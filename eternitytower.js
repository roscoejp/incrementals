// ==UserScript==
// @name         Eternity Tower Script
// @namespace    http://tampermonkey.net/
// @version      0.1a
// @description  try to take over the world!
// @author       You
// @match        https://eternitytower.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Done:
//Cassie
//Mio


// === SCRIPT
var debug = false;
var healthThreshold = 67;
//var abilityTimer = setInterval(useAbilities, 1000);
var farmingInterval = 0;
var isQuestActive = false;

function beginBattle() {
	// only do anything if we're in the combat tab
	if ( location.pathname == "/combat" ) {

		// in case we're stuck on adventure tab - Navigate to personal quest
		if ($(".adventuresTabLink > a").hasClass("active")) { $(".nav-item.personalQuestTabLink").click(); }

		// make sure we're only looking at the out-of-battle health bar, not the in-battle one
		var healthBar = $(".d-flex.flex-column.m-3 > .progress.mt-1 > .progress-bar.bg-danger");
		var isHealthBarHidden = healthBar.parent().parent().parent().parent().hasClass("hidden-xs-up");
		var isHealthLow = healthBar.attr('aria-valuenow') < healthThreshold;

		// figure out if energy bar is low - goes through energy and magic bars
		var isEnergyBarLow = false;
		var energyBar = $(".progress.mt-1 > .progress-bar.bg-warning").each( function() {
			if ($(this).attr("aria-valuenow") <= 3) { // 1/40 = 2.5%
				isEnergyBarLow = true;
				return false;	// break the each loop
			}
		});

		// get currently active adventures from sidebar
		isQuestActive = ($(".d-flex.flex-wrap.align-items-center > .cancel-adventure > div").length) > 0 ? true : false;

		// if out of battle healthbar is visible click battle button
		if (!isHealthBarHidden) {
			// try farming every so often
			if (farmingInterval++ >= 30) {
				doFarming();
				farmingInterval = 0;
			}

			if (!isQuestActive) {
				if (isEnergyBarLow || isHealthLow) {
					// repeat until we're at full health
					healthThreshold = 90;

					// startadventure if energy low to better use downtime
					debugLog("low energy or health - adventure");
					doAdventure();

				} else {
					debugLog("begin battle");
					$(".btn.btn-primary.mt-1.random-battle").click();
					// change threshold so we can clump battles and quests
					healthThreshold = 67;
				}
			} else { debugLog("pass combat - waiting on active quest"); }
		}	// out of battle healthbar is hidden - we're out of tab or in combat
		else if(isHealthBarHidden) { useAbilities(); }
	} else if ( location.pathname == "/farming") { // not in /combat
        debugLog("not in /combat");
		doFarming();	// need to do this for greasemonkey since it runs script again? I think?
	}
}

function useAbilities(){
	// ability containers don't exist outside battle so catch exceptions
	try{
		$(".ability-icon-container").each(function() {
			// don't use the targetting action
			if ($(this).first().text().trim() != 't') {
				$(this).click();
				debugLog("used abilities");
			}
		});
	} catch(err) {}
}

function doAdventure(){
	// navigate to adventure tab
	$(".nav-item.adventuresTabLink").click();

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

	// Click on one new adventure - fail to longer missions if shorter ones not active
	if (shortAdventureButtons.length > 0) { shortAdventureButtons.first().click(); }
	else if (longAdventureButtons.length > 0) { longAdventureButtons.first().click(); }
	else if (epicAdventureButtons.length > 0) { epicAdventureButtons.first().click(); }
	else { debugLog("no adventures"); }

	// Clear out completed adventures
   	if (!isQuestActive) { $(".btn.btn-success.collect-adventure-btn").click(); }

	// Navigate to personal quest
	$(".nav-item.personalQuestTabLink").click();
}

function doFarming(){
	// navigate to farming window
	$(".nav-link[href='/farming']").click();

	// need to set timeout so we can wait for page load - get rid of this when we start checking via sidebar
	setTimeout(function(){

		var farmingPlots = $(".d-flex.flex-column.flex-wrap > .farm-space-container:not('.inactive')");
		var marigoldSeeds = $("img[src='/icons/marigoldSeed.svg']");

		// try picking the weeds
		for (var i = 0; i < farmingPlots.length; i++) {
			farmingPlots[i].click();
			debugLog("planting plot");
		}

		// try planting the weeds
		try {
			for (i = 0; i < farmingPlots.length; i++) {
				marigoldSeeds[0].click();
			}
		}
		catch(err) {
			debugLog("no seeds");
		}

		// navigate to combat window
		$(".nav-link[href='/combat']").click();

		// Navigate to personal quest
		$(".nav-item.personalQuestTabLink").click();
	});

}

function stopTimers() {
	window.clearInterval(i1);
	window.clearInterval(abilityTimer);
}

function debugLog(string) {
	if(debug) { console.log("[" + new Date().toUTCString() + "]" + string); }
}

// MAIN
var i1 = setInterval(beginBattle, 1000);
})();
