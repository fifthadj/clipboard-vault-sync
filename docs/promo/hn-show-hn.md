# Hacker News「Show HN」草稿(2026-07-03 擬,2026-07-04 更新到 v0.1.1;待帳號養成後發)

> 註:2026-07-03 新帳號送出被 /showlim 擋(temporarily restricting Show HNs),
> 需先參與社群累積 karma 後再發。

## Title(≤80 字元)

Show HN: Save everything you copy into your Obsidian vault, even while closed

## URL

https://github.com/fifthadj/clipboard-vault-sync

## Text

I kept losing things I copied during the day and wanted them to land in my
Obsidian vault automatically, so I built a small Windows tray app.

It polls the clipboard, and every new copy (text or image) becomes a
timestamped Markdown note in a folder you pick inside your vault. Images are
converted to AVIF by a bundled avifenc (libavif) child process — if encoding
ever fails it falls back to saving the PNG, so images are never silently
lost. Content is deduplicated by hash, so copying the same thing twice never
creates two notes, even across app restarts. A toast confirms every save,
and a tray toggle switches between continuous capture and hotkey-only mode.

The main reason it exists as a standalone app instead of an Obsidian plugin:
plugins only run while Obsidian is open. This sits in the tray and captures
all day, and the notes are just there next time you open the vault.

Everything is local, no network calls, MIT licensed. UI in English and
Traditional Chinese. Electron, so the portable exe is ~76 MB.

Honest caveats: while continuous capture is on it saves *everything* you
copy, including passwords — switch to hotkey-only mode (or quit) before
copying secrets; pattern-based filtering is on the roadmap. Windows only for
now. The binaries are unsigned, so SmartScreen will warn.
