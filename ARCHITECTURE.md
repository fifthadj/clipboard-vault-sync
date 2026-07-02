# Clipboard Vault Sync - 系統架構

## 整體流程圖

```
┌─────────────────────────────────────────────────┐
│          Windows 系統層                          │
│    (剪貼板、系統托盤、全域快鍵、文件系統)        │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌──────────────┐       ┌──────────────┐
   │ Electron App │       │  Settings    │
   │  (main.ts)  │◄─────►│  Window      │
   │             │       │ (renderer/)  │
   └────┬────────┘       └──────────────┘
        │
        │ ┌─────────────────────────────────┐
        ├─► ClipboardMonitor.ts             │
        │   - 輪詢系統剪貼板                 │
        │   - 檢測內容變化                   │
        │   - 發送 'content' 事件            │
        │   - 支持全域快鍵觸發              │
        │ └─────────────────────────────────┘
        │
        │ ┌─────────────────────────────────┐
        ├─► VaultManager.ts                 │
        │   - 掃描 .obsidian 文件夾         │
        │   - 驗證 Vault 有效性             │
        │   - 每筆剪貼寫一個筆記檔          │
        │   - 轉換圖片為 AVIF               │
        │   - 生成圖片引用                   │
        │ └─────────────────────────────────┘
        │
        │ ┌─────────────────────────────────┐
        └─► ConfigManager.ts                │
            - 讀寫 config.json              │
            - 保存 Vault 列表               │
            - 保存快鍵設置                   │
            - IPC 處理設置窗口請求          │
        └─────────────────────────────────┘
```

## 數據流

### 1. 初始化流程

```
App Start
  │
  ├─► ConfigManager.loadConfig()
  │   └─► 讀取或創建 config.json
  │
  ├─► VaultManager.scanVaults()
  │   └─► 掃描 ~/Obsidian/ 尋找 .obsidian
  │
  ├─► 設置當前 Vault
  │   └─► switchVault(selectedVault)
  │
  ├─► ClipboardMonitor.startPolling()
  │   └─► 每 500ms 檢查一次剪貼板
  │
  └─► globalShortcut.register()
      └─► 監聽 Ctrl+Alt+C（可配置）
```

### 2. 剪貼板同步流程

```
用戶複製文本/圖片
  │
  ▼
ClipboardMonitor 檢測到變化
  │
  ├─► 讀取文本和圖片
  │
  ├─► 生成 hash 檢查是否真的有變化
  │
  └─► 發送 'content' 事件 (text, imageBuffer)
      │
      ▼
VaultManager.appendToClipboardNote()
  │
  ├─► 檢查文本和圖片是否都為空 (濾出)
  │
  ├─► 生成筆記路徑：Clipboard-{YYYY-MM-DD}_{HH-MM-SS-mmm}.md（每筆一檔）
  │
  ├─► 如果有圖片：
  │   ├─► 用 sharp 轉換為 AVIF
  │   ├─► 存到 attachments/clipboard_{timestamp}.avif
  │   └─► 生成 Markdown 圖片引用
  │
  ├─► 生成條目：
  │   └─► ## [HH:MM:SS] Clipboard Entry
  │       <文本>
  │       ![](../attachments/...)
  │       ---
  │
  └─► 追加到筆記（新建或追加）
      └─► fs.appendFileSync() 或 fs.writeFileSync()
```

### 3. 設置更新流程

```
用戶在 Settings 窗口修改設置
  │
  ├─► 點擊「Select Vault」
  │   └─► IPC: set-vault
  │       ├─► ConfigManager.setSelectedVault()
  │       └─► switchVault(newVault)
  │
  └─► 修改快鍵並點擊 Save
      └─► IPC: set-hotkey
          ├─► globalShortcut.unregister(oldHotkey)
          ├─► ConfigManager.setGlobalHotkey()
          └─► globalShortcut.register(newHotkey)
```

## 模塊 API

### ClipboardMonitor

```typescript
class ClipboardMonitor extends EventEmitter {
  startPolling(intervalMs: number = 500): void
  stopPolling(): void
  private checkClipboard(): void
  private nativeImageToBuffer(image: any): Buffer

  // 事件：
  // on('content', (text: string, image: Buffer | undefined) => {})
}
```

### VaultManager

```typescript
class VaultManager {
  constructor(vaultPath: string)
  
  async appendToClipboardNote(
    text: string,
    imageBuffer: Buffer | undefined,
    date: string,
    timestamp: string
  ): Promise<void>
  
  getClipboardNotePath(date: string): string
  
  static async scanVaults(parentPath: string): Promise<string[]>
  static isValidVault(vaultPath: string): boolean
}
```

### ConfigManager

```typescript
class ConfigManager {
  constructor()
  
  getSelectedVault(): string
  setSelectedVault(vaultPath: string): void
  
  getVaultList(): string[]
  setVaultList(vaults: string[]): void
  
  getGlobalHotkey(): string
  setGlobalHotkey(hotkey: string): void
  
  getConfig(): Config
  saveConfig(): void
}
```

## IPC 通信

### 安全層 (preload.ts)

```typescript
contextBridge.exposeInMainWorld('appAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  setHotkey: (hotkey: string) => ipcRenderer.invoke('set-hotkey', hotkey),
  setVault: (vaultPath: string) => ipcRenderer.invoke('set-vault', vaultPath),
  getVaults: () => ipcRenderer.invoke('get-vaults'),
})
```

### 主進程處理 (main.ts)

```typescript
ipcMain.handle('get-config', () => {...})
ipcMain.handle('set-hotkey', (_event, hotkey) => {...})
ipcMain.handle('set-vault', (_event, vaultPath) => {...})
ipcMain.handle('get-vaults', () => {...})
```

## 文件樹結構

```
clipboard-vault-sync/
├── src/
│   ├── main.ts                   # Electron 主進程
│   ├── preload.ts                # IPC 安全層
│   ├── ClipboardMonitor.ts       # 剪貼板監視
│   ├── ClipboardMonitor.test.ts  # 測試
│   ├── VaultManager.ts           # Vault 管理
│   ├── VaultManager.test.ts      # 測試
│   ├── ConfigManager.ts          # 配置管理
│   └── index.ts                  # 導出
│
├── renderer/
│   └── settings.html             # 設置窗口 UI
│
├── assets/
│   └── icon.png                  # 托盤圖標
│
├── dist/                         # TypeScript 編譯輸出
│   ├── main.js
│   ├── preload.js
│   ├── ClipboardMonitor.js
│   ├── VaultManager.js
│   └── ConfigManager.js
│
├── package.json                  # 依賴和腳本
├── tsconfig.json                 # TypeScript 配置
├── jest.config.js                # Jest 配置
├── SPEC.md                       # 功能規格
├── ARCHITECTURE.md               # 本文件
└── README.md                     # 使用指南
```

## 關鍵設計決策

### 1. 輪詢 vs 事件監聽
**選擇**：輪詢（500ms）
**原因**：
- Electron 剪貼板 API 無原生事件
- 輪詢足夠快（0.5s 延遲可接受）
- 實現簡單，跨平台兼容

### 2. AVIF 轉換時機
**選擇**：接收時轉換
**原因**：
- 減少 Vault 體積
- 轉換成本只需一次
- sharp 庫高效

### 3. 單 Vault 活躍
**選擇**：同時只監視一個 Vault
**原因**：
- 用戶通常一次工作一個 Vault
- 簡化邏輯
- 後期可擴展為多 Vault（使用 multi-threading）

### 4. 配置存儲
**選擇**：`app.getPath('userData')/config.json`
**原因**：
- 跨平台標準位置
- Electron 自動處理路徑
- 遵循 Windows 規范

## 性能考量

| 操作 | 耗時 | 制約 |
|------|------|------|
| 剪貼板檢查 | <5ms | 輪詢間隔 500ms |
| 圖片轉換 (10MB) | ~100-500ms | sharp 多線程 |
| 筆記寫入 | <10ms | 磁盤 I/O |
| Vault 掃描 | <100ms | 目錄數量 |

## 未來擴展點

1. **多 Vault 監視**
   - 改為哈希表 `{vaultPath: VaultManager}`
   - 多線程處理
   - 配置: 監視列表

2. **雲端同步**
   - Obsidian Sync API
   - iCloud Drive
   - OneDrive

3. **過濾規則**
   - 正則表達式過濾
   - 自訂存檔目錄
   - URL 自動提取

4. **Linux/macOS 適配**
   - XClip + Wayland（Linux）
   - pbpaste + MediaKeyTap（macOS）
   - 托盤圖標適配

---

**最後更新**：2026-07-02
