// ========================
// Runecrafting Functions
// ========================
function startRunecrafting(clicked = false) {
	//Idle checker
	//if (!idleChecker(CONSTANTS.skill.Runecrafting)) {
	if (true) {	// Allow for idling all skills at once
		if (selectedRunecraft != null) {
			//cancel if currently crafting
			if (clicked && isRunecrafting && currentRunecraft === selectedRunecraft) {
				clearTimeout(runecraftingTimeout);
				isRunecrafting = false;
				currentRunecraft = null;
				$("#skill-nav-name-15").attr("class", "nav-main-link-name");
				resetProgressAnimation("runecrafting-progress");
				clearOffline();
			} else if (skillLevel[CONSTANTS.skill.Runecrafting] >= runecraftingItems[selectedRunecraft].runecraftingLevel) {
				isRunecrafting = true;
				currentRunecraft = selectedRunecraft;
				let item = runecraftingItems[selectedRunecraft].itemID;
				//make sure you have enough ore to actually smelt
				let runecraftCheck = true;
				//check if the check failed. If not, continue
				if (!runecraftCheck) {
					notifyPlayer(CONSTANTS.skill.Runecrafting, "You don't have the required materials to create that.", "danger");
					startRunecrafting(true);
				} else {
					offline.skill = CONSTANTS.skill.Runecrafting;
					offline.action = selectedRunecraft;
					offline.timestamp = new Date().getTime();
					saveData("offline");
					runecraftInterval = 250;
					if (godUpgrade[1]) runecraftInterval *= 0.8;
					$("#skill-nav-name-15").attr("class", "nav-main-link-name text-success");
					animateProgress("runecrafting-progress", runecraftInterval);
					runecraftingTimeout = setTimeout(function () {
						//make sure you have enough ore to actually smelt
						let runecraftCheck = true;
						//check if the check failed. If not, continue
						if (!runecraftCheck) {
							notifyPlayer(CONSTANTS.skill.Runecrafting, "You don't have the required materials to create that.", "danger");
							startRunecrafting(true);
						} else {
							let rcMastery = getMasteryLevel(CONSTANTS.skill.Runecrafting, items[item].runecraftingID);
							let qtyToAdd = 1;
							if (items[item].type === "Rune" && rcMastery >= 99) qtyToAdd = items[item].runecraftQty + 10;
							else if (items[item].type === "Rune") qtyToAdd = Math.floor(items[item].runecraftQty + rcMastery / 15);
							if (getMasteryPoolProgress(CONSTANTS.skill.Runecrafting) >= masteryCheckpoints[3] && items[item].type === "Rune") qtyToAdd += 5;
							let itemDoubleChance = 0;
							if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) itemDoubleChance += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
							let chanceToDouble = Math.floor(Math.random() * 100);
							if (chanceToDouble < itemDoubleChance) qtyToAdd *= 2;
							//bank check
							let bankItem = addItemToBank(item, qtyToAdd);
							//If the function tells us the bank is full, stop the cooking if the setting is set
							if (!bankItem && !ignoreBankFull) {
								bankFullNotify();
								startRunecrafting(true);
							} else {
								let chanceToKeep = Math.random() * 100;
								let chanceTotal = 0;
								if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
									let checkR = checkRhaelyx();
									if (checkR) chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
									else chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
								}
								if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Runecrafting_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) chanceTotal += 35;
								if (petUnlocked[10]) chanceTotal += PETS[10].chance;
								if (getMasteryPoolProgress(CONSTANTS.skill.Runecrafting) >= masteryCheckpoints[2]) chanceTotal += 10;
								if (chanceTotal < chanceToKeep) {
									//for (let i = 0; i < runecraftReqCheck.length; i++) {
										//bank[runecraftReqCheck[i].bankID].qty -= items[item].runecraftReq[runecraftReqCheck[i].reqID].qty;
										//updateItemInBank(runecraftReqCheck[i].bankID, items[item].runecraftReq[runecraftReqCheck[i].reqID].id, -items[item].runecraftReq[runecraftReqCheck[i].reqID].qty);
									//}
								} else notifyPlayer(CONSTANTS.skill.Runecrafting, "You preserved your resources.", "success");
								if (herbloreBonuses[18].bonus[0] === 0 && herbloreBonuses[18].charges > 0) {
									let elementals = [CONSTANTS.item.Air_Rune, CONSTANTS.item.Water_Rune, CONSTANTS.item.Earth_Rune, CONSTANTS.item.Fire_Rune];
									let chance = Math.floor(Math.random() * 100);
									if (herbloreBonuses[18].bonus[1] > chance) {
										let e = Math.floor(Math.random() * elementals.length);
										addItemToBank(elementals[e], 1);
									}
									updateHerbloreBonuses(herbloreBonuses[18].itemID);
								}
								rollForPet(10, runecraftInterval);
								rollForPet(21, runecraftInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Runecrafting) / 100), false, CONSTANTS.skill.Runecrafting);
								dropRingHalfA(runecraftingItems[selectedRunecraft].runecraftingLevel);
								statsRunecrafting[0].count += qtyToAdd;
								statsRunecrafting[1].count += runecraftInterval;
								updateStats("runecrafting");
								let xpToAdd = items[item].runecraftingXP;
								let xpMultiplier = 10;
								if (getMasteryPoolProgress(CONSTANTS.skill.Runecrafting) >= masteryCheckpoints[1] && items[item].type === "Rune") xpMultiplier += 1.5;
								addXP(CONSTANTS.skill.Runecrafting, xpToAdd * xpMultiplier);
								addMasteryXP(CONSTANTS.skill.Runecrafting, items[item].runecraftingID, runecraftInterval);
								updateSkillWindow(CONSTANTS.skill.Runecrafting);
								//saveData();
								isRunecrafting = false;
								$("#skill-nav-name-15").attr("class", "nav-main-link-name");
								updateRunecraftQty(item);
								activateTutorialTip(2);
								startRunecrafting();
							}
						}
					}, runecraftInterval);
				}
			}
		}
	}
}
