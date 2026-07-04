/*
  目的：管理 app 設定（config.json）：選定 vault、vault 清單、全域熱鍵、vault 搜尋路徑、連續收集模式
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-04  v0.1.0.3  1.新增 language（auto/en/zh-TW）欄位與 getter/setter，預設 auto。
       2026-07-04  v0.1.0.2  1.新增 continuousMode（連續收集模式）欄位與 getter/setter，預設 true。2.補檔頭。
       2026-07-02  v0.1.0.1  1.誕生日。
*/
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
// 2026-07-04 17:57:07 語言偏好型別. By Claude Fable 5 (effort: default), 傳企監看。begin
import { LanguagePref } from './i18n';
// 2026-07-04 17:57:07 語言偏好型別. By Claude Fable 5 (effort: default), 傳企監看。 end

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
  // 2026-07-04 17:25:07 連續收集模式：true＝輪詢自動存檔（預設），false＝只有熱鍵才存. By Claude Fable 5 (effort: default), 傳企監看。begin
  continuousMode: boolean;
  // 2026-07-04 17:25:07 連續收集模式：true＝輪詢自動存檔（預設），false＝只有熱鍵才存. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-04 17:57:07 UI 語言偏好：auto＝跟隨系統語言. By Claude Fable 5 (effort: default), 傳企監看。begin
  language: LanguagePref;
  // 2026-07-04 17:57:07 UI 語言偏好：auto＝跟隨系統語言. By Claude Fable 5 (effort: default), 傳企監看。 end
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
    // 2026-07-04 17:25:07 連續收集模式預設開啟（維持既有自動存檔行為）. By Claude Fable 5 (effort: default), 傳企監看。begin
    continuousMode: true,
    // 2026-07-04 17:25:07 連續收集模式預設開啟（維持既有自動存檔行為）. By Claude Fable 5 (effort: default), 傳企監看。 end
    // 2026-07-04 17:57:07 語言預設 auto（跟隨系統）. By Claude Fable 5 (effort: default), 傳企監看。begin
    language: 'auto',
    // 2026-07-04 17:57:07 語言預設 auto（跟隨系統）. By Claude Fable 5 (effort: default), 傳企監看。 end
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

  // 2026-07-04 17:25:07 連續收集模式 getter/setter. By Claude Fable 5 (effort: default), 傳企監看。begin
  getContinuousMode(): boolean {
    return this.config.continuousMode !== false;
  }

  setContinuousMode(enabled: boolean): void {
    this.config.continuousMode = enabled;
    this.saveConfig();
  }
  // 2026-07-04 17:25:07 連續收集模式 getter/setter. By Claude Fable 5 (effort: default), 傳企監看。 end

  // 2026-07-04 17:57:07 語言偏好 getter/setter. By Claude Fable 5 (effort: default), 傳企監看。begin
  getLanguage(): LanguagePref {
    const value = this.config.language;
    return value === 'en' || value === 'zh-TW' ? value : 'auto';
  }

  setLanguage(language: LanguagePref): void {
    this.config.language = language;
    this.saveConfig();
  }
  // 2026-07-04 17:57:07 語言偏好 getter/setter. By Claude Fable 5 (effort: default), 傳企監看。 end

  getConfig(): Config {
    return { ...this.config };
  }
}
