/*
  目的：管理 Obsidian Vault 的剪貼簿筆記寫入（每筆剪貼一檔、一日可多檔）、圖片 AVIF 轉存與 Vault 掃描驗證
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-02  v0.1.0.3  1.筆記檔名加上本地日期：Clipboard-YYYY-MM-DD_HH-MM-SS-mmm.md（日期與時間以底線分隔，無空白）。
       2026-07-02  v0.1.0.2  1.修正圖片相對路徑 ../attachments → attachments（筆記在根目錄，非 Inbox）。2.移除未使用的 date 參數。3.修正筆記檔頭 typo。
       2026-07-02  v0.1.0.1  1.誕生日。
*/
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export class VaultManager {
  private vaultPath: string;

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
  // 2026-07-02 22:32:00 新簽名：只收 text/imageBuffer/timestamp. By Claude Fable 5 (effort: default), 傳企監看。begin
  async appendToClipboardNote(
    text: string,
    imageBuffer: Buffer | undefined,
    timestamp: string = this.getCurrentTimestamp()
  ): Promise<void> {
  // 2026-07-02 22:32:00 新簽名：只收 text/imageBuffer/timestamp. By Claude Fable 5 (effort: default), 傳企監看。 end
    // Filter: don't save if both text and image are empty
    if (!text.trim() && !imageBuffer) {
      return;
    }

    const notePath = this.getClipboardNotePath(timestamp);
    let entry = `## [${timestamp}] Clipboard Entry\n`;

    if (text.trim()) {
      entry += `${text.trim()}\n\n`;
    }

    let imageReference = '';
    if (imageBuffer) {
      try {
        // Convert to AVIF
        const imageFileName = this.generateImageFileName(timestamp);
        const imagePath = path.join(this.vaultPath, 'attachments', imageFileName);

        await sharp(imageBuffer)
          .avif({ quality: 80 })
          .toFile(imagePath);

        // 2026-07-02 22:32:00 修正圖片相對路徑：筆記在選定資料夾根目錄，attachments 為其子目錄，不需 ../. By Claude Fable 5 (effort: default), 傳企監看。begin
        // imageReference = `![](../attachments/${imageFileName})\n\n`;
        imageReference = `![](attachments/${imageFileName})\n\n`;
        // 2026-07-02 22:32:00 修正圖片相對路徑：筆記在選定資料夾根目錄，attachments 為其子目錄，不需 ../. By Claude Fable 5 (effort: default), 傳企監看。 end
        entry += imageReference;
      } catch (error) {
        console.error('Failed to process image:', error);
        // Continue without image if processing fails
      }
    }

    entry += '---\n\n';

    // Append or create the note
    if (fs.existsSync(notePath)) {
      fs.appendFileSync(notePath, entry);
    } else {
      // 2026-07-02 22:32:00 修正檔頭 typo「Clipboard Clipboard」. By Claude Fable 5 (effort: default), 傳企監看。begin
      // const header = '# Clipboard Clipboard\n\n';
      const header = '# Clipboard\n\n';
      // 2026-07-02 22:32:00 修正檔頭 typo「Clipboard Clipboard」. By Claude Fable 5 (effort: default), 傳企監看。 end
      fs.writeFileSync(notePath, header + entry);
    }
  }

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
