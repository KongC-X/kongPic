const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const maxWidth = 800;
const maxHeight = 800;

var dropFileList; // 拖拽文件列表

let originalData; // 原始图像数据

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
const slider = document.getElementById("brightness-slider");
slider.addEventListener("input", function () {
  const brightness = parseInt(this.value) * 0.02; // 增加一个缩放系数

  // 获取图片数据
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  // 调整亮度（原以为是像素值越界，检查后发现是因为累积效应）
  // for (let i = 0; i < data.length; i += 4) {
  //   data[i] += brightness;
  //   data[i + 1] += brightness;
  //   data[i + 2] += brightness;
  // }

  // 调整亮度
  for (let i = 0; i < originalData.length; i += 4) {
    // 将 RGB 值转换为浮点数（范围为 0-1）
    const r = originalData[i] / 255;
    const g = originalData[i + 1] / 255;
    const b = originalData[i + 2] / 255;

    // 调整亮度
    const adjustedR = clamp(r * brightness, 0, 1);
    const adjustedG = clamp(g * brightness, 0, 1);
    const adjustedB = clamp(b * brightness, 0, 1);

    // 将调整后的 RGB 值转换为整数（范围为 0-255）
    data[i] = Math.round(adjustedR * 255);
    data[i + 1] = Math.round(adjustedG * 255);
    data[i + 2] = Math.round(adjustedB * 255);
    data[i + 3] = originalData[i + 3]; // 保持透明度不变
  }

  // 绘制处理后的图片数据到 Canvas 上
  ctx.putImageData(imageData, 0, 0);
});

// 清除水印
function clearWatermark() {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // 清除原始画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 修改图片亮度为初始值
  const opacityPercentage = document.getElementById("opacityPercentage");
  opacityPercentage.textContent = '50';
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

// 水印百分比显示
function updateOpacity() {
  const opacity = parseFloat(
    document.getElementById("brightness-slider").value
  );
  const opacityPercentage = document.getElementById("opacityPercentage");
  opacityPercentage.textContent = `${Math.round(opacity)}`;
}

// 辅助函数：将值限制在指定范围内
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
