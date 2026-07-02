# 🚀 快速啟動指南

## 5 分鐘內啟動應用

### Step 1: 安裝依賴（3 分鐘）

```bash
cd clipboard-vault-sync
npm install
```

這會安裝所有必要的包，包括：
- Electron（應用框架）
- TypeScript（類型檢查）
- Jest（測試框架）
- sharp（圖片轉換）

### Step 2: 編譯代碼（1 分鐘）

```bash
npm run build
```

將 TypeScript 編譯為 JavaScript，輸出到 `dist/` 目錄。

### Step 3: 運行測試（1 分鐘）

```bash
npm test
```

運行 13 個單元測試，驗證核心邏輯。

✅ 所有測試應該通過（綠色）。

---

## 開發環境

### 啟動開發模式

```bash
npm run dev
```

這會：
1. 監視 `src/` 目錄的變化
2. 自動編譯 TypeScript
3. 啟動 Electron 應用
4. 支持實時熱重載

### 打開開發者工具

在應用窗口中按 `F12` 查看控制台和調試工具。

---

## 打包成 Windows EXE

### 生成可執行文件

```bash
npm run dist
```

這會創建：
- `dist/Clipboard Vault Sync Setup 0.1.0.exe` - 安裝程序
- `dist/Clipboard Vault Sync 0.1.0.exe` - 便攜版本

### 安裝和運行

1. 雙擊 `.exe` 文件
2. 按照安裝向導完成
3. 應用會在系統托盤中啟動

---

## 配置應用

### 首次啟動

1. **選擇 Vault**
   - 右鍵托盤圖標 → Select Vault
   - 應用會自動掃描 `~/Obsidian/` 目錄
   - 選擇你的 Vault

2. **自訂快鍵**（可選）
   - 右鍵托盤 → Settings
   - 修改「Global Hotkey」（默認 `Ctrl+Alt+C`）
   - 點擊 Save

3. **開始複製**
   - 複製文字 → 自動存到選定資料夾的 `Clipboard-{YYYY-MM-DD}_{HH-MM-SS-mmm}.md`（每筆一檔）
   - 複製圖片 → 自動轉換為 AVIF 並插入引用
   - 複製文字 + 圖片 → 混合存檔

---

## 常見問題

### Q: 如何找到暫存筆記？
A: 在 Obsidian 中打開你的 Vault，進入你選定的同步資料夾，找 `Clipboard-2026-07-02_14-30-25-123.md` 這類檔案（每筆剪貼一檔）。

### Q: 圖片存在哪裡？
A: 存在 `attachments/clipboard_{timestamp}.avif`。

### Q: 如何重新選擇 Vault？
A: 右鍵托盤 → Select Vault，選擇另一個。

### Q: 如何修改快鍵？
A: 右鍵托盤 → Settings → 修改 Global Hotkey → Save。

### Q: 應用在哪裡？
A: 看系統托盤（屏幕右下角）。

### Q: 如何卸載？
A: 按 Windows 控制面板 → 程式與功能 → 找 Clipboard Vault Sync → 卸載。

---

## 開發工作流

### 典型的開發循環

```bash
# 1. 啟動開發環境
npm run dev

# 2. 修改代碼（自動編譯）

# 3. 測試修改
# - 重啟 Electron（按 Ctrl+R）
# - 或在 DevTools 中測試

# 4. 運行測試
npm test

# 5. 提交代碼
git add .
git commit -m "feat: add new feature"
```

### 代碼結構速查

```
src/
├── main.ts              ← Electron 主進程（托盤、快鍵）
├── ClipboardMonitor.ts  ← 剪貼板監視邏輯
├── VaultManager.ts      ← Vault 寫入邏輯
└── ConfigManager.ts     ← 配置管理邏輯

renderer/
└── settings.html        ← 設置窗口 UI
```

---

## 打包 & 分發

### Windows 安裝程序

```bash
npm run dist
```

生成：
- **Setup EXE**：包含安裝程序，用戶可按步驟安裝
- **Portable EXE**：無需安裝，直接執行

### 上傳和分享

1. 上傳 `dist/` 中的 `.exe` 文件到發行版本
2. 用戶下載並運行
3. 應用自動檢查更新（需配置 electron-updater）

---

## 下一步

### 短期（本周）
- [x] 開發環境設置
- [ ] 本地功能測試
- [ ] 打包 EXE
- [ ] Windows 安裝測試

### 中期（下周）
- [ ] Linux 適配（XClip）
- [ ] macOS 適配（pbpaste）
- [ ] E2E 測試

### 長期
- [ ] 自動更新機制
- [ ] 多語言支持
- [ ] 雲端同步集成

---

## 技術規范

| 組件 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 運行時 |
| Electron | 29.x | 應用框架 |
| TypeScript | 5.x | 類型檢查 |
| Jest | 29.x | 測試框架 |
| sharp | 0.32.x | 圖片處理 |

---

## 支持

**遇到問題？**

1. 查看 `ARCHITECTURE.md` - 理解系統設計
2. 查看 `SPEC.md` - 了解功能要求
3. 查看單元測試 - 了解預期行為
4. 檢查 `npm test` 輸出 - 驗證核心邏輯

---

**祝你好運！** 🚀

---

**最後更新**：2026-07-02  
**狀態**：✅ 開發就緒
