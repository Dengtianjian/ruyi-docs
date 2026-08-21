# WechatPayV2 — 微信支付 V2

- **文件位置**: `kernel/Platform/Wechat/WechatPay/WechatPayV2.php`
- **命名空间**: `kernel\Platform\Wechat\WechatPay`
- **继承**: `extends WechatPay`

微信支付 V2 协议封装，使用 XML + MD5/HMAC-SHA256 签名。涵盖统一下单、JSAPI、扫码、退款、查询、回调等。

## 构造

```php
new WechatPayV2($mchId, $mchKey, $appId, $appSecret, $notifyUrl = null, $sslCert = null, $sslKey = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `unifiedOrder($params)` | 统一下单（`pay/unifiedorder`） |
| `createJsApi($params)` | JSAPI 下单，返回前端支付参数（`getBrandWCPayRequest`） |
| `createNative($params)` | 扫码支付下单（返回 code_url） |
| `createApp($params)` | App 支付下单 |
| `refund($params)` | 退款（需证书） |
| `queryOrder($params)` | 查询订单（`pay/orderquery`） |
| `closeOrder($params)` | 关闭订单 |
| `downloadBill($params)` | 下载对账单 |
| `notify()` | 解析支付回调，返回通知结果 |
| `verifySign($data)` | 校验回调签名 |

## 使用

```php
use kernel\Platform\Wechat\WechatPay\WechatPayV2;

$pay = new WechatPayV2("mch_id", "mch_key", "wx_appid", "wx_secret");
$jsParams = $pay->createJsApi([
    "out_trade_no" => "ORDER_123",
    "total_fee"    => 1,        // 单位分
    "body"         => "测试商品",
]);
```
