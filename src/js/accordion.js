//アコーディオンをクリックした時の動作
$(".accordion-container").on("click", function () {
  //タイトル要素をクリックしたら
  var findElm = $(this).find(".answer-box"); //直後のアコーディオンを行うエリアを取得し
  $(findElm).toggleClass("is-open");
  var findIcon = $(this).find(".accordion-icon");

  if (findElm.hasClass("is-open")) {
    //タイトル要素にクラス名closeがあれば
    findIcon.attr("src", "../img/common/accordion-open.png");
  } else {
    //それ以外は
    findIcon.attr("src", "../img/common/accordion-close.png");
  }
});

// 水平スクロールの操作変更
const horizontal = document.querySelector(".accordion-area");

horizontal.addEventListener(
  "wheel",
  (e) => {
    const buffer = 1;

    // スクロール位置の判定
    const isAtLeftEdge = horizontal.scrollLeft <= 0;
    // 要素の表示幅(clientWidth)と現在のスクロール量(scrollLeft)の合計が、要素全体の幅(scrollWidth)に達しているか
    const isAtRightEdge =
      Math.ceil(horizontal.scrollLeft) + horizontal.clientWidth >=
      horizontal.scrollWidth - buffer;

    // スクロール方向の判定 (e.deltaY < 0 は上/左方向、e.deltaY > 0 は下/右方向)
    const isScrollingLeft = e.deltaY < 0;
    const isScrollingRight = e.deltaY > 0;

    // 左端でさらに左（上）へ、または右端でさらに右（下）へスクロールしようとした場合
    if (
      (isAtLeftEdge && isScrollingLeft) ||
      (isAtRightEdge && isScrollingRight)
    ) {
      // preventDefault() を実行せずに処理を抜け、通常の縦スクロールを許可する
      return;
    }

    // 要素が端にない場合は、デフォルトの縦スクロールを止めて横スクロールさせる
    e.preventDefault();
    horizontal.scrollLeft += e.deltaY;
  },
  { passive: false },
);
