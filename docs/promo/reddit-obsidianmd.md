# Reddit r/ObsidianMD 草稿(2026-07-03 擬,2026-07-04 更新到 v0.1.1;待帳號養成後發;排程 2026-07-10)

> 註:版規「Don't shill / If your first post is to promote your app, you will
> be banned」——帳號 2026-07-03 新註冊,需先以真實留言參與約一週再發。
> Obsidian 官方論壇 Share & showcase 明文拒收「透過 Markdown 檔互動的第三方
> app」,永久不可行,勿再嘗試。

## Title

I built a tray app that captures everything I copy into my vault — even while Obsidian is closed

## Body

Hi everyone! I built a small open-source Windows tray app for myself and
thought I'd share. It watches the clipboard and saves everything I copy —
text **and images** — straight into my vault as Markdown notes.

The reason it's a standalone app instead of a plugin: plugins only capture
while Obsidian is running. This sits in the system tray and captures all
day, then the notes are just *there* next time I open the vault.

**Features:**

- Auto-capture — every copy becomes a timestamped note (one file per entry)
- Images converted to AVIF (bundled encoder; falls back to PNG if conversion
  fails, so images are never lost) and linked from the note
- Toast notification on every save — you always know it worked
- Continuous-capture toggle in the tray: on = auto-save every copy,
  off = save only when you press the hotkey
- Dedup — the same content is never saved twice, even across app restarts
- Sync target can be any folder inside the vault (e.g. my inbox)
- Global hotkey with press-to-record picker
- UI in English and Traditional Chinese (follows system language)
- 100% local — no network, no telemetry. MIT licensed.

**Honest caveat:** with continuous capture on it saves *everything* you copy,
including sensitive text — flip it to hotkey-only mode (or quit) before
copying secrets. Pattern-based filtering is on the roadmap.

GitHub (source + downloads): https://github.com/fifthadj/clipboard-vault-sync

Windows only for now (that's what I use and test). Feedback very welcome!
