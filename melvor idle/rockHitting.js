// ========================
// Mining functions
// ========================
function mineRock(ore, clicked = false, ignoreDepletion = false) {
	//Idle checker
	if (!idleChecker(CONSTANTS.skill.Mining)) {
		//cancel if currently mining
		if (clicked && isMining && currentRock === ore) {
			clearTimeout(miningTimeout);
			isMining = false;
			currentRock = null;
			$("#mining-rock-status-" + ore).attr("class", "");
			$("#mining-rock-status-" + ore).text("Mine");
			$("#skill-nav-name-4").attr("class", "nav-main-link-name");
			resetProgressAnimation("mining-rock-progress-" + ore);
			clearOffline();
		} else if (rockData[ore].damage >= rockData[ore].maxHP) {
			if (!ignoreDepletion) {
				notifyPlayer(CONSTANTS.skill.Mining, "The rock is depleted.", "danger");
				statsMining[1].count++;
				updateStats("mining");
			} else {
				clearTimeout(miningTimeout);
				miningTimeout = setTimeout(function () {
					mineRock(ore, false, true);
				}, 1000);
			}
		} else if (isMining && currentRock != ore) {
			mineRock(currentRock, true);
			mineRock(ore, true);
		} else if ((ore != 9 || (ore === 9 && canMineDragonite())) && skillLevel[CONSTANTS.skill.Mining] >= miningData[ore].level) {
			offline.skill = CONSTANTS.skill.Mining;
			offline.action = ore;
			offline.timestamp = new Date().getTime();
			saveData("offline");
			isMining = true;
			currentRock = ore;
			$("#skill-nav-name-4").attr("class", "nav-main-link-name text-success");
			//set the pickaxe interval
			let miningIntervalReduction = 0;
			if (getMasteryPoolProgress(CONSTANTS.skill.Mining) >= masteryCheckpoints[2]) miningIntervalReduction = 200;
			let miningInterval = 250;
			if (godUpgrade[2]) miningInterval *= 0.8;
			miningInterval *= 1 - pickaxeBonusSpeed[currentPickaxe] / 100;
			miningInterval -= miningIntervalReduction;
			$("#mining-rock-status-" + ore).text("Mining");
			$("#mining-rock-status-" + ore).attr("class", "badge badge-info");
			animateProgress("mining-rock-progress-" + ore, miningInterval);
			miningTimeout = setTimeout(function () {
				//setup variable for how many ores are being added to bank
				let oreQty = 1;
				if (ore === 10) oreQty = 2;
				let doubleOreChanceFromMastery = 0;
				if (getMasteryLevel(CONSTANTS.skill.Mining, ore) >= 99) doubleOreChanceFromMastery = 15;
				else {
					for (let i = 10; i <= getMasteryLevel(CONSTANTS.skill.Mining, ore); i += 10) doubleOreChanceFromMastery++;
				}
				if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) doubleOreChanceFromMastery += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
				let extraOreChance = Math.floor(Math.random() * 100);
				if (extraOreChance < pickaxeBonus[currentPickaxe] + doubleOreChanceFromMastery) oreQty *= 2;
				if (glovesTracker[CONSTANTS.shop.gloves.Mining].isActive && glovesTracker[CONSTANTS.shop.gloves.Mining].remainingActions > 0 && equippedItems[CONSTANTS.equipmentSlot.Gloves] === CONSTANTS.item.Mining_Gloves) {
					oreQty *= 2;
					glovesTracker[CONSTANTS.shop.gloves.Mining].remainingActions--;
					updateGloves(CONSTANTS.shop.gloves.Mining, CONSTANTS.skill.Mining);
				}
				//try to add the item to the bank
				let collectItem = addItemToBank(miningData[ore].ore, oreQty);
				if (collectItem) {
					//Notify the player of new item
					if (ore !== 10 && glovesTracker[CONSTANTS.shop.gloves.Gems].isActive && glovesTracker[CONSTANTS.shop.gloves.Gems].remainingActions > 0 && equippedItems[CONSTANTS.equipmentSlot.Gloves] === CONSTANTS.item.Gem_Gloves) {
						collectGem();
						glovesTracker[CONSTANTS.shop.gloves.Gems].remainingActions--;
						updateGloves(CONSTANTS.shop.gloves.Gems, CONSTANTS.skill.Mining);
					} else {
						let gemChance = 200;
						if (equippedItems.includes(CONSTANTS.item.Clue_Chasers_Insignia)) gemChance *= 1 - items[CONSTANTS.item.Clue_Chasers_Insignia].increasedItemChance / 100;
						gemChance = Math.random() * gemChance;
						if (gemChance < 2) {
							collectGem();
							activateTutorialTip(4);
						}
					}
					if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Mining_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) {
						addItemToBank(CONSTANTS.item.Coal_Ore, 1);
					}
					addXP(CONSTANTS.skill.Mining, items[miningData[ore].ore].miningXP);
					addMasteryXP(CONSTANTS.skill.Mining, ore, miningInterval);
					//update damage to rock
					if (herbloreBonuses[10].bonus[0] === 0 && herbloreBonuses[10].charges > 0) {
						let chance = Math.floor(Math.random() * 100);
						if (herbloreBonuses[10].bonus[1] > chance) notifyPlayer(CONSTANTS.skill.Mining, "You did no damage to the rock", "success");
						else rockData[ore].damage++;
						updateHerbloreBonuses(herbloreBonuses[10].itemID);
					} else rockData[ore].damage++;
					//check if damage exceeds maxHp
					if (rockData[ore].damage >= rockData[ore].maxHP) rockData[ore].depleted = true;
					rollForPet(4, miningInterval);
					rollForPet(21, miningInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Mining) / 100), false, CONSTANTS.skill.Mining);
					dropRingHalfA(miningData[ore].level);
					//Update the HP accordingly
					updateRockHP(ore);
					statsMining[0].count++;
					updateStats("mining");
					//update required windows
					updateSkillWindow(CONSTANTS.skill.Mining);
					if (ore === 10 && selectedRunecraft !== null) selectRunecraft(selectedRunecraft, true);
					//reset and clear the timers/vars
					mineRock(ore, false, true);
				} else {
					bankFullNotify();
					mineRock(ore, true);
				}
				updateMiningRates();
			}, miningInterval);
		}
	}
}
// No depletion
function updateRockHP(ore, initialise = false) {
	//initialise vars
	let maxRockHP;
	let currentRockHP;
	let rockProgress;
	//check if this is running on game load
	if (initialise) {
		//loop through the mining data (each ore)
		for (let i = 0; i < rockData.length; i++) {
			//apply HP data
			let increasedHP = 0;
			if (getMasteryPoolProgress(CONSTANTS.skill.Mining) >= masteryCheckpoints[3]) increasedHP = 10;
			maxRockHP = baseRockHP + getMasteryLevel(CONSTANTS.skill.Mining, ore) + increasedHP;
			if (petUnlocked[4]) maxRockHP += 5;
			rockData[i].maxHP = maxRockHP;
			currentRockHP = maxRockHP - rockData[i].damage;
			rockProgress = Math.floor((currentRockHP / maxRockHP) * 100);
			$("#mining-rock-hp-" + i).css("width", rockProgress + "%");
			if (rockData[i].damage >= rockData[i].maxHP) rockData[i].depleted = true;
			//check if the ore is depleted, if it is then begin the reset timer
			if (rockData[i].depleted) {
				rockReset(i);
			}
		}
	} else {
		//if not loading game, only update required ore
		//update HP data
		let increasedHP = 0;
		if (getMasteryPoolProgress(CONSTANTS.skill.Mining) >= masteryCheckpoints[3]) increasedHP = 10;
		maxRockHP = baseRockHP + getMasteryLevel(CONSTANTS.skill.Mining, ore) + increasedHP;
		if (petUnlocked[4]) maxRockHP += 5;
		rockData[ore].maxHP = maxRockHP;
		currentRockHP = maxRockHP;
		rockProgress = Math.floor((currentRockHP / maxRockHP) * 100);
		$("#mining-rock-hp-" + ore).css("width", rockProgress + "%");
		if (rockData[ore].damage >= rockData[ore].maxHP) rockData[ore].depleted = true;
		//check if depleted. If yes, being reset timer
		if (rockData[ore].depleted) {
			rockReset(ore);
		}
	}
	if (canMineDragonite()) {
		$("#mining-ore-requirement-9").addClass("d-none");
	}
}
