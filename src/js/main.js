// スクロールリセット
history.scrollRestoration = "manual";
window.addEventListener("beforeunload", function () {
  window.scrollTo(0, 0);
});

// ローディング画面と動画の制御
document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const introVideoScreen = document.getElementById("intro-video-screen");
  const introVideo = document.getElementById("intro-video");
  const body = document.body;

  // 要素が欠けていてもスクロールロックだけは必ず外す（ページが操作不能になるのを防ぐ）
  if (!loadingScreen || !introVideoScreen || !introVideo) {
    body.classList.remove("no-scroll");
    return;
  }

  // ローディング動画の最低表示時間
  const minLoadingTime = 3000;
  // loadイベントを待つ上限。外部CDN（Adobe Fonts / p5.js など）が
  // 遅い・落ちている場合でも、ここで必ず先へ進める
  const maxLoadingTime = 6000;
  // メイン動画が「再生できる状態」になるのを待つ上限（ページ表示からの絶対値）。
  // ここを過ぎたらメイン動画は諦めて本編へ進む
  const maxIntroReadyTime = 9000;
  // 再生が始まった後、映像が進まなくなった場合に見切りをつけるまでの時間
  const introStallTime = 4000;
  // 万一 ended が飛んでこない場合の最終保険
  const maxIntroPlayTime = 20000;

  const startTime = Date.now();
  const elapsed = () => Date.now() - startTime;

  let loadingFinished = false;
  let introFinished = false;
  let siteRevealed = false;

  let introTimer = null;
  let introTimerMs = null;
  let stallWatcher = null;

  // オーバーレイを全て外して本編を見せる（何度呼ばれても安全）
  const revealSite = () => {
    if (siteRevealed) return;
    siteRevealed = true;

    clearTimeout(introTimer);
    clearInterval(stallWatcher);

    loadingScreen.classList.add("is-hidden");
    introVideoScreen.classList.add("is-hidden");

    // スクロール禁止を解除し、下部のコンテンツへ移動可能にする
    body.classList.remove("no-scroll");
  };

  // メイン動画の再生が終了した時（またはこれ以上待てない時）
  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;

    // ローディング表示中に動画のエラーが判明した場合は、すぐに本編を出さず
    // 最低表示時間まで待つ（finishLoading が必ず呼ばれるので固まることはない）
    if (loadingFinished) revealSite();
  };

  introVideo.addEventListener("ended", finishIntro);
  introVideo.addEventListener("error", finishIntro);

  // タブが非表示の間、ブラウザは動画の読み込みも再生も止めてしまう。
  // その間タイマーを進めると「戻ってきたら既に終わっていた」ことになるので、
  // 表示されている間だけ待ち時間を数える
  const armIntroTimer = (ms) => {
    clearTimeout(introTimer);
    introTimerMs = ms;
    if (document.hidden) return; // 表示された時に張り直す
    introTimer = setTimeout(finishIntro, ms);
  };

  document.addEventListener("visibilitychange", () => {
    if (introFinished || introTimerMs === null) return;

    if (document.hidden) {
      clearTimeout(introTimer);
      return;
    }

    // 戻ってきたら読み込み・再生を仕切り直して、待ち時間も測り直す
    if (introVideo.paused) {
      const p = introVideo.play();
      if (p) p.catch(finishIntro);
    }
    armIntroTimer(introTimerMs);
  });

  // 再生は始まったのに映像が進まない（バッファ切れ・デコード失敗）場合の監視。
  // 非表示タブではsetIntervalが間引かれるため、経過時間は実時間で測る
  const watchForStall = () => {
    let lastTime = introVideo.currentTime;
    let lastProgressAt = Date.now();

    clearInterval(stallWatcher);
    stallWatcher = setInterval(() => {
      if (introFinished) return;

      // 非表示中は止まって当然なので数えない
      if (document.hidden || introVideo.currentTime > lastTime) {
        lastTime = introVideo.currentTime;
        lastProgressAt = Date.now();
        return;
      }

      if (Date.now() - lastProgressAt >= introStallTime) finishIntro();
    }, 500);
  };

  // メイン動画を表示して再生する
  const showIntro = () => {
    if (introFinished || siteRevealed) return;

    introVideoScreen.classList.remove("is-hidden");
    loadingScreen.classList.add("is-hidden");

    // 実尺が分かっていればそれを基準に、分からなければ固定値で打ち切る
    const remaining = Number.isFinite(introVideo.duration)
      ? (introVideo.duration - introVideo.currentTime) * 1000 + 3000
      : maxIntroPlayTime;
    armIntroTimer(remaining);

    // 自動再生がブロックされた場合はPromiseがrejectされる
    const playPromise = introVideo.play();
    if (playPromise) playPromise.catch(finishIntro);

    watchForStall();
  };

  // メイン動画が「再生できる状態」になるまではローディング画面を出したままにする。
  // 読み込めていないまま切り替えると、真っ黒な画面だけが残ってしまう
  const startIntro = () => {
    // HAVE_FUTURE_DATA 以上なら、切り替えた瞬間から映像が出る
    if (introVideo.readyState >= 3) {
      showIntro();
      return;
    }

    const budget = maxIntroReadyTime - elapsed();
    if (budget <= 0) {
      finishIntro(); // 間に合わないのでメイン動画は飛ばす
      return;
    }

    introVideo.addEventListener("canplay", showIntro, { once: true });
    armIntroTimer(budget);

    // 非表示タブなどで読み込みが始まってすらいない場合の再要求
    if (introVideo.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      introVideo.load();
    }
  };

  // 読み込み完了時（またはmaxLoadingTimeを過ぎた時）
  const finishLoading = () => {
    if (loadingFinished) return;
    loadingFinished = true;

    // 動画が再生できないと既に判明している場合は、メイン動画を飛ばして本編へ
    if (introFinished) {
      revealSite();
      return;
    }

    startIntro();
  };

  const scheduleFinishLoading = () => {
    setTimeout(finishLoading, Math.max(minLoadingTime - elapsed(), 0));
  };

  if (document.readyState === "complete") {
    scheduleFinishLoading();
  } else {
    window.addEventListener("load", scheduleFinishLoading);
  }
  setTimeout(finishLoading, maxLoadingTime);
});

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

// ヒグマ対策の道具クリックイベント
document.addEventListener("DOMContentLoaded", () => {
  const toolsContainer = document.querySelector(".tool-pictures");
  const tools = document.querySelectorAll(".tool-pictures img");
  const memoTextContent = document.querySelector(".memo-text-content");

  // 各道具に対応する説明テキストのデータ（必要に応じてテキストを変更してください）
  const toolData = {
    "tool-bell": {
      title: "熊よけ鈴",
      text: "<p>ヒグマに襲われた時、クマにスプレーを吹きかけ、その攻撃から身を守る道具です。北米では、90％以上の確率でヒグマ攻撃を止めた効果があります。</p><p>成分は主にカプサイシン（唐辛子エキス）です。クマの目、鼻、口の粘膜に強烈な刺激を与えることで、一時的に視力と呼吸機能を奪い、その隙に逃げるための道具です。</p>",
    },
    "tool-spray": {
      title: "クマスプレー",
      text: "<p>ヒグマに襲われた時、クマにスプレーを吹きかけ、その攻撃から身を守る道具です。北米では、90％以上の確率でヒグマ攻撃を止めた効果があります。</p><p>成分は主にカプサイシン（唐辛子エキス）です。クマの目、鼻、口の粘膜に強烈な刺激を与えることで、一時的に視力と呼吸機能を奪い、その隙に逃げるための道具です。</p>",
    },
    "tool-bearhorn": {
      title: "ベアホーン",
      text: "<p>ベアホーンは、ガスや手動の力で強烈な高周波音を出し、クマにこちらの存在を知らせたり、驚かせて遠ざけたりするための道具です。</p><p>風の強い日や川の近くなど、音が消されやすい場所で有効です。</p>",
    },
    "tool-handy-radio": {
      title: "携帯ラジオ",
      text: "<p>人の話し声などを流すことで、ヒグマに警戒させます。</p><p>周囲に人がいることをアピールするのに役立ちます。</p>",
    },
    // 初期状態（リセット時用）のテキスト
    default: {
      title: "もしもに備える道具",
      text: "<p>私たちが被害を受けないためには、まずはヒグマに私たちの存在を知らせることが重要です。</p><p>また、近距離まで接近してしまった最悪の場合に備えて、撃退できる道具を持つことが有効です。</p>",
    },
  };

  tools.forEach((tool) => {
    // pocket と bag はクリックイベントの対象外にする
    if (tool.id === "tool-pocket" || tool.id === "tool-bag") return;

    tool.addEventListener("click", (e) => {
      e.stopPropagation(); // 【推測】親要素へのクリックイベント伝播を防ぎ、意図せぬリセットを防止

      const isAlreadyActive = tool.classList.contains("active");

      // 一旦すべてのツールのアクティブ状態を解除
      tools.forEach((t) => t.classList.remove("active"));
      toolsContainer.classList.remove("is-active");

      if (!isAlreadyActive) {
        // クリックされたツールをアクティブにする
        tool.classList.add("active");
        toolsContainer.classList.add("is-active");

        // 対応するテキストに切り替える
        const data = toolData[tool.id];
        if (data) {
          memoTextContent.innerHTML = `<h5>${data.title}</h5>${data.text}`;
        }
      } else {
        // すでにアクティブなものを再度クリックした場合は、初期状態に戻す
        memoTextContent.innerHTML = `<h5>${toolData["default"].title}</h5>${toolData["default"].text}`;
      }
    });
  });

  document.addEventListener("click", () => {
    tools.forEach((t) => t.classList.remove("active"));
    toolsContainer.classList.remove("is-active");
    memoTextContent.innerHTML = `<h5>${toolData["default"].title}</h5>${toolData["default"].text}`;
  });
});
