# AliyunSignature — 阿里云 RPC 签名器

- **文件位置**: `kernel/Platform/Aliyun/AliyunSignature.php`
- **命名空间**: `kernel\Platform\Aliyun`
- **继承**: `extends Aliyun`
- **是否可继承**: 是

阿里云 OpenAPI 请求签名器，按阿里云 RPC 签名规范（HMAC-SHA1 + Base64）生成请求签名。

## 继承属性

继承自 `Aliyun`：

| 可见性 | 名称 | 说明 |
|--------|------|------|
| protected | `$AppId` | AccessKeyId |
| protected | `$AppSecret` | AccessKeySecret |

## 方法

### `generate` — 生成签名

```php
generate($parameters = [], $method = "GET")
```

根据参数集与请求方法生成签名串。

**参数**

- `$parameters`（array）：参与签名的请求参数（含公共参数），默认 `[]`
- `$method`（string）：HTTP 请求方法，默认 `GET`

**返回值**

- 返回 base64 编码的 HMAC-SHA1 签名串（string）

**签名算法**

1. 将参数按键名升序排序（`ksort`）。
2. 对每个键值对做 `percentEncode`，以 `&` 拼接成规范化查询串。
3. 构造待签字符串：`$method . '&%2F&' . percentEncode(规范化查询串)`。
4. 使用密钥 `$AppSecret . '&'` 对待签字符串做 HMAC-SHA1，结果 base64 编码。

### `percentEncode` — 百分号编码（private）

```php
percentEncode($value = null)
```

阿里云规范的 URL 编码：对值做 `urlencode` 后，将 `+` 转回 `%20`、`*` 转 `%2A`、`%7E` 还原为 `~`。

## 使用

```php
use kernel\Platform\Aliyun\AliyunSignature;

$signature = new AliyunSignature("your-access-key-id", "your-access-key-secret");
$sign = $signature->generate([
  "Format" => "json",
  "AccessKeyId" => "your-access-key-id",
  "Action" => "SendSms",
  "Timestamp" => "2026-08-21T03:00:00Z",
  "SignatureMethod" => "HMAC-SHA1",
]);
// 将 $sign 赋值给参数中的 Signature
```

通常不直接使用本类，而是通过 `AliyunRequest::send()` 自动完成签名。
