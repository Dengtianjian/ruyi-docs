# WechatPay — 微信支付基类

- **文件位置**: `kernel/Platform/Wechat/WechatPay/WechatPay.php`
- **命名空间**: `kernel\Platform\Wechat\WechatPay`
- **继承**: `extends Wechat`
- **是否可继承**: 是

微信支付基类，继承微信平台请求能力，作为 V2/V3 支付的公共父类。

## 说明

- 提供微信支付所需的商户号、证书、回调等基础配置继承
- 子类：`WechatPayV2`（v2 协议）、`WechatPayV3`（v3 协议）、`WechatPayJSApi`（JSAPI 支付）

## 构造

```php
new WechatPay($accessToken = null, $appId = null, $secret = null)
```

## 子类

| 类 | 说明 |
|----|------|
| `WechatPayV2` | 微信支付 V2 协议（XML 签名） |
| `WechatPayV3` | 微信支付 V3 协议（RSA 签名 + AES-GCM 解密） |
| `WechatPayJSApi` | JSAPI 支付 |
