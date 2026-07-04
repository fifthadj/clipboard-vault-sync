/*
  目的：UI 多語系（繁體中文／English）：字典、locale 解析（auto 依系統語言）、t() 取字串含 {參數} 插值
  作者：徐傳企 Mario Hsu（AI 協助：Claude Fable 5）
  沿革：
       2026-07-04  v0.0.0.1  1.誕生日。首發支援 en 與 zh-TW。
*/
// 2026-07-04 17:57:07 UI 多語系模組（自製輕量字典，不引外部套件）. By Claude Fable 5 (effort: default), 傳企監看。begin
export type Locale = 'en' | 'zh-TW';
export type LanguagePref = 'auto' | Locale;

const en = {
  // Tray
  'tray.continuousMode': 'Continuous capture (auto-save)',
  'tray.openVaultFolder': 'Open Vault Folder',
  'tray.selectVault': 'Select Vault...',
  'tray.settings': 'Settings',
  'tray.quit': 'Quit',
  'tray.tooltip': 'Clipboard Vault Sync',

  // Notifications
  'notify.savedTitle': '✅ Saved to Vault',
  'notify.savedImageAvif': '[image → AVIF]',
  'notify.savedImagePngFallback': '[image → PNG (AVIF conversion failed, original kept)]',
  'notify.notSavedTitle': 'Not saved',
  'notify.duplicateBody': 'Clipboard content is a duplicate of an earlier entry',
  'notify.emptyBody': 'Clipboard has no text or image',
  'notify.noVaultBody': 'No vault selected — use Select Vault in the tray menu',
  'notify.saveFailedTitle': '❌ Save failed',
  'notify.continuousOnTitle': 'Continuous capture: ON',
  'notify.continuousOnBody': 'New clipboard content is saved to the vault automatically',
  'notify.continuousOffTitle': 'Continuous capture: OFF',
  'notify.continuousOffBody': 'Content is saved only when you press the hotkey ({hotkey})',

  // Dialogs
  'dialog.selectFolderTitle': 'Select Folder to Sync Clipboard',
  'dialog.invalidLocationTitle': 'Invalid location',
  'dialog.invalidLocationBody':
    'The selected folder is not inside any Obsidian vault.\n\nPlease pick a folder inside a vault.\n\nPath: {path}',

  // Settings window
  'settings.title': '⚙️ Settings',
  'settings.currentFolderLabel': 'Current Sync Folder',
  'settings.browseButton': '📂 Browse... (pick any folder inside a vault)',
  'settings.vaultListLabel': 'Vaults (click to switch to that vault root)',
  'settings.hotkeyLabel': 'Global Hotkey (click the field, then press a combo)',
  'settings.hotkeyPlaceholder': 'Click here, then press a combo such as Ctrl+Alt+C',
  'settings.saveHotkeyButton': 'Save Hotkey',
  'settings.languageLabel': 'Language',
  'settings.languageAuto': 'Auto (system language)',
  'settings.openVaultFolderButton': '📁 Open Vault Folder',
  'settings.refreshVaultsButton': '🔄 Refresh Vaults',
  'settings.notSelected': '(not selected yet)',
  'settings.noVaultsFound': 'No vaults found',
  'settings.syncingSubdir': ' (currently syncing a subfolder)',
  'settings.confirmSwitchRoot':
    'A subfolder of this vault is currently being synced. Switch to the vault root?',
  'settings.statusVaultSelected': '✓ Vault selected',
  'settings.statusFolderUpdated': '✓ Sync folder updated',
  'settings.statusHotkeySaved': '✓ Hotkey saved',
  'settings.statusHotkeyInvalid': '✗ Invalid or unavailable hotkey',
  'settings.statusOpeningFolder': '✓ Opening vault folder...',
  'settings.statusOpenFolderFailed': '✗ Failed to open vault folder',
  'settings.statusLanguageSaved': '✓ Language saved',
  'settings.hotkeyPressCombo': 'Press a key combo… (Esc to cancel)',
  'settings.hotkeyUnsupportedKey': '✗ Unsupported key',
  'settings.hotkeyNeedModifier': '✗ At least one modifier is required (Ctrl / Alt / Shift / Win)',
  'settings.hotkeyDetected': 'Detected — press "Save Hotkey" to apply',
} as const;

export type MessageKey = keyof typeof en;

const zhTW: Record<MessageKey, string> = {
  // Tray
  'tray.continuousMode': '連續收集模式（自動存檔）',
  'tray.openVaultFolder': '開啟 Vault 資料夾',
  'tray.selectVault': '選擇 Vault…',
  'tray.settings': '設定',
  'tray.quit': '結束',
  'tray.tooltip': 'Clipboard Vault Sync',

  // Notifications
  'notify.savedTitle': '✅ 已存入 Vault',
  'notify.savedImageAvif': '[圖片 → AVIF]',
  'notify.savedImagePngFallback': '[圖片 → PNG（AVIF 轉檔失敗，已退存原圖）]',
  'notify.notSavedTitle': '未存檔',
  'notify.duplicateBody': '剪貼簿內容與先前存過的重複',
  'notify.emptyBody': '剪貼簿沒有文字或圖片',
  'notify.noVaultBody': '尚未選擇 Vault，請從托盤選單「選擇 Vault…」設定',
  'notify.saveFailedTitle': '❌ 存檔失敗',
  'notify.continuousOnTitle': '連續收集模式：開',
  'notify.continuousOnBody': '剪貼簿有新內容就自動存入 Vault',
  'notify.continuousOffTitle': '連續收集模式：關',
  'notify.continuousOffBody': '只有按熱鍵（{hotkey}）才存檔',

  // Dialogs
  'dialog.selectFolderTitle': '選擇要同步剪貼簿的資料夾',
  'dialog.invalidLocationTitle': '無效的位置',
  'dialog.invalidLocationBody':
    '選擇的資料夾不在任何 Obsidian Vault 內。\n\n請選擇 Vault 內的任何資料夾。\n\n路徑：{path}',

  // Settings window
  'settings.title': '⚙️ 設定',
  'settings.currentFolderLabel': '目前同步目錄',
  'settings.browseButton': '📂 瀏覽…（選擇 Vault 內任一子目錄）',
  'settings.vaultListLabel': 'Vault 清單（點選切換為該 Vault 根目錄）',
  'settings.hotkeyLabel': '全域熱鍵（點擊欄位後直接按下組合鍵）',
  'settings.hotkeyPlaceholder': '點此後按下組合鍵，例如 Ctrl+Alt+C',
  'settings.saveHotkeyButton': '儲存熱鍵',
  'settings.languageLabel': '語言 Language',
  'settings.languageAuto': '自動（跟隨系統語言）',
  'settings.openVaultFolderButton': '📁 開啟 Vault 資料夾',
  'settings.refreshVaultsButton': '🔄 重新掃描 Vault',
  'settings.notSelected': '（尚未選擇）',
  'settings.noVaultsFound': '找不到任何 Vault',
  'settings.syncingSubdir': '（目前同步其子目錄）',
  'settings.confirmSwitchRoot': '目前同步的是此 Vault 內的子目錄，切換為 Vault 根目錄？',
  'settings.statusVaultSelected': '✓ 已選擇 Vault',
  'settings.statusFolderUpdated': '✓ 已更新同步目錄',
  'settings.statusHotkeySaved': '✓ 熱鍵已儲存',
  'settings.statusHotkeyInvalid': '✗ 熱鍵無效或已被占用',
  'settings.statusOpeningFolder': '✓ 正在開啟 Vault 資料夾…',
  'settings.statusOpenFolderFailed': '✗ 開啟 Vault 資料夾失敗',
  'settings.statusLanguageSaved': '✓ 語言已儲存',
  'settings.hotkeyPressCombo': '請按下組合鍵…（Esc 取消）',
  'settings.hotkeyUnsupportedKey': '✗ 不支援的按鍵',
  'settings.hotkeyNeedModifier': '✗ 至少要搭配一個修飾鍵（Ctrl / Alt / Shift / Win）',
  'settings.hotkeyDetected': '已偵測，按「儲存熱鍵」套用',
};

const messages: Record<Locale, Record<MessageKey, string>> = {
  en,
  'zh-TW': zhTW,
};

let currentLocale: Locale = 'en';

/** 依偏好（auto/en/zh-TW）與系統 locale（如 zh-TW、zh-Hant-TW、en-US）解析實際 locale */
export function resolveLocale(pref: string | undefined, systemLocale: string): Locale {
  if (pref === 'en' || pref === 'zh-TW') {
    return pref;
  }
  // auto（含未設定/未知值）：中文系語言一律 zh-TW，其餘 en
  return systemLocale.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/** 取字串；{name} 以 params 插值；缺 key 回傳 key 本身（不炸） */
export function t(key: MessageKey, params?: Record<string, string>): string {
  let text: string = messages[currentLocale][key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(value);
    }
  }
  return text;
}

/** 給 renderer 用：目前 locale 的整份字典 */
export function getMessages(): Record<MessageKey, string> {
  return { ...messages[currentLocale] };
}
// 2026-07-04 17:57:07 UI 多語系模組（自製輕量字典，不引外部套件）. By Claude Fable 5 (effort: default), 傳企監看。 end
