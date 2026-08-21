# WechatPayJSApi — 微信支付 JSAPI

- **文件位置**: `kernel/Platform/Wechat/WechatPay/V3/WechatPayJSApi.php`
- **命名空间**: `kernel\Platform\Wechat\WechatPay\V3`
- **继承**: `extends WechatPayV3`

微信支付 V3 JSAPI 支付，生成前端 `wx.requestPayment` 需要的支付参数。

## 构造

```php
new WechatPayJSApi($mchId, $appId, $serialNo, $privateKey, $platformCert, $apiV3Key, $notifyUrl = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `createJsApi($openId, $outTradeNo, $amount, $description, $attach = null, $timeExpire = null, $notifyUrl = null)` | 下单 JSAPI 支付 |
| `getRequestParams($prepayId)` | 生成前端 `wx.requestPayment` 参数（timeStamp/nonceStr/package/signType/paySign） |

## 使用

```php
use kernel\Platform\Wechat\WechatPay\V3\WechatPayJSApi;

$pay = new WechatPayJSApi("mch_id", "wx_appid", "serial_no", $privateKey, $platformCert, "api_v3_key");
$prepay = $pay->createJsApi("o_openid", "ORDER_123", 100, "测试商品");
$params = $pay->getRequestParams($prepay["prepay_id"]);
// 前端 wx.requestPayment($params)
```
