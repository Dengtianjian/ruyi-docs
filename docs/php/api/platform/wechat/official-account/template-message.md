# TemplateMessage — 公众号模板消息

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/TemplateMessage.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends WechatOfficialAccount`

公众号模板消息发送与账号模板管理。

## 构造

```php
new TemplateMessage($accessToken = null, $appId = null, $secret = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `send($openId, $templateId, $data, $url = null, $miniprogram = null)` | 发送模板消息（`cgi-bin/message/template/send`） |
| `setIndustry($industryId1, $industryId2)` | 设置行业（`cgi-bin/template/api_set_industry`） |
| `getIndustry()` | 获取行业 |
| `getAllPrivateTemplate()` | 获取所有模板列表 |
| `addTemplate($templateIdShort)` | 添加模板 |

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\TemplateMessage;

$tm = new TemplateMessage(null, "wx_appid", "wx_secret");
$tm->send("o_openid", "template_id", [
    "first" => ["value" => "订单支付成功"],
    "keyword1" => ["value" => "￥99.00"],
], "https://example.com");
```
