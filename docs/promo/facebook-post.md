# Facebook 貼文(2026-07-03,公開)

🚀 又開源了一個小工具:Clipboard Vault Sync

複製即存,永久保留。一個 Windows 系統匣小程式,監看剪貼簿,把你複製的所有東西——文字和圖片——自動存進 Obsidian vault 變成 Markdown 筆記。

和 Obsidian 剪貼簿外掛最大的差別:「不需要開著 Obsidian」。外掛只有在 Obsidian 執行時才能收集;它常駐系統匣整天默默收集,下次打開 vault,筆記已經在那裡了。

✅ 文字+圖片自動收集(圖片轉 AVIF 省空間)
✅ 去重:同樣的內容永遠只存一次,重開機也記得
✅ 可同步到 vault 內任何子資料夾
✅ 100% 本地運作,無網路、無遙測,MIT 開源

---

🚀 I open-sourced another little tool: Clipboard Vault Sync

A Windows system-tray app that watches your clipboard and saves everything you copy — text and images — straight into your Obsidian vault as Markdown notes.

The key difference from Obsidian clipboard plugins: Obsidian doesn't need to be open. It sits in your tray capturing all day, and your notes are just there next time you open the vault.

✅ Text + images (auto-converted to AVIF)
✅ Dedup: same content is never saved twice, even across restarts
✅ Sync to any folder inside your vault
✅ 100% local, no network, no telemetry. MIT licensed.

⬇️ Free download & source code:
https://github.com/fifthadj/clipboard-vault-sync

#Obsidian #開源 #OpenSource #生產力工具

(附圖:docs/screenshot-1.jpg、docs/screenshot-2.jpg)

---

# Facebook v0.1.1 更新貼文(2026-07-04 擬)

📦 Clipboard Vault Sync v0.1.1 更新來了!

上週開源的剪貼簿→Obsidian 小工具,這版把大家最需要的都補上:

🖼️ 圖片轉存修好了——改用內附的 avifenc 轉 AVIF,就算轉檔失敗也會自動退存 PNG,圖片絕不丟失
🔔 存檔提示——每存一筆跳通知;按熱鍵時就算內容重複或剪貼簿是空的也會告訴你,不再猜有沒有存到
🔁 連續收集模式開關——托盤一勾:開=複製就自動存,關=只有按熱鍵才存(想大量收集或謹慎收集都行)
🌐 多語系介面——繁體中文/English,跟隨系統語言,設定裡隨時切換
📉 順便瘦身:安裝檔 88MB → 76MB

⬇️ 下載(免費開源 MIT):
https://github.com/fifthadj/clipboard-vault-sync/releases/tag/v0.1.1

---

📦 Clipboard Vault Sync v0.1.1 is out!

The clipboard→Obsidian tray app I open-sourced last week just got the updates that matter:

🖼️ Image capture actually works now — AVIF via bundled avifenc, with PNG fallback so images are never lost
🔔 Save feedback — a toast confirms every save; the hotkey even tells you when content was a duplicate
🔁 Continuous-capture toggle — on = auto-save every copy, off = hotkey-only
🌐 Multilingual UI — English / 繁體中文, follows your system language
📉 Installer slimmed from 88 MB to 76 MB

⬇️ Free download (MIT):
https://github.com/fifthadj/clipboard-vault-sync/releases/tag/v0.1.1

#Obsidian #開源 #OpenSource #生產力工具
