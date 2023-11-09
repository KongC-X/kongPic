const qiniu = require('qiniu');
const fs = require('fs');

// 替换为你的七牛云AccessKey和SecretKey
const accessKey = 'your_access_key';
const secretKey = 'your_secret_key';

// 初始化Auth对象
const auth = new qiniu.Auth(accessKey, secretKey);

// 设置上传后保存的文件名
const bucketName = 'your_bucket_name';
const key = 'your_image_key';

// 生成上传Token
const token = auth.uploadToken(bucketName, key, 3600);

// 读取本地图片文件
const localfile = 'path/to/your/image.jpg';
const fileStream = fs.createReadStream(localfile);

// 上传文件
const config = {
  region: 'your_region', // 替换为你的区域
};
qiniu.putData(token, key, fileStream, config, (err, info) => {
  if (err) {
    console.error('上传失败：', err);
  } else {
    // 获取图片地址
    const imageUrl = `http://${bucketName}.qiniudn.com/${key}`;
    console.log('图片地址：', imageUrl);
  }
});
