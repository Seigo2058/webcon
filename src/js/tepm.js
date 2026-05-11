const canvasArea = document.querySelectorAll(".c-canvas");

// ★ 追加：アニメーション開始の許可を判定するフラグ
let isAnimationStarted = false;
// ★ 追加：発火した瞬間のスクロール量を記録する変数
let startScrollY = 0;

// 要素を監視
const showCanvas = (entries) => {
  const [entry] = entries;
  if (entry.isIntersecting) {
    canvasArea[0].classList.add("is-show");
    console.log("show: 98%画面に入りました");

    // ★ まだアニメーションが開始していなければ、フラグを立ててその時のスクロール量を記録
    if (!isAnimationStarted) {
      isAnimationStarted = true;
      startScrollY = window.scrollY;
    }
  }
};

const options = {
  threshold: 0.98,
};

const canvasObserver = new IntersectionObserver(showCanvas, options);

if (canvasArea.length > 0) {
  canvasObserver.observe(canvasArea[0]);
}

// canvasの設定
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  if (canvasArea.length > 0) {
    canvas.parent(canvasArea[0]);
  }
}

function draw() {
  background("#f0f0f0");

  // デフォルトの直径
  let diameter = 300;

  // ★ Observerが発火（isAnimationStartedがtrue）した以降のみ、サイズ変更の計算を行う
  if (isAnimationStarted) {
    const scrolled = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 発火した時点からのスクロール移動量を算出
    // ※上に戻った時に300より小さくしたくない場合は Math.max(0, scrolled - startScrollY) とします
    const scrollAmount = scrolled - startScrollY;

    // 移動量をもとに直径を計算（0からスタートするため、綺麗に300に加算されます）
    diameter = (scrollAmount / (viewportHeight * 2)) * viewportWidth + 300;
  }

  // 円の大きさを更新
  fill("#31743F");
  strokeWeight(0);
  circle(windowWidth / 2, windowHeight / 2, diameter);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
