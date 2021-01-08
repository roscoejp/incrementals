// ========================
// Herblore Functions
// ========================
function startHerblore(clicked = false) {
	//Idle checker
	//if (!idleChecker(CONSTANTS.skill.Herblore)) {
	if (true) {	// Allow for idling all skills at once
		if (selectedHerblore != null) {
			//cancel if currently fletching
			if (clicked && isHerblore && currentHerblore === selectedHerblore) {
				clearTimeout(herbloreTimeout);
				isHerblore = false;
				currentHerblore = null;
				$("#skill-nav-name-19").attr("class", "nav-main-link-name");
				resetProgressAnimation("herblore-progress");
				clearOffline();
			} else {
				let item = herbloreItemData[selectedHerblore].itemID[getHerbloreTier(selectedHerblore)];
				let herbloreCheck = true;
				isHerblore = true;
				currentHerblore = selectedHerblore;
				if (!herbloreCheck) {
					notifyPlayer(CONSTANTS.skill.Herblore, "You don't have the required materials to brew that.", "danger");
					startHerblore(true);
				} else {
					offline.skill = CONSTANTS.skill.Herblore;
					offline.action = selectedHerblore;
					offline.timestamp = new Date().getTime();
					saveData("offline");
					herbloreInterval = 250;
					if (godUpgrade[1]) herbloreInterval *= 0.8;
					$("#skill-nav-name-19").attr("class", "nav-main-link-name text-success");
					animateProgress("herblore-progress", herbloreInterval);
					herbloreTimeout = setTimeout(function () {
						herbloreCheck = true;
						if (!herbloreCheck) {
							notifyPlayer(CONSTANTS.skill.Herblore, "You don't have the required materials to brew that.", "danger");
							startHerblore(true);
						} else {
							let qtyToAdd = 1;
							let chanceToDouble = 0;
							let chance = Math.random() * 100;
							if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) chanceToDouble += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
							if (petUnlocked[11]) chanceToDouble += PETS[11].chance;
							if (getMasteryPoolProgress(CONSTANTS.skill.Herblore) >= masteryCheckpoints[3]) chanceToDouble += 10;
							if (chanceToDouble > chance) qtyToAdd *= 2;
							if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Herblore_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) qtyToAdd *= 2;
							let bankItem = addItemToBank(item, qtyToAdd);
							if (!bankItem && !ignoreBankFull) {
								bankFullNotify();
								startHerblore(true);
							} else {
								let chanceTotal = 0.2 * getMasteryLevel(CONSTANTS.skill.Herblore, selectedHerblore) - 0.2;
								if (getMasteryLevel(CONSTANTS.skill.Herblore, selectedHerblore) >= 99) chanceTotal += 5;
								if (getMasteryPoolProgress(CONSTANTS.skill.Herblore) >= masteryCheckpoints[2]) chanceTotal += 5;
								if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
									let checkR = checkRhaelyx();
									if (checkR) chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
									else chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
								}
								let chanceToKeep = Math.random() * 100;
								if (chanceTotal < chanceToKeep) {
									//for (let i = 0; i < herbloreReqCheck.length; i++) {
									//	//bank[herbloreReqCheck[i].bankID].qty -= items[item].herbloreReq[herbloreReqCheck[i].reqID].qty;
									//	updateItemInBank(herbloreReqCheck[i].bankID, items[item].herbloreReq[herbloreReqCheck[i].reqID].id, -items[item].herbloreReq[herbloreReqCheck[i].reqID].qty);
									//}
								} else notifyPlayer(CONSTANTS.skill.Herblore, "You preserved your resources!", "success");
								if (herbloreBonuses[19].bonus[0] === 0 && herbloreBonuses[19].charges > 0) {
									let chance = Math.floor(Math.random() * 100);
									if (herbloreBonuses[19].bonus[1] > chance) {
										let t = Math.floor(Math.random() * herbloreItemData[selectedHerblore].itemID.length);
										addItemToBank(herbloreItemData[selectedHerblore].itemID[t], qtyToAdd);
									}
									updateHerbloreBonuses(herbloreBonuses[19].itemID);
								}
								rollForPet(11, herbloreInterval);
								rollForPet(21, herbloreInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Herblore) / 100), false, CONSTANTS.skill.Herblore);
								dropRingHalfA(herbloreItemData[selectedHerblore].herbloreLevel);
								statsHerblore[0].count += qtyToAdd;
								statsHerblore[1].count += herbloreInterval;
								updateStats("herblore");
								let xpToAdd = herbloreItemData[selectedHerblore].herbloreXP;
								addXP(CONSTANTS.skill.Herblore, xpToAdd);
								addMasteryXP(CONSTANTS.skill.Herblore, selectedHerblore, herbloreInterval);
								updateSkillWindow(CONSTANTS.skill.Herblore);
								//saveData();
								isHerblore = false;
								$("#skill-nav-name-19").attr("class", "nav-main-link-name");
								updateHerbloreQty(item);
								startHerblore();
							}
						}
					}, herbloreInterval);
				}
			}
		}
	}
}

