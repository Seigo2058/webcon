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

      // 1. フォントの設定（※文字幅を計算する前に必ず設定する必要があります）
      p.fill("#FFFFFF");
      p.textFont("ads-strong");
      p.textSize(54);
      p.textLeading(70); // 行間（お好みで調整してください）

      // 2. テキストを行ごとに分割する
      const lines = canvasText.split("\n");

      // 3. 一番長い行の幅（ピクセル数）を計算する
      let maxTextWidth = 0;
      for (let i = 0; i < lines.length; i++) {
        let currentLineWidth = p.textWidth(lines[i]); // 現在の行の幅を取得
        if (currentLineWidth > maxTextWidth) {
          maxTextWidth = currentLineWidth;
        }
      }

      // 4. 左端の開始X座標を計算する
      // (画面の幅 - テキストブロックの最大幅) ÷ 2 = ぴったり中央に配置するための開始位置
      const startX = (p.windowWidth - maxTextWidth) / 2;

      // 5. 左寄せにして、計算したX座標から描画する
      p.textAlign(p.LEFT, p.CENTER);
      p.text(canvasText, startX, p.windowHeight / 2);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };

  // 4. 定義した関数を元にインスタンスを生成
  // 第2引数でアタッチする親要素を指定（省略するとbodyの最後に追加される）
  let myP5Instance = new p5(mySketch, canvas);
});
