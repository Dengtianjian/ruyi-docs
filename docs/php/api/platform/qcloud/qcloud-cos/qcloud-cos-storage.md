# QCloudCOSStorage — 腾讯云 COS 文件存储驱动

- **文件位置**: `kernel/Platform/QCloud/QCloudCos/QCloudCOSStorage.php`
- **命名空间**: `kernel\Platform\QCloud\QCloudCos`
- **继承**: `extends AbstractOSSStroage` → `extends AbstractStorage` → `extends AbilityBaseObject`
- **是否可继承**: 是

腾讯云 COS 对象存储的文件存储驱动，实现抽象存储接口。支持文件上传、删除、查询、签名 URL、STS 临时凭证、对象授权访问 URL 等功能。依赖官方 COS SDK（`Qcloud\Cos\Client`）。

## 常量

继承自 `AbstractStorage`（访问控制级别），详见 [AliyunOSSStorage](aliyun-oss/aliyun-oss-storage.md)。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$SDKClient` | `QCloudCOSClient` | `null` | COS SDK 客户端 |
| protected | `$STSClient` | `QCloudSTS` | `null` | STS 安全凭证服务 |
| protected | `$host` | string | `null` | 对象访问域名 `{bucket}.cos.{region}.myqcloud.com` |
| protected | `$bucket` | string | `null` | 存储桶（继承） |
| protected | `$region` | string | `null` | 地域（继承） |
| protected | `$secretId` | string | `null` | 密钥 ID（继承） |
| protected | `$secretKey` | string | `null` | 密钥（继承） |
| protected | `$SecurityToken` | string | `null` | 安全令牌（继承） |

## 构造

```php
__construct($secretId, $secretKey, $region, $bucket, $SignatureKey = "ruyi_storage", $RoutePrefix = "files", $BaseURL = F_BASE_URL)
```

- `$secretId`（string）：密钥 ID
- `$secretKey`（string）：密钥
- `$region`（string）：存储桶所在地区，如 `ap-guangzhou`
- `$bucket`（string）：存储桶名称
- `$SignatureKey`（string）：生成签名的密钥，默认 `ruyi_storage`
- `$RoutePrefix`（string）：路由前缀，默认 `files`
- `$BaseURL`（string）：基础 URL

构造时计算 host 为 `{bucket}.cos.{region}.myqcloud.com`，并调用父类构造，平台名固定为 `cos`。

## 方法

### `loadSDK` — 初始化 SDK（protected）

```php
loadSDK()
```

- 创建 `QCloudSTS` 实例作为 `$STSClient`
- 创建 COS SDK `Client`（scheme `http`），使用永久密钥作为 credentials

返回 `$this`。

### `uploadFile` — 上传文件

```php
uploadFile($file, $fileKey = null, $options = [])
```

- `$file`：上传文件对象
- `$fileKey`（string）：文件键（对象 key）
- `$options`（array）：选项

**逻辑**

1. `verifyRequestAuth` 校验请求授权。
2. 若启用了文件模型，读取记录校验 ACL 与 owner。
3. 通过 `FileSystem::upload` 保存到临时目录。
4. `SDKClient->upload($bucket, $fileKey, fopen(临时文件,'rb'))` 上传到 COS。
5. 删除临时文件，若启用文件模型则 `save` 记录。
6. 返回 `StorageFileInfoData`（含 key/url/previewURL/downloadURL/transferURL/accessControl/ownerId）。
7. 上传失败抛 `Exception`（500）。

### `deleteFile` — 删除文件

```php
deleteFile($fileKey)
```

- `$fileKey`（string）：文件键

`verifyOperationAuthorization($fileKey, "write")` 校验后，通过 `SDKClient->deleteObject` 删除；若启用文件模型则 `remove(true, $fileKey)`；失败抛 `Exception`（500）。

### `getFile` — 获取文件信息

```php
getFile($fileKey)
```

- `$fileKey`（string）：文件键

读取文件模型记录并校验 owner/ACL，或通过远程 URL 获取信息；补充 url/previewURL/downloadURL/transferURL，返回 `StorageFileInfoData`。无记录返回 404。

### `getFileAuth` — 获取文件操作授权

```php
getFileAuth($AllowPrefix = null, $AllowActions = null, $DurationSeconds = 1800)
```

通过 `QCloudSTS->getTempKeys` 获取临时密钥返回。失败时解析错误信息返回 `break(500, code, message)`。

**参数说明**

- `$AllowPrefix`：资源前缀，如 `*`
- `$AllowActions`：允许的操作集合，如 `["name/cos:PutObject"]`
- `$DurationSeconds`（int）：有效期（秒）

### `getFileSign` — 获取文件签名

```php
getFileSign($fileKey = null, $Expires = 1800, $HTTPMethod = "get", $URLParams = [], $Headers = [])
```

创建 `QCloudCosSignture` 实例，对指定文件生成签名授权参数数组。

### `getObjectAuthUrl` — 获取带签名的对象访问 URL

```php
getObjectAuthUrl($fileKey, $HTTPMethod = "get", $URLParams = [], $Headers = [], $Expires = 1800, $Download = false)
```

- `$fileKey`（string）：对象名称，`/` 开头
- `$HTTPMethod`（string）：请求方法，默认 `get`
- `$URLParams`（array）：URL 参数
- `$Headers`（array）：请求头部
- `$Expires`（int）：签名有效期（秒），默认 1800
- `$Download`（bool）：是否强制下载（设置 `response-content-disposition=attachment`）

生成 `https://{host}{fileKey}?{签名参数}` 的完整访问 URL。

### `getFilePreviewURL` — 预览 URL

```php
getFilePreviewURL($fileKey, $URLParams = [], $Expires = 1800)
```

返回签名预览访问 URL。

### `getFileDownloadURL` — 下载 URL

```php
getFileDownloadURL($fileKey, $URLParams = [], $Expires = 1800)
```

返回签名下载访问 URL（强制下载）。

### `fileExist` — 判断文件是否存在

```php
fileExist($fileKey)
```

`verifyOperationAuthorization($fileKey, "read")` 校验后，通过 `SDKClient->doesObjectExist` 判断，返回布尔值。

## 使用

```php
use kernel\Platform\QCloud\QCloudCos\QCloudCOSStorage;

$storage = new QCloudCOSStorage(
  "SecretId",
  "SecretKey",
  "ap-guangzhou",
  "test-125000000"
);

// 上传
$info = $storage->uploadFile($_FILES['file'], "images/2026/08/a.png");

// 签名访问 URL
$previewUrl = $storage->getFilePreviewURL("images/2026/08/a.png");
$downloadUrl = $storage->getFileDownloadURL("images/2026/08/a.png");

// STS 临时密钥
$sts = $storage->getFileAuth("*", ["name/cos:PutObject"], 1800);

// 检查存在
if ($storage->fileExist("images/2026/08/a.png")) {
  // ...
}
```
