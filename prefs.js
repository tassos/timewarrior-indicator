/* This file is part of Timewarrior Indicator

Timewarrior Indicator is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Timewarrior Indicator is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Timewarrior Indicator.  If not, see <http://www.gnu.org/licenses/>.

Copyright (C) 2017 Tassos Natsakis
*/

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const Gettext = imports.gettext.domain('timew-indicator');
const _ = Gettext.gettext;

let settings;

function init() {
	settings = Utils.getSettings(Me);
}

function buildPrefsWidget(){

	// Prepare labels and controls
	let buildable = new Gtk.Builder();
	buildable.add_from_file( Me.dir.get_path() + '/prefs.xml' );
	let box = buildable.get_object('prefs_widget');

	// Bind fields to settings
	settings.bind('interval' , buildable.get_object('update-interval') , 'value' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('tag-length' , buildable.get_object('tag-length') , 'value' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('timew-cmd' , buildable.get_object('timew-cmd') , 'text' , Gio.SettingsBindFlags.DEFAULT);

	box.show_all();
	return box;
};
