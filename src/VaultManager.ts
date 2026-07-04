/*
  目的：管理 Obsidian Vault 的剪貼簿筆記寫入（每筆剪貼一檔、一日可多檔）、圖片 AVIF 轉存與 Vault 掃描驗證
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-04  v0.1.0.4  1.AVIF 轉檔改用 avifenc.exe 外部程序（sidecar），移除 sharp（原生模組在 Electron 打包後載入失敗，圖片默默消失）。2.轉檔失敗自動退存 PNG，圖片絕不丟失。3.appendToClipboardNote 回傳存檔結果供通知使用。
       2026-07-02  v0.1.0.3  1.筆記檔名加上本地日期：Clipboard-YYYY-MM-DD_HH-MM-SS-mmm.md（日期與時間以底線分隔，無空白）。
       2026-07-02  v0.1.0.2  1.修正圖片相對路徑 ../attachments → attachments（筆記在根目錄，非 Inbox）。2.移除未使用的 date 參數。3.修正筆記檔頭 typo。
       2026-07-02  v0.1.0.1  1.誕生日。
*/
import * as fs from 'fs';
import * as path from 'path';
// 2026-07-04 17:25:07 移除 sharp（原生模組打包後失效），改 spawn avifenc.exe. By Claude Fable 5 (effort: default), 傳企監看。begin
// import sharp from 'sharp';
import { execFile } from 'child_process';
import * as os from 'os';

/** appendToClipboardNote 的存檔結果，null 表示無內容未存檔 */
export interface SaveResult {
  notePath: string;
  savedText: boolean;
  /** 'avif'＝正常轉檔；'png'＝avifenc 失敗退存原圖；null＝本筆無圖片 */
  savedImage: 'avif' | 'png' | null;
}
// 2026-07-04 17:25:07 移除 sharp（原生模組打包後失效），改 spawn avifenc.exe. By Claude Fable 5 (effort: default), 傳企監看。 end

export class VaultManager {
  private vaultPath: string;

  // 2026-07-04 17:25:07 avifenc 路徑解析：dev 用專案 assets/bin，打包後用 resources/bin（extraResources）；測試可用 avifencPathOverride 注入. By Claude Fable 5 (effort: default), 傳企監看。begin
  static avifencPathOverride: string | null = null;

  private static resolveAvifencPath(): string | null {
    if (VaultManager.avifencPathOverride !== null) {
      return VaultManager.avifencPathOverride;
    }
    const exe = process.platform === 'win32' ? 'avifenc.exe' : 'avifenc';
    const resourcesPath = (process as any).resourcesPath as string | undefined;
    const candidates = [
      path.join(__dirname, '..', 'assets', 'bin', exe),
      ...(resourcesPath ? [path.join(resourcesPath, 'bin', exe)] : []),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  /** PNG buffer → AVIF 檔。成功回傳 true；任何失敗（找不到 avifenc、轉檔錯誤、輸出空檔）回傳 false，不拋錯 */
  private async convertToAvif(pngBuffer: Buffer, outputPath: string): Promise<boolean> {
    const avifencPath = VaultManager.resolveAvifencPath();
    if (!avifencPath) {
      console.error('avifenc not found, will fall back to PNG');
      return false;
    }

    const tempPng = path.join(
      os.tmpdir(),
      `cvs_${Date.now()}_${Math.random().toString(36).slice(2)}.png`
    );
    try {
      fs.writeFileSync(tempPng, pngBuffer);
      await new Promise<void>((resolve, reject) => {
        execFile(
          avifencPath,
          ['-q', '80', '-s', '8', tempPng, outputPath],
          { timeout: 60_000, windowsHide: true },
          (error) => (error ? reject(error) : resolve())
        );
      });
      return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0;
    } catch (error) {
      console.error('avifenc conversion failed, will fall back to PNG:', error);
      return false;
    } finally {
      try {
        fs.unlinkSync(tempPng);
      } catch {
        // 暫存檔清不掉不影響功能
      }
    }
  }
  // 2026-07-04 17:25:07 avifenc 路徑解析：dev 用專案 assets/bin，打包後用 resources/bin（extraResources）；測試可用 avifencPathOverride 注入. By Claude Fable 5 (effort: default), 傳企監看。 end

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
    this.ensureInboxDirectory();
  }

  private ensureInboxDirectory(): void {
    // Ensure the selected directory exists
    if (!fs.existsSync(this.vaultPath)) {
      fs.mkdirSync(this.vaultPath, { recursive: true });
    }

    // Create attachments directory in the selected directory
    const attachmentsPath = path.join(this.vaultPath, 'attachments');
    if (!fs.existsSync(attachmentsPath)) {
      fs.mkdirSync(attachmentsPath, { recursive: true });
    }
  }

  // 2026-07-02 22:32:00 移除未使用的 date 參數（一日多檔規格下已無每日彙整檔）. By Claude Fable 5 (effort: default), 傳企監看。begin
  // async appendToClipboardNote(
  //   text: string,
  //   imageBuffer: Buffer | undefined,
  //   date: string,
  //   timestamp: string = this.getCurrentTimestamp()
  // ): Promise<void> {
  // 2026-07-02 22:32:00 移除未使用的 date 參數（一日多檔規格下已無每日彙整檔）. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-04 17:25:07 舊版：sharp 轉 AVIF、失敗只印 log 圖片消失、回傳 void. By Claude Fable 5 (effort: default), 傳企監看。begin
  // async appendToClipboardNote(
  //   text: string,
  //   imageBuffer: Buffer | undefined,
  //   timestamp: string = this.getCurrentTimestamp()
  // ): Promise<void> {
  //   // Filter: don't save if both text and image are empty
  //   if (!text.trim() && !imageBuffer) {
  //     return;
  //   }
  //
  //   const notePath = this.getClipboardNotePath(timestamp);
  //   let entry = `## [${timestamp}] Clipboard Entry\n`;
  //
  //   if (text.trim()) {
  //     entry += `${text.trim()}\n\n`;
  //   }
  //
  //   let imageReference = '';
  //   if (imageBuffer) {
  //     try {
  //       // Convert to AVIF
  //       const imageFileName = this.generateImageFileName(timestamp);
  //       const imagePath = path.join(this.vaultPath, 'attachments', imageFileName);
  //
  //       await sharp(imageBuffer)
  //         .avif({ quality: 80 })
  //         .toFile(imagePath);
  //
  //       imageReference = `![](attachments/${imageFileName})\n\n`;
  //       entry += imageReference;
  //     } catch (error) {
  //       console.error('Failed to process image:', error);
  //       // Continue without image if processing fails
  //     }
  //   }
  //
  //   entry += '---\n\n';
  //
  //   // Append or create the note
  //   if (fs.existsSync(notePath)) {
  //     fs.appendFileSync(notePath, entry);
  //   } else {
  //     const header = '# Clipboard\n\n';
  //     fs.writeFileSync(notePath, header + entry);
  //   }
  // }
  // 2026-07-04 17:25:07 舊版：sharp 轉 AVIF、失敗只印 log 圖片消失、回傳 void. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-04 17:25:07 新版：avifenc 轉 AVIF、失敗退存 PNG、回傳 SaveResult 供通知. By Claude Fable 5 (effort: default), 傳企監看。begin
  async appendToClipboardNote(
    text: string,
    imageBuffer: Buffer | undefined,
    timestamp: string = this.getCurrentTimestamp()
  ): Promise<SaveResult | null> {
    // Filter: don't save if both text and image are empty
    if (!text.trim() && !imageBuffer) {
      return null;
    }

    const notePath = this.getClipboardNotePath(timestamp);
    let entry = `## [${timestamp}] Clipboard Entry\n`;

    const savedText = !!text.trim();
    if (savedText) {
      entry += `${text.trim()}\n\n`;
    }

    let savedImage: 'avif' | 'png' | null = null;
    if (imageBuffer) {
      const avifFileName = this.generateImageFileName(timestamp);
      const avifPath = path.join(this.vaultPath, 'attachments', avifFileName);

      let imageFileName = avifFileName;
      if (await this.convertToAvif(imageBuffer, avifPath)) {
        savedImage = 'avif';
      } else {
        // 轉檔失敗：退存剪貼簿原始 PNG，圖片絕不丟失
        imageFileName = avifFileName.replace(/\.avif$/, '.png');
        fs.writeFileSync(path.join(this.vaultPath, 'attachments', imageFileName), imageBuffer);
        savedImage = 'png';
      }
      entry += `![](attachments/${imageFileName})\n\n`;
    }

    entry += '---\n\n';

    // Append or create the note
    if (fs.existsSync(notePath)) {
      fs.appendFileSync(notePath, entry);
    } else {
      const header = '# Clipboard\n\n';
      fs.writeFileSync(notePath, header + entry);
    }

    return { notePath, savedText, savedImage };
  }
  // 2026-07-04 17:25:07 新版：avifenc 轉 AVIF、失敗退存 PNG、回傳 SaveResult 供通知. By Claude Fable 5 (effort: default), 傳企監看。 end

  private generateImageFileName(timestamp: string): string {
    // Convert HH:MM:SS to HHMMSSmmm format with milliseconds
    const now = new Date();
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const cleanTimestamp = timestamp.replace(/:/g, '') + ms;
    return `clipboard_${cleanTimestamp}.avif`;
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  // 2026-07-02 23:03:00 檔名加上本地日期（格式 Clipboard-YYYY-MM-DD-HH-MM-SS-mmm.md，無空白），舊版只有時間. By Claude Fable 5 (effort: default), 傳企監看。begin
  // getClipboardNotePath(timestamp: string): string {
  //   // Use timestamp as filename to create a new file for each clipboard entry
  //   const fileName = `Clipboard-${timestamp.replace(/:/g, '-').replace(/\./g, '-')}.md`;
  //   return path.join(this.vaultPath, fileName);
  // }
  private static getLocalDate(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getClipboardNotePath(timestamp: string, date: string = VaultManager.getLocalDate()): string {
    // Use date + timestamp as filename to create a new file for each clipboard entry
    // 檔名格式：Clipboard-YYYY-MM-DD_HH-MM-SS-mmm.md（日期與時間以底線分隔，無空白）
    const fileName = `Clipboard-${date}_${timestamp.replace(/:/g, '-').replace(/\./g, '-')}.md`;
    return path.join(this.vaultPath, fileName);
  }
  // 2026-07-02 23:03:00 檔名加上本地日期（格式 Clipboard-YYYY-MM-DD-HH-MM-SS-mmm.md，無空白），舊版只有時間. By Claude Fable 5 (effort: default), 傳企監看。 end

  static async scanVaults(parentPath: string): Promise<string[]> {
    const vaults: string[] = [];

    if (!fs.existsSync(parentPath)) {
      return vaults;
    }

    const entries = fs.readdirSync(parentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const vaultPath = path.join(parentPath, entry.name);
        const obsidianPath = path.join(vaultPath, '.obsidian');

        // Check if directory has .obsidian folder (Obsidian vault marker)
        if (fs.existsSync(obsidianPath)) {
          vaults.push(vaultPath);
        }
      }
    }

    return vaults;
  }

  static isValidVault(vaultPath: string): boolean {
    // Check if path itself has .obsidian
    if (fs.existsSync(path.join(vaultPath, '.obsidian'))) {
      return true;
    }

    // Check if path is inside a vault by searching parent directories
    let currentPath = vaultPath;
    for (let i = 0; i < 10; i++) {
      const obsidianMarker = path.join(currentPath, '.obsidian');
      if (fs.existsSync(obsidianMarker)) {
        return true;
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        break;
      }
      currentPath = parentPath;
    }

    return false;
  }
}
