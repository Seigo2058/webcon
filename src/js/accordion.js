//アコーディオンをクリックした時の動作
$(".accordion-area li").on("click", function () {
  //タイトル要素をクリックしたら
  var findElm = $(this).find(".answer-box"); //直後のアコーディオンを行うエリアを取得し
  $(findElm).toggleClass("is-open");
  var findIcon = $(this).find(".accordion-icon");

  if (findElm.hasClass("is-open")) {
    //タイトル要素にクラス名closeがあれば
    findIcon.attr("src", "./img/accordion-open.png");
  } else {
    //それ以外は
    findIcon.attr("src", "./img/accordion-close.png");
  }
});

// 水平スクロールの操作変更
let horizontal = document.querySelector(".accordion-area");
horizontal.addEventListener("wheel", (e) => {
  e.preventDefault();
  horizontal.scrollLeft += e.deltaY;
});
