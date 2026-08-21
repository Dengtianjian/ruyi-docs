# AliyunOSSStorage — 阿里云 OSS 文件存储驱动

- **文件位置**: `kernel/Platform/Aliyun/AliyunOSS/AliyunOSSStorage.php`
- **命名空间**: `kernel\Platform\Aliyun\AliyunOSS`
- **继承**: `extends AbstractOSSStroage` → `extends AbstractStorage` → `extends AbilityBaseObject`
- **是否可继承**: 是

阿里云 OSS 对象存储的文件存储驱动，实现抽象存储接口。支持文件上传、删除、查询、签名 URL、STS 临时凭证获取、ACL 授权校验等功能。

## 常量

继承自 `AbstractStorage`（访问控制级别）：

| 常量 | 值 | 说明 |
|------|-----|------|
| `PRIVATE` | `private` | 私有，创作者与管理员具备全部权限 |
| `PUBLIC_READ` | `public-read` | 公有读，匿名用户可读，创作者与管理具备全部权限 |
| `PUBLIC_READ_WRITE` | `public-read-write` | 公有读写（不建议） |
| `AUTHENTICATED_READ` | `authenticated-read` | 认证用户可读，创作者与管理员具备全部权限 |
| `AUTHENTICATED_READ_WRITE` | `authenticated-read-write` | 认证用户全部权限（不建议） |

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$roleArn` | string | `null` | 获取 STS 凭证的角色 ARN |
| protected | `$policy` | array | `null` | 自定义权限策略，进一步限制 STS 临时凭证权限 |
| protected | `$SDKClient` | `OssClient` | `null` | OSS SDK 实例 |
| protected | `$bucket` | string | `null` | 存储桶名称（继承） |
| protected | `$region` | string | `null` | 地域（继承） |
| protected | `$secretId` | string | `null` | 访问密钥 ID（继承） |
| protected | `$secretKey` | string | `null` | 访问密钥（继承） |
| protected | `$stsClient` | `Sts` | `null` | STS 客户端（继承） |

## 构造

```php
__construct($secretId, $secretKey, $region, $bucket, $roleArn = null, $policy = null, $SignatureKey = "ruyi_storage", $RoutePrefix = "files", $BaseURL = F_BASE_URL)
```

- `$secretId`（string）：AccessKeyId
- `$secretKey`（string）：AccessKeySecret
- `$region`（string）：OSS 地域，如 `oss-cn-hangzhou`
- `$bucket`（string）：存储桶名称
- `$roleArn`（string，可选）：STS 角色 ARN
- `$policy`（array，可选）：STS 自定义策略
- `$SignatureKey`（string）：生成签名的密钥
- `$RoutePrefix`（string）：路由前缀，默认 `files`
- `$BaseURL`（string）：基础 URL

构造时调用 `parent::__construct`，平台名固定为 `oss`。

## 方法

### `loadSDK` — 初始化 SDK（protected）

```php
loadSDK()
```

初始化 OSS 与 STS SDK 客户端：
- endpoint 为 `oss-{region}.aliyuncs.com`
- STS 客户端 endpoint 为 `sts.{region}.aliyuncs.com`
- OSS 客户端使用 `AliyunOSSCredentialsProvider` 作为凭据提供器
- STS 客户端使用官方 `Sts` 客户端

### `uploadFile` — 上传文件

```php
uploadFile($file, $fileKey = null)
```

上传文件到 OSS。

**参数**

- `$file`：上传文件对象（`$_FILES` 结构）
- `$fileKey`（string）：文件键（对象 key）

**逻辑**

1. 校验请求授权 `verifyRequestAuth`。
2. 若启用了文件模型，读取文件记录校验 ACL。
3. 通过 `FileSystem::upload` 保存到临时目录，读取文件信息。
4. 使用 `SDKClient->uploadFile($bucket, $fileKey, $tempFilePath)` 上传到 OSS。
5. 删除本地临时文件，返回 `StorageFileInfoData` 数据对象。
6. 上传失败抛 `Exception`（500）。

### `deleteFile` — 删除文件

```php
deleteFile($fileKey)
```

- `$fileKey`（string）：文件键

先获取文件信息，若无则返回空成功；通过 `SDKClient->deleteObject` 删除 OSS 对象；若启用了文件模型则同步删除记录，返回 `true`。

### `getFile` — 获取文件信息

```php
getFile($fileKey)
```

- `$fileKey`（string）：文件键

读取文件模型记录（校验 owner/ACL）或远程文件信息，补充 key/url/previewURL/downloadURL/transfer 链接，返回 `StorageFileInfoData`。

### `getFileAuth` — 获取文件操作授权

```php
getFileAuth($FileKey = null, $Expires = 600, $URLParams = [], $Headers = [], $HTTPMethod = "get")
```

返回 STS 临时凭证（`getSTSToken` 结果）。

### `getFileSign` — 获取文件签名

```php
getFileSign($FileKey = null, $Expires = 600, $URLParams = [], $Headers = [], $HTTPMethod = "get")
```

返回 STS 临时凭证（与 `getFileAuth` 相同）。

### `getFileSignURL` — 生成签名 URL（protected）

```php
getFileSignURL($ObjectKey, $Expires = 60, $Options = [])
```

通过 `SDKClient->signUrl` 生成 OSS 签名访问 URL。

### `getFilePreviewURL` — 预览 URL

```php
getFilePreviewURL($fileKey, $URLParams = [], $Expires = 60)
```

返回签名预览 URL（走 `getFileSignURL`）。

### `getFileDownloadURL` — 下载 URL

```php
getFileDownloadURL($fileKey, $URLParams = [], $Expires = 60)
```

返回签名下载 URL（走 `getFileSignURL`）。

### `fileExist` — 判断文件是否存在

```php
fileExist($fileKey)
```

校验请求授权后，通过 `SDKClient->doesObjectExist($bucket, $fileKey)` 判断对象是否存在，返回布尔值。

### `getSTSToken` — 获取 STS 临时凭证

```php
getSTSToken($durationSeconds = 3000, $roleSessionName = "oss_session")
```

- `$durationSeconds`（int）：临时凭证有效期（秒），最小 900
- `$roleSessionName`（string）：角色会话名称

通过 STS 客户端 `assumeRoleWithOptions` 获取临时凭证，返回数组：

| 键 | 说明 |
|----|------|
| `AccessKeyId` | 临时 AccessKeyId |
| `AccessKeySecret` | 临时 AccessKeySecret |
| `Expiration` | 过期时间 |
| `SecurityToken` | 安全令牌 |
| `Bucket` | 存储桶名 |
| `Region` | 地域 |

## 使用

```php
use kernel\Platform\Aliyun\AliyunOSS\AliyunOSSStorage;
use kernel\Model\FilesModel;

$storage = (new AliyunOSSStorage(
  "your-access-key-id",
  "your-access-key-secret",
  "oss-cn-hangzhou",
  "my-bucket",
  "acs:ram::your-uid:role/oss-writer"
))
  ->enableFilesModel(new FilesModel())
  ->enableAuth();

$fileInfo = $storage->uploadFile($_FILES['file'], "images/2026/08/a.png");
$url = $storage->getFilePreviewURL("images/2026/08/a.png");
$sts = $storage->getSTSToken();
```
