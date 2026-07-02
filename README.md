# Clipboard Vault Sync

[![CI](https://github.com/fifthadj/clipboard-vault-sync/actions/workflows/test.yml/badge.svg)](https://github.com/fifthadj/clipboard-vault-sync/actions/workflows/test.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Copy anything, keep it forever. A tiny **system-tray app** that watches your clipboard and saves everything you copy — text **and images** — straight into your [Obsidian](https://obsidian.md) vault as Markdown notes.

The key difference from Obsidian clipboard plugins: **Obsidian doesn't need to be open.** Plugins only capture while the app is running; this sits in your tray and captures everything, all day, then your notes are just *there* next time you open your vault.

- 📋 **Auto-capture** — polls the system clipboard (500 ms); every new copy becomes a timestamped note
- 🖼️ **Images too** — screenshots and copied images are converted to **AVIF** (sharp, quality 80) and linked from the note
- 🧠 **Deduplication** — the same content is never saved twice, even across app restarts (content-hash history)
- 🚫 **No startup spam** — whatever was already in your clipboard when the app starts is not saved
- 📁 **Sync to any folder in your vault** — pick the vault root or any subfolder (e.g. your inbox) as the target
- ⌨️ **Global hotkey** — `Ctrl+Alt+C` by default; press-to-record hotkey picker in Settings
- 🔒 **Local only** — no network, no telemetry, nothing leaves your machine. It's open source; check for yourself.

> ⚠️ **Honest note — this saves *everything* you copy**, including passwords and other sensitive text, into plain-text Markdown files in your vault. Quit the app from the tray before copying secrets, or delete the note afterwards. A pause toggle and pattern-based filtering are on the roadmap.

## Screenshots

| Tray menu | Settings |
|:---:|:---:|
| ![Tray menu](docs/screenshot-1.jpg) | ![Settings window](docs/screenshot-2.jpg) |
| Lives in your system tray | Pick any folder inside a vault; press-to-record hotkey |

## Install

Grab the portable `.exe` (no install needed) or the installer from [Releases](https://github.com/fifthadj/clipboard-vault-sync/releases).

Or build from source:

```sh
git clone https://github.com/fifthadj/clipboard-vault-sync.git
cd clipboard-vault-sync
npm install
npm run build
npm start        # or: npm run dist  → portable exe + installer in release/
```

## Usage

1. Launch — an icon appears in the system tray (no window)
2. Right-click the tray icon → **Select Vault…** and pick any folder *inside* an Obsidian vault (it validates by looking for a `.obsidian` ancestor)
3. Copy things. Each copy becomes a note in the selected folder:

```
Clipboard-2026-07-02_14-30-25-123.md      ← one file per clipboard entry
attachments/clipboard_143025.123456.avif  ← images, auto-created subfolder
```

Note format:

```markdown
# Clipboard

## [14:30:25.123] Clipboard Entry
The text you copied

![](attachments/clipboard_143025.123456.avif)

---
```

### Settings (tray → Settings)

| Setting | What it does |
|---|---|
| Current sync folder | Shows the exact target path (full path, including subfolders) |
| Browse… | Pick a different folder inside any vault |
| Vault list | Auto-discovered vaults (`~/Obsidian`, `Documents/Obsidian`, all drive roots on Windows); click to switch |
| Global hotkey | Click the field, press your combo, save |

Config lives in `%APPDATA%/clipboard-vault-sync/config.json` (`vaultSearchPaths` there adds custom scan locations). Dedup history is `seen-hashes.json` next to it — delete it to allow re-saving everything.

## Platform support

**Windows** is what I use and test. The code is plain Electron APIs with no Windows-specific calls, so macOS/Linux likely work (`npm start`), but are untested — reports and PRs welcome. Known caveats: Wayland restricts background clipboard reading and global shortcuts; macOS tray wants a template icon.

## Development

```sh
npm test         # jest — unit tests for the monitor (dedup, priming) and vault writer
npm run dev      # tsc --watch + electron
npm run dist     # package (output in release/, NOT dist/ — dist/ is compiled JS)
```

Stop any running instance before `npm run dist` — packaging rebuilds sharp and fails with `EBUSY` if the DLLs are loaded.

## License

[MIT](./LICENSE)
