const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

var fileInfo; // 图片信息

var dropzone = document.getElementById("dropzone");

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

    // 写入图片大小信息
    let picSize = document.querySelector("table tr:nth-child(2) td:nth-child(2)");
    picSize.innerHTML = formatSizeUnits(fileInfo[0].size);
  
    // 写入图片类型信息
    let picType = document.querySelector("table tr:nth-child(3) td:nth-child(2)");
    picType.innerHTML = fileInfo[0].type.split("/")[1].toUpperCase();
});

// 监听上传按钮点击事件
var uploadBtn = document.getElementById("uploadBtn");
uploadBtn.addEventListener("change", function (e) {
  var files = e.target.files;
  fileInfo = files;
  // 处理上传文件
  handleFiles(files);

  console.log(fileInfo[0].size); // 240480
  console.log(fileInfo[0].type); // image/jpeg

  // 写入图片大小信息
  let picSize = document.querySelector("table tr:nth-child(2) td:nth-child(2)");
  picSize.innerHTML = formatSizeUnits(fileInfo[0].size);

  // 写入图片类型信息
  let picType = document.querySelector("table tr:nth-child(3) td:nth-child(2)");
  picType.innerHTML = fileInfo[0].type.split("/")[1].toUpperCase();
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
        // 写入图片像素信息
        const picPixel = document.querySelector("table tr:nth-child(4) td:nth-child(2)");
        picPixel.innerHTML = `${img.width} x ${img.height} px`;

        // 写入图片宽高
        document.getElementById("pic-width").value = img.width;
        document.getElementById("pic-height").value = img.height;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
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

const selector = document.querySelector(".selector");
const radios = selector.querySelectorAll('input[type="radio"]');

let selectedValue = "jpeg";

radios.forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedValue = event.target.value;
  });
});

  // // 创建离屏Canvas
  // var offscreenCanvas = document.createElement('canvas');
  // var offscreenCtx = offscreenCanvas.getContext('2d');
  
  // let offscreenWidth = canvas.width;
  // let offscreenHeight = canvas.height;

  // // 将主Canvas上的内容绘制到离屏Canvas上
  // offscreenCtx.drawImage(canvas, 0, 0);


// 获取输入框元素
const widthInput = document.getElementById("pic-width");

// 添加事件监听器
widthInput.addEventListener("input", function(event) {
      // 获取当前输入框的值
      var value = event.target.value;

      // 打印当前输入框的值
      console.log(value);
  
      // offscreenWidth = value;
});


// 获取输入框元素
const heightInput = document.getElementById("pic-height");

// 添加事件监听器
heightInput.addEventListener("input", function(event) {
      // 获取当前输入框的值
      var value = event.target.value;

      // 打印当前输入框的值
      console.log(value);
  
      // offscreenHeight = value;
});

// 保存图片
function saveImage() {
  const compress = parseFloat(document.getElementById("compress-slider").value);

  // // 将离屏Canvas绘制回主Canvas
  // offscreenCtx.drawImage(offscreenCanvas, 0, 0, offscreenWidth, offscreenHeight);

  // 将Canvas转换为base64编码的图像数据URL，指定输出格式为JPEG，第二个参数为压缩质量
  // 像 PNG 格式的图片因为压缩算法的不同，设置压缩质量的参数不一定会生效。压缩后的图片质量会有所降低
  // PNG 格式的图像数据通常比 JPEG 格式的图像数据更大，但在某些情况下可能会提供更好的图像质量。
  const dataURL = canvas.toDataURL(
    `image/${selectedValue}`,
    Math.round(compress) / 100
  );

  // canvas.toDataURL() 方法返回的数据URL是以 Base64 编码的字符串形式表示的图像数据。
  // Base64 编码会使图像数据变大约 1.33 倍。
  // 因此，实际下载的文件大小可能会比数据URL的长度大约 1.33 倍。
  console.log(`压缩后文件大小：${formatSizeUnits(dataURL.length)}`);
  console.log(canvas.width);

  // 创建一个链接元素，并设置下载属性
  const link = document.createElement("a");
  link.download = `compress.${selectedValue}`;
  link.href = dataURL;

  // 将链接元素添加到文档中，并模拟单击
  document.body.appendChild(link);
  link.click();

  // 将链接元素从文档中删除
  document.body.removeChild(link);
}

// 压缩系数百分比显示
function updateCompress() {
  const compress = parseFloat(document.getElementById("compress-slider").value);
  const compressPercentage = document.getElementById("compressPercentage");
  compressPercentage.textContent = `${Math.round(compress) / 100}`;
}

// 格式化图片大小单位
function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes > 1) {
    return bytes + " bytes";
  } else if (bytes == 1) {
    return bytes + " byte";
  } else {
    return "0 bytes";
  }
}


var textCanvas = document.getElementById("dir");
var context = textCanvas.getContext("2d");

var gridY = 10,
    gridX = 10,
    colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
        '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
        '#FF5722'
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
        } else { //粒子已经到达最大状态
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
        context.fillRect(this.x, this.y, this.futurRadius, this.futurRadius)
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
    }
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
}

function randomInt(min, max) {
    return min + Math.random() * (max - min + 1);
}

var word = new Shape(textCanvas.width / 2, textCanvas.height / 2, 'KongPic')
word.getValue

(function drawFrame() {
    window.requestAnimationFrame(drawFrame);
    context.clearRect(0, 0, textCanvas.width, textCanvas.height);

    for (var i = 0; i < word.placement.length; i++) {
        //调用particle对像的drawParticle方法，开始画布上画
        word.placement[i].drawParticle();
    }

}())