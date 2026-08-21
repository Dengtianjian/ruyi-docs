# AliyunRequest — 阿里云 OpenAPI 请求封装

- **文件位置**: `kernel/Platform/Aliyun/AliyunRequest.php`
- **命名空间**: `kernel\Platform\Aliyun`
- **继承**: `extends Aliyun`
- **是否可继承**: 是

基于阿里云 OpenAPI 通用请求协议（RPC 风格）的请求封装，自动拼接公共参数、生成签名并通过 CURL 发送请求。适用于以 `Action + Version + 公共参数` 形式调用的阿里云服务。

## 继承属性

继承自 `Aliyun`：

| 可见性 | 名称 | 说明 |
|--------|------|------|
| protected | `$AppId` | AccessKeyId |
| protected | `$AppSecret` | AccessKeySecret |

## 方法

### `send` — 发送 API 请求

```php
send($url, $action, $params = [])
```

发起一次带签名的阿里云 OpenAPI 请求。

**参数**

- `$url`（string）：API 接口地址（完整 URL）
- `$action`（string）：操作名称（Action），如 `DescribeInstances`
- `$params`（array）：业务参数，默认 `[]`

**返回值**

- 返回 CURL GET 请求响应解码后的数据（`getData()` 结果，通常为 JSON 关联数组）

**逻辑摘要**

1. 创建 `AliyunSignature` 实例生成签名。
2. 将 `Action` 合并进业务参数。
3. 通过 `params()` 补充公共参数。
4. 用 `AliyunSignature::generate()` 生成 `Signature`。
5. 使用 `Curl` 发起 GET 请求并返回解码数据。

### `params` — 拼接公共参数（protected）

```php
params($params = [])
```

在业务参数基础上合并阿里云 RPC 调用所需的公共参数，返回合并后的完整参数数组。

**公共参数包括**

| 参数 | 值 | 说明 |
|------|-----|------|
| `Format` | `json` | 返回格式 |
| `Version` | `2019-12-30` | API 版本号 |
| `AccessKeyId` | `$this->AppId` | 访问密钥 ID |
| `SignatureVersion` | `1.0` | 签名算法版本 |
| `SignatureMethod` | `HMAC-SHA1` | 签名算法 |
| `SignatureNonce` | `uniqid()` | 随机数，防重放 |
| `Timestamp` | GMT 时间 | 请求时间戳（UTC，格式 `Y-m-d\TH:i:s\Z`） |

**注意**：此方法内部调用 `date_default_timezone_set("GMT")` 将时区临时设置为 GMT。

## 使用

```php
use kernel\Platform\Aliyun\AliyunRequest;

$request = new AliyunRequest("your-access-key-id", "your-access-key-secret");
$result = $request->send(
  "https://dysmsapi.aliyuncs.com",
  "SendSms",
  ["PhoneNumbers" => "13800000000", "SignName" => "测试", "TemplateCode" => "SMS_000000"]
);
```
