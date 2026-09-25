/**
 * Electron enables nodeIntegration in the renderer, so some npm UMD builds
 * (notably rrule) export via module.exports and never set window globals.
 * Calendar code expects a global RRule (from the old bower build).
 */
(function () {
	"use strict";
	if (typeof window.RRule === "undefined") {
		try {
			var r = require("rrule");
			window.RRule = r.RRule || (r.default && r.default.RRule) || r;
		} catch (e) {
			console.error("Failed to load rrule for global RRule", e);
		}
	}
})();
