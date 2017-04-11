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
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;

const TIMEW = '/usr/bin/timew';
const INTERVAL = 10;
const ERROR = 1;
const TAG_LIMIT = 20;

const TimeWarriorIndicator = new Lang.Class({
  Name: 'TimeWarriorIndicator', Extends: PanelMenu.Button,

  _init: function()
  {
    this.parent(0.0, 'TimeWarrior Indicator', false);
    this.label = new St.Label({
      text: "No activity",
      y_align: Clutter.ActorAlign.CENTER
    });
    this.actor.add_actor(this.label);
    this._refresh();
  },

  _refresh: function() {
    this.label.set_text(this._currentActivity());
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
    let response = this._fetchActivity();
    if (response == 1) {
      return 'Something went wrong';
    } else if (response == 2) {
      return 'No activity';
    } else{
      return this._formatActivity(response);
    }
  },

  _fetchActivity: function(){
    try {
        let [res, out, err, status] = GLib.spawn_command_line_sync(TIMEW);
        if (status) {
          return 2;
        } else {
          return out;
        }
      } catch (err) {
          return ERROR;
      }
  },

  _formatActivity: function(response){
    let response = response.toString().split('\n');
    tags = response[0].replace('Tracking','').trim().match(/[^\s"]+|"([^"]*)"/gi);
    started = response[1].replace('Started','').trim();
    duration = response[3].replace(/\s/g,'').replace('Total','');

    activity = tags.sort(function (a, b) { return b.length - a.length; })[0];
    activity = activity.replace(/"/g,'');
    if (activity.length > TAG_LIMIT)
      activity = activity.slice(0,TAG_LIMIT-3).concat('...');

    duration = duration.split(':')
    hours = duration[0];
    minutes = duration[1];
    seconds = duration[2];

    response = activity.concat(' ',hours,':',minutes);
    return response;
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
