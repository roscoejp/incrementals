// ========================
// Thieving Functions
// ========================
function pickpocket(npc, clicked = true) {
    //if (!idleChecker(CONSTANTS.skill.Thieving)) {
	if (true) { 	// Allow idling multiple skills
        if (isThieving && thievingTimer != null && clicked && npcID === npc) {
            clearTimeout(thievingTimer);
            thievingTimer = null;
            isThieving = false;
            updateGameTitle();
            npcID = null;
            $("#skill-nav-name-10").attr("class", "nav-main-link-name");
            resetProgressAnimation("thieving-progress-" + npc);
            clearOffline();
        } else if (isStunned) {
            notifyPlayer(CONSTANTS.skill.Thieving, "You are stunned!", "danger");
            clearOffline();
        } else if (skillLevel[CONSTANTS.skill.Thieving] >= thievingNPC[npc].level) {
            if (skillLevel[CONSTANTS.skill.Thieving] >= thievingNPC[npc].level) {
                if (isThieving) notifyPlayer(CONSTANTS.skill.Thieving, "You can only perform one action at a time!", "danger");
                else {
                    offline.skill = CONSTANTS.skill.Thieving;
                    offline.action = npc;
                    offline.timestamp = new Date().getTime();
                    saveData("offline");
                    isThieving = true;
                    updateGameTitle();
                    npcID = npc;
                    let thievingInterval = 250;
                    if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Thieving_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Max_Skillcape || equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Cape_of_Completion) thievingInterval -= 500;
                    $("#skill-nav-name-10").attr("class", "nav-main-link-name text-success");
                    animateProgress("thieving-progress-" + npc, thievingInterval);
                    thievingTimer = setTimeout(function() {
                        let successRate = getSuccessRate(npcID);
                        let chanceToPick = Math.floor(Math.random() * 100);
                        if (true) {
                            let gpToAdd = calculateThievingGP(npcID);
                            if (gpToAdd > 0) {
                                gp += gpToAdd;
                                statsGeneral[0].count += gpToAdd;
                                updateGP();
                                gpNotify(gpToAdd);
                            }
                            let itemChance = Math.floor(Math.random() * 4);
                            let qty = 1;
                            if (itemChance >= 1 && thievingNPC[npcID].lootTable.length > 0) {
                                let itemToAdd = selectFromLootTable(CONSTANTS.skill.Thieving, npcID);
                                let itemQtyChance = 0;
                                if (herbloreBonuses[14].bonus[0] === 0 && herbloreBonuses[14].charges > 0) {
                                    itemQtyChance += herbloreBonuses[14].bonus[1];
                                    updateHerbloreBonuses(herbloreBonuses[14].itemID);
                                }
                                if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) itemQtyChance += items[CONSTANTS.item.Aorpheats_Signet_Ring].chanceToDoubleLoot;
                                if (equippedItems.includes(CONSTANTS.item.Chapeau_Noir)) itemQtyChance += items[CONSTANTS.item.Chapeau_Noir].chanceToDoubleLoot;
                                if (getMasteryPoolProgress(CONSTANTS.skill.Thieving) >= masteryCheckpoints[2]) itemQtyChance += 10;
                                if (itemQtyChance > 0) {
                                    let chance = Math.floor(Math.random() * 100);
                                    if (chance < itemQtyChance) qty *= 2;
                                }
                                let bankItem = addItemToBank(itemToAdd, qty);
                                if (!bankItem) bankFullNotify();
                            }
                            let chance = 1;
                            let bobbysChance = Math.random() * 120;
                            let chapeauNoir = Math.random() * 10000;
                            if (equippedItems.includes(CONSTANTS.item.Clue_Chasers_Insignia)) {
                                bobbysChance *= 1 - items[CONSTANTS.item.Clue_Chasers_Insignia].increasedItemChance / 100;
                                chapeauNoir *= 1 - items[CONSTANTS.item.Clue_Chasers_Insignia].increasedItemChance / 100;
                            }
                            if (bobbysChance < chance) addItemToBank(CONSTANTS.item.Bobbys_Pocket, qty);
                            if (chapeauNoir < chance) addItemToBank(CONSTANTS.item.Chapeau_Noir, qty);
                            addXP(CONSTANTS.skill.Thieving, thievingNPC[npcID].xp * 10);
                            addMasteryXP(CONSTANTS.skill.Thieving, npcID, thievingInterval);
                            rollForPet(6, thievingInterval);
                            rollForPet(21, thievingInterval * (1 + getMasteryPoolProgress(CONSTANTS.skill.Thieving) / 100), false, CONSTANTS.skill.Thieving);
                            dropRingHalfA(thievingNPC[npcID].level);
                            statsThieving[0].count++;
                            updateStats("thieving");
                            updateVisualSuccess();
                            updateSkillWindow(CONSTANTS.skill.Thieving);
                            $("#skill-nav-name-10").attr("class", "nav-main-link-name");
                            isThieving = false;
                            updateGameTitle();
                            pickpocket(npcID, false);
                        } else {
                            let playerDamage = Math.floor(Math.random() * (thievingNPC[npc].maxHit * numberMultiplier));
                            playerDamage -= Math.floor((damageReduction / 100) * playerDamage);
                            damagePlayer(playerDamage);
                            stunNotify(playerDamage);
                            statsThieving[1].count++;
                            statsThieving[2].count += playerDamage;
                            updateStats("thieving");
                            if (combatData.player.hitpoints <= 0) {
                                stopCombat(true);
                                pickpocket(npcID, true);
                            } else {
                                isStunned = true;
                                window.setTimeout(function() {
                                    isStunned = false;
                                    isThieving = false;
                                    updateGameTitle();
                                    statsThieving[3].count += 3000;
                                    updateStats("thieving");
                                    if (continueThievingOnStun && npcID != null) {
                                        pickpocket(npcID, false);
                                    }
                                }, 3000);
                            }
                        }
                        updateGameTitle();
                    }, thievingInterval);
                }
            }
        }
    }
}

