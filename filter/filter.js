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

  if (file.type.startsWith("image/")) {
    // 上传完图片后将提示文字隐藏，防止透明滤镜时显示
    const dropText = document.querySelector(".drop-text");
    dropText.style.display = "none";
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
  let h,
    s,
    l = (max + min) / 2;

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
  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  };
}

// 清除水印
function clearFilter() {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // 清除原始画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 修改图片亮度、饱和度、对比度为初始值
  const brightnessPercentage = document.getElementById("brightnessPercentage");
  const saturationPercentage = document.getElementById("saturationPercentage");
  const contrastPercentage = document.getElementById("contrastPercentage");
  const brightnessSlider = document.getElementById("brightness-slider");
  const saturationSlider = document.getElementById("saturation-slider");
  const contrastSlider = document.getElementById("contrast-slider");
  brightnessPercentage.textContent = "0";
  saturationPercentage.textContent = "0";
  contrastPercentage.textContent = "0";
  brightnessSlider.value = 0;
  saturationSlider.value = 0;
  contrastSlider.value = 0;

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
  link.download = "filter.png";
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
  const contrast = parseFloat(document.getElementById("contrast-slider").value);
  const contrastPercentage = document.getElementById("contrastPercentage");
  contrastPercentage.textContent = `${Math.round(contrast)}`;
}

// 在点击“黑白”格子时应用黑白滤镜
const blackWhiteGridItem = document.getElementById("black-white-filter");
blackWhiteGridItem.addEventListener("click", function () {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3; // 计算灰度值
    data[i] = gray; // 设置红色通道为灰度值
    data[i + 1] = gray; // 设置绿色通道为灰度值
    data[i + 2] = gray; // 设置蓝色通道为灰度值
  }

  ctx.putImageData(imageData, 0, 0);
});

// 在点击“暖光”格子时应用暖光滤镜
const warmLightGridItem = document.querySelector("#warm-light-filter");
warmLightGridItem.addEventListener("click", function () {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用暖光滤镜
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // 调整颜色值
    const adjustedRed = red + 40;
    const adjustedGreen = green + 10;
    const adjustedBlue = blue - 10;

    // 将调整后的颜色值写回图像数据
    data[i] = adjustedRed;
    data[i + 1] = adjustedGreen;
    data[i + 2] = adjustedBlue;
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“冷调”格子时应用冷光滤镜
const coolLightGridItem = document.querySelector("#cool-light-filter");
coolLightGridItem.addEventListener("click", function () {
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用冷光滤镜
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // 调整颜色值
    const adjustedRed = red - 10;
    const adjustedGreen = green + 10;
    const adjustedBlue = blue + 40;

    // 将调整后的颜色值写回图像数据
    data[i] = adjustedRed;
    data[i + 1] = adjustedGreen;
    data[i + 2] = adjustedBlue;
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“反色”格子时应用反色滤镜
const invertGridItem = document.querySelector("#invert-filter");
invertGridItem.addEventListener("click", function () {
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用反色滤镜
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // 计算反色值
    const invertedRed = 255 - red;
    const invertedGreen = 255 - green;
    const invertedBlue = 255 - blue;

    // 将反色值写回图像数据
    data[i] = invertedRed;
    data[i + 1] = invertedGreen;
    data[i + 2] = invertedBlue;
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“复古”格子时应用复古滤镜
const vintageGridItem = document.querySelector("#vintage-filter");
vintageGridItem.addEventListener("click", function () {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用复古滤镜
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // 调整颜色值
    const adjustedRed = 0.393 * red + 0.769 * green + 0.189 * blue;
    const adjustedGreen = 0.349 * red + 0.686 * green + 0.168 * blue;
    const adjustedBlue = 0.272 * red + 0.534 * green + 0.131 * blue;

    // 将调整后的颜色值写回图像数据
    data[i] = adjustedRed;
    data[i + 1] = adjustedGreen;
    data[i + 2] = adjustedBlue;
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“自然”格子时应用自然滤镜
const naturalGridItem = document.querySelector("#natural-filter");
naturalGridItem.addEventListener("click", function () {
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用自然滤镜
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // 调整颜色值
    const adjustedRed = 0.8 * red + 0.2 * green + 0.1 * blue;
    const adjustedGreen = 0.2 * red + 0.9 * green + 0.1 * blue;
    const adjustedBlue = 0.1 * red + 0.1 * green + 0.9 * blue;

    // 将调整后的颜色值写回图像数据
    data[i] = adjustedRed;
    data[i + 1] = adjustedGreen;
    data[i + 2] = adjustedBlue;
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“透明”格子时应用透明滤镜
const transparentGridItem = document.querySelector("#transparent-filter");
transparentGridItem.addEventListener("click", function () {
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用透明滤镜
  for (let i = 0; i < data.length; i += 4) {
    // 将 alpha 值设置为 128，即半透明
    data[i + 3] = 128;
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“模糊”格子时应用模糊滤镜，有点慢需要优化
const blurGridItem = document.querySelector('#blur-filter');
blurGridItem.addEventListener('click', function() {
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用模糊滤镜
  const blurRadius = 5; // 模糊半径

  for (let y = blurRadius; y < canvas.height - blurRadius; y++) {
    for (let x = blurRadius; x < canvas.width - blurRadius; x++) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      let pixelCount = 0;

      // 计算模糊区域内的颜色平均值
      for (let j = -blurRadius; j <= blurRadius; j++) {
        for (let i = -blurRadius; i <= blurRadius; i++) {
          const offsetX = x + i;
          const offsetY = y + j;

          const index = (offsetY * canvas.width + offsetX) * 4;
          red += data[index];
          green += data[index + 1];
          blue += data[index + 2];
          alpha += data[index + 3];
          pixelCount++;
        }
      }

      // 计算颜色平均值
      red /= pixelCount;
      green /= pixelCount;
      blue /= pixelCount;
      alpha /= pixelCount;

      // 将颜色平均值应用到像素上
      const currentIndex = (y * canvas.width + x) * 4;
      data[currentIndex] = red;
      data[currentIndex + 1] = green;
      data[currentIndex + 2] = blue;
      data[currentIndex + 3] = alpha;
    }
  }

  // 将处理后的图像数据绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 在点击“马赛克”格子时应用马赛克滤镜
const mosaicGridItem = document.querySelector('#mosaic-filter');
mosaicGridItem.addEventListener('click', function() {
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 创建离屏 Canvas
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenCtx = offscreenCanvas.getContext('2d');

  // 将图片数据绘制到离屏 Canvas 上
  offscreenCtx.putImageData(imageData, 0, 0);

  // 应用马赛克滤镜
  const blockSize = 10; // 马赛克块大小

  for (let y = 0; y < canvas.height; y += blockSize) {
    for (let x = 0; x < canvas.width; x += blockSize) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      for (let j = 0; j < blockSize; j++) {
        for (let i = 0; i < blockSize; i++) {
          const offsetX = x + i;
          const offsetY = y + j;

          if (offsetX < canvas.width && offsetY < canvas.height) {
            const index = (offsetY * canvas.width + offsetX) * 4;
            red += imageData.data[index];
            green += imageData.data[index + 1];
            blue += imageData.data[index + 2];
            alpha += imageData.data[index + 3];
          }
        }
      }

      const totalCount = blockSize * blockSize;
      red /= totalCount;
      green /= totalCount;
      blue /= totalCount;
      alpha /= totalCount;

      for (let j = 0; j < blockSize; j++) {
        for (let i = 0; i < blockSize; i++) {
          const offsetX = x + i;
          const offsetY = y + j;

          if (offsetX < canvas.width && offsetY < canvas.height) {
            const index = (offsetY * canvas.width + offsetX) * 4;
            imageData.data[index] = red;
            imageData.data[index + 1] = green;
            imageData.data[index + 2] = blue;
            imageData.data[index + 3] = alpha;
          }
        }
      }
    }
  }

  // 将结果绘制到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});
