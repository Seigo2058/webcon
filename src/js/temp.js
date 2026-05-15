const canvasArea = document.querySelectorAll(".c-canvas");

// canvasの設定
canvasArea.forEach((canvas) => {
  // 初期設定
  let isAnimationStarted = false;
  let startScrollY = 0;

  // 要素を監視
  const showCanvas = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      canvas.classList.add("is-show");
      console.log("show: 98%画面に入りました");
      if (!isAnimationStarted) {
        isAnimationStarted = true;
        startScrollY = window.scrollY + window.innerHeight;
      }
    }
  };

  const options = {
    threshold: 0.98,
  };

  const canvasObserver = new IntersectionObserver(showCanvas, options);
  canvasObserver.observe(canvas);

  let canvasText = canvas.dataset.text;
  let canvasColor = canvas.dataset.color;
  let canvasDiameter = canvas.dataset.diameter;

  // 1. スケッチの設計図となる関数を定義
  const mySketch = (p) => {
    // 3. setupやdrawを p のプロパティとして定義
    p.setup = () => {
      // 2. p5の関数は p. をつけて呼び出す
      p.createCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
      p.background("#fffbeb");

      // 直径デフォルト値
      let diameter = parseInt(canvasDiameter);

      if (isAnimationStarted) {
        // スクロールに応じて円の大きさを変える
        const scrolled = window.scrollY;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const scrollAmount = Math.max(0, scrolled - startScrollY);

        diameter =
          (scrollAmount / (viewportHeight * 2)) * viewportWidth +
          parseInt(canvasDiameter);
      }

      // 円の大きさを更新
      p.fill(canvasColor);
      p.strokeWeight(0);
      p.circle(p.windowWidth / 2, p.windowHeight / 2, diameter);

      // フォント
      p.fill("#FFFFFF");
      p.textFont("ads-strong");
      p.textSize(54);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(canvasText, p.windowWidth / 2, p.windowHeight / 2);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };

  // 4. 定義した関数を元にインスタンスを生成
  // 第2引数でアタッチする親要素を指定（省略するとbodyの最後に追加される）
  let myP5Instance = new p5(mySketch, canvas);
});
