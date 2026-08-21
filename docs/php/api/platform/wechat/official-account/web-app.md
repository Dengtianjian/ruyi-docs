# WebApp — 公众号网页授权

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/WebApp.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends WechatOfficialAccount`

公众号网页授权（OAuth2.0），用于获取用户 openid 与用户信息。

## 构造

```php
new WebApp($accessToken = null, $appId = null, $secret = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `getAuthorizeUrl($redirectUri, $state = null, $scope = "snsapi_base")` | 生成授权跳转 URL（`snsapi_base` 静默 / `snsapi_userinfo` 弹窗） |
| `getAccessTokenByCode($code)` | 用 code 换取网页授权 access_token（`sns/oauth2/access_token`） |
| `refreshAccessToken($refreshToken)` | 刷新网页授权 token |
| `getUserInfo($accessToken, $openId, $lang = "zh_CN")` | 获取用户信息（snsapi_userinfo 授权） |

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\WebApp;

$web = new WebApp(null, "wx_appid", "wx_secret");
$url = $web->getAuthorizeUrl("https://example.com/callback", "state_1", "snsapi_userinfo");
// 跳转 $url，回调携带 code
$token = $web->getAccessTokenByCode($_GET["code"]);
$userInfo = $web->getUserInfo($token["access_token"], $token["openid"]);
```
