import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

/**
 * QForgeEditToggle - Header pencil toggle for inline Quick Settings editing.
 */
const QForgeEditToggle = GObject.registerClass(
class QForgeEditToggle extends QuickSettings.QuickToggle {
    _init(extension) {
        super._init({
            title: 'Edit QForge',
            iconName: 'document-edit-symbolic',
            toggleMode: true,
        });

        this._extension = extension;
        this.connect('clicked', () => {
            this._extension.toggleEditMode(this.checked);
        });
    }
});

/**
 * QForgeCustomToggle - Dynamic toggle button that executes custom shell commands.
 */
const QForgeCustomToggle = GObject.registerClass(
class QForgeCustomToggle extends QuickSettings.QuickToggle {
    _init(item) {
        super._init({
            title: item.title || 'Custom Launcher',
            iconName: item.iconName || 'utilities-terminal-symbolic',
            toggleMode: false,
        });

        this._command = item.command || '';

        this.connect('clicked', () => {
            if (this._command) {
                try {
                    Gio.Subprocess.new(
                        ['bash', '-c', this._command],
                        Gio.SubprocessFlags.NONE
                    );
                } catch (e) {
                    console.error(`[QForge] Failed to run command '${this._command}':`, e);
                }
            }
        });
    }
});

export default class QForgeExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._customToggles = [];
        this._hiddenElementsMap = new Map();

        // 1. Add Edit Pencil Toggle in Header
        this._editToggle = new QForgeEditToggle(this);
        try {
            Main.panel.statusArea.quickSettings.addExternalIndicator(this._editToggle);
        } catch (e) {
            console.error('[QForge] Could not add edit toggle indicator:', e);
        }

        // 2. Load & apply custom launchers and hidden defaults
        this._applyHiddenDefaults();
        this._loadCustomLaunchers();

        // 3. Listen to setting changes
        this._signals = [
            this._settings.connect('changed::hidden-defaults', () => this._applyHiddenDefaults()),
            this._settings.connect('changed::custom-launchers', () => this._loadCustomLaunchers())
        ];
    }

    disable() {
        // Disconnect settings signals
        if (this._signals && this._settings) {
            this._signals.forEach(id => this._settings.disconnect(id));
            this._signals = [];
        }

        // Restore hidden default tiles to visible
        this._restoreHiddenDefaults();

        // Clean up custom toggles
        this._clearCustomToggles();

        // Remove edit pencil toggle
        if (this._editToggle) {
            this._editToggle.destroy();
            this._editToggle = null;
        }

        this._settings = null;
    }

    toggleEditMode(active) {
        this._settings.set_boolean('edit-mode', active);
        Main.notify('QForge Edit Mode', active ? 'Customize tiles via QForge Preferences window.' : 'Edit mode turned off.');
    }

    _applyHiddenDefaults() {
        this._restoreHiddenDefaults();
        const hiddenList = this._settings.get_strv('hidden-defaults') || [];

        const quickSettings = Main.panel.statusArea.quickSettings;
        if (!quickSettings) return;

        // Known default indicator properties in GNOME Quick Settings
        const defaultMap = {
            'nightLight': quickSettings._nightLight,
            'keyboard': quickSettings._keyboard,
            'darkMode': quickSettings._darkMode,
            'dnd': quickSettings._dnd,
            'backgroundApps': quickSettings._backgroundApps,
        };

        hiddenList.forEach(key => {
            const item = defaultMap[key];
            if (item && item.visible !== undefined) {
                this._hiddenElementsMap.set(key, item);
                item.visible = false;
            }
        });
    }

    _restoreHiddenDefaults() {
        this._hiddenElementsMap.forEach((item) => {
            if (item && item.visible !== undefined) {
                item.visible = true;
            }
        });
        this._hiddenElementsMap.clear();
    }

    _loadCustomLaunchers() {
        this._clearCustomToggles();
        let launchers = [];

        try {
            const rawJson = this._settings.get_string('custom-launchers');
            launchers = JSON.parse(rawJson || '[]');
        } catch (e) {
            console.error('[QForge] Failed to parse custom-launchers JSON:', e);
        }

        launchers.forEach(item => {
            const toggle = new QForgeCustomToggle(item);
            this._customToggles.push(toggle);
            try {
                Main.panel.statusArea.quickSettings.addExternalIndicator(toggle);
            } catch (e) {
                console.error('[QForge] Failed to add custom toggle:', e);
            }
        });
    }

    _clearCustomToggles() {
        this._customToggles.forEach(toggle => {
            if (toggle) toggle.destroy();
        });
        this._customToggles = [];
    }
}
