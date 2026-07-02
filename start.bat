@echo off
REM Purpose: double-click launcher for Clipboard Vault Sync (runs local electron.exe, no console window stays open)
REM Author: Mario Hsu (AI assist: Claude Fable 5)
REM History:
REM   2026-07-02  v0.0.0.2  1.ASCII-only comments (cmd misparses UTF-8 Chinese under codepage 950).
REM   2026-07-02  v0.0.0.1  1.Born.
cd /d "%~dp0"
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"
