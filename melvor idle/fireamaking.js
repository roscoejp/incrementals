// ========================
// Firemaking Functions
// ========================
function burnLog(ignore = true) {
    //if (!idleChecker(CONSTANTS.skill.Firemaking)) {
	if (true) { 	//Allow idling multiple skills
        if (selectedLog != null && currentlyBurning != null && !ignore) {
            clearTimeout(currentlyBurning);
            currentlyBurning = null;
            isBurning = false;
            $("#skill-nav-name-2").attr("class", "nav-main-link-name");
            resetProgressAnimation("skill-fm-burn-progress");
            clearOffline();
        } else if (selectedLog === null) {
            clearOffline();
        } else if (skillLevel[CONSTANTS.skill.Firemaking] >= logsData[selectedLog].level) {
            if (!checkLogExists(selectedLog)) {
                notifyPlayer(CONSTANTS.skill.Firemaking, "You don't have a log to burn.", "danger");
                clearOffline();
            } else {
                offline.skill = CONSTANTS.skill.Firemaking;
                offline.action = selectedLog;
                offline.timestamp = new Date().getTime();
                saveData("offline");
                isBurning = true;
                $("#skill-nav-name-2").attr("class", "nav-main-link-name text-success");
                let firemakingInterval = 250;
                if (godUpgrade[3]) firemakingInterval *= 0.8;
                if (getMasteryPoolProgress(CONSTANTS.skill.Firemaking) >= masteryCheckpoints[1]) firemakingInterval *= 0.9;
                let descreasedBurnInterval = 1 - getMasteryLevel(CONSTANTS.skill.Firemaking, selectedLog) * 0.001;
                firemakingInterval *= descreasedBurnInterval;
                if (checkLogExists(selectedLog)) animateProgress("skill-fm-burn-progress", firemakingInterval);
                currentlyBurning = setTimeout((function(logToBurn) {
                    return function() {
                        if (!checkLogExists(logToBurn)) {
                            burnLog(false);
                        } else {
                            let chanceTotal = 0;
                            if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
                                let checkR = checkRhaelyx();
                                if (checkR) chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
                                else chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
                            }
                            let chanceToKeep = Math.random() * 100;
                            if (chanceTotal <= chanceToKeep) {
                                //logCache.qty -= 1;
                                //updateItemInBank(logCacheID, logCache.id, logCache.qty, true);
                            } else notifyPlayer(CONSTANTS.skill.Firemaking, "You preserved your resources!", "success");
                            if (getMasteryPoolProgress(CONSTANTS.skill.Firemaking) >= masteryCheckpoints[2]) {
                                let gpToAdd = Math.floor(items[logCache.id].sellsFor * 0.25);
                                if (gpToAdd >= 1) {
                                    gp += gpToAdd;
                                    updateGP();
                                    gpNotify(gpToAdd);
                                }
                            }
                            let xpToAdd = logsData[logToBurn].xp + logsData[logToBurn].xp * (bonfireBonus);
                            addXP(CONSTANTS.skill.Firemaking, xpToAdd);
                            addMasteryXP(CONSTANTS.skill.Firemaking, logToBurn, firemakingInterval);
                            let coalChance = Math.random() * 100;
                            let chanceForCoal = 60;
                            if (equippedItems.includes(CONSTANTS.item.Clue_Chasers_Insignia)) chanceForCoal *= 1 - items[CONSTANTS.item.Clue_Chasers_Insignia].increasedItemChance / 100;
                            if (coalChance >= chanceForCoal || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Firemaking_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) {
                                let coalQty = 1;
                                let chanceToDouble = 0;
                                let chance = Math.random() * 100;
                                if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) chanceToDouble += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
                                if (chanceToDouble > chance) coalQty *= 2;
                                addItemToBank(CONSTANTS.item.Coal_Ore, coalQty);
                            }
                            rollForPet(2, firemakingInterval);
                            rollForPet(21, firemakingInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Firemaking) / 100), false, CONSTANTS.skill.Firemaking);
                            dropRingHalfA(logsData[selectedLog].level);
                            updateAvailableLogs();
                            statsFiremaking[0].count++;
                            statsFiremaking[1].count += items[logCache.id].sellsFor;
                            statsFiremaking[2].count += firemakingInterval / 1000;
                            if (currentBonfireHandler) statsFiremaking[3].count += logsData[logToBurn].xp * (bonfireBonus / 100);
                            updateStats("firemaking");
                            updateSkillWindow(CONSTANTS.skill.Firemaking);
                            burnLog(true);
                        }
                    };
                })(selectedLog), firemakingInterval);
            }
        }
    }
}

