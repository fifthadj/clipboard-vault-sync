# Clipboard Vault Sync - 功能規格書

## 核心需求

### 1. 剪貼板監視
- ✅ 自動監聽系統剪貼板變化
- ✅ 支持文字內容
- ✅ 支持圖片內容
- ✅ 支持混合文字 + 圖片

### 2. 存檔策略（2026-07-02 改版：一日可多檔）
- ✅ 每筆剪貼各建一檔：選定資料夾根目錄 `Clipboard-{YYYY-MM-DD}_{HH-MM-SS-mmm}.md`（本地時區，日期與時間以底線分隔，無空白）
- ✅ 圖片存放：`attachments/clipboard_{HHMMSS.mmm}{mmm}.avif`（時間戳＋寫檔當下毫秒）
- ✅ 時間戳格式：`[HH:MM:SS.mmm]`
- ✅ 過濾邏輯：空字符串 + 空圖片 = 不存檔
- ✅ 重複內容不重複存檔（同 session 內容 hash 去重；app 啟動前已在剪貼簿的內容不存）
- ✅ 自動創建 attachments 目錄

### 3. Vault 管理
- ✅ 自動掃描本地 Obsidian Vault
- ✅ 支持動態切換 Vault
- ✅ 托盤右鍵菜單列出所有 Vault
- ✅ 記住上次選定的 Vault

### 4. 全域快鍵
- ✅ 默認快鍵：`Ctrl+Alt+C`
- ✅ 支持自訂快鍵
- ✅ 快鍵觸發時檢查一次剪貼板

### 5. UI 與設置
- ✅ 系統托盤圖標
- ✅ 設置窗口
- ✅ Vault 選擇器（托盤右鍵菜單）
- ✅ 配置保存（JSON 格式）

### 6. 圖片處理
- ✅ 自動轉換為 AVIF 格式
- ✅ 使用 sharp 庫進行高效轉換
- ✅ 圖片品質：80（平衡大小和質量）
- ✅ 生成唯一文件名（時間戳 + 毫秒）

---

## 技術架構

### 技術選型
- **框架**：Electron
- **語言**：TypeScript
- **圖片處理**：sharp
- **測試**：Jest

### 模塊劃分

#### ClipboardMonitor
職責：監聽系統剪貼板變化
```typescript
- startPolling(intervalMs): 啟動輪詢
- stopPolling(): 停止輪詢
- checkClipboard(): 檢查剪貼板變化
- emit('content', text, imageBuffer): 發送事件
```

#### VaultManager
職責：管理 Vault 並寫入筆記
```typescript
- appendToClipboardNote(text, image, timestamp): 寫入一筆剪貼（每筆一檔）
- getClipboardNotePath(timestamp): 獲取筆記路徑
- scanVaults(parentPath): 掃描 Vault
- isValidVault(vaultPath): 驗證 Vault
```

#### ConfigManager
職責：管理應用配置
```typescript
- getSelectedVault(): 獲取當前 Vault
- setSelectedVault(path): 設置當前 Vault
- getGlobalHotkey(): 獲取快鍵
- setGlobalHotkey(hotkey): 設置快鍵
```

#### Main Process
職責：初始化應用，管理窗口和托盤

---

## 平台支持

### Windows（優先）
- ✅ 系統托盤
- ✅ 全域快鍵
- ✅ 剪貼板監視

### Linux（次之）
- ⏳ 需適配 XClip/Wayland
- ⏳ 託盤使用 AppIndicator

### macOS（最後）
- ⏳ 需適配 pbpaste
- ⏳ 快鍵使用 MediaKeyTap

---

## 測試覆蓋

### VaultManager 測試
- ✅ 創建新筆記
- ✅ 追加文本到現有筆記
- ✅ 處理空文本和空圖片
- ✅ 保存圖片並生成引用
- ✅ 混合文本和圖片
- ✅ 掃描 Vault
- ✅ 驗證 Vault

### ClipboardMonitor 測試
- ✅ 偵測純文本
- ✅ 偵測純圖片
- ✅ 偵測混合內容
- ✅ 過濾空內容
- ✅ 多監聽器支持

---

## 開發時程

| 階段 | 內容 | 時間 | 狀態 |
|------|------|------|------|
| 1 | 項目初始化 + 核心模塊 | 4h | ✅ 完成 |
| 2 | 圖片處理 + Vault 管理 | 6h | 進行中 |
| 3 | UI + 設置窗口 | 4h | 待開始 |
| 4 | 測試 + 打包 | 3h | 待開始 |
| 5 | Linux 適配 | 3h | 待開始 |
| 6 | macOS 適配 | 4h | 待開始 |

---

## 配置文件格式

`~/.config/clipboard-vault-sync/config.json`：

```json
{
  "selectedVault": "/home/user/Obsidian/MyVault",
  "vaultList": [
    "/home/user/Obsidian/MyVault",
    "/home/user/Obsidian/Work"
  ],
  "globalHotkey": "Ctrl+Alt+C",
  "autoOpenNote": false
}
```

---

## 筆記格式範例

每筆剪貼一檔，`Clipboard-2026-07-02_14-30-25-123.md`：

```markdown
# Clipboard

## [14:30:25.123] Clipboard Entry
This is some text I copied

![](attachments/clipboard_143025.123456.avif)

---
```

---

## 已知限制

1. **圖片格式**：目前只支持系統剪貼板能提供的圖片格式（BMP, PNG 等），自動轉換為 AVIF
2. **輪詢延遲**：默認 500ms，可能有延遲
3. **多 Vault 同時監視**：目前只支持單個活躍 Vault
4. **本地化**：首版僅支持英文和中文

---

**最後更新**：2026-07-02
