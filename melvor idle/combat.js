// ========================
// Combat Functions
// ========================
// Fast Enemy Respawns
function loadNewEnemy() {
	if (!idleChecker(CONSTANTS.skill.Hitpoints)) {
		isInCombat = true;
		newEnemyLoading = true;
		updateGameTitle();
		//set the skill name to green
		updateNav();
		$("#skill-nav-name-9").attr("class", "nav-main-link-name text-success");
		if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].type === "Ranged Weapon" || items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isRanged) {
			$("#skill-nav-name-" + CONSTANTS.skill.Ranged).attr("class", "nav-main-link-name text-success");
		}
		if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isMagic) {
			$("#skill-nav-name-" + CONSTANTS.skill.Magic).attr("class", "nav-main-link-name text-success");
		} else {
			$("#skill-nav-name-" + (attackStyle + 6)).attr("class", "nav-main-link-name text-success");
		}
		resetEnemyScreen();
		let interval = 0;
		$("#combat-enemy-options").html('<p><button type="button" class="btn btn-lg btn-warning m-1" id="combat-btn-run" onClick="stopCombat(false, true, true); showMap();"><img class="nav-img" src="https://cdn.melvor.net/core/v018/assets/media/skills/combat/run.svg">Run / Area Select</button></p>');
		$("#combat-enemy-img").append('<div class="combat-enemy-img-spinner spinner-border text-danger" role="status"></div>');
		enemyFinder = setTimeout(function () {
			$("#combat-player-hitpoints-current").text(combatData.player.hitpoints);
			$("#combat-player-hitpoints-current-1").text(combatData.player.hitpoints);
			let enemyTrait = "";
			let enemyMediaAdjustment = "";
			let enemy;
			if (forcedEnemy === null) enemy = combatAreas[selectedCombatArea].monsters[Math.floor(Math.random() * combatAreas[selectedCombatArea].monsters.length)];
			else enemy = forcedEnemy;
			combatData.enemy.baseDamageReduction = 0;
			combatData.enemy.damageReduction = 0;
			if (isDungeon) {
				if (selectedDungeon === 15 && dungeonCount < 20) {
					let enemySelection = [];
					for (let i = 0; i < MONSTERS.length; i++) {
						if (getMonsterCombatLevel(i, true) >= 165 && getMonsterCombatLevel(i, true) <= 677 && i !== 134 && i !== 135 && i !== 136) enemySelection.push(i);
					}
					let enemyToChoose = Math.floor(Math.random() * enemySelection.length);
					enemy = enemySelection[enemyToChoose];
					enemyTrait = "Afflicted ";
					combatData.enemy.damageReduction += 20;
					combatData.enemy.baseDamageReduction += 20;
				}
				if (selectedDungeon === 15 && dungeonCount < 21) enemyMediaAdjustment = "filter: saturate(15%);";
			}
			enemyInCombat = enemy;
			monsterStats[enemy].stats[8]++;
			combatData.enemy.id = enemy;
			if (!isGolbinRaid) combatData.enemy.attackType = MONSTERS[enemy].attackType;
			else combatData.enemy.attackType = Math.floor(Math.random() * 3);
			if (!isGolbinRaid) {
				combatData.enemy.maxHitpoints = MONSTERS[enemy].hitpoints * numberMultiplier;
				combatData.enemy.hitpoints = MONSTERS[enemy].hitpoints * numberMultiplier;
				combatData.enemy.attackLevel = MONSTERS[enemy].attackLevel;
				combatData.enemy.strengthLevel = MONSTERS[enemy].strengthLevel;
				combatData.enemy.defenceLevel = MONSTERS[enemy].defenceLevel;
				combatData.enemy.rangedLevel = MONSTERS[enemy].rangedLevel;
				combatData.enemy.magicLevel = MONSTERS[enemy].magicLevel;
				combatData.enemy.attackBonus = MONSTERS[enemy].attackBonus;
				combatData.enemy.strengthBonus = MONSTERS[enemy].strengthBonus;
				combatData.enemy.defenceBonus = MONSTERS[enemy].defenceBonus;
				combatData.enemy.attackBonusRanged = MONSTERS[enemy].attackBonusRanged;
				combatData.enemy.strengthBonusRanged = MONSTERS[enemy].strengthBonusRanged;
				combatData.enemy.defenceBonusRanged = MONSTERS[enemy].defenceBonusRanged;
				combatData.enemy.attackBonusMagic = MONSTERS[enemy].attackBonusMagic;
				combatData.enemy.damageBonusMagic = MONSTERS[enemy].damageBonusMagic;
				combatData.enemy.defenceBonusMagic = MONSTERS[enemy].defenceBonusMagic;
			} else {
				combatData.enemy.maxHitpoints = getGolbinLevel(true) * numberMultiplier;
				combatData.enemy.hitpoints = combatData.enemy.maxHitpoints;
				combatData.enemy.attackLevel = getGolbinLevel();
				combatData.enemy.strengthLevel = getGolbinLevel();
				combatData.enemy.defenceLevel = getGolbinLevel();
				combatData.enemy.rangedLevel = getGolbinLevel();
				combatData.enemy.magicLevel = getGolbinLevel();
				combatData.enemy.attackBonus = getGolbinBonuses();
				combatData.enemy.strengthBonus = getGolbinBonuses();
				combatData.enemy.defenceBonus = getGolbinBonuses();
				combatData.enemy.attackBonusRanged = getGolbinBonuses();
				combatData.enemy.strengthBonusRanged = getGolbinBonuses();
				combatData.enemy.defenceBonusRanged = getGolbinBonuses();
				combatData.enemy.attackBonusMagic = getGolbinBonuses();
				combatData.enemy.damageBonusMagic = 0;
				combatData.enemy.defenceBonusMagic = 0;
				combatData.enemy.magicStrengthBonus = getGolbinBonuses();
			}
			calculateEnemyAccuracy();
			calculateEnemyStrength();
			calculateEnemyDefence();
			if (isGolbinRaid) combatData.enemy.baseAttackSpeed = MONSTERS[enemy].attackSpeed / golbinModifier;
			else combatData.enemy.baseAttackSpeed = MONSTERS[enemy].attackSpeed;
			if (MONSTERS[enemy].damageReduction !== undefined) {
				combatData.enemy.damageReduction += MONSTERS[enemy].damageReduction;
				combatData.enemy.baseDamageReduction += MONSTERS[enemy].damageReduction;
			}
			updateEnemyAttackSpeed();
			if (!isGolbinRaid) $("#combat-enemy-name").text(enemyTrait + MONSTERS[enemy].name);
			else $("#combat-enemy-name").text(getGolbinName());
			$("#combat-enemy-hitpoints-max").text(formatNumber(combatData.enemy.maxHitpoints));
			$("#combat-enemy-hitpoints-current").text(formatNumber(combatData.enemy.maxHitpoints));
			$("#combat-enemy-hitpoints-bar").css("width", "100%");
			$("#combat-enemy-attack-speed").text(MONSTERS[enemy].attackSpeed / 1000 + "s");
			$("#combat-enemy-attack-bonus").text(numberWithCommas(combatData.enemy.maximumAttackRoll));
			$("#combat-enemy-strength-bonus").text(numberWithCommas(combatData.enemy.maximumStrengthRoll));
			$("#combat-enemy-defence-evasion").text(numberWithCommas(combatData.enemy.maximumDefenceRoll));
			$("#combat-enemy-ranged-evasion").text(numberWithCommas(combatData.enemy.maximumRangedDefenceRoll));
			$("#combat-enemy-magic-evasion").text(numberWithCommas(combatData.enemy.maximumMagicDefenceRoll));
			$("#combat-enemy-damage-reduction").text(numberWithCommas(combatData.enemy.damageReduction + "%"));
			$("#combat-enemy-attack-level").text(combatData.enemy.attackLevel);
			$("#combat-enemy-strength-level").text(combatData.enemy.strengthLevel);
			$("#combat-enemy-defence-level").text(combatData.enemy.defenceLevel);
			$("#combat-enemy-ranged-level").text(combatData.enemy.rangedLevel);
			$("#combat-enemy-magic-level").text(combatData.enemy.magicLevel);
			$("#combat-enemy-combat-level").text(getMonsterCombatLevel(enemy));
			if (tooltipInstances.enemyAttackType !== undefined) {
				tooltipInstances.enemyAttackType.forEach((instance) => {
					instance.destroy();
				});
				tooltipInstances.enemyAttackType.length = 0; // clear it
			} else tooltipInstances.enemyAttackType = [];
			if (combatData.enemy.attackType === CONSTANTS.attackType.Melee) {
				$("#combat-enemy-attack-type").attr("src", "assets/media/skills/combat/attack.svg");
				const tooltip = tippy("#combat-enemy-attack-type", {
					content: "Melee",
					placement: "bottom",
					interactive: false,
					animation: false,
				});
				tooltipInstances.enemyAttackType = tooltipInstances.enemyAttackType.concat(tooltip);
			} else if (combatData.enemy.attackType === CONSTANTS.attackType.Ranged) {
				$("#combat-enemy-attack-type").attr("src", "assets/media/skills/ranged/ranged.svg");
				const tooltip = tippy("#combat-enemy-attack-type", {
					content: "Ranged",
					placement: "bottom",
					interactive: false,
					animation: false,
				});
				tooltipInstances.enemyAttackType = tooltipInstances.enemyAttackType.concat(tooltip);
			} else if (combatData.enemy.attackType === CONSTANTS.attackType.Magic) {
				$("#combat-enemy-attack-type").attr("src", "assets/media/skills/magic/magic.svg");
				const tooltip = tippy("#combat-enemy-attack-type", {
					content: "Magic",
					placement: "bottom",
					interactive: false,
					animation: false,
				});
				tooltipInstances.enemyAttackType = tooltipInstances.enemyAttackType.concat(tooltip);
			}
			combatData.enemy.hasSpecialAttack = false;
			combatData.enemy.specialAttackID = null;
			combatData.enemy.specialAttackChances = [];
			let specialAttack = "";
			$("#combat-enemy-special-attack").addClass("d-none");
			if (MONSTERS[enemy].hasSpecialAttack) {
				combatData.enemy.hasSpecialAttack = true;
				combatData.enemy.specialAttackID = MONSTERS[enemy].specialAttackID;
				for (let i = 0; i < combatData.enemy.specialAttackID.length; i++) {
					if (MONSTERS[enemy].overrideSpecialChances !== undefined) {
						combatData.enemy.specialAttackChances.push(MONSTERS[enemy].overrideSpecialChances[i]);
						specialAttack += "<br><strong>" + enemySpecialAttacks[combatData.enemy.specialAttackID[i]].name + "</strong> (" + MONSTERS[enemy].overrideSpecialChances[i] + "%) - " + enemySpecialAttacks[combatData.enemy.specialAttackID[i]].description;
					} else {
						combatData.enemy.specialAttackChances.push(enemySpecialAttacks[combatData.enemy.specialAttackID[i]].chance);
						specialAttack += "<br><strong>" + enemySpecialAttacks[combatData.enemy.specialAttackID[i]].name + "</strong> (" + enemySpecialAttacks[combatData.enemy.specialAttackID[i]].chance + "%) - " + enemySpecialAttacks[combatData.enemy.specialAttackID[i]].description;
					}
				}
				$("#combat-enemy-special-attack").removeClass("d-none");
			}
			if (MONSTERS[enemy].hasPassive) {
				combatData.enemy.hasPassive = true;
				combatData.enemy.passiveID = MONSTERS[enemy].passiveID;
				specialAttack += `<br><h5 class="font-w700 font-size-sm text-warning m-1 mb-2 mt-3">Enemy Passive</h5><h5 class="font-w400 font-size-sm text-combat-smoke m-1 mb-2">`;
				for (let i = 0; i < MONSTERS[enemy].passiveID.length; i++) {
					specialAttack += "<br><strong>" + combatPassive[MONSTERS[enemy].passiveID[i]].name + "</strong> (" + combatPassive[MONSTERS[enemy].passiveID[i]].chance + "%) - " + combatPassive[MONSTERS[enemy].passiveID[i]].description;
				}
				specialAttack += "</h5>";
				$("#combat-enemy-special-attack").removeClass("d-none");
			}
			$("#combat-enemy-special-attack-desc").html(specialAttack);
			combatData.enemy.attackSpeedDebuff = 0;
			combatData.enemy.attackSpeedDebuffTurns = 0;
			combatData.enemy.isBleeding = false;
			combatData.enemy.stunned = false;
			combatData.enemy.stunTurns = 0;
			updateEnemyChanceToHit();
			updatePlayerSpecialWeapon();
			updateEnemyMaxHit();
			updateTooltips();
			let monsterMedia = getMonsterMedia(enemy);
			if (isGolbinRaid) {
				if ((golbinWave + 1) % 10 === 0 && golbinEnemyCount + 1 >= Math.floor(2 + golbinWave * 0.25)) monsterMedia = "assets/media/monsters/golbin-boss.svg";
				else monsterMedia = "assets/media/monsters/golbin-" + Math.floor(Math.random() * 21) + ".svg";
			}
			$("#combat-enemy-img").html("");
			if ((MONSTERS[enemy].isBoss && selectedDungeon !== 15) || (isDungeon && dungeonCount === DUNGEONS[selectedDungeon].monsters.length - 1) || (isDungeon && selectedDungeon === 15 && dungeonCount >= DUNGEONS[selectedDungeon].monsters.length - 3)) $("#combat-enemy-img").append('<img class="combat-enemy-img dungeon-boss" src="' + monsterMedia + '">');
			else $("#combat-enemy-img").append('<img class="combat-enemy-img" src="' + monsterMedia + '">');
			if (MONSTERS[enemy].description !== undefined) {
				$("#combat-enemy-img").append('<br><span class="text-danger">' + MONSTERS[enemy].description + "</span>");
			}
			if (enemyMediaAdjustment !== "") $("#combat-enemy-img").prop("style", enemyMediaAdjustment);
			else $("#combat-enemy-img").prop("style", "");
			let combatAreaVisual = [0, 0];
			if (!isDungeon) {
				if (enemy !== 139) {
					selectedCombatArea = findEnemyArea(enemy, true);
					combatAreaVisual = findEnemyArea(enemy, false);
					if (combatAreaVisual[0] === 0) {
						$("#combat-dungeon-name").text(combatAreas[combatAreaVisual[1]].areaName);
						$("#combat-dungeon-img").attr("src", combatAreas[combatAreaVisual[1]].media);
					} else if (combatAreaVisual[0] === 1) {
						$("#combat-dungeon-name").text(slayerAreas[combatAreaVisual[1]].areaName);
						$("#combat-dungeon-img").attr("src", slayerAreas[combatAreaVisual[1]].media);
						$("#combat-area-effect").removeClass("d-none");
						if (slayerAreas[combatAreaVisual[1]].areaEffect) {
							$("#combat-area-effect").text(slayerAreas[combatAreaVisual[1]].areaEffectDescription);
							$("#combat-area-effect").attr("class", "font-w400 font-size-sm text-danger ml-2");
						} else {
							$("#combat-area-effect").text("No Area Effect");
							$("#combat-area-effect").attr("class", "font-w400 font-size-sm text-success ml-2");
						}
					}
				} else {
					selectedCombatArea = "Unknown Location";
					$("#combat-dungeon-name").text("Unknown Location");
				}
			}
			newEnemyLoading = false;
			updatePlayerStats();
			updatePlayerChanceToHit();
			updateCombatInfoIcons();
			if (selectedDungeon !== 15 || (selectedDungeon === 15 && dungeonCount < 20)) startCombat();
			else pauseDungeon();
		}, interval);
	}
}

// Fast Attack Speed
function calculatePlayerAttackSpeed() {
	playerAttackSpeed = 2400;
	let decreasedPlayerAttackSpeed = 0;
	for (let i = 0; i < equippedItems.length; i++) {
		if (equippedItems[i] != 0) {
			if (items[equippedItems[i]].decreasedAttackSpeed !== undefined) decreasedPlayerAttackSpeed += items[equippedItems[i]].decreasedAttackSpeed;
		}
	}
	if (equippedItems[CONSTANTS.equipmentSlot.Weapon] !== 0 && items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].type !== "Ranged Weapon") playerAttackSpeed = items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].attackSpeed;
	if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].type === "Ranged Weapon" || items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isRanged) {
		if (attackStyle === CONSTANTS.attackStyle.Accurate) playerAttackSpeed = items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].attackSpeed;
		else if (attackStyle === CONSTANTS.attackStyle.Rapid) playerAttackSpeed = items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].attackSpeed - 400;
		else if (attackStyle === CONSTANTS.attackStyle.Longrange) playerAttackSpeed = items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].attackSpeed;
	}
	if (equippedItems.includes(CONSTANTS.item.Guardian_Amulet) && combatData.player.hitpoints < maxHitpoints / 2) playerAttackSpeed = Math.floor(playerAttackSpeed * 1.4);
	else if (equippedItems.includes(CONSTANTS.item.Guardian_Amulet)) playerAttackSpeed = Math.floor(playerAttackSpeed * 1.2);
	if (petUnlocked[23]) playerAttackSpeed -= 100;
	if (isGolbinRaid) playerAttackSpeed /= golbinModifier;
	playerAttackSpeed -= decreasedPlayerAttackSpeed;
	if (selectedCombatArea === "Dark Waters") playerAttackSpeed *= (100 + calculateAreaEffectValue(slayerAreas[CONSTANTS.slayerArea.Dark_Waters].areaEffectValue)) / 100;
	combatData.player.baseAttackSpeed = 250;
	updatePlayerAttackSpeed();
}

// More Combat Damage
function setCombatDamageAdjustment() {
	if (isInCombat && !newEnemyLoading) {
		let damageAdjustment = 10;
		//melee
		if (attackStyle < 3) {
			if (combatData.enemy.attackType === CONSTANTS.attackType.Ranged) damageAdjustment = 11.1;
			else if (combatData.enemy.attackType === CONSTANTS.attackType.Magic) {
				if (currentGamemode === 1) damageAdjustment = 10.8;
				else damageAdjustment = 10.9;
			}
		}
		//ranged
		else if (attackStyle < 6) {
			if (combatData.enemy.attackType === CONSTANTS.attackType.Melee) {
				if (currentGamemode === 1) damageAdjustment = 10.8;
				else damageAdjustment = 10.9;
			} else if (combatData.enemy.attackType === CONSTANTS.attackType.Magic) damageAdjustment = 11.1;
		}
		//magic
		else {
			if (combatData.enemy.attackType === CONSTANTS.attackType.Melee) damageAdjustment = 11.1;
			else if (combatData.enemy.attackType === CONSTANTS.attackType.Ranged) {
				if (currentGamemode === 1) damageAdjustment = 10.8;
				else damageAdjustment = 10.9;
			}
		}
		return damageAdjustment;
	}
	return false;
}

// Better Change to hit
function attackEnemy(playerSpec = false, specID = false, canAncientAttack = true, useAncientRunes = true) {
	let forceHit = false;
	let setDamage = null;
	let damageMultiplier = 1;
	let healsFor = 0;
	let applyBleed = false;
	let canStun = false;
	let stunTurns = 0;
	let maxHit = false;
	let stormsnap = false;
	let stunDamageMultiplier = 1;
	let canSleep = false;
	let sleepTurns = 1;
	if (playerSpec) {
		if (playerSpecialAttacks[specID].forceHit) {
			forceHit = playerSpecialAttacks[specID].forceHit && (!items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isMagic || !isSpellAncient || maximumAttackRoll > 20000);
		}
		if (playerSpecialAttacks[specID].setHPDamage !== undefined) {
			let setHPDamage = (playerSpecialAttacks[specID].setHPDamage / 100) * combatData.player.hitpoints;
			setDamage = Math.floor(Math.random() * setHPDamage + 10);
		} else if (playerSpecialAttacks[specID].customDamageModifier !== undefined) {
			setDamage = Math.floor(baseMaxHit * (1 - playerSpecialAttacks[specID].customDamageModifier / 100));
		} else if (playerSpecialAttacks[specID].setDamage !== null && playerSpecialAttacks[specID].setDamage !== undefined) setDamage = playerSpecialAttacks[specID].setDamage * numberMultiplier;
		damageMultiplier = playerSpecialAttacks[specID].damageMultiplier;
		healsFor = playerSpecialAttacks[specID].healsFor;
		if (playerSpecialAttacks[specID].stunChance !== undefined) {
			let chance = Math.random() * 100;
			if (playerSpecialAttacks[specID].stunChance > chance) canStun = true;
		} else canStun = playerSpecialAttacks[specID].canStun;
		maxHit = playerSpecialAttacks[specID].maxHit;
		stunDamageMultiplier = playerSpecialAttacks[specID].stunDamageMultiplier;
		if (canStun) stunTurns = playerSpecialAttacks[specID].stunTurns;
		if (playerSpecialAttacks[specID].canBleed && !combatData.enemy.isBleeding) {
			if (playerSpecialAttacks[specID].bleedChance !== undefined) {
				let chance = Math.random() * 100;
				if (playerSpecialAttacks[specID].bleedChance > chance) applyBleed = true;
			} else applyBleed = true;
			if (applyBleed) {
				combatData.enemy.bleedInterval = playerSpecialAttacks[specID].bleedInterval;
				combatData.enemy.bleedCount = playerSpecialAttacks[specID].bleedCount;
				if (playerSpecialAttacks[specID].totalBleedHP > 0) combatData.enemy.totalBleedHP = playerSpecialAttacks[specID].totalBleedHP;
				else if (playerSpecialAttacks[specID].totalBleedHPPercent !== undefined) combatData.enemy.totalBleedHP = Math.floor(combatData.enemy.maxHitpoints * (playerSpecialAttacks[specID].totalBleedHPPercent / 100));
			}
		}
		if (playerSpecialAttacks[specID].canSleep !== undefined) {
			canSleep = playerSpecialAttacks[specID].canSleep;
			sleepTurns = playerSpecialAttacks[specID].sleepTurns;
		}
		if (playerSpecialAttacks[specID].stormsnap) stormsnap = true;
		if (playerSpecialAttacks[specID].decreasedRangedEvasion !== undefined) {
			combatData.enemy.decreasedRangedEvasion = playerSpecialAttacks[specID].decreasedRangedEvasion;
			calculateEnemyDefence();
			updateEnemyValues();
			updatePlayerChanceToHit();
		}
		if (playerSpecialAttacks[specID].decreasedMeleeEvasion !== undefined) {
			combatData.enemy.decreasedMeleeEvasion = playerSpecialAttacks[specID].decreasedMeleeEvasion;
			calculateEnemyDefence();
			updateEnemyValues();
			updatePlayerChanceToHit();
		}
		if (playerSpecialAttacks[specID].decreasedMagicEvasion !== undefined) {
			combatData.enemy.decreasedMagicEvasion = playerSpecialAttacks[specID].decreasedMagicEvasion;
			calculateEnemyDefence();
			updateEnemyValues();
			updatePlayerChanceToHit();
		}
		if (playerSpecialAttacks[specID].decreasedAccuracy !== undefined) {
			combatData.enemy.decreasedAccuracy = playerSpecialAttacks[specID].decreasedAccuracy;
			calculateEnemyAccuracy();
			updateEnemyValues();
			updateEnemyChanceToHit();
		}
		$("#combat-progress-attack-player").attr("class", "progress-bar progress-bar-striped progress-bar-animated bg-warning");
	}
	let hasAmmo = true;
	let hasRunes = true;
	let playerAccuracy;
	let enemyDefenceRoll;
	if (attackStyle < 3) enemyDefenceRoll = combatData.enemy.maximumDefenceRoll;
	else if (attackStyle < 6) enemyDefenceRoll = combatData.enemy.maximumRangedDefenceRoll;
	else enemyDefenceRoll = combatData.enemy.maximumMagicDefenceRoll;
	if (maximumAttackRoll < enemyDefenceRoll) playerAccuracy = ((0.5 * maximumAttackRoll) / enemyDefenceRoll) * 100;
	else playerAccuracy = (1 - (0.5 * enemyDefenceRoll) / maximumAttackRoll) * 100;
	let chanceToHit = 0;
	if (herbloreBonuses[13].bonus[0] === 9 && herbloreBonuses[13].charges > 0 && !isGolbinRaid) {
		let diamondLuck = Math.floor(Math.random() * 100);
		if (chanceToHit > diamondLuck) chanceToHit = diamondLuck;
	}
	if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[9]++;
	if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].type === "Ranged Weapon" || items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isRanged) {
		if (equippedItems[CONSTANTS.equipmentSlot.Quiver] === 0 || ammo < 1 || items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].ammoTypeRequired !== items[equippedItems[CONSTANTS.equipmentSlot.Quiver]].ammoType) {
			hasAmmo = false;
		}
		if (hasAmmo) {
			let chanceToKeep = Math.random() * 100;
			if (chanceToKeep >= ammoPreservation) {
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]] !== 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]].stats[10]++;
				ammo--;
				equipmentSets[selectedEquipmentSet].ammo--;
			}
			if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]] !== 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]].stats[9]++;
			updateAmmo();
		}
	}
	if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isMagic) {
		let ignoreRunes = false;
		let chanceToPreserve = 0;
		if (equippedItems[CONSTANTS.equipmentSlot.Cape] === CONSTANTS.item.Skull_Cape) chanceToPreserve += 20;
		if (petUnlocked[17]) chanceToPreserve += 5;
		if (chanceToPreserve > 0) {
			let chance = Math.random() * 100;
			if (chance < chanceToPreserve) ignoreRunes = true;
		}
		if (!ignoreRunes) {
			if (isSpellAncient) hasRunes = checkRuneCount(3, selectedAncient, useAncientRunes);
			else hasRunes = checkRuneCount(0, selectedSpell);
		}
	}
	if (!hasAmmo) {
		notifyPlayer(CONSTANTS.skill.Ranged, "You have no ammo", "danger");
		if (isGolbinRaid) equipItem(CONSTANTS.item.Bronze_Scimitar, 1, selectedEquipmentSet, true);
	} else if (!hasRunes || !canAncientAttack) {
		let runeType = "Standard Runes";
		if (useCombinationRunes) runeType = "Combination Runes";
		notifyPlayer(CONSTANTS.skill.Magic, "You don't have enough " + runeType + ".", "danger");
		if (isGolbinRaid) equipItem(CONSTANTS.item.Bronze_Scimitar, 1, selectedEquipmentSet, true);
	} else {
		//check for magic curses here, after we know the player has enough combat runes to perform an attack
		if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isMagic || items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].canUseMagic) {
			if (selectedCurse !== null && !combatData.enemy.isCursed && !isSpellAncient && combatData.enemy.id !== 147 && combatData.enemy.id !== 148) applyCurseToEnemy(selectedCurse);
			if (activeAurora !== null) updatePlayerAurora(useAncientRunes);
		}
		let damageToEnemy = 0;
		if (
			(playerAccuracy > chanceToHit || forceHit || combatData.enemy.stunned || combatData.enemy.sleep) &&
			!combatData.player.sleep &&
			!combatData.player.stunned &&
			(combatData.enemy.id !== 147 || (combatData.enemy.id === 147 && (attackStyle === 0 || attackStyle === 1 || attackStyle === 2))) &&
			(combatData.enemy.id !== 148 || (combatData.enemy.id === 148 && (attackStyle === 3 || attackStyle === 4 || attackStyle === 5))) &&
			(combatData.enemy.id !== 149 || (combatData.enemy.id === 149 && (attackStyle === 6 || attackStyle === 7)))
		) {
			let damageAdjustment = setCombatDamageAdjustment();
			if (setDamage !== null) damageToEnemy = setDamage * damageMultiplier * damageAdjustment;
			else if (maxHit) damageToEnemy = baseMaxHit * damageMultiplier;
			else if (stormsnap) {
				let playerMagicLevel = skillLevel[CONSTANTS.skill.Magic];
				if (isGolbinRaid) playerMagicLevel = golbinSkillLevels[5];
				damageToEnemy = (6 + 6 * playerMagicLevel) * damageAdjustment;
			} else {
				let minHitIncrease = 0;
				if (items[equippedItems[CONSTANTS.equipmentSlot.Weapon]].isMagic) minHitIncrease += increasedMinSpellDmg[SPELLS[selectedSpell].spellType];
				if (combatData.player.increasedMinHit !== undefined) {
					if (combatData.player.increasedMinHit !== null) minHitIncrease += combatData.player.increasedMinHit;
				}
				if (minHitIncrease + 1 >= baseMaxHit) damageToEnemy = baseMaxHit;
				else damageToEnemy = Math.ceil(Math.random() * (baseMaxHit - minHitIncrease)) + minHitIncrease;
				damageToEnemy *= damageMultiplier;
			}
			//check if enemy is cursed or has some damage multiplayer attached to it, apply the extra dmgs
			if (combatData.enemy.extraDamageMultiplier !== undefined && combatData.enemy.extraDamageMultiplier !== null) damageToEnemy = damageToEnemy * combatData.enemy.extraDamageMultiplier;
			if (combatData.enemy.stunned) damageToEnemy *= stunDamageMultiplier;
			if (combatData.enemy.sleep) damageToEnemy *= sleepDamageMultiplier;
			if (!isDungeon) {
				let enemyArea = findEnemyArea(combatData.enemy.id, false);
				if (enemyArea[0] === 1) {
					if (enemyArea[1] !== undefined) {
						if (slayerAreas[enemyArea[1]].slayerItem > 0) {
							if (!equippedItems.includes(slayerAreas[enemyArea[1]].slayerItem) && !equippedItems.includes(CONSTANTS.item.Slayer_Skillcape) && equippedItems[CONSTANTS.equipmentSlot.Cape] !== CONSTANTS.item.Max_Skillcape && equippedItems[CONSTANTS.equipmentSlot.Cape] !== CONSTANTS.item.Cape_of_Completion) damageToEnemy = 0;
						}
					}
				}
			}
			if ((attackStyle === CONSTANTS.attackStyle.Accurate || attackStyle === CONSTANTS.attackStyle.Rapid || attackStyle === CONSTANTS.attackStyle.Longerange) && equippedItems.includes(CONSTANTS.item.Deadeye_Amulet)) {
				let chance = Math.random() * 100;
				if (chance < items[CONSTANTS.item.Deadeye_Amulet].chanceToCrit) damageToEnemy = Math.floor(damageToEnemy * items[CONSTANTS.item.Deadeye_Amulet].critDamage);
			}
			if (slayerTask.length) {
				if (slayerTask[0].monsterID === combatData.enemy.id && (equippedItems.includes(CONSTANTS.item.Slayer_Skillcape) || equippedItems.includes(CONSTANTS.item.Max_Skillcape) || equippedItems.includes(CONSTANTS.item.Cape_of_Completion))) damageToEnemy *= 1.05;
			}
			if (combatData.enemy.damageReduction > 0) damageToEnemy = Math.floor(damageToEnemy * (1 - combatData.enemy.damageReduction / 100));
			if (combatData.enemy.hitpoints < damageToEnemy) damageToEnemy = combatData.enemy.hitpoints;
			damageToEnemy = Math.floor(damageToEnemy);
			damageEnemy(damageToEnemy);
			if (applyBleed) {
				let bleedHPPerProc = 0;
				if (playerSpecialAttacks[specID].totalBleedHP > 0) {
					if (playerSpecialAttacks[specID].totalBleedHPCustom !== undefined) {
						if (playerSpecialAttacks[specID].totalBleedHPCustom === 1) bleedHPPerProc = Math.floor((Math.random() * (damageToEnemy * combatData.enemy.totalBleedHP)) / combatData.enemy.bleedCount);
					} else bleedHPPerProc = Math.floor((damageToEnemy * combatData.enemy.totalBleedHP) / combatData.enemy.bleedCount);
				} else bleedHPPerProc = Math.floor(combatData.enemy.totalBleedHP / combatData.enemy.bleedCount);
				applyBleedToEnemy(bleedHPPerProc, combatData.enemy.bleedInterval, combatData.enemy.bleedCount);
			}
			if (combatData.enemy.reflectMelee > 0) {
				damagePlayer(combatData.enemy.reflectMelee * numberMultiplier);
			}
			if (equippedItems.includes(CONSTANTS.item.Fighter_Amulet) && attackStyle < 3) {
				if (damageToEnemy >= baseMaxHit * 0.7) {
					canStun = true;
					stunTurns = 1;
				}
			}
			if (equippedItems.includes(CONSTANTS.item.Confetti_Crossbow)) {
				let gpMultiplier = gp / 25000000;
				if (gpMultiplier > items[CONSTANTS.item.Confetti_Crossbow].gpMultiplierCap) gpMultiplier = items[CONSTANTS.item.Confetti_Crossbow].gpMultiplierCap;
				else if (gpMultiplier < items[CONSTANTS.item.Confetti_Crossbow].gpMultiplierMin) gpMultiplier = items[CONSTANTS.item.Confetti_Crossbow].gpMultiplierMin;
				if (equippedItems.includes(CONSTANTS.item.Aorpheats_Signet_Ring)) gpMultiplier *= 2;
				gp += Math.floor(damageToEnemy * gpMultiplier);
				updateGP();
			}
			let healPlayer = 0;
			let lifesteal = 0;
			if (healsFor > 0) lifesteal += healsFor * 100;
			if ((attackStyle === CONSTANTS.attackStyle.Magic || attackStyle === CONSTANTS.attackStyle.Defensive) && equippedItems.includes(CONSTANTS.item.Warlock_Amulet)) lifesteal += items[CONSTANTS.item.Warlock_Amulet].spellHeal;
			if (combatData.player.lifesteal !== undefined) {
				if (combatData.player.lifesteal > 0) lifesteal += combatData.player.lifesteal;
			}
			if (equippedItems.includes(CONSTANTS.item.Elder_Crown)) lifesteal += items[CONSTANTS.item.Elder_Crown].lifesteal;
			if (lifesteal > 0) healPlayer += damageToEnemy * (lifesteal / 100);
			if (healPlayer > 0) updatePlayerHitpoints(Math.floor(healPlayer));
			let combatXpToAdd = (damageToEnemy / numberMultiplier) * 4;
			if (combatXpToAdd < 4) combatXpToAdd = 4;
			let hpXpToAdd = ((damageToEnemy / numberMultiplier) * 1.33 * 100) / 100;
			let prayerXpToAdd = 0;
			for (let i = 0; i < activePrayer.length; i++) {
				if (activePrayer[i]) prayerXpToAdd += (damageToEnemy / numberMultiplier) * 2 * PRAYER[i].pointsPerPlayer;
			}
			//Into the Mist Phase 3 stacking DR
			if (combatData.enemy.intoTheMist) {
				combatData.enemy.increasedDamageReduction += 10;
				activateEnemyBuffs();
			}
			if (equippedItems.includes(CONSTANTS.item.Gold_Emerald_Ring)) {
				combatXpToAdd += combatXpToAdd * 0.07;
				hpXpToAdd += hpXpToAdd * 0.07;
				prayerXpToAdd += (prayerXpToAdd * 0.07) / 2;
			}
			if (attackStyle === CONSTANTS.attackStyle.Stab) {
				addXP(CONSTANTS.skill.Attack, combatXpToAdd);
				updateSkillWindow(CONSTANTS.skill.Attack);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				rollForPet(12, playerAttackSpeed);
			}
			if (attackStyle === CONSTANTS.attackStyle.Slash) {
				addXP(CONSTANTS.skill.Strength, combatXpToAdd);
				updateSkillWindow(CONSTANTS.skill.Strength);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				rollForPet(13, playerAttackSpeed);
			}
			if (attackStyle === CONSTANTS.attackStyle.Block) {
				addXP(CONSTANTS.skill.Defence, combatXpToAdd);
				updateSkillWindow(CONSTANTS.skill.Defence);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				rollForPet(14, playerAttackSpeed);
			}
			if (attackStyle === CONSTANTS.attackStyle.Accurate || attackStyle === CONSTANTS.attackStyle.Rapid) {
				addXP(CONSTANTS.skill.Ranged, combatXpToAdd);
				updateSkillWindow(CONSTANTS.skill.Ranged);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]].stats[5] += damageToEnemy;
				rollForPet(16, playerAttackSpeed);
			}
			if (attackStyle === CONSTANTS.attackStyle.Longrange) {
				addXP(CONSTANTS.skill.Ranged, combatXpToAdd / 2);
				addXP(CONSTANTS.skill.Defence, combatXpToAdd / 2);
				updateSkillWindow(CONSTANTS.skill.Ranged);
				updateSkillWindow(CONSTANTS.skill.Defence);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]].stats[5] += damageToEnemy;
				rollForPet(14, playerAttackSpeed);
				rollForPet(16, playerAttackSpeed);
			}
			if (attackStyle === CONSTANTS.attackStyle.Magic) {
				addXP(CONSTANTS.skill.Magic, combatXpToAdd);
				updateSkillWindow(CONSTANTS.skill.Magic);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				rollForPet(17, playerAttackSpeed);
			}
			if (attackStyle === CONSTANTS.attackStyle.Defensive) {
				addXP(CONSTANTS.skill.Magic, combatXpToAdd / 2);
				addXP(CONSTANTS.skill.Defence, combatXpToAdd / 2);
				updateSkillWindow(CONSTANTS.skill.Magic);
				updateSkillWindow(CONSTANTS.skill.Defence);
				if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[5] += damageToEnemy;
				rollForPet(17, playerAttackSpeed);
				rollForPet(14, playerAttackSpeed);
			}
			if (prayerXpToAdd > 0) {
				addXP(CONSTANTS.skill.Prayer, prayerXpToAdd);
				rollForPet(18, playerAttackSpeed);
			}
			addXP(CONSTANTS.skill.Hitpoints, hpXpToAdd);
			rollForPet(15, playerAttackSpeed);
			if (slayerTask[0] !== undefined) {
				if (slayerTask[0].monsterID === enemyInCombat && !isDungeon) rollForPet(19, playerAttackSpeed);
			}
			updateSkillWindow(CONSTANTS.skill.Hitpoints);
			updateSkillWindow(CONSTANTS.skill.Prayer);
			if (enemyInCombat !== undefined) monsterStats[enemyInCombat].stats[5]++;
			updateStats("combat");
			if (playerSpec) {
				if (playerSpecialAttacks[specID].attackSpeedDebuff && combatData.enemy.attackSpeedDebuff <= 0 && combatData.enemy.attackSpeedDebuffTurns <= 0) {
					combatData.enemy.attackSpeedDebuff = playerSpecialAttacks[specID].attackSpeedDebuff;
					combatData.enemy.attackSpeedDebuffTurns = playerSpecialAttacks[specID].attackSpeedDebuffTurns;
					updateEnemyDebuffs();
				}
			}
			if (canStun && !combatData.enemy.stunned && !combatData.enemy.passiveID.includes(0)) {
				//set stunned player options
				combatData.enemy.stunned = true;
				combatData.enemy.stunTurns = stunTurns;
				//stop player attack
				clearTimeout(enemyTimer);
				clearTimeout(enemyAttackTimer);
				//reset attack bar
				resetEnemyAttackBar();
				startCombat(2);
			}
			if (canSleep && !combatData.enemy.sleep && !combatData.enemy.passiveID.includes(0)) {
				combatData.enemy.sleep = true;
				combatData.enemy.sleepTurns = sleepTurns;
				clearTimeout(enemyTimer);
				clearTimeout(enemyAttackTimer);
				resetEnemyAttackBar();
				startCombat(2);
			}
		} else if (equippedItems.includes(CONSTANTS.item.Candy_Cane) && combatData.enemy.id !== 148 && combatData.enemy.id !== 149) {
			let chance = 0.95;
			let roll = Math.random();
			if (roll >= chance) damageEnemy(696969);
			else damagePlayer(696969);
		} else {
			damageEnemy(0);
			statsCombat[3].count++;
			updateStats("combat");
			//console.log("[PLAYER] Missed!");
			if (itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Weapon]].stats[6]++;
			if ((attackStyle === CONSTANTS.attackStyle.Accurate || attackStyle === CONSTANTS.attackStyle.Rapid || attackStyle === CONSTANTS.attackStyle.Longrange) && equippedItems[CONSTANTS.equipmentSlot.Quiver] != 0) itemStats[equippedItems[CONSTANTS.equipmentSlot.Quiver]].stats[6]++;
			monsterStats[enemyInCombat].stats[7]++;
		}
		if (herbloreBonuses[13].bonus[0] !== null && herbloreBonuses[13].bonus[0] !== 11 && herbloreBonuses[13].bonus[0] !== 7 && herbloreBonuses[13].bonus[0] !== 1 && herbloreBonuses[13].bonus[0] !== 8 && herbloreBonuses[13].bonus[0] !== 10 && herbloreBonuses[13].charges > 0 && !isGolbinRaid) {
			updateHerbloreBonuses(herbloreBonuses[13].itemID);
		}
		for (let i = 0; i < activePrayer.length; i++) {
			if (activePrayer[i]) updatePrayerPoints(PRAYER[i].pointsPerPlayer);
		}
		if (combatData.player.attackSpeedDebuffTurns > 0) {
			combatData.player.attackSpeedDebuffTurns--;
			if (combatData.player.attackSpeedDebuffTurns <= 0) {
				removePlayerDebuffs(0);
			}
		}
		//saveData();
	}
	updateGameTitle();
}

