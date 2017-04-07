
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
    this._timeout = Mainloop.timeout_add_seconds(INTERVAL, Lang.bind(this, this._refresh));
    return true;
  },

  _currentActivity: function() {
    let response = this._fetchActivity();
    if (response == 1) {
        return 'Something went wrong';
    } else {
      return this._formatActivity(response);
    }
  },

  _fetchActivity: function(){
    try {
        let [res, out, err, status] = GLib.spawn_command_line_sync(TIMEW);
        return out;
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
    this._timeout = underfined;
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
    twMenu.destroy();
}
