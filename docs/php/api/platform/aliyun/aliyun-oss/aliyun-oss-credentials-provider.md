# AliyunOSSCredentialsProvider — 阿里云 OSS 凭据提供器

- **文件位置**: `kernel/Platform/Aliyun/AliyunOSS/AliyunOSSCredentialsProvider.php`
- **命名空间**: `kernel\Platform\Aliyun\AliyunOSS`
- **继承**: 无
- **实现接口**: `OSS\Credentials\CredentialsProvider`
- **是否可继承**: 是

阿里云 OSS SDK 的凭据提供器，实现官方 `CredentialsProvider` 接口，为 `OssClient` 提供访问凭据（AccessKey + Token）。用于在初始化 OSS 客户端时指定凭据来源。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$accessKeyId` | string | `null` | AccessKeyId |
| protected | `$accessKeySecret` | string | `null` | AccessKeySecret |
| protected | `$token` | string | `null` | 临时安全令牌（STS Token） |

## 构造

```php
__construct($AccessKeyId, $AccessKeySecret, $Token = null)
```

- `$AccessKeyId`（string）：AccessKeyId
- `$AccessKeySecret`（string）：AccessKeySecret
- `$Token`（string，可选）：临时安全令牌（STS 场景传入）

## 方法

### `getCredentials` — 获取凭据

```php
getCredentials()
```

返回 `OSS\Credentials\Credentials` 实例，携带 `accessKeyId`、`accessKeySecret`、`token`。

**抛异常**：`OssException`

## 使用

通常无需手动实例化，`AliyunOSSStorage::loadSDK()` 内部会用它初始化 OSS 客户端：

```php
use kernel\Platform\Aliyun\AliyunOSS\AliyunOSSCredentialsProvider;
use OSS\OssClient;

$provider = new AliyunOSSCredentialsProvider("id", "secret");
$client = new OssClient(["provider" => $provider, "endpoint" => "oss-cn-hangzhou.aliyuncs.com"]);
```
