## kongcPic图片处理器

暂定功能需求点：水印处理、色彩滤镜、图片裁剪旋转、图片格式处理压缩、头像贴图、ai抠图等

### 水印处理
1. 水印文字内容、大小、颜色、透明度自定义 ✅
2. 水印文字位置和旋转角度自定义 ✅
3. 单文字水印添加、水印平铺 ✅
4. 平铺文字水平垂直间距自定义 ✅
5. 文字水印清除 ✅
6. 保存水印图片 ✅
7. UI样式调整 ✅
8. 拖拽上传 ✅

### 色彩滤镜
1. 图片色彩自定义调节，包括亮度、饱和度、对比度 ✅
2. 添加滤镜，目前有九种滤镜效果，能够涵盖大部分需求 ✅
3. 显示原图色彩 ✅
4. 保存修改后的图片 ✅
5. 拖拽上传 ✅
6. 解决滤镜叠加问题 ❌
7. 解决先调节滤镜再调节色彩，滤镜失效问题 ❌

### 图片格式处理压缩
1. 图片压缩，压缩系数调整 ✅
2. 图片格式转换，目前支持JPEG、PNG、WebP、GIF ✅
3. 图片尺寸像素比调整 ❌
4. 图片初始信息显示 ✅
5. 目前用canvas压缩会存在问题，之后会尝试使用sharp来进行图片处理 ❌
6. 通过input上传的图片大小缩小了很多 ❌
7. PNG 格式的图片因为压缩算法的不同，设置压缩质量的参数不一定会生效 ❌
8. canvas.toDataURL() 方法返回的数据URL是以 Base64 编码的字符串形式表示的图像数据，Base64 编码会使图像数据变大约 1.33 倍 ❌
9. 图片尺寸修改 ❌

### 图片裁剪旋转
1. 图片裁剪 ✅
2. 图片裁剪比例自定义，目前支持：自由比例、1:1、4:3、3:2、16:9 ✅
3. 裁剪框实时预览 ✅
4. 图片旋转，目前支持左右翻转、上下翻转、左转、右转 ✅
5. 图片旋转角度自定义 ✅

### 图片涂鸦
1. 模式选择：支持画笔模式、马赛克模式、图形模式 ✅
2. 画笔目前支持十二种常用颜色，介于input样式难以统一，暂时先不开放颜色自定义 ✅
3. 画布操作：支持撤销、重做、清空画布 ✅
4. 画笔、马赛克效果、图形粗细调整自定义 ✅
5. 图形模式形状选择，暂时仅支持矩形，后续可能会支持圆形 ✅
6. 涂鸦图片保存 ✅