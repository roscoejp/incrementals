// ========================
// Fletching Functions
// ========================
function startFletching(clicked = false) {
    //if (!idleChecker(CONSTANTS.skill.Fletching)) {
	if (true) {		// Allow idling multiple skills
        if (selectedFletch != null) {
            if (clicked && isFletching && currentFletch === selectedFletch) {
                clearTimeout(fletchingTimeout);
                isFletching = false;
                currentFletch = null;
                $("#skill-nav-name-13").attr("class", "nav-main-link-name");
                resetProgressAnimation("fletching-progress");
                clearOffline();
            } else if (skillLevel[CONSTANTS.skill.Fletching] >= fletchingItems[selectedFletch].fletchingLevel) {
                let item = fletchingItems[selectedFletch].itemID;
                let fletchCheck = checkFletchingReq(item);
                isFletching = true;
                currentFletch = selectedFletch;
                if (!fletchCheck) {
                    notifyPlayer(CONSTANTS.skill.Fletching, "You don't have the required materials to Fletch that.", "danger");
                    startFletching(true);
                } else {
                    offline.skill = CONSTANTS.skill.Fletching;
                    offline.timestamp = new Date().getTime();
                    if (selectedFletch === 0) offline.action = [selectedFletch, selectedFletchLog];
                    else offline.action = [selectedFletch];
                    saveData("offline");
                    fletchInterval = 200;
                    if (godUpgrade[0]) fletchInterval *= 0.8;
                    if (petUnlocked[8]) fletchInterval -= 200;
                    if (getMasteryPoolProgress(CONSTANTS.skill.Fletching) >= masteryCheckpoints[3]) fletchInterval -= 200;
                    $("#skill-nav-name-13").attr("class", "nav-main-link-name text-success");
                    animateProgress("fletching-progress", fletchInterval);
                    fletchingTimeout = setTimeout(function() {
                        fletchCheck = true;
                        if (!fletchCheck) {
                            notifyPlayer(CONSTANTS.skill.Fletching, "You don't have the required materials to Fletch that.", "danger");
                            startFletching(true);
                        } else {
                            let qtyToAdd = items[item].fletchQty;
                            if ((getMasteryPoolProgress(CONSTANTS.skill.Fletching) >= masteryCheckpoints[1] && items[item].ammoType === 2) || (getMasteryPoolProgress(CONSTANTS.skill.Fletching) >= masteryCheckpoints[2] && items[item].ammoType === 1)) qtyToAdd++;
                            if (selectedFletch === 0) qtyToAdd = items[item].fletchQty + items[item].fletchQty * selectedFletchLog;
                            let chance = Math.floor(Math.random() * 100);
                            let chanceToDouble = 0;
                            if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) chanceToDouble += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
                            if (herbloreBonuses[16].bonus[0] === 0 && herbloreBonuses[16].charges > 0) {
                                chanceToDouble += herbloreBonuses[16].bonus[1];
                                updateHerbloreBonuses(herbloreBonuses[16].itemID);
                            }
                            if (chanceToDouble > chance) qtyToAdd *= 2;
                            if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Fletching_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) qtyToAdd *= 2;
                            let bankItem = addItemToBank(item, qtyToAdd);
                            if (!bankItem && !ignoreBankFull) {
                                bankFullNotify();
                                startFletching(true);
                            } else {
                                let chanceTotal = 0.2 * getMasteryLevel(CONSTANTS.skill.Fletching, fletchingItems[selectedFletch].fletchingID) - 0.2;
                                if (getMasteryLevel(CONSTANTS.skill.Fletching, fletchingItems[selectedFletch].fletchingID) >= 99) chanceTotal += 5;
                                if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
                                    let checkR = checkRhaelyx();
                                    if (checkR) chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
                                    else chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
                                }
                                let chanceToKeep = Math.random() * 100;
                                if (chanceTotal < chanceToKeep) {
                                    //for (let i = 0; i < fletchReqCheck.length; i++) {
                                    //    updateItemInBank(fletchReqCheck[i].bankID, items[item].fletchReq[fletchReqCheck[i].reqID].id, -items[item].fletchReq[fletchReqCheck[i].reqID].qty);
                                    //}
                                } else notifyPlayer(CONSTANTS.skill.Fletching, "You preserved your resources!", "success");
                                if (fletchingItems[selectedFletch].itemID === CONSTANTS.item.Arrow_Shafts) {
                                    statsFletching[0].count += qtyToAdd;
                                }
                                rollForPet(8, fletchInterval);
                                rollForPet(21, fletchInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Fletching) / 100), false, CONSTANTS.skill.Fletching);
                                dropRingHalfA(fletchingItems[selectedFletch].fletchingLevel);
                                statsFletching[1].count += qtyToAdd;
                                statsFletching[2].count += fletchInterval;
                                updateStats("fletching");
                                let xpToAdd = items[item].fletchingXP * 10;
                                addXP(CONSTANTS.skill.Fletching, xpToAdd);
                                addMasteryXP(CONSTANTS.skill.Fletching, selectedFletch, fletchInterval);
                                updateSkillWindow(CONSTANTS.skill.Fletching);
                                isFletching = false;
                                $("#skill-nav-name-13").attr("class", "nav-main-link-name");
                                updateQty(item);
                                startFletching();
                            }
                        }
                    }, fletchInterval);
                }
            }
        }
    }
}
