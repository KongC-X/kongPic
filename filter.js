const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const maxWidth = 800;
const maxHeight = 800;

var dropFileList; // 拖拽文件列表

let originalData; // 原始图像数据
let updateTimeout; // 用于防抖的计时器 ID

var dropzone = document.getElementById("dropzone");

// 阻止浏览器默认行为
dropzone.addEventListener("dragover", function (e) {
  e.preventDefault();
});

// 监听文件拖入事件
dropzone.addEventListener("drop", function (e) {
  e.preventDefault();
  var files = e.dataTransfer.files;
  dropFileList = files;
  // 处理上传文件
  handleFiles(files);
});

// 监听上传按钮点击事件
var uploadBtn = document.getElementById("uploadBtn");
uploadBtn.addEventListener("change", function (e) {
  var files = e.target.files;
  dropFileList = files;
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
      console.log(file.name + " 不是图片文件！");
      continue;
    }

    var element = document.getElementById("canvas");
    element.style.visibility = "visible";

    // 通过 FileReader 来获取图片的 base64
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        originalData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; // 获取原始图像数据
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file); // 读取文件内容，结果用 data:url 的字符串形式表示
  }
}

// 监听滑动条的 input 事件
const brightnessSlider = document.getElementById("brightness-slider");
const saturationSlider = document.getElementById("saturation-slider");
const contrastSlider = document.getElementById("contrast-slider");
brightnessSlider.addEventListener("input", updateImage);
saturationSlider.addEventListener("input", updateImage);
contrastSlider.addEventListener("input", updateImage);

// 更新图片色彩数据
function updateImage() {
  const brightness = parseInt(brightnessSlider.value); // 将亮度滑动条的值转换为整数
  const saturation = parseInt(saturationSlider.value); // 将饱和度滑动条的值转换为整数
  const contrast = parseInt(contrastSlider.value); // 将对比度滑动条的值转换为整数

  // 获取图片数据
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  // 调整亮度和饱和度
  for (let i = 0; i < originalData.length; i += 4) {
    const r = originalData[i];
    const g = originalData[i + 1];
    const b = originalData[i + 2];

    // 将 RGB 值转换为 HSL 值
    const hsl = rgbToHsl(r, g, b);

    // 调整亮度和饱和度
    hsl[2] += brightness / 100;
    hsl[1] += saturation / 100;

    // 将 HSL 值转换回 RGB 值
    const newRgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

    // 将新的 RGB 值应用于像素
    data[i] = newRgb[0];
    data[i + 1] = newRgb[1];
    data[i + 2] = newRgb[2];
    data[i + 3] = originalData[i + 3];
  }

  // 调整对比度
  if (contrast !== 0) {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
  }

  // 更新图像
  ctx.putImageData(imageData, 0, 0);
}

// rgb转hsl
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 灰色
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

// hsl转rgb
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 灰色
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 防抖函数
function debounce(func, delay) {
  let timeoutId;
  return function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  };
}

// 清除水印
function clearWatermark() {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // 清除原始画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 修改图片亮度为初始值
  const opacityPercentage = document.getElementById("opacityPercentage");
  opacityPercentage.textContent = "50";
  const slider = document.getElementById("brightness-slider");
  slider.value = 50;

  // 在原始画布上重新绘制之前的图像
  const file = dropFileList[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height *= maxWidth / width;
          width = maxWidth;
        } else {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// 保存图片
function saveImage() {
  // 将画布转换为数据 URL
  const dataURL = canvas.toDataURL("image/png");

  // 创建一个链接元素，并设置下载属性
  const link = document.createElement("a");
  link.download = "watermarked.png";
  link.href = dataURL;

  // 将链接元素添加到文档中，并模拟单击
  document.body.appendChild(link);
  link.click();

  // 将链接元素从文档中删除
  document.body.removeChild(link);
}

// 亮度百分比显示
function updateBrightness() {
  const brightness = parseFloat(
    document.getElementById("brightness-slider").value
  );
  const brightnessPercentage = document.getElementById("brightnessPercentage");
  brightnessPercentage.textContent = `${Math.round(brightness)}`;
}

// 饱和度百分比显示
function updateSaturation() {
  const saturation = parseFloat(
    document.getElementById("saturation-slider").value
  );
  const saturationPercentage = document.getElementById("saturationPercentage");
  saturationPercentage.textContent = `${Math.round(saturation)}`;
}

// 对比度百分比显示
function updateContrast() {
  const contrast = parseFloat(
    document.getElementById("contrast-slider").value
  );
  const contrastPercentage = document.getElementById("contrastPercentage");
  contrastPercentage.textContent = `${Math.round(contrast)}`;
}