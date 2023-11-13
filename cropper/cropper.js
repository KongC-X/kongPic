const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
var image = new Image();
var dropzone = document.getElementById("dropzone");

var rotationAngle = 0; // 记录旋转角度
var flippedHorizontal = false; // 记录是否已经左右翻转
var flippedVertical = false; // 记录是否已经上下翻转

// 阻止浏览器默认行为
dropzone.addEventListener("dragover", function (e) {
  e.preventDefault();
});

// 监听文件拖入事件
dropzone.addEventListener("drop", function (e) {
  e.preventDefault();
  var files = e.dataTransfer.files;
  fileInfo = files;
  // 处理上传文件
  handleFiles(files);
});

// 监听上传按钮点击事件
var uploadBtn = document.getElementById("uploadBtn");
uploadBtn.addEventListener("change", function (e) {
  var files = e.target.files;
  fileInfo = files;
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

        var cropper = new Cropper(canvas, {
          aspectRatio: 1 / 1, // 裁剪框宽高比
          viewMode: 2, // 显示模式，0：自由裁剪，1：限制比例裁剪，2：限制裁剪框内图像大小
          zoomable: false, // 是否允许缩放
          crop: function(event) {
            // 裁剪框发生变化时触发
          }
        });

        // 左右翻转
        document.getElementById("flipHorizontalBtn").addEventListener("click", function () {
          flippedHorizontal = !flippedHorizontal;
          if (flippedHorizontal) {
            cropper.scale(-1, 1);
          } else  {
            cropper.scale(1, 1);
          }
        });

        // 上下翻转
        document.getElementById("flipVerticalBtn").addEventListener("click", function () {
          flippedVertical = !flippedVertical;
          if (flippedVertical) {
            cropper.scale(1, -1);
          } else {
            cropper.scale(1, 1);
          }
        });

        // 左转
        document.getElementById("rotateLeftBtn").addEventListener("click", function () {
          cropper.rotate(-90);
        });

        // 右转
        document.getElementById("rotateRightBtn").addEventListener("click", function () {
          cropper.rotate(90);
        });
      };
      img.src = reader.result;

    };

    reader.readAsDataURL(file); // 读取文件内容，结果用 data:url 的字符串形式表示
  }

  if (file.type.startsWith("image/")) {
    // 上传完图片后将提示文字隐藏，防止透明滤镜时显示
    const dropText = document.querySelector(".drop-text");
    dropText.style.display = "none";
  }
}

// 绘制图片
// function drawImage(image) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.save();
//   ctx.translate(canvas.width / 2, canvas.height / 2);
//   ctx.rotate(rotationAngle);
//   if (flippedHorizontal) {
//     ctx.scale(-1, 1);
//   }
//   if (flippedVertical) {
//     ctx.scale(1, -1);
//   }
//   ctx.drawImage(image, -image.width / 2, -image.height / 2);
//   ctx.restore();
// }

// 保存图片
function saveImage() {
  // 将画布转换为数据 URL
  const dataURL = canvas.toDataURL("image/png");

  // 创建一个链接元素，并设置下载属性
  const link = document.createElement("a");
  link.download = "cropper.png";
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
