import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  ipcMain,
  shell,
  dialog,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ClipboardMonitor } from './ClipboardMonitor';
import { VaultManager } from './VaultManager';
import { ConfigManager } from './ConfigManager';

let tray: Tray | null = null;
let settingsWindow: BrowserWindow | null = null;
let vaultSelectorWindow: BrowserWindow | null = null;
let clipboardMonitor: ClipboardMonitor | null = null;
let configManager: ConfigManager | null = null;
let currentVaultManager: VaultManager | null = null;

function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createVaultSelectorWindow(): void {
  if (vaultSelectorWindow) {
    vaultSelectorWindow.focus();
    return;
  }

  vaultSelectorWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  vaultSelectorWindow.loadFile(path.join(__dirname, '../renderer/vault-selector.html'));

  vaultSelectorWindow.on('closed', () => {
    vaultSelectorWindow = null;
  });
}

function createTray(): void {
  // Try multiple icon paths for different build scenarios
  let iconPath = '';

  // 試用開發路徑
  const devPath = path.join(__dirname, '../assets/icon.png');
  const prodPath = path.join(app.getAppPath(), 'assets/icon.png');
  const cwd = path.join(process.cwd(), 'assets/icon.png');

  if (fs.existsSync(devPath)) {
    iconPath = devPath;
    console.log('✅ 圖標路徑 (dev):', iconPath);
  } else if (fs.existsSync(prodPath)) {
    iconPath = prodPath;
    console.log('✅ 圖標路徑 (prod):', iconPath);
  } else if (fs.existsSync(cwd)) {
    iconPath = cwd;
    console.log('✅ 圖標路徑 (cwd):', iconPath);
  } else {
    console.warn('⚠️ 圖標未找到，使用 nativeImage 創建預設圖標');
    const { nativeImage } = require('electron');
    // 創建簡單的預設圖標 (1x1 紅色像素)
    const image = nativeImage.createFromBuffer(Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]), { width: 1, height: 1 });
    tray = new Tray(image);
    console.log('✅ 托盤已創建 (預設圖標)');
    // 2026-07-02 23:22:10 移除 return：早退會跳過下方右鍵選單與 tooltip 設定，打包版托盤因此沒有選單. By Claude Fable 5 (effort: default), 傳企監看。begin
    // return;
    // 2026-07-02 23:22:10 移除 return：早退會跳過下方右鍵選單與 tooltip 設定，打包版托盤因此沒有選單. By Claude Fable 5 (effort: default), 傳企監看。 end
  }

  // 2026-07-02 23:22:10 已在上方 fallback 建立 tray 時不可重建，加 if (!tray) 防護. By Claude Fable 5 (effort: default), 傳企監看。begin
  if (!tray) try {
    // 2026-07-02 22:56:30 Windows 系統匣直接餵 256x256 PNG 會顯示空白，改用 nativeImage 縮至 16x16. By Claude Fable 5 (effort: default), 傳企監看。begin
    // tray = new Tray(iconPath);
    const { nativeImage } = require('electron');
    let trayImage = nativeImage.createFromPath(iconPath);
    if (!trayImage.isEmpty()) {
      trayImage = trayImage.resize({ width: 16, height: 16 });
    }
    tray = new Tray(trayImage);
    // 2026-07-02 22:56:30 Windows 系統匣直接餵 256x256 PNG 會顯示空白，改用 nativeImage 縮至 16x16. By Claude Fable 5 (effort: default), 傳企監看。 end
    console.log('✅ 托盤圖標已加載');
  } catch (error) {
    console.error('❌ 加載圖標失敗:', error);
    const { nativeImage } = require('electron');
    const image = nativeImage.createFromBuffer(Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]), { width: 1, height: 1 });
    tray = new Tray(image);
  }
  // 2026-07-02 23:22:10 已在上方 fallback 建立 tray 時不可重建，加 if (!tray) 防護. By Claude Fable 5 (effort: default), 傳企監看。 end

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Clipboard: Monitoring',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Open Vault Folder',
      click: () => {
        openVaultFolder();
      },
    },
    {
      label: 'Select Vault...',
      click: () => {
        showVaultSelector();
      },
    },
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Clipboard Vault Sync');
}

function findVaultRoot(startPath: string): string | null {
  // Search upward through parent directories to find a folder with .obsidian
  let currentPath = startPath;

  // Search up to 10 levels deep
  for (let i = 0; i < 10; i++) {
    const obsidianMarker = path.join(currentPath, '.obsidian');
    if (fs.existsSync(obsidianMarker)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      // Reached filesystem root
      break;
    }
    currentPath = parentPath;
  }

  return null;
}

// 2026-07-02 22:48:00 改為回傳選定路徑，並以目前選定目錄為對話框起點，供 Settings 的 Browse 共用. By Claude Fable 5 (effort: default), 傳企監看。begin
async function showVaultSelector(): Promise<string | null> {
  const currentVault = configManager?.getSelectedVault();
  const result = await dialog.showOpenDialog({
    title: 'Select Folder to Sync Clipboard',
    defaultPath: currentVault && fs.existsSync(currentVault) ? currentVault : app.getPath('home'),
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const selectedPath = result.filePaths[0];

    // Verify it's inside a valid Vault (has .obsidian ancestor)
    const vaultRoot = findVaultRoot(selectedPath);

    if (vaultRoot) {
      // Store the selected path directly (not the vault root)
      configManager?.setSelectedVault(selectedPath);
      switchVault(selectedPath);
      console.log(`✅ 已選擇目錄: ${selectedPath}`);
      console.log(`   (Vault 根目錄: ${vaultRoot})`);
      return selectedPath;
    } else {
      dialog.showErrorBox(
        '無效的位置',
        `選擇的文件夾不在任何 Obsidian Vault 內。\n\n請選擇 Vault 內的任何文件夾。\n\n路徑: ${selectedPath}`
      );
    }
  }
  return null;
}
// 2026-07-02 22:48:00 改為回傳選定路徑，並以目前選定目錄為對話框起點，供 Settings 的 Browse 共用. By Claude Fable 5 (effort: default), 傳企監看。 end

function openVaultFolder(): void {
  if (!configManager) return;

  const vault = configManager.getSelectedVault();
  if (vault && fs.existsSync(vault)) {
    shell.openPath(vault);
    console.log(`📂 打開 Vault: ${vault}`);
  } else {
    console.warn('⚠️ 未選擇 Vault 或 Vault 不存在');
  }
}

function switchVault(vaultPath: string): void {
  if (VaultManager.isValidVault(vaultPath)) {
    currentVaultManager = new VaultManager(vaultPath);
    console.log(`Switched to vault: ${vaultPath}`);
  }
}

// 2026-07-03 00:23:00 跨平台 vault 搜尋路徑：通用預設＋Windows 掃描全部磁碟＋config 自訂，取代寫死的個人路徑. By Claude Fable 5 (effort: default), 傳企監看。begin
function getVaultSearchPaths(): string[] {
  const userHome = app.getPath('home');
  const documents = app.getPath('documents');

  const paths = [
    path.join(userHome, 'Obsidian'),
    path.join(documents, 'Obsidian'),
  ];

  if (process.platform === 'win32') {
    // 掃描所有存在的磁碟根目錄下的常見 vault 位置
    for (let c = 67; c <= 90; c++) {
      // C: 到 Z:
      const drive = `${String.fromCharCode(c)}:\\`;
      if (fs.existsSync(drive)) {
        paths.push(path.join(drive, 'Obsidian'));
        paths.push(path.join(drive, 'Obsidian-Portable', 'Vault'));
      }
    }
  }

  // config.json 的 vaultSearchPaths 可自訂額外搜尋位置
  const extra = configManager?.getVaultSearchPaths() ?? [];
  return [...new Set([...paths, ...extra])];
}
// 2026-07-03 00:23:00 跨平台 vault 搜尋路徑：通用預設＋Windows 掃描全部磁碟＋config 自訂，取代寫死的個人路徑. By Claude Fable 5 (effort: default), 傳企監看。 end

async function initializeApp(): Promise<void> {
  configManager = new ConfigManager();

  // Scan for available vaults in multiple locations
  // 2026-07-03 00:23:00 改用跨平台搜尋路徑. By Claude Fable 5 (effort: default), 傳企監看。begin
  // const userHome = app.getPath('home');
  // const vaultSearchPaths = [
  //   path.join(userHome, 'Obsidian'),
  //   path.join(userHome, 'Documents', 'Obsidian'),
  //   'E:\\Obsidian-Portable\\Vault',
  //   'D:\\Obsidian',
  //   'C:\\Obsidian',
  // ];
  const vaultSearchPaths = getVaultSearchPaths();
  // 2026-07-03 00:23:00 改用跨平台搜尋路徑. By Claude Fable 5 (effort: default), 傳企監看。 end

  let availableVaults: string[] = [];
  for (const searchPath of vaultSearchPaths) {
    if (fs.existsSync(searchPath)) {
      // Check if the path itself is a vault
      const obsidianMarker = path.join(searchPath, '.obsidian');
      if (fs.existsSync(obsidianMarker)) {
        availableVaults.push(searchPath);
        console.log(`✅ 找到 Vault: ${searchPath}`);
      } else {
        // Otherwise scan subdirectories
        const vaults = await VaultManager.scanVaults(searchPath);
        availableVaults.push(...vaults);
        if (vaults.length > 0) {
          console.log(`✅ 掃描 ${searchPath}: 找到 ${vaults.length} 個 Vault`);
        }
      }
    }
  }

  // 2026-07-03 00:27:20 vaultList 改為「掃描結果＋既有清單＋選定 vault 根目錄」合併，不再整個覆蓋；並剔除已不存在的 vault. By Claude Fable 5 (effort: default), 傳企監看。begin
  // // Remove duplicates
  // availableVaults = [...new Set(availableVaults)];
  //
  // // Filter out invalid vaults (like .stversions)
  // const validVaults = availableVaults.filter((vault) => {
  //   const name = path.basename(vault);
  //   return !name.startsWith('.');
  // });
  //
  // configManager.setVaultList(validVaults);

  // 合併：掃描結果 + 既有清單（保留 Browse 選過、掃描不到的 vault）
  availableVaults.push(...configManager.getVaultList());

  // 選定目錄所屬的 vault 根目錄一定要在清單內
  const savedVault = configManager.getSelectedVault();
  if (savedVault) {
    const savedRoot = findVaultRoot(savedVault);
    if (savedRoot) {
      availableVaults.push(savedRoot);
    }
  }

  // 去重、剔除隱藏目錄（如 .stversions）與已不存在的 vault
  const validVaults = [...new Set(availableVaults)].filter((vault) => {
    const name = path.basename(vault);
    return !name.startsWith('.') && fs.existsSync(path.join(vault, '.obsidian'));
  });

  configManager.setVaultList(validVaults);
  // 2026-07-03 00:27:20 vaultList 改為「掃描結果＋既有清單＋選定 vault 根目錄」合併，不再整個覆蓋；並剔除已不存在的 vault. By Claude Fable 5 (effort: default), 傳企監看。 end

  // Set current vault - prefer saved selection, fall back to first vault
  let selectedVault = configManager.getSelectedVault();

  // Check if saved vault is still valid (could be deleted)
  const isValidPath = selectedVault && VaultManager.isValidVault(selectedVault);

  if (!isValidPath && validVaults.length > 0) {
    // Only auto-select if saved vault is invalid
    selectedVault = validVaults[0];
    configManager.setSelectedVault(selectedVault);
    console.log(`✅ 自動選擇 Vault: ${selectedVault}`);
  }

  if (selectedVault && VaultManager.isValidVault(selectedVault)) {
    switchVault(selectedVault);
  } else if (validVaults.length === 0) {
    console.warn('⚠️ 未找到任何有效 Vault');
  }

  // Initialize clipboard monitor
  // 2026-07-03 00:27:20 傳入持久化路徑，去重跨 app 重啟有效. By Claude Fable 5 (effort: default), 傳企監看。begin
  // clipboardMonitor = new ClipboardMonitor();
  clipboardMonitor = new ClipboardMonitor(
    path.join(app.getPath('userData'), 'seen-hashes.json')
  );
  // 2026-07-03 00:27:20 傳入持久化路徑，去重跨 app 重啟有效. By Claude Fable 5 (effort: default), 傳企監看。 end
  clipboardMonitor.on('content', async (text: string, image: Buffer | undefined) => {
    if (!currentVaultManager) {
      console.log('No vault selected');
      return;
    }

    // 2026-07-02 22:32:00 配合 VaultManager 移除 date 參數（原 toISOString 為 UTC 日期，台灣晚間會差一天，順勢移除）. By Claude Fable 5 (effort: default), 傳企監看。begin
    // const today = new Date().toISOString().split('T')[0];
    // await currentVaultManager.appendToClipboardNote(text, image, today);
    await currentVaultManager.appendToClipboardNote(text, image);
    // 2026-07-02 22:32:00 配合 VaultManager 移除 date 參數（原 toISOString 為 UTC 日期，台灣晚間會差一天，順勢移除）. By Claude Fable 5 (effort: default), 傳企監看。 end
  });

  clipboardMonitor.startPolling(500);

  // Register global hotkey
  const hotkey = configManager.getGlobalHotkey();
  globalShortcut.register(hotkey, () => {
    // Trigger manual clipboard check
    if (clipboardMonitor) {
      clipboardMonitor.emit('manual-trigger');
    }
  });

  createTray();
}

// Single instance lock - prevent multiple instances
const lock = app.requestSingleInstanceLock();
if (!lock) {
  // Another instance is already running
  console.log('⚠️ 應用已在運行，退出此實例');
  app.quit();
} else {
  app.on('second-instance', () => {
    // When user tries to open a second instance, focus the tray instead
    console.log('🔔 有人嘗試啟動第二個實例，焦點保持在系統托盤');
  });

  app.on('ready', initializeApp);
}

app.on('window-all-closed', () => {
  // Don't quit the app when windows close - keep running in system tray
  // Only quit when user explicitly selects Quit from tray menu
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();

  if (clipboardMonitor) {
    clipboardMonitor.stopPolling();
  }
});

// IPC handlers for settings window
ipcMain.handle('get-config', () => {
  return configManager?.getConfig();
});

// 2026-07-02 22:32:00 舊版：register 失敗仍回傳 true，且舊快捷鍵已先解除，失敗時兩者皆失效. By Claude Fable 5 (effort: default), 傳企監看。begin
// ipcMain.handle('set-hotkey', (_event: any, hotkey: string) => {
//   if (!configManager) return false;
//
//   globalShortcut.unregister(configManager.getGlobalHotkey());
//   configManager.setGlobalHotkey(hotkey);
//   globalShortcut.register(hotkey, () => {
//     if (clipboardMonitor) {
//       clipboardMonitor.emit('manual-trigger');
//     }
//   });
//
//   return true;
// });
// 2026-07-02 22:32:00 舊版：register 失敗仍回傳 true，且舊快捷鍵已先解除，失敗時兩者皆失效. By Claude Fable 5 (effort: default), 傳企監看。 end
// 2026-07-02 22:32:00 新版：註冊失敗時還原舊快捷鍵並回傳 false. By Claude Fable 5 (effort: default), 傳企監看。begin
ipcMain.handle('set-hotkey', (_event: any, hotkey: string) => {
  if (!configManager) return false;

  const previousHotkey = configManager.getGlobalHotkey();
  const trigger = () => {
    if (clipboardMonitor) {
      clipboardMonitor.emit('manual-trigger');
    }
  };

  globalShortcut.unregister(previousHotkey);
  if (globalShortcut.register(hotkey, trigger)) {
    configManager.setGlobalHotkey(hotkey);
    return true;
  }

  // 新快捷鍵註冊失敗（無效或被占用）：還原舊的
  globalShortcut.register(previousHotkey, trigger);
  return false;
});
// 2026-07-02 22:32:00 新版：註冊失敗時還原舊快捷鍵並回傳 false. By Claude Fable 5 (effort: default), 傳企監看。 end

ipcMain.handle('set-vault', (_event: any, vaultPath: string) => {
  if (!configManager) return false;

  configManager.setSelectedVault(vaultPath);
  switchVault(vaultPath);

  return true;
});

ipcMain.handle('get-vaults', () => {
  return configManager?.getVaultList() || [];
});

ipcMain.handle('open-vault-folder', () => {
  openVaultFolder();
  return true;
});

// 2026-07-02 22:48:00 Settings 的 Browse 走與托盤相同的子目錄選擇流程，回傳最終選定路徑. By Claude Fable 5 (effort: default), 傳企監看。begin
ipcMain.handle('browse-vault-folder', async () => {
  const selected = await showVaultSelector();
  return selected ?? configManager?.getSelectedVault() ?? '';
});
// 2026-07-02 22:48:00 Settings 的 Browse 走與托盤相同的子目錄選擇流程，回傳最終選定路徑. By Claude Fable 5 (effort: default), 傳企監看。 end
