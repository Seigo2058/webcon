let preCanvas = document.querySelectorAll(".u-canvas");

function setup() {
  let canvas = createCanvas(windowWidth, 1000);
  canvas.parent(preCanvas[0]);
}

function draw() {
  fill("#31743F");
  strokeWeight(0);
  circle(windowWidth / 2, windowHeight / 2, 300);
}

function windowResized() {
  resizeCanvas(windowWidth, 1000);
}

const showCanvas = () => {
  console.log("show canvas completely");
};

const canvasObserver = new IntersectionObserver(showCanvas);

canvasObserver.observe(preCanvas[0]);
