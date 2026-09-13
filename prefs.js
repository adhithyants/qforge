import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class QForgePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Register custom CSS for compact GNOME Quick Settings preview and integrated edit mode
        const cssProvider = new Gtk.CssProvider();
        const css = `
            .qs-preview-wrapper {
                padding: 8px 0 16px 0;
            }
            .qs-preview-panel {
                background-color: #242424;
                border-radius: 22px;
                padding: 14px 16px;
                width: 480px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            .qs-top-row {
                margin-bottom: 8px;
            }
            .qs-battery-pill {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 12px;
                padding: 3px 8px;
            }
            .qs-battery-label {
                color: #ffffff;
                font-weight: bold;
                font-size: 11px;
                margin-left: 4px;
            }
            .qs-action-btn {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 9999px;
                min-width: 28px;
                min-height: 28px;
                padding: 0;
                margin-left: 4px;
                color: #ffffff;
            }
            .qs-slider-row {
                margin-bottom: 6px;
            }
            .qs-slider-icon {
                color: rgba(255, 255, 255, 0.9);
                margin-right: 6px;
            }
            .qs-slider-scale {
                min-height: 18px;
            }
            .qs-slider-scale trough {
                background-color: rgba(255, 255, 255, 0.15);
                border-radius: 6px;
                min-height: 4px;
            }
            .qs-slider-scale highlight {
                background-color: #3584e4;
                border-radius: 6px;
            }
            .qs-slider-scale slider {
                background-color: #ffffff;
                border-radius: 50%;
                min-width: 10px;
                min-height: 10px;
                margin: -3px;
            }
            .qs-arrow-btn {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 9999px;
                min-width: 22px;
                min-height: 22px;
                padding: 0;
                margin-left: 6px;
                color: #ffffff;
            }
            .qs-tile-btn {
                padding: 0;
                border-radius: 14px;
                background: transparent;
                border: none;
                box-shadow: none;
            }
            .qs-tile-btn:hover {
                background: transparent;
            }
            .qs-tile-active {
                background-color: #3584e4;
                color: #ffffff;
                border-radius: 14px;
                padding: 4px 10px;
                min-height: 34px;
            }
            .qs-tile-inactive {
                background-color: rgba(255, 255, 255, 0.12);
                color: #ffffff;
                border-radius: 14px;
                padding: 4px 10px;
                min-height: 34px;
            }
            .qs-tile-static-active {
                background-color: #3584e4;
                color: #ffffff;
                border-radius: 14px;
                padding: 4px 10px;
                min-height: 34px;
                cursor: default;
            }
            .qs-tile-static-inactive {
                background-color: rgba(255, 255, 255, 0.12);
                color: #ffffff;
                border-radius: 14px;
                padding: 4px 10px;
                min-height: 34px;
                cursor: default;
            }
            .qs-tile-hidden {
                background-color: rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.6);
                border: 1px dashed rgba(255, 255, 255, 0.18);
                border-radius: 14px;
                padding: 4px 10px;
                min-height: 34px;
            }
            .qs-tile-add {
                background-color: rgba(255, 255, 255, 0.08);
                border: 1.5px dashed rgba(255, 255, 255, 0.25);
                color: #ffffff;
                border-radius: 14px;
                padding: 4px 10px;
                min-height: 34px;
            }
            .qs-tile-title {
                font-weight: bold;
                font-size: 11px;
                color: #ffffff;
            }
            .qs-tile-subtitle {
                font-size: 9.5px;
                color: rgba(255, 255, 255, 0.75);
            }
            .qs-tile-icon {
                color: #ffffff;
                margin-right: 6px;
            }
            .qs-tile-arrow-box {
                background-color: rgba(255, 255, 255, 0.18);
                border-radius: 9999px;
                min-width: 20px;
                min-height: 20px;
                margin-left: 4px;
            }
            .qs-tile-arrow {
                color: #ffffff;
            }
            .qs-separator {
                background-color: rgba(255, 255, 255, 0.15);
                min-height: 1px;
                margin: 10px 0 6px 0;
            }
            .qs-section-label {
                color: rgba(255, 255, 255, 0.5);
                font-weight: bold;
                font-size: 10.5px;
                letter-spacing: 1px;
                margin-bottom: 6px;
            }
            .qs-empty-hidden {
                color: rgba(255, 255, 255, 0.4);
                font-size: 11px;
                font-style: italic;
                margin-bottom: 4px;
            }
        `;

        if (cssProvider.load_from_string) {
            cssProvider.load_from_string(css);
        } else {
            cssProvider.load_from_data(css, -1);
        }

        const display = Gdk.Display.get_default();
        if (display) {
            Gtk.StyleContext.add_provider_for_display(
                display,
                cssProvider,
                Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            );
        }

        // Main Page
        const mainPage = new Adw.PreferencesPage({
            title: _('Quick Settings Customizer'),
            iconName: 'preferences-system-symbolic',
        });

        // 1. Integrated Quick Settings Layout & Edit Mode Group
        const previewGroup = new Adw.PreferencesGroup({
            title: _('Quick Settings Layout & Edit Mode'),
            description: _('Interactive Quick Settings view. Click hideable tiles to move them between Displayed and Hidden sections.'),
        });

        const previewWrapper = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.CENTER,
            cssClasses: ['qs-preview-wrapper']
        });
        previewGroup.add(previewWrapper);
        mainPage.add(previewGroup);

        const getHiddenDefaults = () => settings.get_strv('hidden-defaults') || [];
        const getCustomLaunchers = () => {
            try {
                const list = JSON.parse(settings.get_string('custom-launchers') || '[]');
                return list.map((item, index) => {
                    const slug = (item.title || 'launcher').toLowerCase().replace(/[^a-z0-9]/g, '_');
                    return {
                        ...item,
                        id: item.id || `custom_${slug}_${index}`
                    };
                });
            } catch (e) {
                return [];
            }
        };

        const defaultHideableItems = [
            { id: 'nightLight', title: _('Night Light'), icon: 'night-light-symbolic' },
            { id: 'keyboard', title: _('Keyboard'), icon: 'keyboard-brightness-symbolic' },
            { id: 'darkMode', title: _('Dark Style'), icon: 'dark-mode-symbolic' },
            { id: 'dnd', title: _('Do Not Disturb'), icon: 'notifications-disabled-symbolic' },
            { id: 'backgroundApps', title: _('Background Apps'), icon: 'background-app-symbolic' },
        ];

        const renderPreview = () => {
            // Remove previous preview child
            let child = previewWrapper.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                previewWrapper.remove(child);
                child = next;
            }

            const panel = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 10,
                cssClasses: ['qs-preview-panel']
            });

            // Top Action Row
            const topRow = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                cssClasses: ['qs-top-row']
            });

            const batteryPill = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                valign: Gtk.Align.CENTER,
                cssClasses: ['qs-battery-pill']
            });
            const battIcon = Gtk.Image.new_from_icon_name('battery-level-60-symbolic');
            const battLabel = new Gtk.Label({
                label: '64%',
                cssClasses: ['qs-battery-label']
            });
            batteryPill.append(battIcon);
            batteryPill.append(battLabel);
            topRow.append(batteryPill);

            const spacer = new Gtk.Box({ hexpand: true });
            topRow.append(spacer);

            const actionIcons = [
                'shortcut-custom-symbolic',
                'document-edit-symbolic',
                'emblem-system-symbolic',
                'system-lock-screen-symbolic',
                'system-shutdown-symbolic'
            ];

            actionIcons.forEach(iconName => {
                const btn = new Gtk.Button({
                    iconName: iconName,
                    valign: Gtk.Align.CENTER,
                    cssClasses: ['qs-action-btn']
                });
                topRow.append(btn);
            });

            panel.append(topRow);

            // Volume Slider Row
            const volRow = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                valign: Gtk.Align.CENTER,
                cssClasses: ['qs-slider-row']
            });
            const volIcon = Gtk.Image.new_from_icon_name('audio-volume-high-symbolic');
            volIcon.add_css_class('qs-slider-icon');
            const volScale = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0, 100, 1);
            volScale.set_value(75);
            volScale.set_hexpand(true);
            volScale.add_css_class('qs-slider-scale');
            const volArrow = new Gtk.Button({
                iconName: 'go-next-symbolic',
                cssClasses: ['qs-arrow-btn']
            });
            volRow.append(volIcon);
            volRow.append(volScale);
            volRow.append(volArrow);
            panel.append(volRow);

            // Brightness Slider Row
            const brightRow = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                valign: Gtk.Align.CENTER,
                cssClasses: ['qs-slider-row']
            });
            const brightIcon = Gtk.Image.new_from_icon_name('display-brightness-symbolic');
            brightIcon.add_css_class('qs-slider-icon');
            const brightScale = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0, 100, 1);
            brightScale.set_value(80);
            brightScale.set_hexpand(true);
            brightScale.add_css_class('qs-slider-scale');
            brightRow.append(brightIcon);
            brightRow.append(brightScale);
            panel.append(brightRow);

            const hiddenList = getHiddenDefaults();
            const launchers = getCustomLaunchers();

            // DISPLAYED TILES
            const displayedTiles = [];
            displayedTiles.push({ title: 'Wi-Fi', subtitle: 'BSNLtelnet(99...)', icon: 'network-wireless-signal-excellent-symbolic', active: true, arrow: true });
            displayedTiles.push({ title: 'Tether', subtitle: 'vivo Y56 5G', icon: 'network-cellular-disabled-symbolic', active: false, arrow: true });
            displayedTiles.push({ title: 'Bluetooth', subtitle: '', icon: 'bluetooth-active-symbolic', active: true, arrow: true });
            displayedTiles.push({ title: 'Airplane Mode', subtitle: '', icon: 'airplane-mode-symbolic', active: false, arrow: false });

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

            launchers.forEach(item => {
                if (!hiddenList.includes(item.id)) {
                    displayedTiles.push({
                        id: item.id,
                        title: item.title || _('Custom Launcher'),
                        subtitle: '',
                        icon: item.iconName || 'utilities-terminal-symbolic',
                        active: false,
                        arrow: false,
                        isHideable: true
                    });
                } else {
                    hiddenLauncherItems.push({
                        id: item.id,
                        title: item.title || _('Custom Launcher'),
                        icon: item.iconName || 'utilities-terminal-symbolic'
                    });
                }
            });

            // Add "+ Add Button" to DISPLAYED area
            displayedTiles.push({
                isAddBtn: true,
                title: _('+ Add Button'),
                subtitle: '',
                icon: 'list-add-symbolic',
                active: false,
                arrow: false
            });

            const displayedGrid = new Gtk.Grid({
                column_spacing: 8,
                row_spacing: 6,
                column_homogeneous: true
            });

            displayedTiles.forEach((tile, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);

                const isInteractive = tile.isHideable || tile.isAddBtn;

                let containerClass = tile.active ? 'qs-tile-active' : 'qs-tile-inactive';
                if (tile.isAddBtn) {
                    containerClass = 'qs-tile-add';
                } else if (!isInteractive) {
                    containerClass = tile.active ? 'qs-tile-static-active' : 'qs-tile-static-inactive';
                }

                const tileBox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    valign: Gtk.Align.CENTER,
                    cssClasses: [containerClass]
                });

                const icon = Gtk.Image.new_from_icon_name(tile.icon);
                icon.add_css_class('qs-tile-icon');
                tileBox.append(icon);

                const textVBox = new Gtk.Box({
                    orientation: Gtk.Orientation.VERTICAL,
                    valign: Gtk.Align.CENTER,
                    hexpand: true
                });

                const titleLabel = new Gtk.Label({
                    label: tile.title,
                    halign: Gtk.Align.START,
                    xalign: 0,
                    cssClasses: ['qs-tile-title']
                });
                textVBox.append(titleLabel);

                if (tile.subtitle) {
                    const subLabel = new Gtk.Label({
                        label: tile.subtitle,
                        halign: Gtk.Align.START,
                        xalign: 0,
                        cssClasses: ['qs-tile-subtitle']
                    });
                    textVBox.append(subLabel);
                }

                tileBox.append(textVBox);

                if (tile.arrow) {
                    const arrowBox = new Gtk.Box({
                        orientation: Gtk.Orientation.HORIZONTAL,
                        valign: Gtk.Align.CENTER,
                        halign: Gtk.Align.CENTER,
                        cssClasses: ['qs-tile-arrow-box']
                    });
                    const arrowIcon = Gtk.Image.new_from_icon_name('go-next-symbolic');
                    arrowIcon.add_css_class('qs-tile-arrow');
                    arrowBox.append(arrowIcon);
                    tileBox.append(arrowBox);
                }

                if (isInteractive) {
                    const tileBtn = new Gtk.Button({
                        cssClasses: ['qs-tile-btn']
                    });
                    tileBtn.set_child(tileBox);

                    if (tile.isHideable) {
                        tileBtn.set_tooltip_text(_('Click to hide tile'));
                        tileBtn.connect('clicked', () => {
                            let current = getHiddenDefaults();
                            if (!current.includes(tile.id)) {
                                current.push(tile.id);
                            }
                            settings.set_strv('hidden-defaults', current);
                            renderPreview();
                        });
                    } else if (tile.isAddBtn) {
                        tileBtn.set_tooltip_text(_('Click to add new launcher'));
                        tileBtn.connect('clicked', () => {
                            const list = getCustomLaunchers();
                            list.push({
                                id: `custom_launcher_${Date.now()}_${list.length}`,
                                title: _('New Button'),
                                iconName: 'utilities-terminal-symbolic',
                                command: 'gnome-terminal'
                            });
                            saveLaunchers(list);
                            renderLaunchers();
                        });
                    }
                    displayedGrid.attach(tileBtn, col, row, 1, 1);
                } else {
                    // Non-interactive tile (Wi-Fi, Tether, Bluetooth, Airplane Mode)
                    displayedGrid.attach(tileBox, col, row, 1, 1);
                }
            });

            panel.append(displayedGrid);

            // SEPARATOR
            const separator = new Gtk.Box({
                cssClasses: ['qs-separator']
            });
            panel.append(separator);

            // HIDDEN SECTION
            const hiddenHeader = new Gtk.Label({
                label: _('HIDDEN'),
                halign: Gtk.Align.START,
                xalign: 0,
                cssClasses: ['qs-section-label']
            });
            panel.append(hiddenHeader);

            const hiddenTiles = [
                ...defaultHideableItems.filter(item => hiddenList.includes(item.id)),
                ...hiddenLauncherItems
            ];

            if (hiddenTiles.length > 0) {
                const hiddenGrid = new Gtk.Grid({
                    column_spacing: 8,
                    row_spacing: 6,
                    column_homogeneous: true
                });

                hiddenTiles.forEach((item, index) => {
                    const col = index % 2;
                    const row = Math.floor(index / 2);

                    const tileBtn = new Gtk.Button({
                        cssClasses: ['qs-tile-btn']
                    });

                    const tileBox = new Gtk.Box({
                        orientation: Gtk.Orientation.HORIZONTAL,
                        valign: Gtk.Align.CENTER,
                        cssClasses: ['qs-tile-hidden']
                    });

                    const icon = Gtk.Image.new_from_icon_name(item.icon);
                    icon.add_css_class('qs-tile-icon');
                    tileBox.append(icon);

                    const textVBox = new Gtk.Box({
                        orientation: Gtk.Orientation.VERTICAL,
                        valign: Gtk.Align.CENTER,
                        hexpand: true
                    });

                    const titleLabel = new Gtk.Label({
                        label: item.title,
                        halign: Gtk.Align.START,
                        xalign: 0,
                        cssClasses: ['qs-tile-title']
                    });
                    textVBox.append(titleLabel);

                    tileBox.append(textVBox);
                    tileBtn.set_child(tileBox);

                    tileBtn.set_tooltip_text(_('Click to show tile'));
                    tileBtn.connect('clicked', () => {
                        let current = getHiddenDefaults();
                        current = current.filter(id => id !== item.id);
                        settings.set_strv('hidden-defaults', current);
                        renderPreview();
                    });

                    hiddenGrid.attach(tileBtn, col, row, 1, 1);
                });

                panel.append(hiddenGrid);
            } else {
                const emptyLabel = new Gtk.Label({
                    label: _('No hidden tiles'),
                    halign: Gtk.Align.START,
                    xalign: 0,
                    cssClasses: ['qs-empty-hidden']
                });
                panel.append(emptyLabel);
            }

            previewWrapper.append(panel);
        };

        renderPreview();

        // 3. Custom Command Launchers Management Group
        const launchersGroup = new Adw.PreferencesGroup({
            title: _('Custom Command Launchers'),
            description: _('Add custom buttons that execute terminal commands or launch applications.'),
        });

        const saveLaunchers = (launchers) => {
            settings.set_string('custom-launchers', JSON.stringify(launchers));
            renderPreview();
        };

        const launcherRows = [];

        const renderLaunchers = () => {
            launcherRows.forEach(row => launchersGroup.remove(row));
            launcherRows.length = 0;

            const launchers = getCustomLaunchers();
            launchers.forEach((item, index) => {
                const expanderRow = new Adw.ExpanderRow({
                    title: item.title || _('Custom Launcher'),
                    subtitle: item.command || _('No command set'),
                    iconName: item.iconName || 'utilities-terminal-symbolic',
                });

                const titleRow = new Adw.EntryRow({
                    title: _('Title'),
                    text: item.title || '',
                });
                titleRow.connect('changed', (entry) => {
                    const list = getCustomLaunchers();
                    if (list[index]) {
                        list[index].title = entry.text;
                        expanderRow.title = entry.text || _('Custom Launcher');
                        saveLaunchers(list);
                    }
                });
                expanderRow.add_row(titleRow);

                const iconRow = new Adw.EntryRow({
                    title: _('Icon Name (Symbolic)'),
                    text: item.iconName || '',
                });
                const iconPreview = Gtk.Image.new_from_icon_name(item.iconName || 'utilities-terminal-symbolic');
                iconPreview.set_pixel_size(20);
                iconRow.add_prefix(iconPreview);

                iconRow.connect('changed', (entry) => {
                    const list = getCustomLaunchers();
                    if (list[index]) {
                        list[index].iconName = entry.text;
                        expanderRow.iconName = entry.text || 'utilities-terminal-symbolic';
                        try {
                            iconPreview.iconName = entry.text || 'utilities-terminal-symbolic';
                        } catch (e) {}
                        saveLaunchers(list);
                    }
                });
                expanderRow.add_row(iconRow);

                // Quick Icon Suggestions Box
                const iconSuggestionsContainer = new Gtk.Box({
                    orientation: Gtk.Orientation.VERTICAL,
                    spacing: 6,
                    margin_top: 8,
                    margin_bottom: 8,
                    margin_start: 12,
                    margin_end: 12,
                });
                const iconSuggestionsLabel = new Gtk.Label({
                    label: _('Quick Icon Suggestions'),
                    xalign: 0,
                    cssClasses: ['dim-label', 'caption-heading'],
                });
                iconSuggestionsContainer.append(iconSuggestionsLabel);

                const iconFlow = new Gtk.FlowBox({
                    selection_mode: Gtk.SelectionMode.NONE,
                    max_children_per_line: 12,
                    min_children_per_line: 4,
                    row_spacing: 6,
                    column_spacing: 6,
                    halign: Gtk.Align.FILL,
                });

                const presetIcons = [
                    { icon: 'utilities-terminal-symbolic', name: _('Terminal') },
                    { icon: 'web-browser-symbolic', name: _('Browser') },
                    { icon: 'folder-symbolic', name: _('Files') },
                    { icon: 'preferences-system-symbolic', name: _('Settings') },
                    { icon: 'emblem-favorite-symbolic', name: _('Favorite') },
                    { icon: 'system-search-symbolic', name: _('Search') },
                    { icon: 'media-playback-start-symbolic', name: _('Media') },
                    { icon: 'utilities-system-monitor-symbolic', name: _('Monitor') },
                    { icon: 'application-x-executable-symbolic', name: _('App') },
                    { icon: 'system-lock-screen-symbolic', name: _('Lock') },
                    { icon: 'audio-volume-high-symbolic', name: _('Sound') },
                    { icon: 'bluetooth-active-symbolic', name: _('Bluetooth') },
                ];

                presetIcons.forEach(preset => {
                    const btn = new Gtk.Button({
                        tooltipText: preset.name,
                        cssClasses: ['flat', 'card']
                    });
                    const img = Gtk.Image.new_from_icon_name(preset.icon);
                    img.set_pixel_size(18);
                    btn.set_child(img);

                    btn.connect('clicked', () => {
                        iconRow.text = preset.icon;
                        const list = getCustomLaunchers();
                        if (list[index]) {
                            list[index].iconName = preset.icon;
                            expanderRow.iconName = preset.icon;
                            try {
                                iconPreview.iconName = preset.icon;
                            } catch (e) {}
                            saveLaunchers(list);
                        }
                    });
                    iconFlow.append(btn);
                });
                iconSuggestionsContainer.append(iconFlow);
                expanderRow.add_row(iconSuggestionsContainer);

                const commandRow = new Adw.EntryRow({
                    title: _('Command'),
                    text: item.command || '',
                });
                commandRow.connect('changed', (entry) => {
                    const list = getCustomLaunchers();
                    if (list[index]) {
                        list[index].command = entry.text;
                        expanderRow.subtitle = entry.text || _('No command set');
                        saveLaunchers(list);
                    }
                });
                expanderRow.add_row(commandRow);

                // Quick Command Suggestions Box
                const cmdSuggestionsContainer = new Gtk.Box({
                    orientation: Gtk.Orientation.VERTICAL,
                    spacing: 6,
                    margin_top: 8,
                    margin_bottom: 8,
                    margin_start: 12,
                    margin_end: 12,
                });
                const cmdSuggestionsLabel = new Gtk.Label({
                    label: _('Quick Command Suggestions (Click preset to insert)'),
                    xalign: 0,
                    cssClasses: ['dim-label', 'caption-heading'],
                });
                cmdSuggestionsContainer.append(cmdSuggestionsLabel);

                const cmdFlow = new Gtk.FlowBox({
                    selection_mode: Gtk.SelectionMode.NONE,
                    max_children_per_line: 6,
                    min_children_per_line: 2,
                    row_spacing: 6,
                    column_spacing: 6,
                    halign: Gtk.Align.FILL,
                });

                const presetCommands = [
                    { label: _('Terminal'), cmd: 'gnome-terminal' },
                    { label: _('Files'), cmd: 'nautilus ~' },
                    { label: _('Browser'), cmd: 'xdg-open https://google.com' },
                    { label: _('Monitor'), cmd: 'gnome-system-monitor' },
                    { label: _('Settings'), cmd: 'gnome-control-center' },
                    { label: _('Screenshot'), cmd: 'gnome-screenshot -i' },
                    { label: _('Calculator'), cmd: 'gnome-calculator' },
                    { label: _('Lock Screen'), cmd: 'loginctl lock-session' },
                    { label: _('Sound Settings'), cmd: 'gnome-control-center sound' },
                    { label: _('Bluetooth'), cmd: 'gnome-control-center bluetooth' },
                ];

                presetCommands.forEach(preset => {
                    const btn = new Gtk.Button({
                        label: preset.label,
                        tooltipText: preset.cmd,
                        cssClasses: ['flat', 'card']
                    });

                    btn.connect('clicked', () => {
                        commandRow.text = preset.cmd;
                        const list = getCustomLaunchers();
                        if (list[index]) {
                            list[index].command = preset.cmd;
                            expanderRow.subtitle = preset.cmd;
                            saveLaunchers(list);
                        }
                    });
                    cmdFlow.append(btn);
                });
                cmdSuggestionsContainer.append(cmdFlow);
                expanderRow.add_row(cmdSuggestionsContainer);

                // Action Buttons Suffix Box (Up, Down, Delete)
                const actionBox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    spacing: 4,
                    valign: Gtk.Align.CENTER,
                });

                if (index > 0) {
                    const upBtn = new Gtk.Button({
                        iconName: 'go-up-symbolic',
                        valign: Gtk.Align.CENTER,
                        cssClasses: ['flat'],
                        tooltipText: _('Move Up'),
                    });
                    upBtn.connect('clicked', () => {
                        const list = getCustomLaunchers();
                        const itemToMove = list.splice(index, 1)[0];
                        list.splice(index - 1, 0, itemToMove);
                        saveLaunchers(list);
                        renderLaunchers();
                    });
                    actionBox.append(upBtn);
                }

                if (index < launchers.length - 1) {
                    const downBtn = new Gtk.Button({
                        iconName: 'go-down-symbolic',
                        valign: Gtk.Align.CENTER,
                        cssClasses: ['flat'],
                        tooltipText: _('Move Down'),
                    });
                    downBtn.connect('clicked', () => {
                        const list = getCustomLaunchers();
                        const itemToMove = list.splice(index, 1)[0];
                        list.splice(index + 1, 0, itemToMove);
                        saveLaunchers(list);
                        renderLaunchers();
                    });
                    actionBox.append(downBtn);
                }

                const delBtn = new Gtk.Button({
                    iconName: 'user-trash-symbolic',
                    valign: Gtk.Align.CENTER,
                    cssClasses: ['destructive-action', 'flat'],
                    tooltipText: _('Delete Launcher'),
                });

                delBtn.connect('clicked', () => {
                    const list = getCustomLaunchers();
                    list.splice(index, 1);
                    saveLaunchers(list);
                    renderLaunchers();
                });

                actionBox.append(delBtn);
                expanderRow.add_suffix(actionBox);

                launchersGroup.add(expanderRow);
                launcherRows.push(expanderRow);
            });
        };

        renderLaunchers();

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
            const list = getCustomLaunchers();
            list.push({
                title: _('New Launcher'),
                iconName: 'utilities-terminal-symbolic',
                command: 'gnome-terminal'
            });
            saveLaunchers(list);
            renderLaunchers();
        });

        addBtnRow.add_suffix(addBtn);
        launchersGroup.add(addBtnRow);

        mainPage.add(launchersGroup);

        // 4. Backup & Restore Group
        const backupGroup = new Adw.PreferencesGroup({
            title: _('Backup & Restore'),
            description: _('Export or import your custom launcher shortcuts configuration.'),
        });

        const exportRow = new Adw.ActionRow({
            title: _('Export Configuration'),
            subtitle: _('Copy custom launchers JSON config to clipboard'),
        });
        const exportBtn = new Gtk.Button({
            label: _('Export'),
            valign: Gtk.Align.CENTER,
        });
        exportBtn.connect('clicked', () => {
            const rawJson = settings.get_string('custom-launchers') || '[]';
            const clipboard = Gdk.Display.get_default().get_clipboard();
            clipboard.set(rawJson);
            window.add_toast(new Adw.Toast({ title: _('Configuration copied to clipboard') }));
        });
        exportRow.add_suffix(exportBtn);
        backupGroup.add(exportRow);

        const importRow = new Adw.EntryRow({
            title: _('Import Configuration (Paste JSON)'),
            show_apply_button: false,
        });
        const importBtn = new Gtk.Button({
            label: _('Import'),
            valign: Gtk.Align.CENTER,
            cssClasses: ['suggested-action'],
        });
        importBtn.connect('clicked', () => {
            const text = importRow.text ? importRow.text.trim() : '';
            if (text) {
                try {
                    const parsed = JSON.parse(text);
                    if (!Array.isArray(parsed)) {
                        throw new Error('Config must be a JSON array');
                    }
                    settings.set_string('custom-launchers', JSON.stringify(parsed));
                    renderLaunchers();
                    renderPreview();
                    importRow.text = '';
                    window.add_toast(new Adw.Toast({ title: _('Configuration imported successfully') }));
                } catch (e) {
                    window.add_toast(new Adw.Toast({ title: _('Invalid JSON array format') }));
                }
            }
        });
        importRow.add_suffix(importBtn);
        backupGroup.add(importRow);

        mainPage.add(backupGroup);
        window.add(mainPage);
    }
}
