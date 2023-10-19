const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const maxWidth = 800;
const maxHeight = 800;

var fileInfo; // 图片信息

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
  console.log(fileInfo[0]);
  console.log(fileInfo[0].size);
  console.log(fileInfo[0].type);
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
        let width = img.width;
        let height = img.height;
        console.log(width);
        console.log(height);
        // if (width > maxWidth || height > maxHeight) {
        //   if (width > height) {
        //     height *= maxWidth / width;
        //     width = maxWidth;
        //   } else {
        //     width *= maxHeight / height;
        //     height = maxHeight;
        //   }
        // }
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

const selector = document.querySelector(".selector");
const radios = selector.querySelectorAll('input[type="radio"]');

let selectedValue;

radios.forEach(radio => {
  radio.addEventListener("change", event => {
    selectedValue = event.target.value;
  });
});

// 保存图片
function saveImage() {
  const compress = parseFloat(
    document.getElementById("compress-slider").value
  );

  // 将Canvas转换为base64编码的图像数据URL，指定输出格式为JPEG，第二个参数为压缩质量
  // 像 PNG 格式的图片因为压缩算法的不同，设置压缩质量的参数不一定会生效。压缩后的图片质量会有所降低
  // PNG 格式的图像数据通常比 JPEG 格式的图像数据更大，但在某些情况下可能会提供更好的图像质量。
  const dataURL = canvas.toDataURL(`image/${selectedValue}`, Math.round(compress) / 100);

  console.log(`Selected value: ${selectedValue}`);
  console.log(`压缩后文件大小：${formatSizeUnits(dataURL.length)}`);

  // 创建一个链接元素，并设置下载属性
  const link = document.createElement("a");
  link.download = `watermarked.${selectedValue}`;
  link.href = dataURL;

  // 将链接元素添加到文档中，并模拟单击
  document.body.appendChild(link);
  link.click();

  // 将链接元素从文档中删除
  document.body.removeChild(link);
}

// 压缩系数百分比显示
function updateCompress() {
  const compress = parseFloat(
    document.getElementById("compress-slider").value
  );
  const compressPercentage = document.getElementById("compressPercentage");
  compressPercentage.textContent = `${Math.round(compress) / 100}`;
}

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
