# User — 小程序用户登录

- **文件位置**: `kernel/Platform/Wechat/Miniprogram/User.php`
- **命名空间**: `kernel\Platform\Wechat\Miniprogram`
- **继承**: `extends WechatMiniProgram`
- **是否可继承**: 是

小程序用户登录（JSCode 换 Session）、绑定与注册。统一使用 `kernel\Foundation\Result` 返回结果。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `JSCode2Session($code)` | JSCode 换取 session |
| `bind($code)` | 登录后绑定微信用户到当前会员 |
| `register($code)` | 登录后注册新微信用户 |

## 属性

继承自 `Wechat`：`$AppId`、`$AppSecret`、`$AccessToken`、`$ApiUrl`、`$CURL`。

## 方法

### `JSCode2Session($code)` — JSCode 换取 session

调用 `sns/jscode2session` 接口，用 JSCode 换取 openid、unionid 等会话信息。内置错误码中文映射：`40029` 无效 Code、`45011` 频率限制、`40226` 高风险用户拦截、`40163` Code 已使用，其余错误按微信返回拼接。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$code` | `string` | - | 前端获取到的 JSCode |

**返回值**

- `Result`：成功时 `result()` 含 `openid`、`unionid` 等；失败时为错误态 `Result`。

**示例**

```php
$user = new User(null, "wx_appid", "wx_secret");
$result = $user->JSCode2Session($code);
if ($result->error) {
    return $result->return();
}
```

### `bind($code)` — 绑定微信用户到当前会员

先 `JSCode2Session` 换取 openid/unionid，成功后调用 `WechatUsersModel::bind()`，将当前登录会员（来自 `_STORE['__App.member']`）与微信用户绑定。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$code` | `string` | - | JSCode |

**返回值**

- `Result|bool`：登录失败返回错误态 `Result`，否则返回 `WechatUsersModel::bind()` 的布尔结果。

### `register($code)` — 注册新微信用户

先 `JSCode2Session` 换取 openid/unionid，成功后调用 `WechatUsersModel::register()` 注册新微信用户。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$code` | `string` | - | JSCode |

**返回值**

- `Result|bool`：登录失败返回错误态 `Result`，否则返回 `WechatUsersModel::register()` 的布尔结果。
