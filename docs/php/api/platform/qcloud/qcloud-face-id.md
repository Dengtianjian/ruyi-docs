# QCloudFaceId — 腾讯云人脸核身（FaceID）

- **文件位置**: `kernel/Platform/QCloud/QCloudFaceId.php`
- **命名空间**: `kernel\Platform\QCloud`
- **继承**: `extends QCloud`
- **是否可继承**: 是

腾讯云人脸核身（FaceID）服务的请求封装，基于 `QCloud` 基类，将服务固定为 `faceid`。

## 继承属性

继承自 `QCloud`（详见 [QCloud](qcloud.md)），构造函数固定 `Service = "faceid"`，Host 自动为 `faceid.tencentcloudapi.com`。

## 构造

```php
__construct($SecretId, $SecretKey, $SecurityToken = null, $TmpSecretId = null, $TmpSecretKey = null)
```

- `$SecretId` / `$SecretKey`：永久密钥
- `$SecurityToken`（string，可选）：安全令牌
- `$TmpSecretId` / `$TmpSecretKey`（string，可选）：临时密钥

内部调用 `parent::__construct($SecretId, $SecretKey, "faceid", null, ...)`，将服务名固定为 `faceid`。

## 方法

### `get` — 发送 GET 请求

```php
get($action, $version, $query = [])
```

### `post` — 发送 POST 请求

```php
post($action, $version, $body = [], $query = [])
```

继承自 `QCloud`，返回 `Result`。

## 使用

```php
use kernel\Platform\QCloud\QCloudFaceId;

$faceId = new QCloudFaceId("SecretId", "SecretKey");

$result = $faceId->post("DetectFace", "2018-03-01", [
  "ImageBase64" => base64_encode(file_get_contents("face.jpg")),
  "MaxFaceNum" => 5,
]);

if ($result->isSuccess()) {
  $faces = $result->getData();
}
```
