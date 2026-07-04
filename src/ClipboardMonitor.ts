/*
  目的：輪詢系統剪貼簿，偵測新內容並發出 content 事件；同 session 內重複內容只存一次
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-04  v0.1.0.3  1.新增 checkNow()：回傳 'new'|'duplicate'|'empty'，供熱鍵觸發後顯示存檔結果通知。2.checkClipboard 內部改回傳狀態。
       2026-07-02  v0.1.0.2  1.跨歷史去重（seenHashes），重複內容不重複存檔。2.startPolling 先記錄當前剪貼簿，啟動時不誤存舊內容。3.圖片 hash 改用 toBitmap+sha1，取代整張 toDataURL。
       2026-07-02  v0.1.0.1  1.誕生日。
*/
import { EventEmitter } from 'events';
import { clipboard, nativeImage } from 'electron';
// 2026-07-02 22:32:00 去重與 hash 需要 crypto. By Claude Fable 5 (effort: default), 傳企監看。begin
import { createHash } from 'crypto';
// 2026-07-02 22:32:00 去重與 hash 需要 crypto. By Claude Fable 5 (effort: default), 傳企監看。 end
// 2026-07-03 00:27:20 seenHashes 持久化需要 fs. By Claude Fable 5 (effort: default), 傳企監看。begin
import * as fs from 'fs';
// 2026-07-03 00:27:20 seenHashes 持久化需要 fs. By Claude Fable 5 (effort: default), 傳企監看。 end

export class ClipboardMonitor extends EventEmitter {
  private lastHash: string = '';
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollingEnabled: boolean = false;
  // 2026-07-02 22:32:00 跨歷史去重：記錄本 session 已存過的內容 hash，上限 5000 筆（FIFO 淘汰）. By Claude Fable 5 (effort: default), 傳企監看。begin
  private seenHashes: Set<string> = new Set();
  private static readonly SEEN_HASHES_MAX = 5000;
  // 2026-07-02 22:32:00 跨歷史去重：記錄本 session 已存過的內容 hash，上限 5000 筆（FIFO 淘汰）. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-03 00:27:20 seenHashes 持久化：指定檔案路徑則啟動載入、新增時寫回，去重跨 app 重啟有效. By Claude Fable 5 (effort: default), 傳企監看。begin
  private persistPath: string | null = null;

  // 2026-07-03 00:27:20 舊版建構子. By Claude Fable 5 (effort: default), 傳企監看。begin
  // constructor() {
  //   super();
  //   // Handle manual trigger from hotkey
  //   this.on('manual-trigger', () => {
  //     this.checkClipboard();
  //   });
  // }
  // 2026-07-03 00:27:20 舊版建構子. By Claude Fable 5 (effort: default), 傳企監看。 end
  constructor(persistPath?: string) {
    super();
    this.persistPath = persistPath ?? null;
    this.loadSeenHashes();
    // Handle manual trigger from hotkey
    this.on('manual-trigger', () => {
      this.checkClipboard();
    });
  }

  private loadSeenHashes(): void {
    if (!this.persistPath || !fs.existsSync(this.persistPath)) {
      return;
    }
    try {
      const data = JSON.parse(fs.readFileSync(this.persistPath, 'utf-8'));
      if (Array.isArray(data)) {
        this.seenHashes = new Set(
          data.filter((h) => typeof h === 'string').slice(-ClipboardMonitor.SEEN_HASHES_MAX)
        );
      }
    } catch (error) {
      console.error('Failed to load seen hashes, starting fresh:', error);
      this.seenHashes = new Set();
    }
  }

  private saveSeenHashes(): void {
    if (!this.persistPath) {
      return;
    }
    try {
      fs.writeFileSync(this.persistPath, JSON.stringify([...this.seenHashes]));
    } catch (error) {
      console.error('Failed to save seen hashes:', error);
    }
  }
  // 2026-07-03 00:27:20 seenHashes 持久化：指定檔案路徑則啟動載入、新增時寫回，去重跨 app 重啟有效. By Claude Fable 5 (effort: default), 傳企監看。 end

  startPolling(intervalMs: number = 500): void {
    if (this.pollingEnabled) {
      return;
    }

    this.pollingEnabled = true;

    // 2026-07-02 22:32:00 先記錄啟動當下的剪貼簿內容（不發事件），避免把開 app 前複製的舊內容存進 vault. By Claude Fable 5 (effort: default), 傳企監看。begin
    this.checkClipboard(false);
    // 2026-07-02 22:32:00 先記錄啟動當下的剪貼簿內容（不發事件），避免把開 app 前複製的舊內容存進 vault. By Claude Fable 5 (effort: default), 傳企監看。 end

    this.pollingInterval = setInterval(() => {
      this.checkClipboard();
    }, intervalMs);
  }

  stopPolling(): void {
    this.pollingEnabled = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // 2026-07-02 22:32:00 舊版：只比對上一筆、圖片用整張 toDataURL 當 hash. By Claude Fable 5 (effort: default), 傳企監看。begin
  // private checkClipboard(): void {
  //   const text = clipboard.readText();
  //   const image = clipboard.readImage();
  //
  //   // Generate hash to detect changes
  //   const imageHash = image.isEmpty() ? '' : image.toDataURL();
  //   const currentHash = `${text}|${imageHash}`;
  //
  //   if (currentHash === this.lastHash) {
  //     return;
  //   }
  //
  //   this.lastHash = currentHash;
  //
  //   const imageBuffer = image.isEmpty() ? undefined : this.nativeImageToBuffer(image);
  //   this.emit('content', text, imageBuffer);
  // }
  // 2026-07-02 22:32:00 舊版：只比對上一筆、圖片用整張 toDataURL 當 hash. By Claude Fable 5 (effort: default), 傳企監看。 end
  // 2026-07-04 17:25:07 checkNow：熱鍵用的公開入口，回傳檢查結果供通知（'new' 會接著發 content 事件觸發存檔）. By Claude Fable 5 (effort: default), 傳企監看。begin
  checkNow(): 'new' | 'duplicate' | 'empty' {
    return this.checkClipboard();
  }
  // 2026-07-04 17:25:07 checkNow：熱鍵用的公開入口，回傳檢查結果供通知（'new' 會接著發 content 事件觸發存檔）. By Claude Fable 5 (effort: default), 傳企監看。 end

  // 2026-07-02 22:32:00 新版：sha1 hash（圖片走 toBitmap 較省 CPU）＋ seenHashes 跨歷史去重；emitContent=false 只記錄不發事件. By Claude Fable 5 (effort: default), 傳企監看。begin
  // 2026-07-04 17:25:07 改回傳狀態（'new'|'duplicate'|'empty'）供 checkNow 通知；空剪貼簿提前判定. By Claude Fable 5 (effort: default), 傳企監看。begin
  private checkClipboard(emitContent: boolean = true): 'new' | 'duplicate' | 'empty' {
    const text = clipboard.readText();
    const image = clipboard.readImage();

    // 空剪貼簿：無文字也無圖片
    if (!text.trim() && image.isEmpty()) {
      return 'empty';
    }
  // 2026-07-04 17:25:07 改回傳狀態（'new'|'duplicate'|'empty'）供 checkNow 通知；空剪貼簿提前判定. By Claude Fable 5 (effort: default), 傳企監看。 end

    const hash = createHash('sha1');
    hash.update(text);
    hash.update('|');
    if (!image.isEmpty()) {
      hash.update(image.toBitmap());
    }
    const currentHash = hash.digest('hex');

    // 與上一筆相同：剪貼簿沒變，直接略過
    if (currentHash === this.lastHash) {
      // 2026-07-04 17:25:07 回傳 duplicate. By Claude Fable 5 (effort: default), 傳企監看。begin
      return 'duplicate';
      // 2026-07-04 17:25:07 回傳 duplicate. By Claude Fable 5 (effort: default), 傳企監看。 end
    }
    this.lastHash = currentHash;

    // 本 session 已存過相同內容：不重複存檔
    if (this.seenHashes.has(currentHash)) {
      // 2026-07-04 17:25:07 回傳 duplicate. By Claude Fable 5 (effort: default), 傳企監看。begin
      return 'duplicate';
      // 2026-07-04 17:25:07 回傳 duplicate. By Claude Fable 5 (effort: default), 傳企監看。 end
    }
    this.seenHashes.add(currentHash);
    if (this.seenHashes.size > ClipboardMonitor.SEEN_HASHES_MAX) {
      const oldest = this.seenHashes.values().next().value;
      if (oldest !== undefined) {
        this.seenHashes.delete(oldest);
      }
    }
    // 2026-07-03 00:27:20 新 hash 進集合即寫回磁碟（人工複製頻率低，同步寫入成本可忽略）. By Claude Fable 5 (effort: default), 傳企監看。begin
    this.saveSeenHashes();
    // 2026-07-03 00:27:20 新 hash 進集合即寫回磁碟（人工複製頻率低，同步寫入成本可忽略）. By Claude Fable 5 (effort: default), 傳企監看。 end

    if (!emitContent) {
      // 2026-07-04 17:25:07 只記錄不發事件路徑也回傳 new. By Claude Fable 5 (effort: default), 傳企監看。begin
      return 'new';
      // 2026-07-04 17:25:07 只記錄不發事件路徑也回傳 new. By Claude Fable 5 (effort: default), 傳企監看。 end
    }

    const imageBuffer = image.isEmpty() ? undefined : this.nativeImageToBuffer(image);
    this.emit('content', text, imageBuffer);
    // 2026-07-04 17:25:07 回傳 new. By Claude Fable 5 (effort: default), 傳企監看。begin
    return 'new';
    // 2026-07-04 17:25:07 回傳 new. By Claude Fable 5 (effort: default), 傳企監看。 end
  }
  // 2026-07-02 22:32:00 新版：sha1 hash（圖片走 toBitmap 較省 CPU）＋ seenHashes 跨歷史去重；emitContent=false 只記錄不發事件. By Claude Fable 5 (effort: default), 傳企監看。 end

  private nativeImageToBuffer(image: any): Buffer {
    // Convert Electron NativeImage to Buffer
    // For now, we'll use a simple approach that preserves the image data
    return image.toPNG();
  }
}
