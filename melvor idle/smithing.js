// ========================
// Fast Smithing
// ========================
function startSmithing(clicked = false) {
	//Idle checker
	//if (!idleChecker(CONSTANTS.skill.Smithing)) {
	if (true) {	// Allow for idling all skills at once
		if (selectedSmith !== null) {
			//cancel if currently smithing
			if (clicked && isSmithing && currentSmith === selectedSmith) {
				clearTimeout(smithingTimeout);
				isSmithing = false;
				currentSmith = null;
				$("#skill-nav-name-5").attr("class", "nav-main-link-name");
				resetProgressAnimation("smithing-progress");
				clearOffline();
			} else if (skillLevel[CONSTANTS.skill.Smithing] >= items[smithingItems[selectedSmith].itemID].smithingLevel) {
				let item = smithingItems[selectedSmith].itemID;
				//make sure you have enough ore to actually smelt
				let smithCheck = true;
				//check if the check failed. If not, continue
				if (!smithCheck) {
					notifyPlayer(CONSTANTS.skill.Smithing, "You don't have the required materials to Smith that.", "danger");
					clearOffline();
				} else {
					offline.skill = CONSTANTS.skill.Smithing;
					offline.action = selectedSmith;
					offline.timestamp = new Date().getTime();
					saveData("offline");
					isSmithing = true;
					currentSmith = selectedSmith;
					smithInterval = 250;
					if (godUpgrade[3]) smithInterval *= 0.8;
					$("#skill-nav-name-5").attr("class", "nav-main-link-name text-success");
					//Animate the progress bars for the tree you are cutting
					animateProgress("smithing-progress", smithInterval);
					smithingTimeout = setTimeout(function () {
						//make sure you have enough ore to actually smelt
						let smithCheck = true;
						//check if the check failed. If not, continue
						if (!smithCheck) {
							notifyPlayer(CONSTANTS.skill.Smithing, "You don't have the required materials to Smith that.", "danger");
							clearOffline();
						} else {
							let qtyToAdd = 1;
							if (items[smithingItems[selectedSmith].itemID].smithingQty != undefined) qtyToAdd = items[smithingItems[selectedSmith].itemID].smithingQty;
							let chanceToDouble = 0;
							let randomSmithingDouble = Math.floor(Math.random() * 100);
							let smithingMasteryLevel = getMasteryLevel(CONSTANTS.skill.Smithing, smithingItems[selectedSmith].smithingID);
							if (smithingMasteryLevel >= 99) chanceToDouble = 35;
							else if (smithingMasteryLevel >= 90) chanceToDouble = 25;
							else if (smithingMasteryLevel >= 70) chanceToDouble = 20;
							else if (smithingMasteryLevel >= 50) chanceToDouble = 15;
							else if (smithingMasteryLevel >= 30) chanceToDouble = 10;
							else if (smithingMasteryLevel >= 10) chanceToDouble = 5;
							if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) chanceToDouble += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
							if (getMasteryPoolProgress(CONSTANTS.skill.Smithing) >= masteryCheckpoints[3]) chanceToDouble += 10;
							if (chanceToDouble > randomSmithingDouble) qtyToAdd *= 2;
							//bank check
							let bankItem = addItemToBank(item, qtyToAdd);
							//If the function tells us the bank is full, stop the cooking if the setting is set
							if (!bankItem && !ignoreBankFull) {
								bankFullNotify();
								startSmithing(true);
							} else {
								let preserveChance = 0;
								if (petUnlocked[5]) preserveChance += 10;
								if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
									let checkR = checkRhaelyx();
									if (checkR) preserveChance += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
									else preserveChance += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
								}
								let randomSmithingKeep = Math.floor(Math.random() * 100);
								if (smithingMasteryLevel >= 99) preserveChance += 30;
								else if (smithingMasteryLevel >= 80) preserveChance += 20;
								else if (smithingMasteryLevel >= 60) preserveChance += 15;
								else if (smithingMasteryLevel >= 40) preserveChance += 10;
								else if (smithingMasteryLevel >= 20) preserveChance += 5;
								if (getMasteryPoolProgress(CONSTANTS.skill.Smithing) >= masteryCheckpoints[1]) preserveChance += 5;
								if (getMasteryPoolProgress(CONSTANTS.skill.Smithing) >= masteryCheckpoints[2]) preserveChance += 5;
								if (preserveChance <= randomSmithingKeep) {
									let hasCape = false;
									if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Smithing_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) hasCape = true;
									//remove the bars from the bank
									//for (let i = 0; i < smithReqCheck.length; i++) {
									//	if (hasCape && bank[smithReqCheck[i].bankID].id === CONSTANTS.item.Coal_Ore) updateItemInBank(smithReqCheck[i].bankID, items[item].smithReq[smithReqCheck[i].reqID].id, -items[item].smithReq[smithReqCheck[i].reqID].qty / 2);
									//	else updateItemInBank(smithReqCheck[i].bankID, items[item].smithReq[smithReqCheck[i].reqID].id, -items[item].smithReq[smithReqCheck[i].reqID].qty);
									//}
								} else notifyPlayer(CONSTANTS.skill.Smithing, "You managed to preserve your resources", "info");
								if (smithingItems[selectedSmith].itemID === CONSTANTS.item.Silver_Bar) {
									if (herbloreBonuses[11].bonus[0] === 0 && herbloreBonuses[11].charges > 0) {
										let chance = Math.floor(Math.random() * 100);
										if (herbloreBonuses[11].bonus[1] > chance) addItemToBank(CONSTANTS.item.Gold_Bar, 1);
										updateHerbloreBonuses(herbloreBonuses[11].itemID);
									}
								}
								let xpToAdd = items[item].smithingXP;
								if (glovesTracker[CONSTANTS.shop.gloves.Smithing].isActive && glovesTracker[CONSTANTS.shop.gloves.Smithing].remainingActions > 0 && equippedItems[CONSTANTS.equipmentSlot.Gloves] === CONSTANTS.item.Smithing_Gloves) {
									xpToAdd = xpToAdd * 1.5;
									glovesTracker[CONSTANTS.shop.gloves.Smithing].remainingActions--;
									updateGloves(CONSTANTS.shop.gloves.Smithing, CONSTANTS.skill.Smithing);
								}
								addXP(CONSTANTS.skill.Smithing, xpToAdd);
								addMasteryXP(CONSTANTS.skill.Smithing, smithingItems[selectedSmith].smithingID, smithInterval);
								rollForPet(5, smithInterval);
								rollForPet(21, smithInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Smithing) / 100), false, CONSTANTS.skill.Smithing);
								if (smithingItems[selectedSmith].smithingID < 9) statsSmithing[0].count++;
								else statsSmithing[1].count++;
								dropRingHalfA(smithingItems[selectedSmith].smithingLevel);
								statsSmithing[2].count += smithInterval / 1000;
								updateStats("smithing");
								updateSkillWindow(CONSTANTS.skill.Smithing);
								//saveData();
								isSmithing = false;
								$("#skill-nav-name-5").attr("class", "nav-main-link-name");
								updateSmithQty(item);
								startSmithing();
							}
						}
					}, smithInterval);
				}
			}
		}
	}
}
// Load mod
loadSmithing();
