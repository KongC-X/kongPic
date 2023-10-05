const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxWidth = 800;
const maxHeight = 800;

const fileInput = document.getElementById('file-input');
const watermarkInput = document.getElementById('watermark-input');
const positionXInput = document.getElementById('positionXInput');
const positionYInput = document.getElementById('positionYInput');
const rotationInput = document.getElementById('rotation-input');
const addWatermarkBtn = document.getElementById('add-watermark');
const tileButton = document.getElementById('tileButton');

// 图片上传
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) {
        return;
    }
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
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file); // 读取文件内容，结果用 data:url 的字符串形式表示
});

// 添加水印
addWatermarkBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
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
  
        const rotation = parseInt(rotationInput.value) || 0;
        const text = watermarkInput.value;
        let positionX = parseInt(positionXInput.value) || 0;
        let positionY = parseInt(positionYInput.value) || 0;
        positionX = Math.min(positionX, maxWidth);
        positionY = Math.min(positionY, maxHeight);
        const color = document.getElementById('colorPicker').value;
        const opacity = parseFloat(document.getElementById('opacitySlider').value);
        const fontSize = parseInt(document.getElementById('fontSizeInput').value);
  
        const drawWatermark = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
  
          ctx.save();
          ctx.translate(positionX, positionY);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.font = `${fontSize}px ${getComputedStyle(ctx.canvas).fontFamily}`;
          ctx.fillStyle = `rgba(${hexToRgb(color)}, ${opacity})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 0, 0);
          ctx.restore();
        };
  
        drawWatermark();
      };
      img.src = URL.createObjectURL(file);
    };
    reader.readAsDataURL(file);
});

// 水印平铺
tileButton.addEventListener('click', () => {
        const text = document.getElementById('watermark-input').value;
        const rotation = document.getElementById('rotation-input').value;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const horizontalSpacing = parseInt(document.getElementById('horizontalSpacing').value);
        const verticalSpacing = parseInt(document.getElementById('verticalSpacing').value);
        const color = document.getElementById('colorPicker').value;
        const opacity = parseFloat(document.getElementById('opacitySlider').value);
        const fontSize = parseInt(document.getElementById('fontSizeInput').value);
    
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
    
        // 复制原始画布到临时画布
        tempContext.drawImage(canvas, 0, 0);
    
        // 清除画布上的单个水印
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
        // 绘制平铺水印
        for (let x = horizontalSpacing; x < canvasWidth; x += horizontalSpacing) {
          for (let y = verticalSpacing; y < canvasHeight; y += verticalSpacing) {
            tempContext.save();
            tempContext.translate(x, y);
            tempContext.rotate((rotation * Math.PI) / 180);
            tempContext.font = `${fontSize}px ${getComputedStyle(ctx.canvas).fontFamily}`;
            tempContext.fillStyle = `rgba(${hexToRgb(color)}, ${opacity})`;
            tempContext.textAlign = 'center';
            tempContext.textBaseline = 'middle';
            tempContext.fillText(text, 0, 0);
            tempContext.restore();
          }
        }
    
        // 清除原始画布并复制临时画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // 将临时画布复制回原始画布
        ctx.drawImage(tempCanvas, 0, 0);
});

// 清除水印
function clearWatermark() {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
  
    // 清除原始画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
    // 在原始画布上重新绘制之前的图像
    const file = fileInput.files[0];
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
    const dataURL = canvas.toDataURL('image/png');
  
    // 创建一个链接元素，并设置下载属性
    const link = document.createElement('a');
    link.download = 'watermarked.png';
    link.href = dataURL;
  
    // 将链接元素添加到文档中，并模拟单击
    document.body.appendChild(link);
    link.click();
  
    // 将链接元素从文档中删除
    document.body.removeChild(link);
}
  
// 将十六进制颜色转换为 RGB 值
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// 水印百分比显示
function updateOpacity() {
    const opacity = parseFloat(document.getElementById('opacitySlider').value);
    const opacityPercentage = document.getElementById('opacityPercentage');
    opacityPercentage.textContent = `${Math.round(opacity * 100)}%`;
  }