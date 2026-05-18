// スクロールリセット
// history.scrollRestoration = "manual";
// window.addEventListener("beforeunload", function () {
//   window.scrollTo(0, 0);
// });

// fade-script.js
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger-fade");
  const nav = document.querySelector(".nav-fade");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");

    const isOpen = hamburger.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isOpen);
    nav.setAttribute("aria-hidden", !isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
});

const windowWidth = window.innerWidth;
console.log("Window width:", windowWidth);

// すべての説明要素（.desc-item）を非表示にする共通関数
function hideAllDescriptions() {
  const allDescs = document.querySelectorAll(".desc-item");
  allDescs.forEach((desc) => {
    desc.classList.remove("bento-is-show");
  });
}

// ==========================================
// item1（地域個体群）のクリックイベント
// ==========================================
const item1 = document.querySelector(".item-1");
const kotaigun = document.querySelector(".kotaigun");

item1.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する（クリックして非表示）
  if (kotaigun.classList.contains("bento-is-show")) {
    kotaigun.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item1Rect = item1.getBoundingClientRect();
  kotaigun.style.left = `${item1Rect.right + 24}px`;
  kotaigun.style.top = `${item1Rect.top}px`;

  kotaigun.classList.add("bento-is-show");
});

// ==========================================
// item2（季節の食べ物）のクリックイベント
// ==========================================
const item2 = document.querySelector(".item-2");
const kisetsunotabemono = document.querySelector(".kisetsunotabemono");

item2.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する（クリックして非表示）
  if (kisetsunotabemono.classList.contains("bento-is-show")) {
    kisetsunotabemono.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item2Rect = item2.getBoundingClientRect();
  kisetsunotabemono.style.right = `${windowWidth - item2Rect.left + 24}px`;
  kisetsunotabemono.style.top = `${item2Rect.top}px`;

  kisetsunotabemono.classList.add("bento-is-show");
});

// ==========================================
// item3（体重）のクリックイベント
// ==========================================
const item3 = document.querySelector(".item-3");
const taijuu = document.querySelector(".taijuu");

item3.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (taijuu.classList.contains("bento-is-show")) {
    taijuu.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item3Rect = item3.getBoundingClientRect();
  taijuu.style.left = `${item3Rect.right + 24}px`;
  taijuu.style.bottom = `5%`;

  taijuu.classList.add("bento-is-show");
});

// ==========================================
// item4（身長）のクリックイベント
// ==========================================
const item4 = document.querySelector(".item-4");
const shincho = document.querySelector(".shincho");

item4.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (shincho.classList.contains("bento-is-show")) {
    shincho.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item4Rect = item4.getBoundingClientRect();
  shincho.style.right = `${windowWidth - item4Rect.left + 24}px`;
  shincho.style.bottom = `5%`;

  shincho.classList.add("bento-is-show");
});

// ==========================================
// item5（行動範囲）のクリックイベント
// ==========================================
const item5 = document.querySelector(".item-5");
const koudohani = document.querySelector(".koudohani");

item5.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (koudohani.classList.contains("bento-is-show")) {
    koudohani.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item5Rect = item5.getBoundingClientRect();
  koudohani.style.right = `${windowWidth - item5Rect.left + 24}px`;
  koudohani.style.bottom = `5%`;

  koudohani.classList.add("bento-is-show");
});

// ==========================================
// item6（1日の行動）のクリックイベント
// ==========================================
const item6 = document.querySelector(".item-6");
const ichinichinokodo = document.querySelector(".ichinichinokodo");

item6.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (ichinichinokodo.classList.contains("bento-is-show")) {
    ichinichinokodo.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item6Rect = item6.getBoundingClientRect();
  ichinichinokodo.style.left = `${item6Rect.right + 24}px`;
  ichinichinokodo.style.bottom = `5%`;

  ichinichinokodo.classList.add("bento-is-show");
});

// ==========================================
// item7（個体数）のクリックイベント
// ==========================================
const item7 = document.querySelector(".item-7");
const kotaisu = document.querySelector(".kotaisu");

item7.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (kotaisu.classList.contains("bento-is-show")) {
    kotaisu.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item7Rect = item7.getBoundingClientRect();
  kotaisu.style.left = `${item7Rect.right + 24}px`;
  kotaisu.style.bottom = `5%`;

  kotaisu.classList.add("bento-is-show");
});

// ==========================================
// item8（個体数）のクリックイベント
// ==========================================
const item8 = document.querySelector(".item-8");
const kalorie = document.querySelector(".kalorie");

item8.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (kalorie.classList.contains("bento-is-show")) {
    kalorie.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item8Rect = item8.getBoundingClientRect();
  kalorie.style.right = `${windowWidth - item8Rect.left + 24}px`;
  kalorie.style.bottom = `5%`;

  kalorie.classList.add("bento-is-show");
});

// ==========================================
// item9（季節別行動）のクリックイベント
// ==========================================
const item9 = document.querySelector(".item-9");
const kisetsubetsukodo = document.querySelector(".kisetsubetsukodo");

item9.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (kisetsubetsukodo.classList.contains("bento-is-show")) {
    kisetsubetsukodo.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item9Rect = item9.getBoundingClientRect();
  kisetsubetsukodo.style.right = `${windowWidth - item9Rect.left + 24}px`;
  kisetsubetsukodo.style.bottom = `5%`;

  kisetsubetsukodo.classList.add("bento-is-show");
});

// ==========================================
// item10（五感）のクリックイベント
// ==========================================
const item10 = document.querySelector(".item-10");
const gokan = document.querySelector(".gokan");

item10.addEventListener("click", () => {
  // すでに表示されている場合は、非表示にして処理を終了する
  if (gokan.classList.contains("bento-is-show")) {
    gokan.classList.remove("bento-is-show");
    return;
  }

  // 他のすべての説明要素を非表示にする
  hideAllDescriptions();

  // 位置の計算と表示
  const item10Rect = item10.getBoundingClientRect();
  gokan.style.right = `${windowWidth - item10Rect.left + 24}px`;
  gokan.style.bottom = `5%`;

  gokan.classList.add("bento-is-show");
});
