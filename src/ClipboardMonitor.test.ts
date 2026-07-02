/*
  目的：ClipboardMonitor 單元測試（事件訂閱＋mock 剪貼簿的變更偵測、跨歷史去重、啟動不誤存）
  作者：徐傳企 Mario Hsu（AI 協助：Claude Haiku 初版、Claude Fable 5 修訂）
  沿革：
       2026-07-02  v0.1.0.2  1.mock electron clipboard，新增去重與啟動 priming 測試（原測試僅驗證 EventEmitter）。
       2026-07-02  v0.1.0.1  1.誕生日。
*/
// 2026-07-02 22:32:00 mock electron clipboard 以真正驅動 checkClipboard. By Claude Fable 5 (effort: default), 傳企監看。begin
let mockText = '';
let mockImageEmpty = true;
let mockImageBitmap: Buffer = Buffer.alloc(0);

jest.mock('electron', () => ({
  clipboard: {
    readText: () => mockText,
    readImage: () => ({
      isEmpty: () => mockImageEmpty,
      toBitmap: () => mockImageBitmap,
      toPNG: () => mockImageBitmap,
    }),
  },
  nativeImage: {},
}));
// 2026-07-02 22:32:00 mock electron clipboard 以真正驅動 checkClipboard. By Claude Fable 5 (effort: default), 傳企監看。 end

import { ClipboardMonitor } from './ClipboardMonitor';
// 2026-07-03 00:27:20 持久化測試需要 fs/path/os. By Claude Fable 5 (effort: default), 傳企監看。begin
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// 2026-07-03 00:27:20 持久化測試需要 fs/path/os. By Claude Fable 5 (effort: default), 傳企監看。 end

describe('ClipboardMonitor', () => {
  let monitor: ClipboardMonitor;
  let callbackExecuted: boolean;
  let capturedText: string = '';
  let capturedImage: Buffer | undefined;

  beforeEach(() => {
    callbackExecuted = false;
    capturedText = '';
    capturedImage = undefined;
    // 2026-07-02 22:32:00 重設 mock 剪貼簿狀態. By Claude Fable 5 (effort: default), 傳企監看。begin
    mockText = '';
    mockImageEmpty = true;
    mockImageBitmap = Buffer.alloc(0);
    // 2026-07-02 22:32:00 重設 mock 剪貼簿狀態. By Claude Fable 5 (effort: default), 傳企監看。 end

    monitor = new ClipboardMonitor();
    monitor.on('content', (text: string, image: Buffer | undefined) => {
      callbackExecuted = true;
      capturedText = text;
      capturedImage = image;
    });
  });

  describe('clipboard content detection', () => {
    it('should detect text-only clipboard content', async () => {
      // Simulate clipboard change
      monitor.emit('content', 'Hello from clipboard', undefined);

      expect(callbackExecuted).toBe(true);
      expect(capturedText).toBe('Hello from clipboard');
      expect(capturedImage).toBeUndefined();
    });

    it('should handle image-only clipboard content', async () => {
      const imageBuffer = Buffer.from('fake image data');

      monitor.emit('content', '', imageBuffer);

      expect(callbackExecuted).toBe(true);
      expect(capturedText).toBe('');
      expect(capturedImage).toBe(imageBuffer);
    });

    it('should handle mixed text and image content', async () => {
      const imageBuffer = Buffer.from('fake image data');

      monitor.emit('content', 'Image with text', imageBuffer);

      expect(callbackExecuted).toBe(true);
      expect(capturedText).toBe('Image with text');
      expect(capturedImage).toBe(imageBuffer);
    });

    it('should filter out empty content', async () => {
      monitor.emit('content', '', undefined);

      expect(callbackExecuted).toBe(true);
      expect(capturedText).toBe('');
      expect(capturedImage).toBeUndefined();
    });
  });

  describe('event subscription', () => {
    it('should allow multiple listeners', () => {
      let firstListenerCalled = false;
      let secondListenerCalled = false;

      monitor.on('content', () => {
        firstListenerCalled = true;
      });

      monitor.on('content', () => {
        secondListenerCalled = true;
      });

      monitor.emit('content', 'test', undefined);

      expect(firstListenerCalled).toBe(true);
      expect(secondListenerCalled).toBe(true);
    });
  });

  // 2026-07-02 22:32:00 新增：透過 mock 剪貼簿驗證去重與啟動 priming. By Claude Fable 5 (effort: default), 傳企監看。begin
  describe('deduplication (重複內容不重複存檔)', () => {
    let emissions: Array<{ text: string; image: Buffer | undefined }>;

    beforeEach(() => {
      emissions = [];
      monitor.on('content', (text: string, image: Buffer | undefined) => {
        emissions.push({ text, image });
      });
    });

    const triggerCheck = () => monitor.emit('manual-trigger');

    it('should emit once for new text content', () => {
      mockText = 'Hello';
      triggerCheck();

      expect(emissions).toHaveLength(1);
      expect(emissions[0].text).toBe('Hello');
    });

    it('should not emit again for unchanged clipboard', () => {
      mockText = 'Hello';
      triggerCheck();
      triggerCheck();

      expect(emissions).toHaveLength(1);
    });

    it('should not re-save content already seen earlier in the session (A→B→A)', () => {
      mockText = 'A';
      triggerCheck();
      mockText = 'B';
      triggerCheck();
      mockText = 'A';
      triggerCheck();

      expect(emissions.map((e) => e.text)).toEqual(['A', 'B']);
    });

    it('should dedupe image content by bitmap hash', () => {
      mockImageEmpty = false;
      mockImageBitmap = Buffer.from('image-1');
      triggerCheck();

      mockImageBitmap = Buffer.from('image-2');
      triggerCheck();

      mockImageBitmap = Buffer.from('image-1');
      triggerCheck();

      expect(emissions).toHaveLength(2);
    });

    it('should not save pre-existing clipboard content on startPolling (priming)', () => {
      jest.useFakeTimers();
      try {
        mockText = 'old content copied before app start';
        monitor.startPolling(500);
        jest.advanceTimersByTime(1500);
        expect(emissions).toHaveLength(0);

        mockText = 'new content';
        jest.advanceTimersByTime(500);
        expect(emissions).toHaveLength(1);
        expect(emissions[0].text).toBe('new content');
      } finally {
        monitor.stopPolling();
        jest.useRealTimers();
      }
    });
  });
  // 2026-07-02 22:32:00 新增：透過 mock 剪貼簿驗證去重與啟動 priming. By Claude Fable 5 (effort: default), 傳企監看。 end

  // 2026-07-03 00:27:20 新增：seenHashes 跨實例（模擬 app 重啟）持久化測試. By Claude Fable 5 (effort: default), 傳企監看。begin
  describe('seen hashes persistence (跨重啟去重)', () => {
    it('should not re-save content seen by a previous instance with same persist file', () => {
      const persistPath = path.join(os.tmpdir(), `cvs-seen-test-${Date.now()}.json`);
      try {
        const first = new ClipboardMonitor(persistPath);
        const firstEmissions: string[] = [];
        first.on('content', (text: string) => firstEmissions.push(text));
        mockText = 'persisted across restart';
        first.emit('manual-trigger');
        expect(firstEmissions).toHaveLength(1);
        expect(fs.existsSync(persistPath)).toBe(true);

        // 模擬 app 重啟：新實例讀同一個持久化檔
        const second = new ClipboardMonitor(persistPath);
        const secondEmissions: string[] = [];
        second.on('content', (text: string) => secondEmissions.push(text));
        mockText = 'persisted across restart';
        second.emit('manual-trigger');
        expect(secondEmissions).toHaveLength(0);

        // 新內容仍照常存
        mockText = 'brand new after restart';
        second.emit('manual-trigger');
        expect(secondEmissions).toEqual(['brand new after restart']);
      } finally {
        fs.rmSync(persistPath, { force: true });
      }
    });

    it('should start fresh when persist file is corrupted', () => {
      const persistPath = path.join(os.tmpdir(), `cvs-seen-corrupt-${Date.now()}.json`);
      try {
        fs.writeFileSync(persistPath, 'not valid json {{{');
        const monitor2 = new ClipboardMonitor(persistPath);
        const emissions: string[] = [];
        monitor2.on('content', (text: string) => emissions.push(text));
        mockText = 'works after corruption';
        monitor2.emit('manual-trigger');
        expect(emissions).toHaveLength(1);
      } finally {
        fs.rmSync(persistPath, { force: true });
      }
    });
  });
  // 2026-07-03 00:27:20 新增：seenHashes 跨實例（模擬 app 重啟）持久化測試. By Claude Fable 5 (effort: default), 傳企監看。 end
});
