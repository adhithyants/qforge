import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class QForgePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Register custom CSS for compact GNOME Quick Settings preview and interactive tile cards
        const cssProvider = new Gtk.CssProvider();
        const css = `
            .qs-preview-wrapper {
                padding: 8px 0 16px 0;
            }
            .qs-preview-panel {
                background-color: #242424;
                border-radius: 22px;
                padding: 14px;
                width: 340px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            .qs-top-row {
                margin-bottom: 10px;
            }
            .qs-battery-pill {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 14px;
                padding: 4px 10px;
            }
            .qs-battery-label {
                color: #ffffff;
                font-weight: bold;
                font-size: 12px;
                margin-left: 4px;
            }
            .qs-action-btn {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 9999px;
                min-width: 30px;
                min-height: 30px;
                padding: 0;
                margin-left: 4px;
                color: #ffffff;
            }
            .qs-slider-row {
                margin-bottom: 8px;
            }
            .qs-slider-icon {
                color: rgba(255, 255, 255, 0.9);
                margin-right: 8px;
            }
            .qs-slider-scale {
                min-height: 20px;
            }
            .qs-slider-scale trough {
                background-color: rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                min-height: 5px;
            }
            .qs-slider-scale highlight {
                background-color: #3584e4;
                border-radius: 8px;
            }
            .qs-slider-scale slider {
                background-color: #ffffff;
                border-radius: 50%;
                min-width: 12px;
                min-height: 12px;
                margin: -3.5px;
            }
            .qs-arrow-btn {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 9999px;
                min-width: 24px;
                min-height: 24px;
                padding: 0;
                margin-left: 6px;
                color: #ffffff;
            }
            .qs-tile-active {
                background-color: #3584e4;
                color: #ffffff;
                border-radius: 18px;
                padding: 8px 12px;
                min-height: 40px;
            }
            .qs-tile-inactive {
                background-color: rgba(255, 255, 255, 0.12);
                color: #ffffff;
                border-radius: 18px;
                padding: 8px 12px;
                min-height: 40px;
            }
            .qs-tile-title {
                font-weight: bold;
                font-size: 12px;
                color: #ffffff;
            }
            .qs-tile-subtitle {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.8);
            }
            .qs-tile-icon {
                color: #ffffff;
                margin-right: 8px;
            }
            .qs-tile-arrow {
                color: rgba(255, 255, 255, 0.7);
                margin-left: 6px;
            }

            /* Tile Selection Cards */
            .qs-card-btn {
                padding: 0;
                border-radius: 16px;
                background: transparent;
                box-shadow: none;
            }
            .qs-card-btn:hover {
                background: transparent;
            }
            .qs-tile-card-selected {
                background-color: rgba(53, 132, 228, 0.12);
                border: 2px solid #3584e4;
                border-radius: 16px;
                padding: 10px 14px;
                min-height: 52px;
            }
            .qs-tile-card-unselected {
                background-color: rgba(255, 255, 255, 0.04);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 10px 14px;
                min-height: 52px;
                opacity: 0.6;
            }
            .qs-tile-card-title {
                font-weight: bold;
                font-size: 13px;
                color: #ffffff;
            }
            .qs-tile-card-sub {
                font-size: 11px;
                margin-top: 2px;
            }
            .qs-card-status-active {
                color: #3584e4;
                font-weight: bold;
            }
            .qs-card-status-hidden {
                color: rgba(255, 255, 255, 0.4);
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

        // 1. Compact Live Preview Group
        const previewGroup = new Adw.PreferencesGroup({
            title: _('Quick Settings Preview'),
            description: _('Real-time compact preview of your Quick Settings menu.'),
        });

        const previewWrapper = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.CENTER,
            cssClasses: ['qs-preview-wrapper']
        });
        previewGroup.add(previewWrapper);
        mainPage.add(previewGroup);

        // 2. Interactive Tile Cards Section
        const cardsGroup = new Adw.PreferencesGroup({
            title: _('Quick Settings Tiles Manager'),
            description: _('Click any tile card to toggle whether it appears in your Quick Settings menu.'),
        });

        const cardsContainer = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
        });
        cardsGroup.add(cardsContainer);
        mainPage.add(cardsGroup);

        const getHiddenDefaults = () => settings.get_strv('hidden-defaults') || [];
        const getCustomLaunchers = () => {
            try {
                return JSON.parse(settings.get_string('custom-launchers') || '[]');
            } catch (e) {
                return [];
            }
        };

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

            // Volume Slider
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

            // Brightness Slider
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

            // 2-Column Tile Grid
            const grid = new Gtk.Grid({
                column_spacing: 8,
                row_spacing: 8,
                column_homogeneous: true
            });

            const hidden = getHiddenDefaults();
            const launchers = getCustomLaunchers();

            const candidateTiles = [];

            // Standard GNOME Tiles
            candidateTiles.push({ title: 'Wi-Fi', subtitle: 'BSNLtelnet(99...)', icon: 'network-wireless-signal-excellent-symbolic', active: true, arrow: true });
            candidateTiles.push({ title: 'Tether', subtitle: 'vivo Y56 5G', icon: 'network-cellular-disabled-symbolic', active: false, arrow: true });
            candidateTiles.push({ title: 'Bluetooth', subtitle: '', icon: 'bluetooth-active-symbolic', active: true, arrow: true });
            candidateTiles.push({ title: 'Airplane Mode', subtitle: '', icon: 'airplane-mode-symbolic', active: false, arrow: false });

            if (!hidden.includes('nightLight')) {
                candidateTiles.push({ title: 'Night Light', subtitle: '', icon: 'night-light-symbolic', active: false, arrow: false });
            }
            if (!hidden.includes('keyboard')) {
                candidateTiles.push({ title: 'Keyboard', subtitle: '', icon: 'keyboard-brightness-symbolic', active: false, arrow: false });
            }
            if (!hidden.includes('darkMode')) {
                candidateTiles.push({ title: 'Dark Style', subtitle: '', icon: 'dark-mode-symbolic', active: true, arrow: false });
            }
            if (!hidden.includes('dnd')) {
                candidateTiles.push({ title: 'Do Not Disturb', subtitle: '', icon: 'notifications-disabled-symbolic', active: false, arrow: false });
            }
            if (!hidden.includes('backgroundApps')) {
                candidateTiles.push({ title: 'Background Apps', subtitle: '', icon: 'background-app-symbolic', active: false, arrow: false });
            }

            // Custom Launchers
            launchers.forEach(item => {
                candidateTiles.push({
                    title: item.title || _('Custom Launcher'),
                    subtitle: '',
                    icon: item.iconName || 'utilities-terminal-symbolic',
                    active: false,
                    arrow: false
                });
            });

            candidateTiles.forEach((tile, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);

                const tileBox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    valign: Gtk.Align.CENTER,
                    cssClasses: [tile.active ? 'qs-tile-active' : 'qs-tile-inactive']
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
                    const arrowIcon = Gtk.Image.new_from_icon_name('go-next-symbolic');
                    arrowIcon.add_css_class('qs-tile-arrow');
                    tileBox.append(arrowIcon);
                }

                grid.attach(tileBox, col, row, 1, 1);
            });

            panel.append(grid);
            previewWrapper.append(panel);
        };

        const renderTileCards = () => {
            let child = cardsContainer.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                cardsContainer.remove(child);
                child = next;
            }

            const grid = new Gtk.Grid({
                column_spacing: 10,
                row_spacing: 10,
                column_homogeneous: true
            });

            const defaultItems = [
                { id: 'nightLight', label: _('Night Light'), icon: 'night-light-symbolic' },
                { id: 'keyboard', label: _('Keyboard Backlight'), icon: 'keyboard-brightness-symbolic' },
                { id: 'darkMode', label: _('Dark Style'), icon: 'dark-mode-symbolic' },
                { id: 'dnd', label: _('Do Not Disturb'), icon: 'notifications-disabled-symbolic' },
                { id: 'backgroundApps', label: _('Background Apps'), icon: 'background-app-symbolic' },
            ];

            const hiddenList = getHiddenDefaults();

            defaultItems.forEach((item, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const isSelected = !hiddenList.includes(item.id);

                const cardBtn = new Gtk.Button({
                    cssClasses: ['qs-card-btn']
                });

                const innerBox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    valign: Gtk.Align.CENTER,
                    cssClasses: [isSelected ? 'qs-tile-card-selected' : 'qs-tile-card-unselected']
                });

                const icon = Gtk.Image.new_from_icon_name(item.icon);
                icon.set_pixel_size(20);
                icon.set_margin_end(10);
                innerBox.append(icon);

                const textVBox = new Gtk.Box({
                    orientation: Gtk.Orientation.VERTICAL,
                    valign: Gtk.Align.CENTER,
                    hexpand: true
                });

                const titleLabel = new Gtk.Label({
                    label: item.label,
                    halign: Gtk.Align.START,
                    xalign: 0,
                    cssClasses: ['qs-tile-card-title']
                });
                textVBox.append(titleLabel);

                const statusLabel = new Gtk.Label({
                    label: isSelected ? _('Selected (Appears in Menu)') : _('Hidden'),
                    halign: Gtk.Align.START,
                    xalign: 0,
                    cssClasses: ['qs-tile-card-sub', isSelected ? 'qs-card-status-active' : 'qs-card-status-hidden']
                });
                textVBox.append(statusLabel);

                innerBox.append(textVBox);

                const checkIcon = Gtk.Image.new_from_icon_name(isSelected ? 'object-select-symbolic' : 'action-unavailable-symbolic');
                checkIcon.set_pixel_size(16);
                innerBox.append(checkIcon);

                cardBtn.set_child(innerBox);

                cardBtn.connect('clicked', () => {
                    let current = getHiddenDefaults();
                    if (isSelected) {
                        if (!current.includes(item.id)) current.push(item.id);
                    } else {
                        current = current.filter(id => id !== item.id);
                    }
                    settings.set_strv('hidden-defaults', current);
                    renderPreview();
                    renderTileCards();
                });

                grid.attach(cardBtn, col, row, 1, 1);
            });

            cardsContainer.append(grid);
        };

        renderPreview();
        renderTileCards();

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
                iconRow.connect('changed', (entry) => {
                    const list = getCustomLaunchers();
                    if (list[index]) {
                        list[index].iconName = entry.text;
                        expanderRow.iconName = entry.text || 'utilities-terminal-symbolic';
                        saveLaunchers(list);
                    }
                });
                expanderRow.add_row(iconRow);

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

                expanderRow.add_suffix(delBtn);

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
        window.add(mainPage);
    }
}
