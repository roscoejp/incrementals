// ========================
// Mastery Function
// ========================
function addMasteryXP(skill, masteryID, timePerAction, spendingXP = false, xp = 0, addToPool = true, offline = false) {
  switch (skill) {
    case CONSTANTS.skill.Firemaking:
      timePerAction = logsData[masteryID].interval * 0.6;
      break;
    case CONSTANTS.skill.Cooking:
      timePerAction = 2400;
      break;
    case CONSTANTS.skill.Smithing:
      timePerAction = 1600;
      break;
    case CONSTANTS.skill.Fletching:
      timePerAction = 1200;
      break;
    case CONSTANTS.skill.Crafting:
      timePerAction = 1500;
      break;
    case CONSTANTS.skill.Runecrafting:
      timePerAction = 1600;
      break;
    case CONSTANTS.skill.Herblore:
      timePerAction = 1600;
      break;
  }
  let xpToAdd = 0;
  if (!spendingXP) xpToAdd = getMasteryXpToAdd(skill, masteryID, timePerAction);
   else xpToAdd = xp;
  xpToAdd *= 100;
  let currentLevel = getMasteryLevel(skill, masteryID);
  MASTERY[skill].xp[masteryID] += xpToAdd;
  if (exp.xp_to_level(MASTERY[skill].xp[masteryID]) - 1 > currentLevel && currentLevel < 99) {
    updateMasteryLevelCache(skill, masteryID);
    notifyMasteryLevelUp(skill, masteryID);
    if (skill === CONSTANTS.skill.Woodcutting && currentLevel >= 98) updateWCRates();
    if (skill === CONSTANTS.skill.Herblore && selectedHerblore === masteryID) selectHerblore(selectedHerblore);
    updateTotalMastery(skill);
  }
  if (!offline) updateMasteryProgress(skill, masteryID);
  if (addToPool) addMasteryXPToPool(skill, xpToAdd, offline);
}
