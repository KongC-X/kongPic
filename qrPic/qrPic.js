// 获取页面元素
const imageFileInput = document.getElementById('imageFile');
const qrCodeFileInput = document.getElementById('qrCodeFile');
const replaceQRCodeButton = document.getElementById('replaceQRCode');
const imagePreview = document.getElementById('imagePreview');

// 上传图片文件时触发
imageFileInput.addEventListener('change', function() {
  const file = imageFileInput.files[0];
  if (file) {
    // 创建FileReader对象读取文件内容
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      // 将读取到的图片内容显示在页面上
      imagePreview.src = reader.result;
      // 在图片中识别二维码
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.src = reader.result;
      image.onload = function() {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode) {
          // 如果识别到二维码，则启用替换按钮
          replaceQRCodeButton.disabled = false;
        } else {
          // 如果未识别到二维码，则禁用替换按钮
          replaceQRCodeButton.disabled = true;
          alert('未识别到二维码，请选择正确的图像！');
        }
      };
    };
  }
});

// 上传用户自己的二维码文件时触发
qrCodeFileInput.addEventListener('change', function() {
  const file = qrCodeFileInput.files[0];
  if (file) {
    // 创建FileReader对象读取文件内容
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      // 将读取到的用户自己的二维码内容保存在变量中
      const qrCodeContent = reader.result;
      // 在替换按钮上添加一个单击事件处理程序
      replaceQRCodeButton.addEventListener('click', function() {
        // 创建新的QRCode实例
        const newQRCode = new QRCode("test", {
            text: "http://jindo.dev.naver.com/collie",
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
        });
        // 添加用户自己的二维码数据
        newQRCode.addData(qrCodeContent);
        // 生成新的QR码图像
        newQRCode.make();
        // 获取生成的QR码图像数据
        const imageData = newQRCode.createImageData(10, 10);
        // 获取原始图像中二维码的位置和大小
        const qrCodeX = qrCode.location.topLeftCorner.x;
        const qrCodeY = qrCode.location.topLeftCorner.y;
        const qrCodeSize = qrCode.location.dimension;
        // 将生成的QR码图像替换原始图像中的二维码
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = imagePreview.src;
        image.onload = function() {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          ctx.putImageData(imageData, qrCodeX, qrCodeY);
          imagePreview.src = canvas.toDataURL();
        };
      });
    };
  }
});
