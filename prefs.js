import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/uilib/extensionPreferences.js';

export default class QForgePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // --- Page 1: General & Defaults Customization ---
        const mainPage = new Adw.PreferencesPage({
            title: _('Quick Settings Tiles'),
            iconName: 'preferences-system-symbolic',
        });

        const defaultsGroup = new Adw.PreferencesGroup({
            title: _('Hide Default GNOME Tiles'),
            description: _('Toggle off any default Quick Settings tile you do not use.'),
        });

        const defaultItems = [
            { id: 'nightLight', label: _('Night Light') },
            { id: 'keyboard', label: _('Keyboard Backlight') },
            { id: 'darkMode', label: _('Dark Style') },
            { id: 'dnd', label: _('Do Not Disturb') },
            { id: 'backgroundApps', label: _('Background Apps') },
        ];

        let hiddenDefaults = settings.get_strv('hidden-defaults') || [];

        defaultItems.forEach(item => {
            const isHidden = hiddenDefaults.includes(item.id);
            const row = new Adw.SwitchRow({
                title: item.label,
                subtitle: _(`Hide ${item.label} tile from Quick Settings`),
                active: isHidden,
            });

            row.connect('notify::active', (switchRow) => {
                let current = settings.get_strv('hidden-defaults') || [];
                if (switchRow.active) {
                    if (!current.includes(item.id)) current.push(item.id);
                } else {
                    current = current.filter(id => id !== item.id);
                }
                settings.set_strv('hidden-defaults', current);
            });

            defaultsGroup.add(row);
        });

        mainPage.add(defaultsGroup);

        // --- Page 2: Custom App & Command Launchers ---
        const launchersGroup = new Adw.PreferencesGroup({
            title: _('Custom Command Launchers'),
            description: _('Add custom buttons that execute terminal commands or launch applications.'),
        });

        // Load existing launchers
        const updateLaunchersUI = () => {
            let launchers = [];
            try {
                launchers = JSON.parse(settings.get_string('custom-launchers') || '[]');
            } catch (e) {
                launchers = [];
            }
            return launchers;
        };

        // Button to add a new launcher
        const addBtnRow = new Adw.ActionRow({
            title: _('Add New Custom Launcher'),
            subtitle: _('Create a new tile button for Quick Settings'),
        });
        const addBtn = new Gtk.Button({
            label: _('Add'),
            valign: Gtk.Align.CENTER,
            cssClasses: ['suggested-action'],
        });

        addBtn.connect('clicked', () => {
            let current = updateLaunchersUI();
            current.push({
                title: 'New Launcher',
                iconName: 'utilities-terminal-symbolic',
                command: 'gnome-terminal'
            });
            settings.set_string('custom-launchers', JSON.stringify(current));
            window.close(); // Refresh window by closing or letting user re-open
        });

        addBtnRow.add_suffix(addBtn);
        launchersGroup.add(addBtnRow);

        mainPage.add(launchersGroup);
        window.add(mainPage);
    }
}
