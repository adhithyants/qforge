import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

/**
 * QForgeEditOverlay - Phase 1 prototype overlay for in-panel Edit Mode.
 */
const QForgeEditOverlay = GObject.registerClass(
class QForgeEditOverlay extends St.BoxLayout {
    _init(extension) {
        super._init({
            style_class: 'qforge-edit-overlay',
            vertical: true,
            x_expand: true,
            y_expand: true,
            style: 'padding: 14px 16px; spacing: 6px; background-color: #242424; border-radius: 22px;'
        });

        this._extension = extension;
        this.render();
    }

    render() {
        this.destroy_all_children();

        const settings = this._extension._settings;
        const hiddenList = settings ? (settings.get_strv('hidden-defaults') || []) : [];
        let launchers = [];
        if (settings) {
            try {
                launchers = JSON.parse(settings.get_string('custom-launchers') || '[]');
            } catch (e) {
                launchers = [];
            }
        }

        // 1. Top Action Row
        const topRow = new St.BoxLayout({
            vertical: false,
            style: 'margin-bottom: 6px;'
        });

        const batteryPill = new St.BoxLayout({
            vertical: false,
            style: 'background-color: rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 4px 10px; spacing: 6px;'
        });
        batteryPill.add_child(new St.Icon({
            icon_name: 'battery-level-60-symbolic',
            icon_size: 14,
            style: 'color: #ffffff;'
        }));
        batteryPill.add_child(new St.Label({
            text: '64%',
            style: 'color: #ffffff; font-weight: bold; font-size: 11px;'
        }));
        topRow.add_child(batteryPill);

        topRow.add_child(new St.Widget({ x_expand: true }));

        const actionIcons = [
            'shortcut-custom-symbolic',
            'document-edit-symbolic',
            'emblem-system-symbolic',
            'system-lock-screen-symbolic',
            'system-shutdown-symbolic'
        ];
        actionIcons.forEach(iconName => {
            const btn = new St.Button({
                style: 'background-color: rgba(255, 255, 255, 0.12); border-radius: 9999px; min-width: 28px; min-height: 28px; margin-left: 4px;',
                can_focus: true
            });
            btn.set_child(new St.Icon({
                icon_name: iconName,
                icon_size: 14,
                style: 'color: #ffffff;'
            }));
            topRow.add_child(btn);
        });
        this.add_child(topRow);

        // 2. Volume Slider Row
        const volRow = new St.BoxLayout({
            vertical: false,
            style: 'margin-bottom: 6px; spacing: 6px;'
        });
        volRow.add_child(new St.Icon({
            icon_name: 'audio-volume-high-symbolic',
            icon_size: 14,
            style: 'color: rgba(255, 255, 255, 0.9);'
        }));
        volRow.add_child(new St.Slider({
            value: 0.75,
            x_expand: true,
            style: 'min-height: 20px;'
        }));
        const volArrow = new St.Button({
            style: 'background-color: rgba(255, 255, 255, 0.12); border-radius: 9999px; min-width: 22px; min-height: 22px; margin-left: 4px;',
            can_focus: true
        });
        volArrow.set_child(new St.Icon({
            icon_name: 'go-next-symbolic',
            icon_size: 12,
            style: 'color: #ffffff;'
        }));
        volRow.add_child(volArrow);
        this.add_child(volRow);

        // 3. Brightness Slider Row
        const brightRow = new St.BoxLayout({
            vertical: false,
            style: 'margin-bottom: 8px; spacing: 6px;'
        });
        brightRow.add_child(new St.Icon({
            icon_name: 'display-brightness-symbolic',
            icon_size: 14,
            style: 'color: rgba(255, 255, 255, 0.9);'
        }));
        brightRow.add_child(new St.Slider({
            value: 0.8,
            x_expand: true,
            style: 'min-height: 20px;'
        }));
        this.add_child(brightRow);

        // 4. DISPLAYED TILES
        const defaultHideableItems = [
            { id: 'nightLight', title: 'Night Light', icon: 'night-light-symbolic' },
            { id: 'keyboard', title: 'Keyboard', icon: 'keyboard-brightness-symbolic' },
            { id: 'darkMode', title: 'Dark Style', icon: 'dark-mode-symbolic' },
            { id: 'dnd', title: 'Do Not Disturb', icon: 'notifications-disabled-symbolic' },
            { id: 'backgroundApps', title: 'Background Apps', icon: 'background-app-symbolic' },
        ];

        const displayedTiles = [
            { title: 'Wi-Fi', subtitle: 'BSNLtelnet(99...)', icon: 'network-wireless-signal-excellent-symbolic', active: true, arrow: true },
            { title: 'Tether', subtitle: 'vivo Y56 5G', icon: 'network-cellular-disabled-symbolic', active: false, arrow: true },
            { title: 'Bluetooth', subtitle: '', icon: 'bluetooth-active-symbolic', active: true, arrow: true },
            { title: 'Airplane Mode', subtitle: '', icon: 'airplane-mode-symbolic', active: false, arrow: false },
        ];

        defaultHideableItems.forEach(item => {
            if (!hiddenList.includes(item.id)) {
                displayedTiles.push({
                    id: item.id,
                    title: item.title,
                    subtitle: '',
                    icon: item.icon,
                    active: false,
                    arrow: false,
                    isHideable: true
                });
            }
        });

        const hiddenLauncherItems = [];

        launchers.forEach((item, index) => {
            const slug = (item.title || 'launcher').toLowerCase().replace(/[^a-z0-9]/g, '_');
            const launcherId = item.id || `custom_${slug}_${index}`;
            if (!hiddenList.includes(launcherId)) {
                displayedTiles.push({
                    id: launcherId,
                    title: item.title || 'Custom Launcher',
                    subtitle: '',
                    icon: item.iconName || 'utilities-terminal-symbolic',
                    active: false,
                    arrow: false,
                    isHideable: true
                });
            } else {
                hiddenLauncherItems.push({
                    id: launcherId,
                    title: item.title || 'Custom Launcher',
                    icon: item.iconName || 'utilities-terminal-symbolic'
                });
            }
        });

        // Add "+ Add Button" tile to DISPLAYED section
        displayedTiles.push({
            isAddBtn: true,
            title: '+ Add Button',
            subtitle: '',
            icon: 'list-add-symbolic',
            active: false,
            arrow: false
        });

        const displayedBox = new St.BoxLayout({
            vertical: true,
            style: 'spacing: 6px;'
        });

        const createTileWidget = (tile, isHiddenSection = false) => {
            const isInteractive = tile.isHideable || tile.isAddBtn;

            let bgStyle = 'background-color: rgba(255, 255, 255, 0.12); border-radius: 14px; padding: 4px 10px; min-height: 34px;';
            if (tile.active) {
                bgStyle = 'background-color: #3584e4; border-radius: 14px; padding: 4px 10px; min-height: 34px;';
            } else if (isHiddenSection) {
                bgStyle = 'background-color: rgba(255, 255, 255, 0.05); border: 1px dashed rgba(255, 255, 255, 0.2); border-radius: 14px; padding: 4px 10px; min-height: 34px;';
            } else if (tile.isAddBtn) {
                bgStyle = 'background-color: rgba(255, 255, 255, 0.08); border: 1.5px dashed rgba(255, 255, 255, 0.25); border-radius: 14px; padding: 4px 10px; min-height: 34px;';
            }

            const tileInner = new St.BoxLayout({
                vertical: false,
                x_expand: true,
                style: 'spacing: 6px;'
            });

            const icon = new St.Icon({
                icon_name: tile.icon,
                icon_size: 15,
                style: isHiddenSection ? 'color: rgba(255, 255, 255, 0.6);' : 'color: #ffffff;'
            });
            tileInner.add_child(icon);

            const textVBox = new St.BoxLayout({
                vertical: true,
                x_expand: true
            });
            const titleLabel = new St.Label({
                text: tile.title,
                style: isHiddenSection ? 'color: rgba(255, 255, 255, 0.6); font-weight: bold; font-size: 11px;' : 'color: #ffffff; font-weight: bold; font-size: 11px;'
            });
            textVBox.add_child(titleLabel);

            if (tile.subtitle) {
                const subLabel = new St.Label({
                    text: tile.subtitle,
                    style: 'color: rgba(255, 255, 255, 0.75); font-size: 9.5px;'
                });
                textVBox.add_child(subLabel);
            }
            tileInner.add_child(textVBox);

            if (tile.arrow) {
                const arrowBox = new St.BoxLayout({
                    vertical: false,
                    x_align: Clutter.ActorAlign.CENTER,
                    y_align: Clutter.ActorAlign.CENTER,
                    style: 'background-color: rgba(255, 255, 255, 0.18); border-radius: 9999px; min-width: 20px; min-height: 20px; margin-left: 4px;'
                });
                const arrowIcon = new St.Icon({
                    icon_name: 'go-next-symbolic',
                    icon_size: 12,
                    style: 'color: #ffffff;'
                });
                arrowBox.add_child(arrowIcon);
                tileInner.add_child(arrowBox);
            }

            if (isInteractive) {
                const tileBtn = new St.Button({
                    x_expand: true,
                    style: bgStyle,
                    can_focus: true,
                    reactive: true
                });
                tileBtn.set_child(tileInner);

                if (tile.isHideable) {
                    tileBtn.connect('clicked', () => {
                        if (settings) {
                            let current = settings.get_strv('hidden-defaults') || [];
                            if (isHiddenSection) {
                                current = current.filter(id => id !== tile.id);
                            } else {
                                if (!current.includes(tile.id)) current.push(tile.id);
                            }
                            settings.set_strv('hidden-defaults', current);
                        }
                    });
                } else if (tile.isAddBtn) {
                    tileBtn.connect('clicked', () => {
                        if (settings) {
                            let list = [];
                            try {
                                list = JSON.parse(settings.get_string('custom-launchers') || '[]');
                            } catch (e) {}
                            list.push({
                                id: `custom_launcher_${Date.now()}_${list.length}`,
                                title: 'New Button',
                                iconName: 'utilities-terminal-symbolic',
                                command: 'gnome-terminal'
                            });
                            settings.set_string('custom-launchers', JSON.stringify(list));
                        }
                    });
                }
                return tileBtn;
            } else {
                const staticTileContainer = new St.BoxLayout({
                    x_expand: true,
                    style: bgStyle,
                    reactive: false,
                    can_focus: false
                });
                staticTileContainer.add_child(tileInner);
                return staticTileContainer;
            }
        };

        for (let i = 0; i < displayedTiles.length; i += 2) {
            const rowBox = new St.BoxLayout({
                vertical: false,
                style: 'spacing: 6px;'
            });
            const tile1 = createTileWidget(displayedTiles[i], false);
            rowBox.add_child(tile1);

            if (i + 1 < displayedTiles.length) {
                const tile2 = createTileWidget(displayedTiles[i + 1], false);
                rowBox.add_child(tile2);
            } else {
                const dummySpacer = new St.Widget({ x_expand: true });
                rowBox.add_child(dummySpacer);
            }
            displayedBox.add_child(rowBox);
        }
        this.add_child(displayedBox);

        // 5. SEPARATOR
        const separator = new St.Widget({
            style: 'height: 1px; background-color: rgba(255, 255, 255, 0.15); margin-top: 10px; margin-bottom: 6px;',
            x_expand: true
        });
        this.add_child(separator);

        // 6. HIDDEN SECTION
        const hiddenHeader = new St.Label({
            text: 'HIDDEN',
            style: 'color: rgba(255, 255, 255, 0.5); font-weight: bold; font-size: 10.5px; margin-bottom: 6px;'
        });
        this.add_child(hiddenHeader);

        const hiddenTiles = [
            ...defaultHideableItems.filter(item => hiddenList.includes(item.id)),
            ...hiddenLauncherItems
        ];

        if (hiddenTiles.length > 0) {
            const hiddenBox = new St.BoxLayout({
                vertical: true,
                style: 'spacing: 6px;'
            });

            for (let i = 0; i < hiddenTiles.length; i += 2) {
                const rowBox = new St.BoxLayout({
                    vertical: false,
                    style: 'spacing: 6px;'
                });
                const tile1 = createTileWidget({
                    id: hiddenTiles[i].id,
                    title: hiddenTiles[i].title,
                    icon: hiddenTiles[i].icon,
                    isHideable: true
                }, true);
                rowBox.add_child(tile1);

                if (i + 1 < hiddenTiles.length) {
                    const tile2 = createTileWidget({
                        id: hiddenTiles[i + 1].id,
                        title: hiddenTiles[i + 1].title,
                        icon: hiddenTiles[i + 1].icon,
                        isHideable: true
                    }, true);
                    rowBox.add_child(tile2);
                } else {
                    const dummySpacer = new St.Widget({ x_expand: true });
                    rowBox.add_child(dummySpacer);
                }
                hiddenBox.add_child(rowBox);
            }
            this.add_child(hiddenBox);
        } else {
            const emptyLabel = new St.Label({
                text: 'No hidden tiles',
                style: 'color: rgba(255, 255, 255, 0.4); font-size: 11px; font-style: italic; margin-bottom: 4px;'
            });
            this.add_child(emptyLabel);
        }

        // 7. Done Button Row
        const buttonBox = new St.BoxLayout({
            x_align: Clutter.ActorAlign.END,
            style: 'margin-top: 14px;'
        });
        const doneButton = new St.Button({
            label: 'Done',
            style: 'padding: 8px 20px; background-color: #3584e4; color: white; border-radius: 12px; font-weight: bold;',
            can_focus: true
        });
        doneButton.connect('clicked', () => {
            this._extension.toggleEditMode();
        });
        buttonBox.add_child(doneButton);
        this.add_child(buttonBox);
    }
});

/**
 * QForgeEditHeaderButton - Icon button placed inside the Quick Settings
 * popup menu header row (alongside battery, screenshot, settings, lock & power buttons).
 */
const QForgeEditHeaderButton = GObject.registerClass(
class QForgeEditHeaderButton extends QuickSettings.QuickSettingsItem {
    _init(extension) {
        super._init({
            style_class: 'icon-button',
            can_focus: true,
            icon_name: 'document-edit-symbolic',
            accessible_name: 'QForge Preferences',
        });

        this._extension = extension;
        this.connect('clicked', () => {
            try {
                Main.panel.statusArea.quickSettings?.menu?.close();
            } catch (e) {
                // Ignore menu close error
            }
            try {
                this._extension.openPreferences();
            } catch (e) {
                console.error('[QForge] Failed to open preferences:', e);
            }
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

        this._id = item.id || '';
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
        this._editModeActive = false;
        this._editOverlay = null;
        this._originalGridVisible = null;
        this._menuClosedSignalId = null;

        // 1. Add Edit Pencil Button into Quick Settings Header Popup Row
        this._editButton = new QForgeEditHeaderButton(this);
        try {
            const systemItem = Main.panel.statusArea.quickSettings?._system?._systemItem;
            if (systemItem && systemItem.child) {
                systemItem.child.insert_child_at_index(this._editButton, 3);
            }
        } catch (e) {
            console.error('[QForge] Could not add edit button to system header:', e);
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
        // Exit edit mode cleanly if active
        this._exitEditMode();

        // Disconnect settings signals
        if (this._signals && this._settings) {
            this._signals.forEach(id => this._settings.disconnect(id));
            this._signals = [];
        }

        // Restore hidden default tiles to visible
        this._restoreHiddenDefaults();

        // Clean up custom toggles
        this._clearCustomToggles();

        // Remove edit pencil header button
        if (this._editButton) {
            const parent = this._editButton.get_parent();
            if (parent) {
                parent.remove_child(this._editButton);
            }
            this._editButton.destroy();
            this._editButton = null;
        }

        this._settings = null;
    }

    toggleEditMode() {
        if (this._editModeActive) {
            this._exitEditMode();
        } else {
            this._enterEditMode();
        }
    }

    _enterEditMode() {
        if (this._editModeActive || this._editOverlay) return;

        const quickSettings = Main.panel.statusArea.quickSettings;
        const menuBox = quickSettings?.menu?.box || quickSettings?.menu?._box;
        if (!quickSettings || !quickSettings.menu || !menuBox) {
            console.error('[QForge] Cannot enter Edit Mode: Quick Settings menu container missing');
            return;
        }

        const grid = quickSettings._grid || quickSettings.menu?._grid || quickSettings.menu?._gridBox;
        if (grid && 'visible' in grid) {
            this._originalGridVisible = grid.visible;
            grid.visible = false;
        }

        // Create temporary edit overlay
        this._editOverlay = new QForgeEditOverlay(this);

        try {
            menuBox.add_child(this._editOverlay);
        } catch (e) {
            console.error('[QForge] Failed to insert edit overlay:', e);
            if (grid && this._originalGridVisible !== null && 'visible' in grid) {
                grid.visible = this._originalGridVisible;
            }
            this._editOverlay = null;
            return;
        }

        // Connect to menu-closed signal so closing popup menu during Edit Mode exits cleanly
        try {
            if (quickSettings.menu && !this._menuClosedSignalId) {
                this._menuClosedSignalId = quickSettings.menu.connect('menu-closed', () => {
                    if (this._editModeActive) {
                        this._exitEditMode();
                    }
                });
            }
        } catch (e) {
            // Ignore signal errors
        }

        this._editModeActive = true;
    }

    _exitEditMode() {
        if (!this._editModeActive && !this._editOverlay) return;

        const quickSettings = Main.panel.statusArea.quickSettings;

        // Disconnect menu-closed signal
        if (quickSettings && quickSettings.menu && this._menuClosedSignalId) {
            try {
                quickSettings.menu.disconnect(this._menuClosedSignalId);
            } catch (e) {
                // Ignore disconnect errors
            }
            this._menuClosedSignalId = null;
        }

        // Remove and destroy edit overlay
        if (this._editOverlay) {
            try {
                const parent = this._editOverlay.get_parent();
                if (parent) {
                    parent.remove_child(this._editOverlay);
                }
                this._editOverlay.destroy();
            } catch (e) {
                console.error('[QForge] Error destroying edit overlay:', e);
            }
            this._editOverlay = null;
        }

        // Restore exact original grid visibility state
        if (quickSettings) {
            const grid = quickSettings._grid || quickSettings.menu?._grid || quickSettings.menu?._gridBox;
            if (grid && this._originalGridVisible !== null && 'visible' in grid) {
                grid.visible = this._originalGridVisible;
            }
        }
        this._originalGridVisible = null;

        this._editModeActive = false;
    }

    _matchesDefaultKey(item, key) {
        if (!item) return false;

        let gtypeName = '';
        try {
            gtypeName = GObject.type_name(item) || '';
        } catch (e) {
            gtypeName = '';
        }

        const getLabelText = (obj) => {
            if (!obj) return '';
            if (typeof obj.title === 'string') return obj.title;
            if (typeof obj.accessible_name === 'string') return obj.accessible_name;
            if (typeof obj.label === 'string') return obj.label;
            if (obj.label && typeof obj.label.text === 'string') return obj.label.text;
            if (obj._label && typeof obj._label.text === 'string') return obj._label.text;
            if (obj._title && typeof obj._title.text === 'string') return obj._title.text;
            return '';
        };

        const getIconString = (obj) => {
            if (!obj) return '';
            if (typeof obj.iconName === 'string') return obj.iconName;
            if (typeof obj.icon_name === 'string') return obj.icon_name;
            if (typeof obj._iconName === 'string') return obj._iconName;
            if (obj.gicon && typeof obj.gicon.to_string === 'function') return obj.gicon.to_string();
            if (obj._icon) {
                if (typeof obj._icon.icon_name === 'string') return obj._icon.icon_name;
                if (obj._icon.gicon && typeof obj._icon.gicon.to_string === 'function') return obj._icon.gicon.to_string();
            }
            return '';
        };

        const title = getLabelText(item).toLowerCase();
        const icon = getIconString(item).toLowerCase();
        const typeLower = gtypeName.toLowerCase();

        switch (key) {
            case 'nightLight':
                return typeLower.includes('nightlight') ||
                       title.includes('night light') ||
                       icon.includes('night-light');
            case 'keyboard':
                return typeLower.includes('keyboard') ||
                       title.includes('keyboard') ||
                       icon.includes('keyboard-brightness') ||
                       icon.includes('keyboard-backlight');
            case 'darkMode':
                return typeLower.includes('dark') ||
                       title.includes('dark style') ||
                       title.includes('dark mode') ||
                       icon.includes('dark-mode') ||
                       icon.includes('style-variant-dark') ||
                       icon.includes('day-night');
            case 'dnd':
                return typeLower.includes('dnd') ||
                       typeLower.includes('donotdisturb') ||
                       title.includes('do not disturb') ||
                       title.includes('dnd') ||
                       icon.includes('notifications-disabled') ||
                       icon.includes('notification-disabled');
            case 'backgroundApps':
                return typeLower.includes('backgroundapp') ||
                       title.includes('background app') ||
                       icon.includes('background-app');
            default:
                return false;
        }
    }

    _findItems(key, quickSettings) {
        if (!quickSettings) return [];
        const matches = new Set();

        // 1. Direct property checks on quickSettings and quickSettings.menu
        const directProps = {
            'nightLight': ['_nightLight', '_nightLightToggle', 'nightLight', '_nightLightItem'],
            'keyboard': ['_keyboard', '_keyboardToggle', 'keyboard', '_keyboardBrightness'],
            'darkMode': ['_darkMode', '_darkModeToggle', 'darkMode', '_darkStyleToggle', '_darkStyle'],
            'dnd': ['_dnd', '_dndToggle', 'dnd', '_notificationsToggle'],
            'backgroundApps': ['_backgroundApps', '_backgroundAppsItem', 'backgroundApps'],
        };

        const propsToTry = directProps[key] || [];
        const checkAndAdd = (candidate) => {
            if (!candidate) return;

            // If candidate has quickSettingsItems (e.g. SystemIndicator), check each tile inside it
            if (Array.isArray(candidate.quickSettingsItems)) {
                candidate.quickSettingsItems.forEach(qsItem => {
                    if (qsItem && (this._matchesDefaultKey(qsItem, key) || this._matchesDefaultKey(candidate, key))) {
                        matches.add(qsItem);
                    }
                });
            }

            if (this._matchesDefaultKey(candidate, key)) {
                matches.add(candidate);
            }
        };

        for (const prop of propsToTry) {
            if (quickSettings[prop]) checkAndAdd(quickSettings[prop]);
            if (quickSettings.menu && quickSettings.menu[prop]) checkAndAdd(quickSettings.menu[prop]);
        }

        // 2. Search indicators set if available
        if (quickSettings._indicators) {
            try {
                if (typeof quickSettings._indicators.forEach === 'function') {
                    quickSettings._indicators.forEach(indicator => checkAndAdd(indicator));
                } else if (typeof quickSettings._indicators[Symbol.iterator] === 'function') {
                    for (const indicator of quickSettings._indicators) {
                        checkAndAdd(indicator);
                    }
                }
            } catch (e) {
                // Ignore collection iteration errors
            }
        }

        // 3. Search children in quickSettings._grid (and legacy quickSettings.menu._grid)
        const grids = [quickSettings._grid, quickSettings.menu?._grid].filter(Boolean);
        for (const grid of grids) {
            if (grid.get_children) {
                const children = grid.get_children();
                for (const child of children) {
                    checkAndAdd(child);
                }
            }
        }

        // 4. Search children in quickSettings._box or quickSettings.menu._box (for list items or background apps)
        const boxes = [quickSettings._box, quickSettings.menu?._box].filter(Boolean);
        for (const box of boxes) {
            if (box.get_children) {
                const children = box.get_children();
                for (const child of children) {
                    checkAndAdd(child);
                    // Also check 1 level deeper inside containers
                    if (child.get_children) {
                        const subChildren = child.get_children();
                        for (const subChild of subChildren) {
                            checkAndAdd(subChild);
                        }
                    }
                }
            }
        }

        return Array.from(matches);
    }

    _applyHiddenDefaults() {
        this._restoreHiddenDefaults();
        const hiddenList = this._settings.get_strv('hidden-defaults') || [];

        const quickSettings = Main.panel.statusArea.quickSettings;
        if (quickSettings) {
            hiddenList.forEach(key => {
                const items = this._findItems(key, quickSettings);
                items.forEach(item => {
                    if (item && item.visible !== undefined) {
                        if (this._hiddenElementsMap.has(item)) return;

                        item.visible = false;

                        let signalId = 0;
                        try {
                            signalId = item.connect('notify::visible', () => {
                                if (item.visible) {
                                    item.visible = false;
                                }
                            });
                        } catch (e) {
                            console.error('[QForge] Failed to connect notify::visible signal:', e);
                        }

                        this._hiddenElementsMap.set(item, { signalId, key });
                    }
                });
            });
        }

        // Also update visibility of custom launcher toggles
        this._customToggles.forEach(toggle => {
            if (toggle && toggle._id) {
                toggle.visible = !hiddenList.includes(toggle._id);
            }
        });

        if (this._editOverlay && typeof this._editOverlay.render === 'function') {
            this._editOverlay.render();
        }
    }

    _restoreHiddenDefaults() {
        this._hiddenElementsMap.forEach((data, item) => {
            try {
                if (data && data.signalId && item && typeof item.disconnect === 'function') {
                    item.disconnect(data.signalId);
                }
            } catch (e) {
                // Signal already disconnected or object destroyed
            }

            try {
                if (item && item.visible !== undefined) {
                    item.visible = true;
                }
            } catch (e) {
                // Object destroyed
            }
        });
        this._hiddenElementsMap.clear();

        // Restore custom launcher toggles visibility
        this._customToggles.forEach(toggle => {
            if (toggle) toggle.visible = true;
        });
    }

    _loadCustomLaunchers() {
        this._clearCustomToggles();
        let launchers = [];

        try {
            const rawJson = this._settings.get_string('custom-launchers');
            const list = JSON.parse(rawJson || '[]');
            launchers = list.map((item, index) => {
                const slug = (item.title || 'launcher').toLowerCase().replace(/[^a-z0-9]/g, '_');
                return {
                    ...item,
                    id: item.id || `custom_${slug}_${index}`
                };
            });
        } catch (e) {
            console.error('[QForge] Failed to parse custom-launchers JSON:', e);
        }

        const hiddenList = this._settings ? (this._settings.get_strv('hidden-defaults') || []) : [];
        const quickSettings = Main.panel.statusArea.quickSettings;

        launchers.forEach(item => {
            const toggle = new QForgeCustomToggle(item);
            this._customToggles.push(toggle);
            try {
                if (quickSettings && quickSettings.menu) {
                    quickSettings.menu.addItem(toggle, 1);
                    if (hiddenList.includes(item.id)) {
                        toggle.visible = false;
                    }
                }
            } catch (e) {
                console.error('[QForge] Failed to add custom toggle:', e);
            }
        });

        if (this._editOverlay && typeof this._editOverlay.render === 'function') {
            this._editOverlay.render();
        }
    }

    _clearCustomToggles() {
        this._customToggles.forEach(toggle => {
            if (toggle) toggle.destroy();
        });
        this._customToggles = [];
    }
}
