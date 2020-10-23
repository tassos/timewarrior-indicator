/*
 * Timewarrior Indicator with Gnome Shell
 * https://github.com/tassos/timewarrior-indicator
 *
 * Copyright (C) 2017 Tassos Natsakis
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this
 * program. If not, see http://www.gnu.org/licenses/.
 *
 */
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;

const St = imports.gi.St;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

let TIMEW = '/usr/bin/timew';
let TIMEWACT = TIMEW.concat(' get dom.active');
let TIMEWJSON = TIMEWACT.concat('.json');
let INTERVAL = 10;
let TAG_LIMIT = 20;

const TimeWarriorIndicator = new Lang.Class({
  Name: 'TimeWarriorIndicator', Extends: PanelMenu.Button,

  _init: function()
  {
    this.parent(0.0, 'TimeWarrior Indicator', false);
    this.label = new St.Label({
      text: "No activity",
      y_align: Clutter.ActorAlign.CENTER
    });

          let box = new St.BoxLayout();
          this.icon = new St.Icon({ icon_name: 'user-available',
                                  style_class: 'system-status-icon' });

          box.add_actor(this.icon);
          box.add_actor(this.label)
    this.actor.add_actor(box);
    this._refresh();

		// Adding menu items
		this.stopMenuItem = new PopupMenu.PopupMenuItem(_('Stop tracking'));
		this.restartMenuItem = new PopupMenu.PopupMenuItem(_('Restart tracking'));
		let settingsMenuItem = new PopupMenu.PopupMenuItem(_('Settings'));

		this.menu.addMenuItem(this.stopMenuItem);
		this.menu.addMenuItem(this.restartMenuItem);
		this.menu.addMenuItem(settingsMenuItem);

		// Bind menu items to actions
		this.stopMenuItem.connect('activate', Lang.bind(this, this._stopTracking));
		this.restartMenuItem.connect('activate', Lang.bind(this, this._restartTracking));
		settingsMenuItem.connect('activate', Lang.bind(this, this._openSettings));

		// Load settings
		this._settings = Utils.getSettings();
		this._settingsChangedId = this._settings.connect('changed', Lang.bind(this, this._applySettings));
		this._applySettings();
  },

  _refresh: function() {
    let v = this._currentActivity();
    if (v == null) {
    	this.label.set_text('No activity');
    	this.icon.icon_name = 'user-offline';
    } else {
	    this.label.set_text(this._currentActivity());
    	this.icon.icon_name = 'user-available';
    }
    this._removeTimeout();
    this._timeout = Mainloop.timeout_add_seconds(INTERVAL, Lang.bind(this, this._refresh));
    return true;
  },

  _removeTimeout: function() {
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
  },

  _currentActivity: function() {
		let [res, out, err, status] = GLib.spawn_command_line_sync(TIMEWACT);
		if (out == 1) {
	    response = this._fetchActivity();
		} else {
			response = null; //'No activity';
		}
		return response;
  },

  _fetchActivity: function(){
    let [res, out, err, status] = GLib.spawn_command_line_sync(TIMEWJSON);
		info = JSON.parse(out);

		if ("tags" in info)
			tags = info.tags.sort(function (a, b) { return b.length - a.length; });
		else
			tags = [TAG_DEFAULT];
		start = this._parseDate(info.start);
		now = new Date().getTime();
		miliseconds = now-start.getTime();
		duration = new Date(miliseconds);

		activity = tags[0];
		if (tags[0].length > TAG_LIMIT) {
			activity = activity.slice(0,TAG_LIMIT).concat('...');
		}

		hours = this._zeroPad(duration.getUTCHours());
		minutes = this._zeroPad(duration.getUTCMinutes());
		seconds = this._zeroPad(duration.getUTCSeconds());

		return activity.concat(' ',hours,':',minutes);
  },

	_zeroPad: function(num){
		snum = String(num);
		lng = snum.length;
		if (lng==1) {
			snum = String(0).concat(snum);
		}
		return snum;
	},

	_parseDate: function(input){
		return new Date(Date.UTC(
			parseInt(input.slice(0, 4), 10),
			parseInt(input.slice(4, 6), 10) - 1,
			parseInt(input.slice(6, 8), 10),
			parseInt(input.slice(9, 11), 10),
			parseInt(input.slice(11, 13), 10),
			parseInt(input.slice(13,15), 10)
		));
	},

	_stopTracking: function(){
		GLib.spawn_command_line_sync(TIMEW.concat(' stop'));
		this._refresh();
	},

	_restartTracking: function(){
		GLib.spawn_command_line_sync(TIMEW.concat(' continue'));
		this._refresh();
	},

	_openSettings: function () {
		Util.spawn([ "gnome-shell-extension-prefs", Me.uuid ]);
	},

	_applySettings: function() {
		INTERVAL = this._settings.get_int('interval');
		TIMEW = this._settings.get_string('timew-cmd');
		TAG_LIMIT = this._settings.get_int('tag-length');
		TAG_DEFAULT = "Work"; //this._settings.get_string('default-tag-text');
		TIMEWACT = TIMEW.concat(' get dom.active');
		TIMEWJSON = TIMEWACT.concat('.json');
	},

  stop: function(){
    if (this._timeout)
      Mainloop.source_remove(this._timeout);
    this._timeout = undefined;
    this.menu.removeAll();
  }
});

let twInt;

function init() {}

function enable() {
    twInt = new TimeWarriorIndicator;
    Main.panel.addToStatusArea("tw-indicator", twInt, 0, 'left');
}

function disable() {
    twInt.stop();
    twInt.destroy();
}
