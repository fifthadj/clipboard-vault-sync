import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface Config {
  selectedVault: string;
  vaultList: string[];
  globalHotkey: string;
  // 2026-07-03 00:27:20 移除死欄位 autoOpenNote（無任何實作與 UI，YAGNI）. By Claude Fable 5 (effort: default), 傳企監看。begin
  // autoOpenNote: boolean;
  // 2026-07-03 00:27:20 移除死欄位 autoOpenNote（無任何實作與 UI，YAGNI）. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-03 00:23:00 使用者自訂額外 vault 搜尋路徑（跨平台化，取代寫死路徑）. By Claude Fable 5 (effort: default), 傳企監看。begin
  vaultSearchPaths: string[];
  // 2026-07-03 00:23:00 使用者自訂額外 vault 搜尋路徑（跨平台化，取代寫死路徑）. By Claude Fable 5 (effort: default), 傳企監看。 end
}

export class ConfigManager {
  private configPath: string;
  private config: Config;

  private readonly DEFAULT_CONFIG: Config = {
    selectedVault: '',
    vaultList: [],
    globalHotkey: 'Ctrl+Alt+C',
    // 2026-07-03 00:27:20 移除死欄位 autoOpenNote. By Claude Fable 5 (effort: default), 傳企監看。begin
    // autoOpenNote: false,
    // 2026-07-03 00:27:20 移除死欄位 autoOpenNote. By Claude Fable 5 (effort: default), 傳企監看。 end
    // 2026-07-03 00:23:00 預設無額外搜尋路徑. By Claude Fable 5 (effort: default), 傳企監看。begin
    vaultSearchPaths: [],
    // 2026-07-03 00:23:00 預設無額外搜尋路徑. By Claude Fable 5 (effort: default), 傳企監看。 end
  };

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    if (fs.existsSync(this.configPath)) {
      try {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return { ...this.DEFAULT_CONFIG, ...JSON.parse(data) };
      } catch (error) {
        console.error('Failed to load config:', error);
        return { ...this.DEFAULT_CONFIG };
      }
    }

    return { ...this.DEFAULT_CONFIG };
  }

  saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  getSelectedVault(): string {
    return this.config.selectedVault;
  }

  setSelectedVault(vaultPath: string): void {
    this.config.selectedVault = vaultPath;
    this.saveConfig();
  }

  getVaultList(): string[] {
    return this.config.vaultList;
  }

  setVaultList(vaults: string[]): void {
    this.config.vaultList = vaults;
    this.saveConfig();
  }

  getGlobalHotkey(): string {
    return this.config.globalHotkey;
  }

  setGlobalHotkey(hotkey: string): void {
    this.config.globalHotkey = hotkey;
    this.saveConfig();
  }

  // 2026-07-03 00:27:20 移除死欄位 autoOpenNote 的 getter/setter. By Claude Fable 5 (effort: default), 傳企監看。begin
  // isAutoOpenNote(): boolean {
  //   return this.config.autoOpenNote;
  // }
  //
  // setAutoOpenNote(enabled: boolean): void {
  //   this.config.autoOpenNote = enabled;
  //   this.saveConfig();
  // }
  // 2026-07-03 00:27:20 移除死欄位 autoOpenNote 的 getter/setter. By Claude Fable 5 (effort: default), 傳企監看。 end

  // 2026-07-03 00:23:00 取得使用者自訂 vault 搜尋路徑. By Claude Fable 5 (effort: default), 傳企監看。begin
  getVaultSearchPaths(): string[] {
    return this.config.vaultSearchPaths || [];
  }
  // 2026-07-03 00:23:00 取得使用者自訂 vault 搜尋路徑. By Claude Fable 5 (effort: default), 傳企監看。 end

  getConfig(): Config {
    return { ...this.config };
  }
}
