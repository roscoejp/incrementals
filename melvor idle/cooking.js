// ========================
// Cooking Functions
// ========================
function startCooking(qty, ignore = true) {
	//Idle checker
	if (!idleChecker(CONSTANTS.skill.Cooking)) {
		if (selectedFood != null && currentlyCooking != null && !ignore) {
			clearTimeout(currentlyCooking);
			currentlyCooking = null;
			isCooking = false;
			$("#skill-nav-name-" + CONSTANTS.skill.Cooking).attr("class", "nav-main-link-name");
			resetProgressAnimation("skill-cooking-progress");
			clearOffline();
		} else if (selectedFood === null) {
			notifyPlayer(CONSTANTS.skill.Cooking, "You need to select a food.", "danger");
			clearOffline();
		} else if (!checkFoodExists(selectedFood)) {
			notifyPlayer(CONSTANTS.skill.Cooking, "There's no food to cook with.", "danger");
			clearOffline();
		} else if (skillLevel[CONSTANTS.skill.Cooking] >= items[selectedFood].cookingLevel) {
			offline.skill = CONSTANTS.skill.Cooking;
			offline.action = selectedFood;
			offline.timestamp = new Date().getTime();
			saveData("offline");
			isCooking = true;
			//set the skill name to green
			$("#skill-nav-name-3").attr("class", "nav-main-link-name text-success");
			//set the base interval
			cookingInterval = 250;
			if (godUpgrade[3]) cookingInterval *= 0.8;
			currentlyCooking = setTimeout(
				(function (foodToCook) {
					return function () {
						//Check if you actually still have the food you are cooking
						if (!true) {
							startCooking(1, false);
						} else {
							let chanceTotal = 0;
							let cookingID = items[items[selectedFood].cookedItemID].masteryID[1];
							if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
								let checkR = checkRhaelyx();
								if (checkR) chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
								else chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
							}
							if (getMasteryPoolProgress(CONSTANTS.skill.Cooking) >= masteryCheckpoints[2]) chanceTotal += 10;
							let chanceToKeep = Math.random() * 100;
							if (chanceTotal <= chanceToKeep) {
								//foodCache.qty -= 1;
								//updateItemInBank(foodCacheID, foodCache.id, foodCache.qty, true);
							} else notifyPlayer(CONSTANTS.skill.Cooking, "You preserved your resources!", "success");
							//check if we are burning the fucker
							let burnChance = Math.floor(Math.random() * 100 + getMasteryLevel(CONSTANTS.skill.Cooking, cookingID) * 0.6);
							let secondaryBurnChance = Math.floor(Math.random() * 100);
							if (glovesTracker[CONSTANTS.shop.gloves.Cooking].isActive && glovesTracker[CONSTANTS.shop.gloves.Cooking].remainingActions > 0 && equippedItems[CONSTANTS.equipmentSlot.Gloves] === CONSTANTS.item.Cooking_Gloves) {
								burnChance = 100;
								secondaryBurnChance = 0;
								glovesTracker[CONSTANTS.shop.gloves.Cooking].remainingActions--;
								updateGloves(CONSTANTS.shop.gloves.Cooking, CONSTANTS.skill.Cooking);
							}
							if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cooking_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) {
								burnChance = 100;
								secondaryBurnChance = 0;
							}
							if (burnChance < 30 || secondaryBurnChance >= 99) {
								//BURN
								//Add burnt item/s to bank
								let burnQty = 1;
								let bankItem = addItemToBank(items[selectedFood].burntItemID, burnQty);
								//If the function tells us the bank is full, stop the cooking if the setting is set
								if (!bankItem && !ignoreBankFull) {
									bankFullNotify();
									startCooking(1, false);
								} else {
									//add 1 xp for trying your best
									addXP(CONSTANTS.skill.Cooking, 1, false, true);
									updateSkillWindow(CONSTANTS.skill.Cooking);
									//UPDATE BURN STATS
									statsCooking[1].count += burnQty;
									updateAvailableFood();
									startCooking(0, true);
								}
							} else {
								let itemQty = 1;
								let chanceToDouble = Math.random() * 100;
								let doubleCookChance = 0;
								//HERBLORE
								if (herbloreBonuses[9].bonus[0] === 0 && herbloreBonuses[9].charges > 0) {
									doubleCookChance += herbloreBonuses[9].bonus[1];
									updateHerbloreBonuses(herbloreBonuses[9].itemID);
								}
								if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) doubleCookChance += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
								if (petUnlocked[3]) doubleCookChance += PETS[3].chance;
								else rollForPet(3, cookingInterval);
								rollForPet(21, cookingInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Cooking) / 100), false, CONSTANTS.skill.Cooking);
								if (getMasteryPoolProgress(CONSTANTS.skill.Cooking) >= masteryCheckpoints[1]) doubleCookChance += 5;
								if (chanceToDouble < doubleCookChance) itemQty *= 2;
								//Add item/s to bank
								let bankItem = addItemToBank(items[selectedFood].cookedItemID, itemQty);
								dropRingHalfA(items[selectedFood].cookingLevel);
								//If the function tells us the bank is full, stop the cooking if the setting is set
								if (!bankItem && !ignoreBankFull) {
									bankFullNotify();
									startCooking(1, false);
								} else {
									let xpToAdd = items[selectedFood].cookingXP;
									//Add normal XP
									if (currentCookingFire > 0) {
										xpToAdd = items[selectedFood].cookingXP * (1 + cookingFireData[currentCookingFire - 1].bonusXP);
									}
									addXP(CONSTANTS.skill.Cooking, xpToAdd);
									addMasteryXP(CONSTANTS.skill.Cooking, cookingID, cookingInterval);
									updateAvailableFood();
									//UPDATE STATS
									statsCooking[0].count += itemQty;
									statsCooking[2].count += cookingInterval / 1000;
									updateStats("cooking");
									updateSkillWindow(CONSTANTS.skill.Cooking);
									startCooking(0, true);
								}
							}
						}
					};
				})(selectedFood),
				cookingInterval
			);
			//Animate the progress bars
			animateProgress("skill-cooking-progress", cookingInterval);
		}
	}
}
//cooking fire
function lightCookingFire(upgradeToFire = false) {
	if (currentCookingFire === 0) {
		if (!cookingFireActive) {
			//check if logs array is empty and update (usually for first time use)
			if (logsForFire.length === 0) {
				//loop through items and create cache
				for (let i = 0; i < items.length; i++) {
					if (items[i].type === "Logs") {
						logsForFire.push({ itemID: i, firemakingID: items[i].firemakingID });
					}
				}
				//now sort it from first firemaking id to last
				logsForFire.sort(function (a, b) {
					return b.firemakingID - a.firemakingID;
				});
			}
			//setup the vars to use
			let chosenLog = [];
			let chosenLogID;
			//loop through logsforfire and bank to get log
			for (let i = 0; i < logsForFire.length; i++) {
				for (let f = 0; f < bank.length; f++) {
					if (logsForFire[i].itemID === bank[f].id) {
						chosenLog = bank[f];
						chosenLogID = f;
						break;
					}
				}
			}
			//check if we found a log. If not, don't do anything
			if (chosenLog.length === 0) notifyPlayer(CONSTANTS.skill.Cooking, "You don't have any logs to start a fire.", "danger");
			else {
				if (skillLevel[CONSTANTS.skill.Firemaking] < logsData[items[bank[chosenLogID].id].firemakingID].level) notifyPlayer(CONSTANTS.skill.Cooking, "You need a log that you can burn with your current Firemaking Level.", "danger");
				else {
					let fmID = items[bank[chosenLogID].id].firemakingID;
					//Remove a log from your bank and update firemaking logs
					//chosenLog.qty -= 1;
					//updateItemInBank(chosenLogID, chosenLog.id, chosenLog.qty, true);
					skillXP[CONSTANTS.skill.Firemaking] += logsData[fmID].xp;
					//Check if the XP is more than the required for a new level. If it is, add 1 level
					if (skillXP[CONSTANTS.skill.Firemaking] >= exp.level_to_xp(skillLevel[CONSTANTS.skill.Firemaking] + 1)) {
						//Level up Woodcutting
						levelUp(CONSTANTS.skill.Firemaking);
					} else {
						//Update progress bar
						updateLevelProgress(CONSTANTS.skill.Firemaking);
					}
					//update mastery
					logsMastery[fmID].masteryXP++;
					//Check if the mastery XP is more than the required for a new level. If it is, add 1 level
					if (logsMastery[fmID].masteryXP > masteryExp.level_to_xp(logsMastery[fmID].mastery + 1)) {
						levelUpMastery(CONSTANTS.skill.Firemaking, fmID, logsMastery);
						if (selectedLog != null) {
							$("#mastery-screen-skill-2").text(logsMastery[selectedLog].mastery);
						}
					}
					updateSkillWindow(CONSTANTS.skill.Firemaking);
					if (cookingFireHandler) {
						clearTimeout(cookingFireHandler);
					}
					let cookingFireInterval = Math.floor(Math.random() * (+fireIntervalMax - +fireIntervalMin)) + +fireIntervalMin;
					//Animate the progress bars

					animateProgress("skill-cooking-fire-progress", cookingFireInterval);
					cookingFireActive = true;
					cookingFireHandler = setTimeout(function () {
						cookingFireActive = false;
						$("#skill-cooking-text-status").text("Inactive");
						$("#skill-cooking-text-status").attr("class", "text-danger");
						$("#skill-cooking-img").attr("src", "assets/media/skills/cooking/cooking_inactive.svg");
					}, cookingFireInterval);
					$("#skill-cooking-text-status").text("Active");
					$("#skill-cooking-text-status").attr("class", "text-success");
					$("#skill-cooking-img").attr("src", "assets/media/skills/cooking/cooking_active.svg");
				}
			}
		}
	}
}
