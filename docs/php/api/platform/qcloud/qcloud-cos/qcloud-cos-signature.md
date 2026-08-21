# QCloudCosSignture — 腾讯云 COS 签名器

- **文件位置**: `kernel/Platform/QCloud/QCloudCos/QCloudCosSignture.php`
- **命名空间**: `kernel\Platform\QCloud\QCloudCos`
- **继承**: `extends QCloud`
- **是否可继承**: 是

腾讯云 COS 请求签名器，按 COS 签名规范（HMAC-SHA1）生成授权信息，用于生成带签名的访问链接或请求授权。注意类名拼写为 `QCloudCosSignture`（官方拼写 `Signature` 少个 a）。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$SignHost` | boolean | `false` | 是否在签名中携带 Host |
| protected | `$SignHeader` | array | 见下 | 允许参与签名的头部键名列表 |

`$SignHeader` 包含常见的 COS 请求头：`cache-control`、`content-*`、`host`、`if-*`、`origin`、`range`、`response-*`、`transfer-encoding`、`versionid` 等。

## 构造

```php
__construct($SecretId, $SecretKey, $Region, $Bucket, $host = null, $SecurityToken = null)
```

- `$SecretId` / `$SecretKey`：云 API 密钥
- `$Region`（string）：地域
- `$Bucket`（string）：存储桶
- `$host`（string，可选）：自定义 host；传入后开启 `SignHost`
- `$SecurityToken`（string，可选）：安全令牌

## 方法

### `createAuthorization` — 制作授权信息

```php
createAuthorization($objectName, $URLParams = [], $Headers = [], $Expires = 1800, $HTTPMethod = "get")
```

- `$objectName`（string）：对象路径，以 `/` 开头
- `$URLParams`（array）：请求的 URL 参数
- `$Headers`（array）：请求头部
- `$Expires`（int）：签名有效期（秒），默认 1800
- `$HTTPMethod`（string）：请求方式，默认 `get`

返回授权信息数组（`q-sign-*` 系列参数），通常拼接到 COS 对象 URL 的 query 上：

| 键 | 说明 |
|----|------|
| `q-sign-algorithm` | 签名算法 `sha1` |
| `q-ak` | SecretId |
| `q-sign-time` | 签名时间范围 `start;end` |
| `q-key-time` | 密钥时间范围 |
| `q-header-list` | 参与签名的头部键 |
| `q-signature` | 签名值 |
| `q-url-param-list` | 参与签名的 URL 参数键 |
| `x-cos-security-token` | 安全令牌（设置了 token 时） |

## 使用

```php
use kernel\Platform\QCloud\QCloudCos\QCloudCosSignture;

$signature = new QCloudCosSignture("SecretId", "SecretKey", "ap-guangzhou", "test-125000000");
$auth = $signature->createAuthorization("/path/to/file.jpg", [], [], 1800, "get");

$url = "https://test-125000000.cos.ap-guangzhou.myqcloud.com/path/to/file.jpg?" . http_build_query($auth);
```
