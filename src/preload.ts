import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  setHotkey: (hotkey: string) => ipcRenderer.invoke('set-hotkey', hotkey),
  setVault: (vaultPath: string) => ipcRenderer.invoke('set-vault', vaultPath),
  getVaults: () => ipcRenderer.invoke('get-vaults'),
  openVaultFolder: () => ipcRenderer.invoke('open-vault-folder'),
  // 2026-07-02 22:48:00 Settings 的 Browse 子目錄選擇. By Claude Fable 5 (effort: default), 傳企監看。begin
  browseVaultFolder: () => ipcRenderer.invoke('browse-vault-folder'),
  // 2026-07-02 22:48:00 Settings 的 Browse 子目錄選擇. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-04 17:57:07 多語系：取字典、切換語言. By Claude Fable 5 (effort: default), 傳企監看。begin
  getI18n: () => ipcRenderer.invoke('get-i18n'),
  setLanguage: (language: string) => ipcRenderer.invoke('set-language', language),
  // 2026-07-04 17:57:07 多語系：取字典、切換語言. By Claude Fable 5 (effort: default), 傳企監看。 end
});
