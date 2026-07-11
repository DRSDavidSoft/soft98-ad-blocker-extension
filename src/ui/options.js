(function soft98OptionsUi() {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const STORAGE_KEY = "soft98AdBlockerSettings";
  const DEFAULT_SETTINGS = {
    blockAds: true,
    patchScripts: true,
    pro: true,
    darkDesign: true,
    compactLayout: true,
    linkBadges: true,
    pirateLogo: true,
    taunt: true,
    diagnostics: true,
    recommendExtension: false,
  };
  const LOCALE = preferredLocale();
  const RTL = LOCALE === "fa";
  const STRINGS = {
    en: {
      product: "Soft98 Pro",
      headline: "Precise page control without fragile names.",
      body: "Patch packed Soft98 code, preserve download links, remove ads and noisy blocker-side notices, then optionally turn on Soft98 Pro.",
      scan: "Scan active tab",
      repo: "Repository",
      options: {
        blockAds: ["Block ads", "Remove ad surfaces using source, shape, and link behavior."],
        patchScripts: ["Patch Soft98 code", "Unpack and patch Soft98 anti-adblock code before it runs."],
        pro: ["Soft98 Pro", "Enable the enhanced experience layer."],
        darkDesign: ["Modern dark design", "Apply the modern dark Soft98 Pro theme."],
        linkBadges: ["Download badges", "Mark recovered download links."],
        pirateLogo: ["Pirate logo", "Switch the logo after successful cleanup."],
        taunt: ["Professional challenge", "Show the success note only after the script works."],
        diagnostics: ["Console diagnostics", "Expose useful logs and interactive page APIs."],
      },
    },
    fa: {
      product: "Soft98 Pro",
      headline: "کنترل دقیق صفحه بدون وابستگی به نام‌های شکننده.",
      body: "کد فشرده Soft98 را اصلاح کنید، لینک‌های دانلود را سالم نگه دارید، تبلیغات و اعلان‌های مزاحم را حذف کنید و در صورت نیاز Soft98 Pro را فعال کنید.",
      scan: "بررسی تب فعال",
      repo: "مخزن پروژه",
      options: {
        blockAds: ["حذف تبلیغات", "حذف سطح‌های تبلیغاتی بر اساس منبع، شکل، و رفتار لینک."],
        patchScripts: ["اصلاح کد Soft98", "بازکردن و اصلاح کد ضد‌مسدودسازی پیش از اجرا."],
        pro: ["Soft98 Pro", "فعال‌سازی لایه تجربه پیشرفته."],
        darkDesign: ["طراحی تیره مدرن", "اعمال ظاهر تیره مدرن Soft98 Pro."],
        linkBadges: ["نشان لینک دانلود", "نمایش نشان روی لینک‌های بازیابی‌شده."],
        pirateLogo: ["لوگوی جایگزین", "تغییر لوگو پس از پاک‌سازی موفق."],
        taunt: ["پیام موفقیت حرفه‌ای", "نمایش پیام موفقیت فقط زمانی که ابزار واقعا کار کرده است."],
        diagnostics: ["گزارش کنسول", "نمایش لاگ‌ها و APIهای تعاملی برای بررسی."],
      },
    },
  };
  const OPTIONS = ["blockAds", "patchScripts", "pro", "darkDesign", "linkBadges", "pirateLogo", "taunt", "diagnostics"];

  const root = document.querySelector("[data-app]");
  let settings = { ...DEFAULT_SETTINGS };

  function preferredLocale() {
    const languages = [navigator.language || "", ...(navigator.languages || [])].filter(Boolean);
    let timeZone = "";
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (_error) {}
    return languages.some((language) => /^fa(?:-|$)/i.test(language)) || timeZone === "Asia/Tehran" ? "fa" : "en";
  }

  function text(key) {
    return STRINGS[LOCALE][key] || STRINGS.en[key] || key;
  }

  function storageGet(callback) {
    api.storage.local.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => callback({ ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] }));
  }

  function storageSet(next, callback) {
    api.storage.local.set({ [STORAGE_KEY]: next }, callback);
  }

  function messageActiveTab(message) {
    if (!api.tabs) return;
    api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) api.tabs.sendMessage(tabs[0].id, message, () => void api.runtime.lastError);
    });
  }

  function save(next) {
    settings = { ...DEFAULT_SETTINGS, ...next };
    storageSet(settings, () => messageActiveTab({ type: "soft98:set-settings", settings }));
    render();
  }

  function render() {
    document.documentElement.dir = RTL ? "rtl" : "ltr";
    const options = STRINGS[LOCALE].options || STRINGS.en.options;
    root.innerHTML = `
      <section class="hero">
        <span>${text("product")}</span>
        <h1>${text("headline")}</h1>
        <p>${text("body")}</p>
      </section>
      <section class="grid">
        ${OPTIONS.map((key) => {
          const [title, detail] = options[key] || STRINGS.en.options[key];
          return `
          <label class="option">
            <input type="checkbox" name="${key}" ${settings[key] ? "checked" : ""}>
            <span><strong>${title}</strong><small>${detail}</small></span>
          </label>
        `;
        }).join("")}
      </section>
      <footer>
        <button type="button" data-action="scan">${text("scan")}</button>
        <a href="https://github.com/DRSDavidSoft/soft98-pro" target="_blank" rel="noopener noreferrer">${text("repo")}</a>
      </footer>
    `;
  }

  root.addEventListener("change", (event) => {
    const input = event.target;
    if (!input || input.tagName !== "INPUT") return;
    save({ ...settings, [input.name]: input.checked });
  });

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='scan']");
    if (button) messageActiveTab({ type: "soft98:scan" });
  });

  storageGet((next) => {
    settings = next;
    render();
  });
})();
