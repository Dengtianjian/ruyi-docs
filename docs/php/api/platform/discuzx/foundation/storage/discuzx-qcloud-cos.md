# DiscuzXQCloudCOS — Discuz!X 腾讯云 COS 请求客户端

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Storage/QCloud/DiscuzXQCloudCOS.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Storage\QCloud`
- **继承**: `extends QCloud`
- **是否可继承**: 是

适用于 Discuz!X 的腾讯云 COS 请求客户端。因 Discuz!X 环境不便安装腾讯云 COS SDK，故直接基于 `QCloud` 基类发送 HTTP 请求到腾讯云处理，并提供对象签名、存在性判断、删除等基础能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$secretId` | string | `null` | 密钥 ID |
| protected | `$secretKey` | string | `null` | 密钥 |
| protected | `$region` | string | `null` | 存储桶地域 |
| protected | `$bucket` | string | `null` | 存储桶名称 |
| protected | `$signatureInstance` | `QCloudCosSignture` | `null` | COS 签名器实例 |

## 构造

```php
public function __construct($secretId, $secretKey, $region, $bucket)
```

- `$secretId` / `$secretKey`：腾讯云密钥
- `$region`（string）：存储桶地域
- `$bucket`（string）：存储桶名称

**逻辑**

1. 计算 host：`http://{bucket}.cos.{region}.myqcloud.com`。
2. 调用 `parent::__construct($secretId, $secretKey, null, $host)`（`Service=null`，`Host` 为 COS 域名）。
3. 保存 region/bucket，创建 `QCloudCosSignture` 签名器实例。

## 方法

### `getObjectSign` — 获取对象签名

```php
public function getObjectSign($fileKey = null, $Expires = 1800, $HTTPMethod = "get", $URLParams = [], $Headers = [])
```

- `$fileKey`（string）：对象名称；不以 `/` 开头时自动补 `/`
- `$Expires`（int）：有效期（秒），默认 1800
- `$HTTPMethod`（string）：请求方法，默认 `get`
- `$URLParams` / `$Headers`（array）：URL 参数 / 请求头

委托 `$signatureInstance->createAuthorization()` 返回签名参数数组。

### `doesObjectExist` — 判断对象是否存在

```php
public function doesObjectExist($objectName)
```

- `$objectName`（string）：对象名称

发送 `HEAD` 请求 `{host}/{objectName}`（签名有效期 300 秒），关闭 HTTPS 校验、超时 5 秒。CURL 出错返回 `break(500)`；否则返回 `statusCode() === 200`。

### `deleteObject` — 删除对象

```php
public function deleteObject($objectName)
```

- `$objectName`（string）：对象名称

发送 `DELETE` 请求 `{host}/{objectName}`（签名有效期 300 秒）。CURL 出错返回 `break(500)`；状态码非 `204` 返回 `break(statusCode, "code:Code", Message, response)`；成功返回 `true`。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Storage\QCloud\DiscuzXQCloudCOS;

$cos = new DiscuzXQCloudCOS("SecretId", "SecretKey", "ap-guangzhou", "test-125000000");

$sign = $cos->getObjectSign("/path/file.jpg", 1800, "get");
if ($cos->doesObjectExist("/path/file.jpg")) {
  $cos->deleteObject("/path/file.jpg");
}
```
