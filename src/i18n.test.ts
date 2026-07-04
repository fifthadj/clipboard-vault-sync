/*
  目的：i18n 模組單元測試（locale 解析、t() 取字、插值、字典完整性）
  作者：徐傳企 Mario Hsu（AI 協助：Claude Fable 5）
  沿革：
       2026-07-04  v0.0.0.1  1.誕生日。
*/
// 2026-07-04 17:57:07 i18n 測試. By Claude Fable 5 (effort: default), 傳企監看。begin
import { resolveLocale, setLocale, getLocale, t, getMessages } from './i18n';

describe('i18n', () => {
  afterEach(() => {
    setLocale('en');
  });

  describe('resolveLocale', () => {
    it('should honor explicit en / zh-TW preference regardless of system locale', () => {
      expect(resolveLocale('en', 'zh-TW')).toBe('en');
      expect(resolveLocale('zh-TW', 'en-US')).toBe('zh-TW');
    });

    it('should map auto to zh-TW for Chinese system locales', () => {
      expect(resolveLocale('auto', 'zh-TW')).toBe('zh-TW');
      expect(resolveLocale('auto', 'zh-Hant-TW')).toBe('zh-TW');
      expect(resolveLocale('auto', 'zh-CN')).toBe('zh-TW');
      expect(resolveLocale('auto', 'ZH-TW')).toBe('zh-TW');
    });

    it('should map auto to en for non-Chinese system locales', () => {
      expect(resolveLocale('auto', 'en-US')).toBe('en');
      expect(resolveLocale('auto', 'ja')).toBe('en');
      expect(resolveLocale('auto', '')).toBe('en');
    });

    it('should treat undefined/unknown preference as auto', () => {
      expect(resolveLocale(undefined, 'zh-TW')).toBe('zh-TW');
      expect(resolveLocale('fr', 'en-US')).toBe('en');
    });
  });

  describe('t', () => {
    it('should return the string for the current locale', () => {
      setLocale('en');
      expect(t('notify.savedTitle')).toBe('✅ Saved to Vault');

      setLocale('zh-TW');
      expect(t('notify.savedTitle')).toBe('✅ 已存入 Vault');
    });

    it('should interpolate {params}', () => {
      setLocale('zh-TW');
      expect(t('notify.continuousOffBody', { hotkey: 'Ctrl+Alt+C' })).toContain('Ctrl+Alt+C');

      setLocale('en');
      expect(t('dialog.invalidLocationBody', { path: 'X:\\foo' })).toContain('X:\\foo');
    });

    it('setLocale/getLocale should round-trip', () => {
      setLocale('zh-TW');
      expect(getLocale()).toBe('zh-TW');
    });
  });

  describe('dictionary completeness', () => {
    it('zh-TW should cover every en key with a non-empty string', () => {
      setLocale('en');
      const enKeys = Object.keys(getMessages());
      setLocale('zh-TW');
      const zh = getMessages() as Record<string, string>;

      for (const key of enKeys) {
        expect(typeof zh[key]).toBe('string');
        expect(zh[key].length).toBeGreaterThan(0);
      }
    });
  });
});
// 2026-07-04 17:57:07 i18n 測試. By Claude Fable 5 (effort: default), 傳企監看。 end
