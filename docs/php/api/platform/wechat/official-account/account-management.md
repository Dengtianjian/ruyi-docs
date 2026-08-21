# AccountManagement — 公众号账号管理

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/AccountManagement.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends WechatOfficialAccount`

公众号账号管理，生成带参数的二维码及换取二维码图片。

## 构造

```php
new AccountManagement($accessToken = null, $appId = null, $secret = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `generatingParametricQRCode($sceneId = null, $sceneStr = null, $expireSeconds = 60, $actionName = "QR_SCENE")` | 生成带参数二维码（`cgi-bin/qrcode/create`）。`$actionName`：QR_SCENE（临时整型）/QR_STR_SCENE（临时字符串）/QR_LIMIT_SCENE（永久整型）/QR_LIMIT_STR_SCENE（永久字符串） |
| `showQRCode($ticket)` | 通过 ticket 换取二维码图片 |

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\AccountManagement;

$am = new AccountManagement(null, "wx_appid", "wx_secret");
$res = $am->generatingParametricQRCode(100, null, 60, "QR_SCENE");
$ticket = $res["ticket"] ?? null;
$qrImage = $am->showQRCode($ticket);
```
