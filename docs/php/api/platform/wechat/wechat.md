# Wechat — 微信平台基类

- **文件位置**: `kernel/Platform/Wechat/Wechat.php`
- **命名空间**: `kernel\Platform\Wechat`
- **继承**: `extends Foundation\Object\AbilityBaseObject`
- **是否可继承**: 是（小程序 / 公众号 / 支付共用的抽象基类）

微信平台基类，封装 CURL 请求、AccessToken 管理及 GET/POST 发送能力。子类通过配置 `$ApiUrl` 实现不同微信服务。统一使用 `https://api.weixin.qq.com` 作为 API 根地址。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($accessToken, $appId, $secret)` | 构造并创建 CURL 实例 |
| `setAccessToken($value)` | 设置 AccessToken（链式） |
| `get($uri, $query, $withAccessToken)` | 发送 GET 请求，可自动附加 `access_token` |
| `post($uri, $body, $query, $withAccessToken)` | 发送 POST 请求，可自动附加 `access_token` |
| `getJSONData()` | 将 CURL 响应数据 JSON 解码为关联数组 |

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$AppId` | `string` | `null` | protected | 微信小程序/公众号的 AppId |
| `$AppSecret` | `string` | `null` | protected | 微信 AppSecret |
| `$AccessToken` | `string` | `null` | protected | 访问 Token（接口调用凭证） |
| `$ApiUrl` | `string` | `"https://api.weixin.qq.com"` | protected | 微信 API 根地址 |
| `$CURL` | `Curl` | `null` | protected | CURL 请求实例 |

## 方法

### `__construct($accessToken = null, $appId = null, $secret = null)` — 构造微信基类

初始化 AppId、AppSecret、AccessToken，并创建一个 `Curl` 实例赋给 `$CURL`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$accessToken` | `string` | `null` | 访问 Token |
| `$appId` | `string` | `null` | 微信 AppId |
| `$secret` | `string` | `null` | 微信 AppSecret |

**返回值**

- `void`

### `setAccessToken($value)` — 设置 AccessToken

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | - | AccessToken 值 |

**返回值**

- `$this`：返回当前实例，支持链式调用。

### `get($uri, $query = [], $withAccessToken = true)` — 发送 GET 请求

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string` | - | 业务 URI，拼接在 `$ApiUrl` 之后 |
| `$query` | `array` | `[]` | query 参数；若 `$withAccessToken` 为真，会自动加入 `access_token` |
| `$withAccessToken` | `boolean` | `true` | 是否自动携带 AccessToken |

**返回值**

- `Curl`：请求对象，可链式调用获取响应数据。

**示例**

```php
$wechat->get("cgi-bin/user/info", ["openid" => "o_xxx"])->getJSONData();
```

### `post($uri, $body = [], $query = [], $withAccessToken = true)` — 发送 POST 请求

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string` | - | 业务 URI，拼接在 `$ApiUrl` 之后 |
| `$body` | `array` | `[]` | 请求体数据 |
| `$query` | `array` | `[]` | query 参数；若 `$withAccessToken` 为真，会自动加入 `access_token` |
| `$withAccessToken` | `boolean` | `true` | 是否自动携带 AccessToken |

**返回值**

- `Curl`：请求对象，可链式调用获取响应数据。

**示例**

```php
$wechat->post("cgi-bin/stable_token", ["appid" => $appId, "secret" => $secret])->getData();
```

### `getJSONData()` — 获取 JSON 格式响应数据

**参数**

无。

**返回值**

- `array`：将 CURL 响应数据经 `json_decode(..., true)` 解码后的关联数组。
