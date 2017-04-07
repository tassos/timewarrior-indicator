
const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;

const TimeWarriorIndicator = new Lang.Class({
  Name: 'TimeWarriorIndicator', Extends: PanelMenu.Button,

  _init: function()
  {
    this.parent(0.0, 'TimeWarrior Indicator', false);
    let text = new St.Label({text: "No activity"});
    this.actor.add_actor(text);
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
