const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

var dropzone = document.getElementById("dropzone");

// 阻止浏览器默认行为
dropzone.addEventListener("dragover", function (e) {
  e.preventDefault();
});

// 监听文件拖入事件
dropzone.addEventListener("drop", function (e) {
  e.preventDefault();
  var files = e.dataTransfer.files;
  // 处理上传文件
  handleFiles(files);
});

// 监听上传按钮点击事件
var uploadBtn = document.getElementById("uploadBtn");
uploadBtn.addEventListener("change", function (e) {
  var files = e.target.files;
  // 处理上传文件
  handleFiles(files);
});

// 处理上传文件
function handleFiles(files) {
  // 处理每个文件
  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    // 检查文件类型是否为图片类型
    if (!file.type.startsWith("image/")) {
      alert(file.name + " 不是图片文件！");
      continue;
    }

    var element = document.getElementById("canvas");
    element.style.visibility = "visible";

    // 通过 FileReader 来获取图片的 base64
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file); // 读取文件内容，结果用 data:url 的字符串形式表示
  }
}

const selector = document.querySelector(".selector");
const radios = selector.querySelectorAll('input[type="radio"]');

let selectedValue = "pen";

radios.forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedValue = event.target.value;
  });
});

// 设置初始画笔颜色和粗细
var colorPicker = document.getElementById("colorPicker");
var sizeSlider = document.getElementById("sizeSlider");
var currentColor = colorPicker.value;
var currentSize = sizeSlider.value;

// 监听颜色选择器的变化
colorPicker.addEventListener("change", function () {
  currentColor = colorPicker.value;
});

// 监听粗细滑块的变化
sizeSlider.addEventListener("input", function () {
  currentSize = sizeSlider.value;
});

ctx.globalCompositeOperation = 'source-over';

// 监听鼠标或触摸在Canvas上的绘制事件
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDrawing);

var isDrawing = false;
var lastX = 0;
var lastY = 0;

function startDrawing(e) {
  isDrawing = true;
  var pos = getMousePos(canvas, e);
  lastX = pos.x;
  lastY = pos.y;
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;

  var pos = getMousePos(canvas, e);
  var currentX = pos.x;
  var currentY = pos.y;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.lineCap = "round";
  ctx.stroke();

  lastX = currentX;
  lastY = currentY;
}

function stopDrawing() {
  isDrawing = false;
}

function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}


// 保存图片
function saveImage() {
  // 将裁剪画布转换为数据 URL
  const dataURL = canvas.toDataURL("image/png");

  // 创建一个链接元素，并设置下载属性
  const link = document.createElement("a");
  link.download = "draw.png";
  link.href = dataURL;

  // 将链接元素添加到文档中，并模拟单击
  document.body.appendChild(link);
  link.click();

  // 将链接元素从文档中删除
  document.body.removeChild(link);
}

var textCanvas = document.getElementById("dir");
var context = textCanvas.getContext("2d");

var gridY = 10,
  gridX = 10,
  colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
  ],
  durVal = 0.1;

// 粒子
function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.color = colors[Math.floor(Math.random() * colors.length)]; //'bleack'//
  this.futurRadius = randomInt(1.1, 5.1);
  this.radius = 1.1;
  this.dying = false;
  this.base = [x, y];

  this.drawParticle = function () {
    // 当前粒子变小到一定程度之后，每次将它的半径+0.1，使其慢慢变大
    if (this.radius < this.futurRadius && this.dying === false) {
      this.radius += durVal;
    } else {
      //粒子已经到达最大状态
      this.dying = true; //表示粒子还处于show状态
    }

    //每次-0.1
    if (this.dying) {
      this.radius -= durVal;
    }
    // 画粒子形状
    context.save();
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(this.x, this.y, this.futurRadius, this.futurRadius);
    context.closePath();
    context.fill();
    context.restore();

    //将消失的粒子重置最初的状态
    if (this.y < 0 || this.radius < 1) {
      this.x = this.base[0];
      this.y = this.base[1];
      this.dying = false;
      this.futurRadius = randomInt(1.1, 5.1);
    }
  };
}

function Shape(x, y, texte) {
  this.x = x;
  this.y = y;
  this.size = 200;
  this.text = texte;
  this.placement = [];
}

Shape.prototype.getValue = function () {
  context.textAlign = "center";
  context.font = this.size + "px arial";
  context.fillText(this.text, this.x, this.y);

  let idata = context.getImageData(0, 0, textCanvas.width, textCanvas.height); // 获取 canvas指定范围内的 像素数组
  let buffer32 = new Uint32Array(idata.data.buffer); // 转成32位的数组

  // 遍历所有的数组
  for (var j = 0; j < textCanvas.height; j += gridY) {
    for (var i = 0; i < textCanvas.width; i += gridX) {
      if (buffer32[j * textCanvas.width + i]) {
        // 放入粒子对象
        var ball = new Particle(i, j);
        this.placement.push(ball);
      }
    }
  }

  context.clearRect(0, 0, textCanvas.width, textCanvas.height);
};

function randomInt(min, max) {
  return min + Math.random() * (max - min + 1);
}

var word = new Shape(textCanvas.width / 2, textCanvas.height / 2, "KongPic");
word.getValue(
  (function drawFrame() {
    window.requestAnimationFrame(drawFrame);
    context.clearRect(0, 0, textCanvas.width, textCanvas.height);

    for (var i = 0; i < word.placement.length; i++) {
      //调用particle对像的drawParticle方法，开始画布上画
      word.placement[i].drawParticle();
    }
  })()
);
