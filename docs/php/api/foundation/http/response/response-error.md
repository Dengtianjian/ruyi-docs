# ResponseError — 错误响应

- **文件位置**: `kernel/Foundation/HTTP/Response/ResponseError.php`
- **命名空间**: `kernel\Foundation\HTTP\Response`
- **继承**: 继承 `kernel\Foundation\HTTP\Response`
- **是否可继承**: 是

错误响应对象，用于显式构建一个**错误态**的响应。构造即标记 `error = true`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$error` | `bool` | `true` | protected | 是否错误态（构造时置 `true`） |
| `$responseStatusCode` | `int` | — | protected | HTTP 状态码（构造传参） |
| `$responseData` | `mixed` | — | protected | 主体数据（构造传参 `$data`） |
| `$responseCode` | `int\|string` | — | protected | 响应码（构造传参 `$code`） |
| `$responseMessage` | `string` | — | protected | 响应信息（构造传参 `$message`） |
| `$responseDetails` | `mixed` | — | protected | 错误详情（仅状态码 `>299` 时保留） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($statusCode, $code, $message, $details, $data)` | 构造：构建错误响应 |

## 方法

### `__construct($statusCode, $code = 500, $message = "error", $details = [], $data = [])` — 构造错误响应

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | 无 | HTTP 状态码 |
| `$code` | `int\|string` | `500` | 响应码 |
| `$message` | `string` | `"error"` | 响应信息 |
| `$details` | `array` | `[]` | 响应详情（主要针对报错）；仅状态码 `>299` 时保留 |
| `$data` | `array` | `[]` | 主体数据 |

**返回值**

- 无。

**示例**

```php
return new ResponseError(401, 401000, "未登录", ["请先登录"]);
```
