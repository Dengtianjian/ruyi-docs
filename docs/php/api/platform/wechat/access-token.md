# AccessToken — 微信 AccessToken 获取

- **文件位置**: `kernel/Platform/Wechat/AccessToken.php`
- **命名空间**: `kernel\Platform\Wechat`
- **继承**: `extends Wechat`
- **是否可继承**: 是

获取微信 API 调用凭证（access_token），包括普通凭证（`cgi-bin/token`）与稳定版凭证（`cgi-bin/stable_token`）。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `getAccessToken()` | 获取普通 access_token |
| `getStableAccessToken($forceRefresh)` | 获取稳定版接口调用凭证 |

## 属性

继承自 `Wechat` 的属性：`$AppId`、`$AppSecret`、`$AccessToken`、`$ApiUrl`、`$CURL`。构造时传入 `$appId`、`$secret` 后即可调用凭证获取方法。

## 方法

### `getAccessToken()` — 获取 access_token

调用 `cgi-bin/token` 接口，`grant_type=client_credential`，用 `$AppId` 与 `$AppSecret` 换取普通接口调用凭证。

**参数**

无。

**返回值**

- `array`：微信返回的凭证数据（含 `access_token`、`expires_in`）。

**示例**

```php
$token = new AccessToken(null, "wx_appid", "wx_secret");
$res = $token->getAccessToken();
// $res["access_token"]  /  $res["expires_in"]
```

### `getStableAccessToken($forceRefresh = false)` — 获取稳定版接口调用凭证

调用 `cgi-bin/stable_token` 接口获取稳定版凭证。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$forceRefresh` | `boolean` | `false` | 是否强制刷新（`true` 忽略缓存强制重新获取） |

**返回值**

- `array`：微信返回的稳定版凭证数据（含 `access_token`、`expires_in`）。

**示例**

```php
$token = new AccessToken(null, "wx_appid", "wx_secret");
$stable = $token->getStableAccessToken(true); // 强制刷新
```
