# Curl — HTTP 请求封装

- **文件位置**: `kernel/Foundation/HTTP/Curl.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **是否可继承**: 是

对 PHP cURL 的二次封装。通过 `Curl::init()` 实例化后**链式调用**配置并发送请求，自动处理 JSON/XML 编解码、请求头、Cookie、代理、SSL、文件上传等。发送方法（`get()`/`post()`/`put()`/`file()`…）在调用时即发送请求并返回实例，随后通过 `getData()` / `statusCode()` / `responseHeaders()` / `error()` / `errorNo()` 读取结果。

**特性**：
- `isJson` 默认开启：请求体自动 `json_encode`，响应按 `Content-Type` 自动解析 JSON / XML。
- 方法即发送：`get()`/`post()` 等在完成配置后立即 `send()`。
- 请求数据通过 `data()` **累计合并**；`post($body)` 传参则**整体替换**。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$curlInstance` | `\CurlHandle\|null` | `null` | private | cURL 句柄 |
| `$requestUrl` | `string\|null` | `null` | private | 请求地址 |
| `$curlOptions` | `array` | `[]` | private | 附加 cURL 选项（键为 `CURLOPT_*` 常量值） |
| `$curlHeaders` | `array` | `[]` | private | 请求头（键值对） |
| `$curlDatas` | `array` | `[]` | private | POST 字段数据（请求体） |
| `$curlMethod` | `string` | `"get"` | private | 请求方法（`get`/`post`/`put`/`patch`/`delete`/`head`/`connect`/`file`） |
| `$curlTimeout` | `int` | `60` | private | 超时秒数 |
| `$isJson` | `bool` | `true` | private | 是否 JSON 请求/响应 |
| `$curlCookie` | `array` | `[]` | private | Cookie 数据 |
| `$uploadFile` | `array` | `[]` | private | 上传文件数组 |
| `$bypasSSLVerification` | `bool` | `false` | private | 是否绕过 SSL 验证 |
| `$SSLCERTType` | `string` | `"PEM"` | private | SSL 证书类型 |
| `$SSLCERTFilePath` | `string\|null` | `null` | private | SSL 证书文件路径 |
| `$SSLKeyType` | `string` | `"PEM"` | private | SSL 密钥类型 |
| `$SSLKeyFilePath` | `string\|null` | `null` | private | SSL 密钥文件路径 |
| `$responseData` | `mixed` | `null` | private | 响应数据 |
| `$curlErrorMsg` | `string\|null` | `null` | private | cURL 错误信息 |
| `$curlErrorNo` | `int\|null` | `null` | private | cURL 错误码 |
| `$responseHeadersData` | `array\|null` | `null` | private | 响应头 |
| `$responseStatusCode` | `int` | `200` | private | 响应状态码 |
| `$proxy` | `array` | `["open"=>false,"url"=>"","port"=>"","username"=>"","password"=>""]` | private | 代理配置 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `Curl::init()` | 实例化 Curl |
| `url($url, $query)` | 设置请求 URL 与 query |
| `json($yes)` | 设置 JSON 模式 |
| `options($options)` | 设置 cURL 选项 |
| `headers($params)` | 设置请求头 |
| `buildHeaders($params)` | 关联数组转请求头字符串 |
| `data($datas)` | 累计合并请求数据 |
| `get()` | 发送 GET 请求 |
| `post($body)` | 发送 POST 请求 |
| `put()` | 发送 PUT 请求 |
| `patch()` | 发送 PATCH 请求 |
| `delete()` | 发送 DELETE 请求 |
| `head()` | 发送 HEAD 请求 |
| `connect()` | 发送 CONNECT 请求 |
| `file($fileNames, $postName, $mime)` | 上传文件 |
| `timeout($seconds)` | 设置超时 |
| `proxy($url, $port, $username, $password)` | 设置代理 |
| `https($yes)` | 设置 HTTPS 验证 |
| `SSLCert($filePath, $type)` | 设置 SSL 证书 |
| `SSLKey($filePath, $type)` | 设置 SSL 密钥 |
| `cookie($datas)` | 设置 Cookie |
| `buildCookie($datas)` | 关联数组转 Cookie 字符串 |
| `send()` | 发送请求（内部） |
| `pause()` | 暂停请求 |
| `error()` | 获取错误信息 |
| `errorNo()` | 获取错误码 |
| `getData()` | 获取响应数据 |
| `statusCode()` | 获取响应状态码 |
| `responseHeaders()` | 获取响应头 |

## 方法

### `Curl::init()` — 实例化 Curl

**参数**

- 无。

**返回值**

- `Curl`：新实例。

### `url($url, $query = [])` — 设置请求 URL

自动把 `$query` 用 `http_build_query` 拼接到 URL 后。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$url` | `string` | 无 | 请求 URL |
| `$query` | `array` | `[]` | query 参数（键值对） |

**返回值**

- `$this`：支持链式调用。

### `json($yes = true)` — 设置 JSON 模式

`true`：请求体 JSON 编码，响应按 JSON 解析；`false`：不 JSON 处理。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | `true` | 是否 JSON 模式 |

**返回值**

- `$this`：支持链式调用。

### `options($options)` — 设置 cURL 选项

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$options` | `array` | 无 | 选项与选项值，键为 `CURLOPT_*` 常量值（如 `[CURLOPT_FOLLOWLOCATION => true]`） |

**返回值**

- `$this`：支持链式调用。

### `headers($params)` — 设置请求头

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 请求头键值对（如 `["X-Token" => "abc"]`） |

**返回值**

- `$this`：支持链式调用。

### `buildHeaders($params)` — 关联数组转请求头

把 `["Key" => "value"]` 转为 `["Key: value"]` 列表；索引数组原样返回。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 请求头参数 |

**返回值**

- `string[]`：请求头字符串数组。

### `data($datas)` — 累计合并请求数据

多次调用会**合并**键值对到请求体。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | 请求数据（键值对） |

**返回值**

- `$this`：支持链式调用。

### `get()` — 发送 GET 请求

发送后返回实例，经 `getData()` 读取结果。

**参数**

- 无。

**返回值**

- `$this`：当前实例（已发送）。

### `post($body = null)` — 发送 POST 请求

传 `$body` 时**整体替换**请求数据；不传沿用 `data()` 累计的数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `array\|null` | `null` | 请求体（整体替换） |

**返回值**

- `$this`：当前实例（已发送）。

### `put()` — 发送 PUT 请求

**参数**

- 无。

**返回值**

- `$this`：当前实例（已发送）。

### `patch()` — 发送 PATCH 请求

**参数**

- 无。

**返回值**

- `$this`：当前实例（已发送）。

### `delete()` — 发送 DELETE 请求

**参数**

- 无。

**返回值**

- `$this`：当前实例（已发送）。

### `head()` — 发送 HEAD 请求

**参数**

- 无。

**返回值**

- `$this`：当前实例（已发送）。

### `connect()` — 发送 CONNECT 请求

**参数**

- 无。

**返回值**

- `$this`：当前实例（已发送）。

### `file($fileNames, $postName = "", $mime = "")` — 上传文件

支持单文件路径、文件名索引数组、`[filename => postName]` 关联数组、`[filename => [postName, mime]]` 数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileNames` | `string\|array` | 无 | 文件路径，或文件名数组/映射 |
| `$postName` | `string` | `""` | 上传字段名（默认取文件 `name`） |
| `$mime` | `string` | `""` | 文件 MIME（默认 `application/octet-stream`） |

**返回值**

- `$this`：当前实例（已发送）。

### `timeout($seconds)` — 设置超时

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seconds` | `int` | 无 | 超时秒数 |

**返回值**

- `$this`：支持链式调用。

### `proxy($url, $port, $username = "", $password = "")` — 设置代理

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$url` | `string` | 无 | 代理地址 |
| `$port` | `int` | 无 | 代理端口 |
| `$username` | `string` | `""` | 代理用户名 |
| `$password` | `string` | `""` | 代理密码 |

**返回值**

- `$this`：支持链式调用。

### `https($yes = true)` — 设置 HTTPS 验证

`true` 验证 HTTPS，`false` 绕过 SSL 验证。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | `true` | 是否验证 HTTPS |

**返回值**

- `$this`：支持链式调用。

### `SSLCert($filePath, $type = "PEM")` — 设置 SSL 证书

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 证书文件路径 |
| `$type` | `string` | `"PEM"` | 证书类型 |

**返回值**

- `$this`：支持链式调用。

### `SSLKey($filePath, $type = "PEM")` — 设置 SSL 密钥

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 密钥文件路径 |
| `$type` | `string` | `"PEM"` | 密钥类型 |

**返回值**

- `$this`：支持链式调用。

### `cookie($datas)` — 设置 Cookie

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | Cookie 键值对 |

**返回值**

- `$this`：支持链式调用。

### `buildCookie($datas)` — 关联数组转 Cookie 字符串

`["a"=>1]` → `"a=1"`，多项用 `; ` 连接。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | Cookie 数据 |

**返回值**

- `string`：Cookie 字符串。

### `send()` — 发送请求

> 内部方法，由各 HTTP 方法触发。组装 cURL 选项并执行，解析响应头、状态码、响应体（JSON/XML）。

**参数**

- 无。

**返回值**

- `$this`：当前实例。

### `pause()` — 暂停请求

**参数**

- 无。

**返回值**

- `int`：`curl_pause` 结果（`CURLE_OK`）。

### `error()` — 获取错误信息

**参数**

- 无。

**返回值**

- `string|null`：错误信息；无错误为 `null`。

### `errorNo()` — 获取错误码

**参数**

- 无。

**返回值**

- `int|null`：错误码；无错误为 `null`。

### `getData()` — 获取响应数据

**参数**

- 无。

**返回值**

- `mixed`：响应数据（数组/字符串/布尔等）。

### `statusCode()` — 获取响应状态码

**参数**

- 无。

**返回值**

- `int`：响应状态码。

### `responseHeaders()` — 获取响应头

**参数**

- 无。

**返回值**

- `array`：响应头（含 `http-protocol` / `http-status-code`）。

**示例**

```php
use kernel\Foundation\HTTP\Curl;

$response = Curl::init()
    ->url("https://api.example.com/login")
    ->json(true)
    ->timeout(10)
    ->data(["username" => "admin", "password" => "123456"])
    ->post();

if ($response->error()) {
    echo $response->errorNo() . ": " . $response->error();
} else {
    $data = $response->getData();
    $code = $response->statusCode();
}
```
