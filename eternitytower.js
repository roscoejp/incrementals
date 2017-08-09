// ==UserScript==
// @name         Eternity Tower Script
// @namespace    http://tampermonkey.net/
// @version      0.1a
// @description  Try to take over the world!
// @author       You
// @match        https://eternitytower.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
// === SCRIPT
// CONFIG
var debug = false;			// used for debug purposes (TODO)
var mainInterval = 10;			// Timer interval for main (in seconds)[10 seconds]
var abilityInterval = 1; 		// Timer interval for abilities (in seconds)[1 second]
var farmingFrequency = 6;		// Frequency to check farms (number of iterations of main)[1 min]
var healthThreshold = 60;		// Health before moving on to adventures (percentage of max)[60% health]
var fullHelathThreshold = 90;		// Health before moving from adventures to combat (percentage of max)[90% health]
var eneregyThreshold = 1;		// Energy threshold before moving to adventures (absolute value)[1 energy]
var reloadFrequency = 360;		// Frequency to reload the page to fix memory errors (number of iterations of main)[1 hour]

// HELPERS
var abilityTimer;
var farmingIntervalCount = 0;
var reloadIntervalCount = 0;
var capsLockDown = false;
$(document).on( "keydown", function(event) {if (event.which == 20) { 
	capsDown = true; 
	$(".navbar").css('background-color', 'indianred');
}});
$(document).on( "keyup", function(event) {if (event.which == 20) { 
	capsDown = false; 
	$(".navbar").css('background-color', '#f7f7f7');
}});
function navigateTo(string) { $(".nav-link[href='/" + string + "']").click(); }
function useAbilities(){
	// destroy active ability timers and restart (since it's only called in combat)
	window.clearInterval(abilityTimer);
	abilityTimer = setInterval(function() {
		try{	// ability containers don't exist outside battle so catch exceptions
			$(".ability-icon-container").each(function() {
				// don't use the targetting action
				if ($(this).first().text().trim() != 't') { $(this).click(); }
			});
		} catch(err) {}
	}, abilityInterval * 1000);
}
function doAdventure() {
	// navigate to adventure tab
	$(".nav-item.adventuresTabLink").click();

	setTimeout(function(){
		// Grab all adventure buttons
		var shortAdventureButtons = null;
		var longAdventureButtons = null;
		var epicAdventureButtons = null;
		$(".mt-3").each(function() {
			if ($(this).text().trim() == "Short Adventures") {
				shortAdventureButtons = $(".btn.btn-primary.start-adventure-btn", $(this).next());
			} else if ($(this).text().trim() == "Long Adventures") {
				longAdventureButtons = $(".btn.btn-primary.start-adventure-btn", $(this).next());
			} else if ($(this).text().trim() == "Epic Adventures") {
				epicAdventureButtons = $(".btn.btn-primary.start-adventure-btn", $(this).next());
			}
		});

		// Click on one new adventure - fail to longer missions if shorter ones not available
		if (shortAdventureButtons.length > 0) { shortAdventureButtons.first().click(); }
		else if (longAdventureButtons.length > 0) { longAdventureButtons.first().click(); }
		else if (epicAdventureButtons.length > 0) { epicAdventureButtons.first().click(); }
	});
}

// COMBAT
function doCombat() {
	var healthCheck = healthThreshold;
	var healthBar = $(".d-flex.flex-column.m-3 > .progress.mt-1 > .progress-bar.bg-danger");
	var isInCombat = healthBar.parent().parent().parent().parent().hasClass("hidden-xs-up");
	var isHealthLow = healthBar.attr('aria-valuenow') < healthCheck;
	var isEnergyBarLow = false;
	var energyBar = $(".progress.mt-1 > .progress-bar.bg-warning").each( function() {
		if ($(this).attr("aria-valuenow") <= 3) { // 1/40 = 2.5%
			isEnergyBarLow = true;
			return false;	// break the each loop
		}
	});
	var isQuestActive = (parseFloat($(".d-flex.flex-wrap.align-items-center > .cancel-adventure > div").text().trim())) < 100 ? true : false;

	// Collect quests
	$(".collect-adventure").click();
	
	if (!isInCombat) {		// figure out what to do since we're not in battle
		if (!isQuestActive) {
			if (isEnergyBarLow || isHealthLow) {
				// quest until we have energy/health
				healthCheck = fullHelathThreshold;
				doAdventure();

			} else {
				// actually battle and change health threshold to group battles and quests
				$(".btn.btn-primary.mt-1.random-battle").click();
				healthCheck = healthThreshold;
				useAbilities();
			}
		}
	}
	else if(isInCombat) { useAbilities(); }
}

// FARMING
function doFarming(){
	// need to set timeout so we can wait for page load - get rid of this when we start checking via sidebar
	setTimeout(function(){

		var farmingPlots = $(".d-flex.flex-column.flex-wrap > .farm-space-container:not('.inactive')");
		var marigoldSeeds = $("img[src='/icons/marigoldSeed.svg']");
		var cactusSeeds = $("img[src='/icons/cactusSeed.svg']");

		// try picking the weeds
		for (var i = 0; i < farmingPlots.length; i++) { farmingPlots[i].click(); }

		// buy seeds if we don't have any
		if (marigoldSeeds.length < 1 || cactusSeeds.length < 3) {
			$(".nav-item.shopLink").click();
			$(".nav-item.miscLink").click();
			if (marigoldSeeds.length < 1) { $("button[data-shop-item-id='marigold_seed'].buy-10").click(); }
			if (cactusSeeds.length < 1) { $("button[data-shop-item-id='cactus_seed'].buy-10").click(); }
		}

		// try planting the weeds. 1 marigold and 3 cacti
		$(".nav-item.plotsLink").click();
		try {
			marigoldSeeds[0].click();
			for (i = 0; i < farmingPlots.length - 1; i++) {
				cactusSeeds[0].click();
			}
		}
		catch(err) { }
	});
}

// MAIN TIMER
var mainTimer = setInterval(function() {
	if (!capsLockDown) {					// do nothing if caps is pressed
		if (location.pathname == "/combat" && $(".nav-item.personalQuestTabLink > a").hasClass("active")) {

			// reload occassionally to fix memory errors
			if (++reloadIntervalCount >= reloadFrequency) {
				reloadFrequency = 0;
				location.reload();
			}

			// check crops at regular intervals
			if (++farmingIntervalCount >= farmingFrequency) {
				farmingIntervalCount = 0;
				navigateTo("farming");
				doFarming();
			}

			doCombat();
			
			// back to where we started
			$(".nav-link[href='/combat']").click();
			$(".nav-item.personalQuestTabLink").click();
		}
	}
}, mainInterval * 1000);

// === /SCRIPT
})();
