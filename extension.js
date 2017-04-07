
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;

const timew = '/usr/bin/timew';
const interval = 10;

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
    this._timeout = Mainloop.timeout_add_seconds(interval, Lang.bind(this, this._refresh));
    return true;
  },

  _currentActivity: function() {
    let response = this._fetchActivity();
    return response;
  },

  _fetchActivity: function(){
    try {
        //[ok: Boolean, standard_output: ByteArray, standard_error: ByteArray, exit_status: Number(gint)]
        let [res, out, err, status] = GLib.spawn_command_line_sync('date');
        return out.toString();
      } catch (err) {
          printerr(err);
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
