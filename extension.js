
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
    this._timeout = Mainloop.timeout_add_seconds(INTERVAL, Lang.bind(this, this._refresh));
    return true;
  },

  _currentActivity: function() {
    let response = this._fetchActivity();
    if (response == 1) {
        return 'Something went wrong';
    } else {
      return response[0];
    }
  },

  _fetchActivity: function(){
    try {
        let [res, out, err, status] = GLib.spawn_command_line_sync(TIMEW);
        let result = out.toString().split('\n');
        return result;
      } catch (err) {
          return ERROR;
      }
  }
});

let twInt;

function init() {}

function enable() {
    twInt = new TimeWarriorIndicator;
    Main.panel.addToStatusArea("tw-indicator", twInt, 0, 'left');
}

function disable() {
    twMenu.destroy();
}
