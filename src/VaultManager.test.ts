/*
  目的：VaultManager 單元測試（對齊 2026-07-02 新規格：每筆剪貼一檔、一日可多檔、圖片連結 attachments/ 不帶 ../）
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-02  v0.1.0.2  1.改寫全部 appendToClipboardNote 測試對齊一日多檔規格（舊版測試整塊註解保留於檔尾）。2.移除 date 參數。
       2026-07-02  v0.1.0.1  1.誕生日。
*/
// 2026-07-02 22:32:00 依一日多檔新規格改寫測試. By Claude Fable 5 (effort: default), 傳企監看。begin
import * as fs from 'fs';
import * as path from 'path';
import { VaultManager } from './VaultManager';

describe('VaultManager', () => {
  const testDir = path.join(__dirname, '../test-vault');
  let testVaultPath: string;

  beforeEach(() => {
    const uniqueId = Math.random().toString(36).substring(7);
    testVaultPath = path.join(testDir, `test-vault-${uniqueId}`);

    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testVaultPath, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  const listNotes = () =>
    fs.readdirSync(testVaultPath).filter((f) => f.endsWith('.md'));

  // 2026-07-02 23:03:00 檔名含本地日期，測試用同邏輯計算今天. By Claude Fable 5 (effort: default), 傳企監看。begin
  const localToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  // 2026-07-02 23:03:00 檔名含本地日期，測試用同邏輯計算今天. By Claude Fable 5 (effort: default), 傳企監看。 end

  // 2026-07-04 17:25:07 舊 fixture 的 IDAT CRC 是壞的（sharp/libvips 寬容照吃，avifenc/libpng 嚴格拒收），換成合法 1x1 PNG. By Claude Fable 5 (effort: default), 傳企監看。begin
  // // 1x1 PNG
  // const pngBuffer = Buffer.from([
  //   0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  //   0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  //   0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
  //   0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  //   0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
  //   0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  // ]);
  // 1x1 PNG（合法檔，avifenc 可讀）
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  // 2026-07-04 17:25:07 舊 fixture 的 IDAT CRC 是壞的（sharp/libvips 寬容照吃，avifenc/libpng 嚴格拒收），換成合法 1x1 PNG. By Claude Fable 5 (effort: default), 傳企監看。 end

  // 2026-07-04 18:15:22 avifenc 二進位只入庫 Windows 版：CI ubuntu job 無 avifenc，AVIF 成功路徑測試條件式 skip（Windows 仍完整跑；退存 PNG 路徑各平台都測）. By Claude Fable 5 (effort: default), 傳企監看。begin
  const avifencAvailable = fs.existsSync(
    path.join(__dirname, '../assets/bin', process.platform === 'win32' ? 'avifenc.exe' : 'avifenc')
  );
  const itIfAvifenc = avifencAvailable ? it : it.skip;
  // 2026-07-04 18:15:22 avifenc 二進位只入庫 Windows 版：CI ubuntu job 無 avifenc，AVIF 成功路徑測試條件式 skip（Windows 仍完整跑；退存 PNG 路徑各平台都測）. By Claude Fable 5 (effort: default), 傳企監看。 end

  describe('appendToClipboardNote', () => {
    it('should create one note file per clipboard entry with text content', async () => {
      const vault = new VaultManager(testVaultPath);
      const timestamp = '14:30:25.123';

      await vault.appendToClipboardNote('Test clipboard content', undefined, timestamp);

      const notePath = vault.getClipboardNotePath(timestamp);
      expect(notePath).toBe(
        path.join(testVaultPath, `Clipboard-${localToday()}_14-30-25-123.md`)
      );
      expect(fs.existsSync(notePath)).toBe(true);

      const content = fs.readFileSync(notePath, 'utf-8');
      expect(content).toContain('# Clipboard\n');
      expect(content).toContain(timestamp);
      expect(content).toContain('Test clipboard content');
    });

    it('should not create note if text is empty and no image', async () => {
      const vault = new VaultManager(testVaultPath);

      await vault.appendToClipboardNote('', undefined, '14:31:00.000');

      expect(listNotes()).toHaveLength(0);
    });

    it('should create separate files for entries with different timestamps (一日可多檔)', async () => {
      const vault = new VaultManager(testVaultPath);

      await vault.appendToClipboardNote('First entry', undefined, '14:30:00.000');
      await vault.appendToClipboardNote('Second entry', undefined, '14:35:00.000');

      const notes = listNotes();
      expect(notes).toHaveLength(2);

      const combined = notes
        .map((f) => fs.readFileSync(path.join(testVaultPath, f), 'utf-8'))
        .join('\n');
      expect(combined).toContain('First entry');
      expect(combined).toContain('Second entry');
    });

    it('should append to the file when the same timestamp is reused', async () => {
      const vault = new VaultManager(testVaultPath);
      const timestamp = '14:40:00.000';

      await vault.appendToClipboardNote('First entry', undefined, timestamp);
      await vault.appendToClipboardNote('Second entry', undefined, timestamp);

      expect(listNotes()).toHaveLength(1);
      const content = fs.readFileSync(vault.getClipboardNotePath(timestamp), 'utf-8');
      expect(content).toContain('First entry');
      expect(content).toContain('Second entry');
    });

    // 2026-07-04 18:15:22 無 avifenc 環境（CI ubuntu）skip：此測試驗證 AVIF 成功路徑. By Claude Fable 5 (effort: default), 傳企監看。begin
    // it('should save image as avif and reference it via attachments/ (no ../)', async () => {
    itIfAvifenc('should save image as avif and reference it via attachments/ (no ../)', async () => {
    // 2026-07-04 18:15:22 無 avifenc 環境（CI ubuntu）skip：此測試驗證 AVIF 成功路徑. By Claude Fable 5 (effort: default), 傳企監看。 end
      const vault = new VaultManager(testVaultPath);
      const timestamp = '14:45:00.000';

      await vault.appendToClipboardNote('', pngBuffer, timestamp);

      const content = fs.readFileSync(vault.getClipboardNotePath(timestamp), 'utf-8');
      expect(content).toContain('![](attachments/clipboard_');
      expect(content).not.toContain('../attachments');
      expect(content).toContain('.avif)');

      const attachments = fs.readdirSync(path.join(testVaultPath, 'attachments'));
      expect(attachments.some((f) => f.endsWith('.avif'))).toBe(true);
    });

    it('should handle mixed text and image', async () => {
      const vault = new VaultManager(testVaultPath);
      const timestamp = '14:50:00.000';
      const text = 'Screenshot with text';

      await vault.appendToClipboardNote(text, pngBuffer, timestamp);

      const content = fs.readFileSync(vault.getClipboardNotePath(timestamp), 'utf-8');
      expect(content).toContain(text);
      expect(content).toContain('![](attachments/clipboard_');
    });

    // 2026-07-04 17:25:07 新增：avifenc sidecar 成功/失敗退存 PNG 與 SaveResult 回傳值測試. By Claude Fable 5 (effort: default), 傳企監看。begin
    itIfAvifenc('should report savedImage avif in SaveResult when avifenc succeeds', async () => {
      const vault = new VaultManager(testVaultPath);

      const result = await vault.appendToClipboardNote('with image', pngBuffer, '15:00:00.000');

      expect(result).not.toBeNull();
      expect(result!.savedText).toBe(true);
      expect(result!.savedImage).toBe('avif');

      const attachments = fs.readdirSync(path.join(testVaultPath, 'attachments'));
      const avifFile = attachments.find((f) => f.endsWith('.avif'));
      expect(avifFile).toBeDefined();
      expect(fs.statSync(path.join(testVaultPath, 'attachments', avifFile!)).size).toBeGreaterThan(0);
    });

    it('should fall back to PNG (image never lost) when avifenc is unavailable', async () => {
      VaultManager.avifencPathOverride = path.join(testVaultPath, 'no-such-avifenc.exe');
      try {
        const vault = new VaultManager(testVaultPath);
        const timestamp = '15:05:00.000';

        const result = await vault.appendToClipboardNote('', pngBuffer, timestamp);

        expect(result).not.toBeNull();
        expect(result!.savedImage).toBe('png');

        const content = fs.readFileSync(vault.getClipboardNotePath(timestamp), 'utf-8');
        expect(content).toContain('.png)');
        expect(content).not.toContain('.avif)');

        const attachments = fs.readdirSync(path.join(testVaultPath, 'attachments'));
        const pngFile = attachments.find((f) => f.endsWith('.png'));
        expect(pngFile).toBeDefined();
        // 退存的 PNG 必須是剪貼簿原始 bytes
        expect(
          fs.readFileSync(path.join(testVaultPath, 'attachments', pngFile!)).equals(pngBuffer)
        ).toBe(true);
      } finally {
        VaultManager.avifencPathOverride = null;
      }
    });

    it('should return null when nothing is saved', async () => {
      const vault = new VaultManager(testVaultPath);

      const result = await vault.appendToClipboardNote('', undefined, '15:10:00.000');

      expect(result).toBeNull();
      expect(listNotes()).toHaveLength(0);
    });
    // 2026-07-04 17:25:07 新增：avifenc sidecar 成功/失敗退存 PNG 與 SaveResult 回傳值測試. By Claude Fable 5 (effort: default), 傳企監看。 end
  });

  describe('scanVaults', () => {
    it('should detect multiple Obsidian vaults', async () => {
      const testVaultsDir = path.join(testDir, 'multi-vaults');
      fs.mkdirSync(testVaultsDir, { recursive: true });

      fs.mkdirSync(path.join(testVaultsDir, 'vault1', '.obsidian'), { recursive: true });
      fs.mkdirSync(path.join(testVaultsDir, 'vault2', '.obsidian'), { recursive: true });
      fs.mkdirSync(path.join(testVaultsDir, 'not-vault'), { recursive: true });

      const vaults = await VaultManager.scanVaults(testVaultsDir);

      expect(vaults.length).toBeGreaterThanOrEqual(2);
      expect(vaults.some((v) => v.includes('vault1'))).toBe(true);
      expect(vaults.some((v) => v.includes('vault2'))).toBe(true);
      expect(vaults.some((v) => v.includes('not-vault'))).toBe(false);
    });
  });

  describe('getClipboardNotePath', () => {
    it('should return per-entry path with local date and timestamp (no spaces)', () => {
      const vault = new VaultManager(testVaultPath);
      const timestamp = '14:30:25.123';

      const notePath = vault.getClipboardNotePath(timestamp, '2026-07-02');

      expect(notePath).toBe(path.join(testVaultPath, 'Clipboard-2026-07-02_14-30-25-123.md'));
      expect(path.basename(notePath)).not.toContain(' ');
    });
  });
});
// 2026-07-02 22:32:00 依一日多檔新規格改寫測試. By Claude Fable 5 (effort: default), 傳企監看。 end

// 2026-07-02 22:32:00 舊版測試（期待 Inbox/Clipboard-{日期}.md 每日一檔，已不符新規格）整塊註解保留. By Claude Fable 5 (effort: default), 傳企監看。begin
// （舊版全文見 git/備份；重點差異：notePath 期待 path.join(testVaultPath, 'Inbox', `Clipboard-${today}.md`)、
//   appendToClipboardNote(text, image, today, timestamp) 帶 date 參數、圖片連結期待 ![](../attachments/…)。）
// 2026-07-02 22:32:00 舊版測試（期待 Inbox/Clipboard-{日期}.md 每日一檔，已不符新規格）整塊註解保留. By Claude Fable 5 (effort: default), 傳企監看。 end
