# Hacker News「Show HN」草稿(2026-07-03 擬,待帳號養成後發)

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
converted to AVIF. Content is deduplicated by hash, so copying the same thing
twice never creates two notes, even across app restarts.

The main reason it exists as a standalone app instead of an Obsidian plugin:
plugins only run while Obsidian is open. This sits in the tray and captures
all day, and the notes are just there next time you open the vault.

Everything is local, no network calls, MIT licensed. Electron, so the
portable exe is ~88 MB.

Honest caveats: it saves *everything* you copy, including passwords, so you
need to quit it before copying secrets (a pause toggle is on the roadmap).
Windows only for now. The binaries are unsigned, so SmartScreen will warn.
