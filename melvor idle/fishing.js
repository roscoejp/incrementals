// ========================
// Fishing Functions
// ========================
function startFishing(areaID, fishID, clicked = false) {
	//if (!idleChecker(CONSTANTS.skill.Fishing)) {
	if (true) {	// Allow for idling all skills at once
		if (clicked && isFishing && currentFishingArea === areaID) {
			clearTimeout(fishingTimeout);
			isFishing = false;
			currentFishingArea = null;
			$("#fishing-area-" + areaID + "-fishing-status-spinner").addClass("d-none");
			$("#fishing-area-" + areaID + "-fishing-status-text").text("Idle");
			$("#fishing-area-" + areaID + "-button").text("Start Fishing");
			$("#fishing-area-" + areaID + "-button").removeClass("btn-danger");
			$("#fishing-area-" + areaID + "-button").addClass("btn-info");
			$("#skill-nav-name-" + CONSTANTS.skill.Fishing).removeClass("text-success");
			clearOffline();
		} else if (isFishing && currentFishingArea != areaID) {
			startFishing(currentFishingArea, fishID, true);
			startFishing(areaID, fishID, true);
		} else {
			let itemID = fishingItems[fishingAreas[areaID].fish[fishID]].itemID;
			if (skillLevel[CONSTANTS.skill.Fishing] >= items[itemID].fishingLevel) {
				offline.skill = CONSTANTS.skill.Fishing;
				offline.action = [areaID, fishID];
				offline.timestamp = new Date().getTime();
				saveData("offline");
				isFishing = true;
				currentFishingArea = areaID;
				$("#fishing-area-" + areaID + "-fishing-status-spinner").removeClass("d-none");
				$("#fishing-area-" + areaID + "-fishing-status-text").text("Fishing");
				$("#fishing-area-" + areaID + "-button").text("Stop Fishing");
				$("#fishing-area-" + areaID + "-button").addClass("btn-danger");
				$("#fishing-area-" + areaID + "-button").removeClass("btn-info");
				$("#skill-nav-name-" + CONSTANTS.skill.Fishing).addClass("text-success");
				let fishingAmuletBonus = 1;
				if (equippedItems.includes(CONSTANTS.item.Amulet_of_Fishing)) fishingAmuletBonus = 1 - items[CONSTANTS.item.Amulet_of_Fishing].fishingSpeedBonus / 100;
				let fishingInterval = Math.floor(Math.random() * (items[itemID].maxFishingInterval - items[itemID].minFishingInterval)) + items[itemID].minFishingInterval;
				fishingInterval = 250;
				fishingTimeout = setTimeout(function () {
					let fishingMastery = getMasteryLevel(CONSTANTS.skill.Fishing, fishingAreas[areaID].fish[fishID]);
					let bonusSpecialChance = 0;
					if (fishingMastery >= 50) bonusSpecialChance += 3;
					let specialChance = (fishingAreas[areaID].specialChance + bonusSpecialChance) * 10;
					let junkChance = (fishingAreas[areaID].junkChance - bonusSpecialChance) * 0;
					if (herbloreBonuses[7].bonus[0] === 0 && herbloreBonuses[7].charges > 0) {
						junkChance -= herbloreBonuses[7].bonus[1];
						updateHerbloreBonuses(herbloreBonuses[7].itemID);
					}
					if (fishingMastery >= 65 || junkChance < 0 || getMasteryPoolProgress(CONSTANTS.skill.Fishing) >= masteryCheckpoints[1]) junkChance = 0;
					let random = Math.floor(Math.random() * 100);
					let chanceToDouble = Math.random() * 100;
					let xpToAdd = 0;
					let strXPToAdd = 0;
					let itemQty = 1;
					let fishingStat = 0;
					if (fishingMastery * 0.4 > chanceToDouble || fishingMastery >= 99) itemQty *= 2;
					//get special item
					if (random < specialChance) {
						xpToAdd = items[itemID].fishingXP;
						itemID = selectFromLootTable(CONSTANTS.skill.Fishing, 0);
						activateTutorialTip(3);
						if (getMasteryPoolProgress(CONSTANTS.skill.Fishing) >= masteryCheckpoints[3]) {
							let doubleSpecial = Math.random() * 100;
							if (doubleSpecial < 25) {
								addItemToBank(selectFromLootTable(CONSTANTS.skill.Fishing, 0), 1);
								statsFishing[6].count++;
							}
						}
						fishingStat = 6;
					}
					//bank space is precious. This will ensure bank space is wasted with useless items that you dont want
					else if (random < junkChance + specialChance) {
						let junk = Math.floor(Math.random() * junkItems.length);
						itemID = junkItems[junk];
						xpToAdd = 1;
						fishingStat = 5;
					}
					//if you managed to make it through everything before this, then I may as well give you the fish
					else {
						xpToAdd = items[itemID].fishingXP * 10;
						if (items[itemID].strengthXP !== undefined) strXPToAdd = items[itemID].strengthXP;
					}
					chanceToDouble = Math.floor(Math.random() * 100);
					let doubleFishChance = 0;
					if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) doubleFishChance += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
					if (petUnlocked[1]) doubleFishChance += PETS[1].chance;
					else rollForPet(1, fishingInterval);
					rollForPet(21, fishingInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Fishing) / 100), false, CONSTANTS.skill.Fishing);
					if (getMasteryPoolProgress(CONSTANTS.skill.Fishing) >= masteryCheckpoints[2]) doubleFishChance += 5;
					if (chanceToDouble < doubleFishChance) itemQty *= 2;
					if (equippedItems.includes(CONSTANTS.item.Fishing_Skillcape) || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) itemQty *= 2;
					let addItem = addItemToBank(itemID, itemQty);
					if (!addItem) bankFullNotify();
					if (fishingStat !== 5 && fishingStat !== 6) dropRingHalfA(items[itemID].fishingLevel);
					else dropRingHalfA(1);
					statsFishing[fishingStat].count += itemQty;
					if (equippedItems.includes(CONSTANTS.item.Pirates_Lost_Ring)) xpToAdd *= 1 + items[CONSTANTS.item.Pirates_Lost_Ring].fishingBonusXP / 100;
					addXP(CONSTANTS.skill.Fishing, xpToAdd);
					if (!junkItems.includes(itemID)) addMasteryXP(CONSTANTS.skill.Fishing, fishingAreas[areaID].fish[fishID], fishingInterval);
					updateSkillWindow(CONSTANTS.skill.Fishing);
					if (strXPToAdd > 0) {
						if (equippedItems[CONSTANTS.equipmentSlot.Ring] === CONSTANTS.item.Gold_Emerald_Ring) strXPToAdd *= 1.07;
						addXP(CONSTANTS.skill.Strength, strXPToAdd);
						updateSkillWindow(CONSTANTS.skill.Strength);
					}
					statsFishing[2].count += fishingInterval / 1000;
					updateStats("fishing");
					updateFishingMastery(areaID, fishID);
					updateFishingAreaWeights(areaID, fishID);
					startFishing(areaID, fishID);
				}, fishingInterval);
			}
		}
	}
}

