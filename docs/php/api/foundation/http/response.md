# Response — 响应对象

- **文件位置**: `kernel/Foundation/HTTP/Response.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **是否可继承**: 是（`Result` / `ControllerResponse` 等均继承）

HTTP 响应对象，支持 JSON / XML / Text / HTML 输出、响应头设置、重定向、响应拦截回调，以及成功 / 错误 / 空响应封装。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$error` | `bool` | `false` | public | 是否失败响应，`error()` 时置 `true` |
| `$responseHeaders` | `array` | `[]` | protected | 待输出的响应头列表（每项含 key / value / replace） |
| `$responseData` | `mixed` | `[]` | protected | 响应主体数据 |
| `$responseStatusCode` | `int` | `200` | protected | HTTP 状态码 |
| `$responseCode` | `int` | `200` | protected | 业务响应码 |
| `$responseMessage` | `string` | `"ok"` | protected | 响应信息 |
| `$responseDetails` | `mixed` | `null` | protected | 响应错误详情，主要用于开发模式 |
| `$responseAddBody` | `array` | `[]` | protected | 增加到响应主体的附加字段 |
| `$responseResetBody` | `mixed` | `[]` | protected | 重置响应主体的数据（覆盖整个主体） |
| `$outputType` | `string\|null` | `NULL` | protected | 输出格式，取值 `json` / `text` / `xml` / `html` |
| `$formatOutputTypeOfText` | `bool` | `false` | protected | 输出为 text 格式时是否需要格式化 |
| `$interactions`（static） | `array` | `[]` | protected | 响应拦截回调池，键为 `list` / `error` / `success` / `statusCodes` / `errorCodes` / `mixCodes` |

## 方法速查

| 方法 | 作用 |
|------|------|
| `__construct($data, $statusCode, $code, $message, $details)` | 构建响应 |
| `interaction($callback, $statusCode, $errorCode, $responseType)`（static） | 注册响应拦截回调 |
| `header($key, $value, $replace)` | 设置响应头 |
| `null($statusCode)` | 空响应 |
| `error($statusCode, $code, $message, $details, $data)` | 错误响应 |
| `success($data, $statusCode, $code, $message)` | 成功响应 |
| `statusCode($statusCode)` | 设置 / 获取状态码 |
| `setBody($body)` | 覆盖整个输出主体 |
| `addBody($responseBody, $cover)` | 向主体追加字段 |
| `addData($data, $cover)` | 追加合并主体数据 |
| `setData($data)` | 设置主体数据 |
| `json()` / `xml()` / `text($format)` / `html()` | 设置输出格式 |
| `redirect($url, $statusCode)` | 重定向 |
| `getBody()` | 获取组合后的输出主体 |
| `getData()` | 获取主体数据 |
| `interactionOutput()`（protected） | 执行所有已注册的拦截回调 |
| `output()` | 实际输出并结束程序 |
| `outputType()` | 获取当前输出格式 |

## 方法

### `__construct($data = null, $statusCode = 200, $code = 200, $message = "ok", $details = [])` — 构建响应

> 一次性设置状态码、数据、响应码、信息与详情；`$statusCode > 299` 时 `$details` 作为错误详情，否则忽略。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | `null` | 响应数据 |
| `$statusCode` | `int` | `200` | HTTP 状态码 |
| `$code` | `int` | `200` | 业务响应码 |
| `$message` | `string` | `"ok"` | 响应信息 |
| `$details` | `array` | `[]` | 响应详情，主要针对报错 |

**返回值**

- 无。

**示例**

```php
$r = new Response(["id" => 1], 200, 200, "ok");
```

### `Response::interaction($callback, $statusCode = null, $errorCode = null, $responseType = null)` — 注册响应拦截回调

> 静态方法，返回 `self::class`。回调在 `output()` 时执行，可绑定状态码、错误码或成功 / 失败类型筛选。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `\Closure` | 无 | 回调函数，接收一个参数（当前响应对象） |
| `$statusCode` | `int` | `null` | 状态码，响应状态码等于该值时执行 |
| `$errorCode` | `int\|string` | `null` | 错误码，响应错误码等于该值时执行 |
| `$responseType` | `string\|int` | `null` | 成功 / 失败类型：`success` 或 `error`，`1` 代表成功、`0` 代表失败 |

> 同时传状态码和错误码时，需两者都匹配才执行；都不传时只要响应就执行。

**返回值**

- `string`：返回 `self::class`（`Response` 类名），便于链式静态调用。

**示例**

```php
Response::interaction(function ($response) {
    Log::write("HTTP " . $response->statusCode());
}, 404);
```

### `header($key, $value, $replace = true)` — 设置响应头

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 响应头键 |
| `$value` | `string` | 无 | 响应头值 |
| `$replace` | `bool` | `true` | 是否替换同名响应头 |

**返回值**

- `Response`：返回 `$this`。

**示例**

```php
$response->header("X-Custom", "value", true);
```

### `null($statusCode = 200)` — 空响应

> 清空数据与详情，响应码取状态码，信息依状态码为 `error` 或 `ok`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | `200` | HTTP 状态码 |

**返回值**

- `Response`：返回 `$this`。

**示例**

```php
$response->null(204);
```

### `error($statusCode, $code = 500, $message = "error", $details = [], $data = [])` — 错误响应

> 将 `$error` 置 `true`；`$statusCode > 299` 时 `$details` 作为错误详情。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | 无 | HTTP 状态码 |
| `$code` | `int\|string` | `500` | 业务响应码 |
| `$message` | `string` | `"error"` | 响应信息 |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 主体数据 |

**返回值**

- `Response`：返回 `$this`。

**示例**

```php
$response->error(404, 40400, "资源不存在", ["path" => $path]);
```

### `success($data, $statusCode = 200, $code = 200, $message = "ok")` — 成功响应

> 清空错误详情。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 主体数据 |
| `$statusCode` | `int` | `200` | HTTP 状态码 |
| `$code` | `int\|string` | `200` | 业务响应码 |
| `$message` | `string` | `"ok"` | 响应信息 |

**返回值**

- `Response`：返回 `$this`。

**示例**

```php
$response->success(["id" => 1], 200, 200, "ok");
```

### `statusCode($statusCode = null)` — 设置 / 获取状态码

> 传参则设置状态码并返回 `$this`，不传则返回当前状态码。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | `null` | HTTP 状态码，为 `null` 时表示获取 |

**返回值**

- `int\|Response`：未传参返回当前状态码；传参返回 `$this`。

**示例**

```php
$code = $response->statusCode();      // 获取
$response->statusCode(200);           // 设置
```

### `setBody($body)` — 设置主体

> 直接覆盖整个输出主体，输出时不再组合默认结构。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `mixed` | 无 | 输出时直接输出的值 |

**返回值**

- `Response`：返回 `$this`。

### `addBody($responseBody, $cover = false)` — 添加数据到主体

> 非覆盖模式下会自动移除 `data` 键并与已有附加字段合并。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$responseBody` | `array` | 无 | 附加到主体的字段，最好是关联数组 |
| `$cover` | `bool` | `false` | 是否覆盖已有的附加字段 |

**返回值**

- `Response`：返回 `$this`。

**示例**

```php
$response->addBody(["timestamp" => time()]);
```

### `addData($data, $cover = false)` — 添加合并数据到主体数据

> 数组则合并；字符串 / 数字则拼接；`$cover` 或原数据为 `null` 时直接替换。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 追加的数据 |
| `$cover` | `bool` | `false` | 是否覆盖已有主体数据 |

**返回值**

- `Response`：返回 `$this`。

### `setData($data)` — 设置主体数据

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 主体数据 |

**返回值**

- `Response`：返回 `$this`。

### `json()` — 输出为 json 格式

**参数**

无。

**返回值**

- `Response`：返回 `$this`。

### `xml()` — 输出为 xml 格式

**参数**

无。

**返回值**

- `Response`：返回 `$this`。

### `text($format = false)` — 输出为文本格式

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$format` | `bool` | `false` | 是否格式化输出（`Output::format()`） |

**返回值**

- `Response`：返回 `$this`。

### `html()` — 输出为超文本格式

**参数**

无。

**返回值**

- `Response`：返回 `$this`。

### `redirect($url, $statusCode = 301)` — 重定向

> 设置 `Location` 响应头（替换）并写入状态码。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$url` | `string` | 无 | 重定向目标 URL |
| `$statusCode` | `int` | `301` | HTTP 状态码 |

**返回值**

- `Response`：返回 `$this`。

**示例**

```php
$response->redirect("https://example.com", 302)->output();
```

### `getBody()` — 获取输出的主体

> 返回 `statusCode` / `code` / `data` / `message` / `details` 与附加字段的合并结果；非数组附加字段时直接返回。

**参数**

无。

**返回值**

- `array|mixed`：组合后的响应主体。

### `getData()` — 获取输出的主体数据

**参数**

无。

**返回值**

- `mixed`：主体数据。

### `interactionOutput()`（protected）— 执行拦截回调

> 依次执行无条件回调、成功（2xx）回调、失败（>399）回调、按状态码 / 错误码 / 两者同时匹配的回调。

**参数**

无。

**返回值**

- 无。

### `output()` — 输出内容

> 先执行拦截回调，再输出响应头、设置 `http_response_code`，依据输出格式（或 `Accept` 头推导）输出主体并结束程序。

**参数**

无。

**返回值**

- 无。

### `outputType()` — 获取当前输出格式

**参数**

无。

**返回值**

- `string|null`：当前设置的输出格式。

## 派生响应类

`Response` 的常用派生类：

- [ResponseRedirect](response/response-redirect.md) — 重定向响应（Laravel 风格，`to`/`route`/`away`/`secure`/`back`/`with`）
- [ResponseView](response/response-view.md) — 视图响应（PHP 模板渲染）
- [ResponseDownload](response/response-download.md) — 文件下载响应（支持 Range 分片）
- [ResponseFile](response/response-file.md) — 文件预览响应（含图片缩略图）
- [ResponsePagination](response/response-pagination.md) — 分页列表响应
- [ResponseError](response/response-error.md) — 错误响应

## 示例

```php
$response = new Response();
$response->success(["id" => 1], 200, 200, "ok")
         ->header("X-Custom", "value")
         ->json()
         ->output();
```
