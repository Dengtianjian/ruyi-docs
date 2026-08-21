# WechatPayV3 — 微信支付 V3

- **文件位置**: `kernel/Platform/Wechat/WechatPay/V3/WechatPayV3.php`
- **命名空间**: `kernel\Platform\Wechat\WechatPay\V3`
- **继承**: `extends WechatPay`

微信支付 V3 协议封装，使用 RSA 签名（SHA256withRSA）与 AES-256-GCM 回调解密。API 路径前缀 `v3/`。

## 构造

```php
new WechatPayV3($mchId, $appId, $serialNo, $privateKey, $platformCert, $apiV3Key, $notifyUrl = null)
```

- `$serialNo`：商户证书序列号
- `$privateKey`：商户 API 私钥
- `$platformCert`：微信支付平台证书
- `$apiV3Key`：API v3 密钥

## 方法

| 方法 | 说明 |
|------|------|
| `sign($message)` | 生成 RSA-SHA256 签名 |
| `verify($message, $signature)` | 验证平台签名 |
| `decryptResource($ciphertext, $nonce, $associatedData)` | AES-256-GCM 解密回调内容 |
| `request($method, $path, $data = [])` | 发送 v3 API 请求（自动签名+验签） |
| `notify()` | 解析 v3 支付回调 |

## 使用

```php
use kernel\Platform\Wechat\WechatPay\V3\WechatPayV3;

$pay = new WechatPayV3("mch_id", "wx_appid", "serial_no", $privateKey, $platformCert, "api_v3_key");
$res = $pay->request("POST", "/v3/pay/transactions/jsapi", $jsapiParams);
```
