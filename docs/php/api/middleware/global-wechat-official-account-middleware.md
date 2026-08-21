# GlobalWechatOfficialAccountMiddleware — 微信公众号全局中间件

- **文件位置**: `kernel/Middleware/GlobalWechatOfficialAccountMiddleware.php`
- **命名空间**: `kernel\Middleware`
- **继承**: `extends Foundation\Middleware\MiddlewareBase`
- **是否可继承**: 是

微信公众号全局中间件。负责获取/缓存公众号 access_token 并写入全局 `_STORE`。

## 方法

| 方法 | 说明 |
|------|------|
| `handle($AppId, $AppSecret, $next)` | 获取并缓存稳定 access_token |

## 说明

- 通过 `AccessTokenModel` 缓存 token，过期自动重新获取
- 使用 `Platform\Wechat\AccessToken::getStableAccessToken()`
- 写入 `$GLOBALS['_STORE']['__App']['Wechat']['OfficialAccount']`（含 `AccessToken` / `AppId`）

## 使用

```php
use kernel\Middleware\GlobalWechatOfficialAccountMiddleware;

$middleware = new Middleware();
// 注册时传入 AppId / AppSecret 作为执行参数
$middleware->set(GlobalWechatOfficialAccountMiddleware::class, ["wx_appid", "wx_secret"]);
$app->set(["middleware" => $middleware]);
```
