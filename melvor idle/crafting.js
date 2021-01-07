// ========================
// Fast Crafting
// ========================
function startCrafting(clicked = false) {
    //Idle checker
    if (!idleChecker(CONSTANTS.skill.Crafting)) {
        if (selectedCraft != null) {
            //cancel if currently crafting
            if (clicked && isCrafting && currentCraft === selectedCraft) {
                clearTimeout(craftingTimeout);
                isCrafting = false;
                currentCraft = null;
                $("#skill-nav-name-" + CONSTANTS.skill.Crafting).attr("class", "nav-main-link-name");
                resetProgressAnimation("crafting-progress");
                clearOffline();
            } else {
                let item = craftingItems[selectedCraft].itemID;
                //make sure you have enough ore to actually smelt
                let craftCheck = checkCraftingReq(item);
                isCrafting = true;
                currentCraft = selectedCraft;
                //check if the check failed. If not, continue
                if (!craftCheck) {
                    notifyPlayer(CONSTANTS.skill.Crafting, "You don't have the required materials to Craft that.", "danger");
                    startCrafting(true);
                } else {
                    offline.skill = CONSTANTS.skill.Crafting;
                    offline.action = selectedCraft;
                    offline.timestamp = new Date().getTime();
                    saveData("offline");
                    $("#skill-nav-name-14").attr("class", "nav-main-link-name text-success");
                    craftInterval = 250;
                    if (godUpgrade[0]) craftInterval *= 0.8;
                    if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Crafting_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) craftInterval -= 500;
                    if (petUnlocked[9]) craftInterval -= 200;
                    if (getMasteryPoolProgress(CONSTANTS.skill.Crafting) >= masteryCheckpoints[2]) craftInterval -= 200;
                    //Animate the progress bars for the tree you are cutting
                    animateProgress("crafting-progress", craftInterval);
                    craftingTimeout = setTimeout(function() {
                        //make sure you have enough ore to actually smelt
                        let craftCheck = checkCraftingReq(item);
                        //check if the check failed. If not, continue
                        if (!craftCheck) {
                            notifyPlayer(CONSTANTS.skill.Crafting, "You don't have the required materials to Craft that.", "danger");
                            startCrafting(true);
                        } else {
                            let qtyToAdd = items[item].craftQty;
                            if (getMasteryPoolProgress(CONSTANTS.skill.Crafting) >= masteryCheckpoints[3] && (items[item].type === "Ring" || items[item].type === "Amulet")) qtyToAdd = 2;
                            let chanceToDouble = 0;
                            let chance = Math.random() * 100;
                            if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) chanceToDouble += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleResources;
                            if (chanceToDouble > chance) qtyToAdd *= 2;
                            //bank check
                            let bankItem = addItemToBank(item, qtyToAdd);
                            //If the function tells us the bank is full, stop the cooking if the setting is set
                            if (!bankItem && !ignoreBankFull) {
                                bankFullNotify();
                                startCrafting(true);
                            } else {
                                let chanceTotal = 0.2 * getMasteryLevel(CONSTANTS.skill.Crafting, items[item].masteryID[1]) - 0.2;
                                if (getMasteryLevel(CONSTANTS.skill.Crafting, items[item].masteryID[1]) >= 99) chanceTotal += 5;
                                if (equippedItems.includes(CONSTANTS.item.Crown_of_Rhaelyx)) {
                                    let checkR = checkRhaelyx();
                                    if (checkR) chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].chanceToPreserve;
                                    else chanceTotal += items[CONSTANTS.item.Crown_of_Rhaelyx].baseChanceToPreserve;
                                }
                                if (getMasteryPoolProgress(CONSTANTS.skill.Crafting) >= masteryCheckpoints[1]) chanceTotal += 5;
                                let chanceToKeep = Math.random() * 100;
                                if (chanceTotal < chanceToKeep) {
                                    for (let i = 0; i < craftReqCheck.length; i++) {
                                        //bank[craftReqCheck[i].bankID].qty -= items[item].craftReq[craftReqCheck[i].reqID].qty;
                                        updateItemInBank(craftReqCheck[i].bankID, items[item].craftReq[craftReqCheck[i].reqID].id, -items[item].craftReq[craftReqCheck[i].reqID].qty);
                                    }
                                } else notifyPlayer(CONSTANTS.skill.Crafting, "You preserved your resources!", "success");
                                statsCrafting[0].count += qtyToAdd;
                                statsCrafting[1].count += craftInterval;
                                updateStats("crafting");
                                let xpToAdd = items[item].craftingXP;
                                if (herbloreBonuses[17].bonus[0] === 0 && herbloreBonuses[17].charges > 0) {
                                    let chance = Math.floor(Math.random() * 100);
                                    if (herbloreBonuses[17].bonus[1] > chance) xpToAdd *= 2;
                                    updateHerbloreBonuses(herbloreBonuses[17].itemID);
                                }
                                rollForPet(9, craftInterval);
                                rollForPet(21, craftInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Crafting) / 100), false, CONSTANTS.skill.Crafting);
                                dropRingHalfA(craftingItems[selectedCraft].craftingLevel);
                                addXP(CONSTANTS.skill.Crafting, xpToAdd);
                                addMasteryXP(CONSTANTS.skill.Crafting, items[item].masteryID[1], craftInterval);
                                updateSkillWindow(CONSTANTS.skill.Crafting);
                                //saveData();
                                isCrafting = false;
                                $("#skill-nav-name-12").attr("class", "nav-main-link-name");
                                updateCraftQty(item);
                                startCrafting();
                            }
                        }
                    }, craftInterval);
                }
            }
        }
    }
}
// Do this to load modded function
loadCrafting();

