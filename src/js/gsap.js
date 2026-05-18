// スクロールトップボタンのスムーズスクロール
const scrollToTopBtn = document.querySelector(".returntotop");
scrollToTopBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
         コンテナ1のアニメーション（画面固定・下からスライド）
      ========================================================= */
const items1 = gsap.utils.toArray(".pin-container .item");
gsap.set(items1.slice(1), { yPercent: 100 }); // 2枚目以降を下に配置

const tl1 = gsap.timeline({
  scrollTrigger: {
    trigger: ".pin-container",
    start: "top top",
    end: "+=6000",
    pin: true,
    pinSpacing: true,
    scrub: 1,
  },
});

items1.forEach((item, i) => {
  const content = item.querySelector(".js-scroll-text");
  if (i === 0) {
    tl1.to(content, { autoAlpha: 1, duration: 1 }).to({}, { duration: 0.5 }); // 表示キープ時間を短くする（元は1）
  } else {
    // つ前のテキスト要素を取得
    const prevContent = items1[i - 1].querySelector(".js-scroll-text");

    tl1
      // 前のテキストをフェードアウトさせる（"<" で次のスライドインと同時に開始）
      .to(prevContent, { autoAlpha: 0, duration: 0.5 })
      .to(item, { yPercent: 0, ease: "none", duration: 1 }, "<")
      .to(content, { autoAlpha: 1, duration: 1 })
      .to({}, { duration: 0.5 }); // 表示キープ時間を短くする（元は1）
  }
});

/* =========================================================
         コンテナ2のアニメーション（画面固定・フェードで切り替え）
      ========================================================= */

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: ".pin-container2",
    start: "top top",
    end: "+=4000", // スクロール量（アイテム数に合わせて調整）
    pin: true,
    pinSpacing: true,
    scrub: 1,
  },
});

tl2
  .to("#text5", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to({}, { duration: 0.5 }) // 表示をキープ
  .to("#text5", {
    autoAlpha: 0, // opacity: 0, visibility: hidden になる
    y: -40, // さらに上にスライドしながら消える
    duration: 1,
  })
  .to("#text6", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to({}, { duration: 0.5 }) // 表示をキープ
  .to("#text6", {
    autoAlpha: 0.3, // opacity: 0, visibility: hidden になる
    duration: 1,
  })
  .to("#text7", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to({}, { duration: 0.5 });

/* =========================================================
         コンテナ3のアニメーション（画面固定・フェードで切り替え）
      ========================================================= */
const videoOperate = () => {
  const video9 = document.querySelector("#video9");

  return gsap.to(video9, {});
};

const tl3 = gsap.timeline({
  scrollTrigger: {
    trigger: ".pin-container3",
    start: "top top",
    end: "+=4000", // スクロール量（アイテム数に合わせて調整）
    pin: true,
    pinSpacing: true,
    scrub: 1,
  },
});

tl3
  .to("#text8", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
    onStart: function () {
      const video = document.querySelector("#video9");
      gsap.killTweensOf(video);
      video.currentTime = 0;
      gsap.set(video, { x: 0 });

      gsap.to(video, {
        x: "30vw",
        duration: 5,
        ease: "none",
        zIndex: 0,
        onStart: function () {
          video.play();
        },
        onComplete: function () {
          video.pause();
        },
      });
    },
  })
  .to("#text10", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to("#text10", {
    autoAlpha: 0, // opacity: 0, visibility: hidden になる
    y: -40, // さらに上にスライドしながら消える
    duration: 1,
  })
  .to("#text11", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to("#text11", {
    autoAlpha: 0, // opacity: 0, visibility: hidden になる
    y: -40, // さらに上にスライドしながら消える
    duration: 1,
  })
  .to("#text12", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to("#text12", {
    autoAlpha: 0, // opacity: 0, visibility: hidden になる
    y: -40, // さらに上にスライドしながら消える
    duration: 1,
  })
  .to("#text13", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to("#text13", {
    autoAlpha: 0, // opacity: 0, visibility: hidden になる
    y: -40, // さらに上にスライドしながら消える
    duration: 1,
  })
  .to("#pin3img8", {
    autoAlpha: 0, // opacity: 1, visibility: visible になる
    duration: 1,
  })
  .to("#text14", {
    autoAlpha: 1, // opacity: 1, visibility: visible になる
    y: -20, // 少し上にスライドしながら出現
    duration: 1,
  })
  .to({}, { duration: 0.5 });

/* =========================================================
   コンテナ4のアニメーション（画像だけ固定・テキストはスクロール）
========================================================= */
ScrollTrigger.create({
  trigger: ".pin-container4",
  start: "top top",
  end: "bottom bottom",
  pin: ".bg-wrapper",
  pinSpacing: false,
});

/* =========================================================
   コンテナ4のテキスト表示アニメーション（ふわっと表示）
========================================================= */
// .text-wrapper4 の直下にある要素（h3やp）をすべて取得
const textElements = gsap.utils.toArray(".text-wrapper4 > *");

textElements.forEach((el) => {
  gsap.fromTo(
    el,
    {
      autoAlpha: 0, // 初期状態：透明度0、非表示
      y: 30, // 初期状態：本来の位置より30px下に配置
    },
    {
      autoAlpha: 1, // アニメーション後：透明度1、表示
      y: 0, // アニメーション後：本来の位置へ
      duration: 2, // 2秒かけてアニメーション
      ease: "power2.out", // フワッとした自然な減速のイージング
      scrollTrigger: {
        trigger: el,
        start: "top 30%", // 対象要素の上端(top)が、画面の中央(center)と交差した時に発火
        toggleActions: "play none none reverse",
      },
    },
  );
});
