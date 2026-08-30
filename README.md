# QForge - GNOME Quick Settings Customizer

Customize your GNOME Shell Quick Settings menu with ease. **QForge** allows you to hide default quick settings tiles (such as Night Light, Dark Mode, Keyboard layout, Do Not Disturb, and Background Apps), add dynamic launcher tiles that run custom shell commands, and edit layout preferences on the fly.

![GNOME Extensions](https://img.shields.io/badge/GNOME%20Extensions-45%20%7C%2046%20%7C%2047%20%7C%2048%20%7C%2049%20%7C%2050-blue?logo=gnome)

---

## 🌟 Features

* **Hide Default Tiles:** Effortlessly toggle visibility of default tiles like Night Light, Dark Mode, Keyboard, DND, and Background Apps.
* **Custom Command Launchers:** Create quick-launch buttons that execute arbitrary shell scripts and bash commands.
* **Inline Quick Settings Indicator:** Header pencil icon for quick access to editing options.
* **Native Libadwaita Preferences:** Seamless configuration window built into the GNOME Extensions App.

---

## 🛠️ Installation & Setup (From Source)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adhithyants/qforge.git
   cd qforge
   ```

2. **Compile the settings schema:**
   ```bash
   glib-compile-schemas schemas/
   ```

3. **Install the extension:**
   Symlink or copy the directory into your local GNOME shell extensions folder:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions
   ln -s $(pwd) ~/.local/share/gnome-shell/extensions/qforge@goku.github.com
   ```

4. **Enable Extension:**
   - **X11:** Press `Alt+F2`, type `r`, and hit `Enter`.
   - **Wayland:** Log out and log back in (or restart your session).
   - Enable **QForge** via the **GNOME Extensions** app.

---

## 🎛️ Configuration

1. Open **GNOME Extensions**.
2. Click the ⚙️ **Settings UI (Gear icon)** next to QForge.
3. Configure your hidden default tiles or add new custom command launchers.

---

## 📄 License

GPL-3.0 or later.
