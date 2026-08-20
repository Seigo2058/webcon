/**
 * 日本語 / 英語の切り替え（Vanilla JS）
 *
 * 翻訳データは src/locales/<lang>.json を fetch で非同期に取得する。
 * ページ本体は日本語で書かれているため、日本語のままなら通信は発生しない。
 *
 * 対応する属性:
 *   data-i18n="key"                    textContent を差し替える
 *   data-i18n-html="key"               innerHTML を差し替える（<br> を含む文用）
 *   data-i18n-text="key"               dataset.text を差し替える（p5の見出し用）
 *   data-i18n-attr="alt:key;title:key" 任意の属性を差し替える
 */

export const SUPPORTED_LANGS = ["ja", "en"];

// ページのHTMLが元々書かれている言語。ここへ戻す時は取得不要
const SOURCE_LANG = "ja";
const STORAGE_KEY = "webcon.lang";
const FETCH_TIMEOUT = 8000;

const localeUrl = (lang) =>
  new URL(`../locales/${lang}.json`, import.meta.url).href;

/** 取得済みの辞書。言語ごとに一度だけ取得する */
const cache = new Map();
/** 取得中のPromise。同じ言語を並行して取りに行かないようにする */
const inflight = new Map();

let currentLang = SOURCE_LANG;
/** 切り替え要求の通し番号。古い応答を捨てるために使う */
let requestSeq = 0;

/* ------------------------------------------------------------------ *
 * 取得
 * ------------------------------------------------------------------ */

async function fetchLocale(lang) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(localeUrl(lang), {
      signal: controller.signal,
      credentials: "same-origin",
    });
    if (!res.ok) {
      throw new Error(
        `翻訳ファイルを取得できませんでした (HTTP ${res.status})`,
      );
    }
    const dict = await res.json();
    if (!dict || typeof dict !== "object") {
      throw new Error("翻訳ファイルの形式が不正です");
    }
    return dict;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`翻訳ファイルの取得がタイムアウトしました (${lang})`, {
        cause: err,
      });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 辞書を取得する。取得済みなら再利用し、取得中なら同じPromiseを共有する。
 * 失敗した場合はキャッシュに残さないので、次の呼び出しで再試行できる。
 */
export function loadLocale(lang) {
  if (cache.has(lang)) return Promise.resolve(cache.get(lang));
  if (inflight.has(lang)) return inflight.get(lang);

  const task = fetchLocale(lang)
    .then((dict) => {
      cache.set(lang, dict);
      return dict;
    })
    .finally(() => {
      inflight.delete(lang);
    });

  inflight.set(lang, task);
  return task;
}

/* ------------------------------------------------------------------ *
 * 適用
 * ------------------------------------------------------------------ */

/**
 * 任意の要素（DOMから切り離したものでも可）に翻訳を適用する。
 * JSから組み立て直す部分を、本文と同じ仕組みで翻訳するために使う。
 */
export function translate(root, dict) {
  if (!root || !dict) return;
  applyDictionary(dict, root);
}

/** root 自身と子孫の両方から対象を集める */
function scope(root, selector) {
  const found = [...root.querySelectorAll(selector)];
  if (root.matches?.(selector)) found.unshift(root);
  return found;
}

function applyDictionary(dict, root = document) {
  scope(root, "[data-i18n]").forEach((el) => {
    const value = dict[el.dataset.i18n];
    if (typeof value === "string") el.textContent = value;
  });

  // 翻訳ファイルは同一オリジンの静的ファイルのみを読み込む前提
  scope(root, "[data-i18n-html]").forEach((el) => {
    const value = dict[el.dataset.i18nHtml];
    if (typeof value === "string") el.innerHTML = value;
  });

  // p5で描画している見出し。bg-p5.js が毎フレーム dataset.text を読み直す
  scope(root, "[data-i18n-text]").forEach((el) => {
    const value = dict[el.dataset.i18nText];
    if (typeof value === "string") el.dataset.text = value;
  });

  scope(root, "[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const sep = pair.indexOf(":");
      if (sep < 0) return;
      const attr = pair.slice(0, sep).trim();
      const value = dict[pair.slice(sep + 1).trim()];
      if (attr && typeof value === "string") el.setAttribute(attr, value);
    });
  });
}

/* ------------------------------------------------------------------ *
 * 公開API
 * ------------------------------------------------------------------ */

export const getLanguage = () => currentLang;

/** 保存済みの設定 → ブラウザの言語 → 日本語 の順に決める */
export function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch {
    // プライベートモード等で localStorage が使えない場合は無視する
  }

  const prefs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || ""];
  const hit = prefs
    .map((tag) => String(tag).toLowerCase().split("-")[0])
    .find((tag) => SUPPORTED_LANGS.includes(tag));

  return hit || SOURCE_LANG;
}

/**
 * 表示言語を切り替える。
 *
 * 連打された場合は最後の要求だけが反映される（古い応答は破棄する）。
 * 取得に失敗した場合は表示を変えずに例外を投げる。
 */
export async function setLanguage(lang, { persist = true } = {}) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    throw new Error(`未対応の言語です: ${lang}`);
  }

  const seq = ++requestSeq;
  document.documentElement.dataset.i18nStatus = "loading";
  document.dispatchEvent(new CustomEvent("i18n:loading", { detail: { lang } }));

  try {
    // 未翻訳のキーは日本語で表示されるよう、原文の辞書も一緒に読む
    const [dict, base] = await Promise.all([
      loadLocale(lang),
      lang === SOURCE_LANG ? null : loadLocale(SOURCE_LANG).catch(() => null),
    ]);

    // この要求より後に別の切り替えが始まっていたら、結果を捨てる
    if (seq !== requestSeq) return currentLang;

    const merged = base ? { ...base, ...dict } : dict;
    applyDictionary(merged);
    document.documentElement.lang = lang;
    currentLang = lang;

    try {
      if (persist) localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // 保存できなくても表示は切り替わっているので続行する
    }

    document.dispatchEvent(
      new CustomEvent("i18n:change", { detail: { lang, dict: merged } }),
    );
    return lang;
  } catch (err) {
    if (seq === requestSeq) {
      document.dispatchEvent(
        new CustomEvent("i18n:error", { detail: { lang, error: err } }),
      );
    }
    throw err;
  } finally {
    if (seq === requestSeq) delete document.documentElement.dataset.i18nStatus;
  }
}

/**
 * 起動時の初期化。
 * 日本語ならHTMLの内容がそのまま使えるので、通信せずに終わる。
 */
export async function initLanguage() {
  const lang = detectLanguage();

  if (lang === SOURCE_LANG) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.dispatchEvent(
      new CustomEvent("i18n:change", { detail: { lang, dict: null } }),
    );
    return lang;
  }

  try {
    return await setLanguage(lang, { persist: false });
  } catch {
    // 取得できなければ日本語のまま表示する
    return SOURCE_LANG;
  }
}

/** 言語切り替えボタンを動作させる */
export function mountLanguageSwitch(selector = ".lang-switch") {
  const root = document.querySelector(selector);
  if (!root) return;

  const buttons = [...root.querySelectorAll("[data-lang]")];

  const syncButtons = (lang, busy = false) => {
    buttons.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      btn.disabled = busy;
    });
    root.classList.toggle("is-loading", busy);
  };

  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-lang]");
    if (!btn || btn.dataset.lang === getLanguage()) return;

    const lang = btn.dataset.lang;
    syncButtons(lang, true);
    try {
      await setLanguage(lang);
    } catch {
      syncButtons(getLanguage(), false); // 失敗したので元の言語へ戻す
      return;
    }
    syncButtons(getLanguage(), false);
  });

  document.addEventListener("i18n:change", (e) =>
    syncButtons(e.detail.lang, false),
  );

  syncButtons(getLanguage(), false);
}
