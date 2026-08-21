# Curl — HTTP 客户端

- **文件位置**: `kernel/Foundation/Network/Curl.php`
- **命名空间**: `kernel\Foundation\Network`
- **是否可继承**: 是

基于 PHP 原生 cURL 封装的 HTTP 客户端，采用流式（链式）API。支持多种请求方法、JSON 请求/响应、文件上传、代理、Cookie、SSL 绕过等。所有设置方法返回 `$this` 以支持链式调用；除 `get()` 等请求方法外，设置完毕后需显式调用 `send()` 执行请求。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$curlInstance` | `resource` | `NULL` | private | cURL 实例 |
| `$requestUrl` | `string` | `NULL` | private | 请求的地址 |
| `$curlOptions` | `array` | `[]` | private | cURL 选项，键为 cURL 常量值 |
| `$curlHeaders` | `array` | `[]` | private | 请求头 |
| `$curlDatas` | `array` | `[]` | private | 请求的 post field 数据，相当于请求体 |
| `$curlMethod` | `string` | `"get"` | private | 请求方法 |
| `$curlTimeout` | `int` | `60` | private | 请求超时秒数 |
| `$isJson` | `bool` | `true` | private | 请求数据是否为 JSON，接收时也会 JSON 格式化 |
| `$curlCookie` | `array` | `[]` | private | 请求的 Cookie |
| `$uploadFile` | `array` | `[]` | private | 上传的文件，执行 `file()` 时写入 |
| `$bypasSSLVerification` | `bool` | `false` | private | 是否绕过 SSL 验证 |
| `$responseData` | `mixed` | `NULL` | private | 响应的数据 |
| `$curlErrorMsg` | `string` | `NULL` | private | 错误信息 |
| `$curlErrorNo` | `int` | `NULL` | private | 错误码 |
| `$responseHeadersData` | `array` | `null` | private | 响应头 |
| `$responseStatusCode` | `int` | `200` | private | 响应状态码 |
| `$proxy` | `array` | `["open"=>false,...]` | private | 代理相关：`open`/`url`/`port`/`username`/`password` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `init()` | 创建 Curl 实例（静态工厂） |
| `url($url, $query)` | 设置请求 URL 与 query 参数 |
| `json($yes)` | 设置请求/响应是否 JSON 格式 |
| `options($options)` | 设置 cURL 选项 |
| `headers($params)` | 设置请求头 |
| `buildHeaders($params)` | 将 header 数组转换为 cURL 字符串格式 |
| `data($datas)` | 追加请求数据 |
| `get()` | 发送 GET 请求 |
| `post($body)` | 发送 POST 请求 |
| `put()` | 发送 PUT 请求 |
| `patch()` | 发送 PATCH 请求 |
| `delete()` | 发送 DELETE 请求 |
| `head()` | 发送 HEAD 请求 |
| `connect()` | 发送 CONNECT 请求 |
| `file($fileNames, $postName, $mime)` | 上传文件并发送请求 |
| `timeout($seconds)` | 设置请求超时时间 |
| `proxy($url, $port, $username, $password)` | 设置请求代理 |
| `https($yes)` | 设置是否验证 HTTPS |
| `cookie($datas)` | 设置 Cookie |
| `buildCookie($datas)` | 将 Cookie 数组转换为 cURL 格式 |
| `send()` | 发送请求 |
| `pause()` | 暂停请求 |
| `error()` | 获取错误信息 |
| `errorNo()` | 获取错误码 |
| `getData()` | 获取响应数据 |
| `statusCode()` | 获取响应状态码 |
| `responseHeaders()` | 获取响应头 |

## 方法

### `init()` — 创建 Curl 实例

**参数**

- 无。

**返回值**

- `Curl`：新实例。

**示例**

```php
use kernel\Foundation\Network\Curl;

$curl = Curl::init();
```

### `url($url, $query = [])` — 设置请求 URL 与 query 参数

`$query` 会通过 `http_build_query` 生成并拼接到 URL 后（非空时加 `?`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$url` | `string` | 无 | 请求的 URL |
| `$query` | `array` | `[]` | query 参数，键为参数名、值为参数值 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `json($yes)` — 设置请求/响应是否 JSON 格式

为 `true` 时，请求数据自动 `json_encode` 并设置 `Content-Type: application/json`，响应体自动 `json_decode` 为数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | 无 | 是否 JSON 格式 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `options($options)` — 设置 cURL 选项

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$options` | `array` | 无 | 选项，键为 cURL 常量（如 `CURLOPT_SSL_VERIFYPEER`）、值为选项值 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `headers($params)` — 设置请求头

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 请求头，键为头名称、值为头值 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `buildHeaders($params)` — 将 header 数组转换为 cURL 字符串格式

关联数组 `["Key" => "Value"]` 转为 `["Key: Value", ...]`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 参数和参数值 |

**返回值**

- `array`：转换后的字符串数组。

### `data($datas)` — 追加请求数据

每次调用会递增合并数据到请求体。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | 数据，键为字段名、值为字段值 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `get()` — 发送 GET 请求

设置请求方法为 GET 并立即发送。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `post($body = null)` — 发送 POST 请求

设置请求方法为 POST 并立即发送。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `array` | `null` | 请求体，非空时直接覆盖已有请求数据 |

**返回值**

- `Curl`：当前实例。

### `put()` — 发送 PUT 请求

设置请求方法为 PUT 并立即发送。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `patch()` — 发送 PATCH 请求

设置请求方法为 PATCH 并立即发送。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `delete()` — 发送 DELETE 请求

设置请求方法为 DELETE 并立即发送。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `head()` — 发送 HEAD 请求

设置请求方法为 HEAD 并立即发送。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `connect()` — 发送 CONNECT 请求

设置请求方法为 CONNECT 并立即发送。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `file($fileNames, $postName = "", $mime = "")` — 上传文件并发送请求

设置请求方法为文件上传并立即发送。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileNames` | `string\|array` | 无 | 文件名称（含路径）。支持：单个路径字符串；索引数组（多个路径）；关联数组 `[filename => postName]`；`[filename => [$postName, $mime]]` |
| `$postName` | `string` | `""` | 上传数据中的文件名称（默认取文件属性 name） |
| `$mime` | `string` | `""` | 文件的 MIME type（默认 `application/octet-stream`） |

**返回值**

- `Curl`：当前实例。

### `timeout($seconds)` — 设置请求超时时间

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seconds` | `int` | 无 | 超时秒数 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `proxy($url, $port, $username = "", $password = "")` — 设置请求代理

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$url` | `string` | 无 | 代理地址 |
| `$port` | `int` | 无 | 代理端口 |
| `$username` | `string` | `""` | 代理用户名 |
| `$password` | `string` | `""` | 代理用户密码 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `https($yes = true)` — 设置是否验证 HTTPS

协议头是 https 时默认验证 https。传 `true` 表示验证，`false` 表示绕过 SSL 验证。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | `true` | 是否验证 HTTPS |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `cookie($datas)` — 设置 Cookie

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | Cookie 数据，键为 Cookie 名、值为 Cookie 值 |

**返回值**

- `Curl`：当前实例（支持链式调用）。

### `buildCookie($datas)` — 将 Cookie 数组转换为 cURL 格式

`["Key" => "Value"]` 转为 `"Key=Value; Key2=Value2"`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | Cookie 数据 |

**返回值**

- `string`：转换后的字符串。

### `send()` — 发送请求

实例化 cURL，设置请求头、选项、Cookie、代理、SSL 等，执行请求并解析响应头、状态码与响应体。请求失败（`curl_exec` 返回 `false`）时记录 `curl_error`/`curl_errno`；JSON 模式响应体解析失败时包装为 `["response" => 原始响应体]`。

**参数**

- 无。

**返回值**

- `Curl`：当前实例。

### `pause()` — 暂停请求

**参数**

- 无。

**返回值**

- `int`：暂停结果（cURL 返回值）。

### `error()` — 获取错误信息

**参数**

- 无。

**返回值**

- `string\|null`：错误信息。

### `errorNo()` — 获取错误码

**参数**

- 无。

**返回值**

- `int\|null`：错误码。

### `getData()` — 获取响应数据

**参数**

- 无。

**返回值**

- `array\|int\|string\|bool`：响应数据。

### `statusCode()` — 获取响应状态码

**参数**

- 无。

**返回值**

- `int`：响应状态码。

### `responseHeaders()` — 获取响应头

返回数组含 `http-protocol`（协议）、`http-status-code`（状态码）及全部响应头键值。

**参数**

- 无。

**返回值**

- `array`：响应头。

## 完整示例

```php
use kernel\Foundation\Network\Curl;

$result = Curl::init()
    ->url("https://api.example.com/login")
    ->data(['username' => 'admin', 'password' => '123456'])
    ->json(true)
    ->timeout(10)
    ->post();

if ($result->error()) {
    echo $result->errorNo() . ': ' . $result->error();
} else {
    $data = $result->getData();       // 响应数据
    $code = $result->statusCode();    // 状态码
    $headers = $result->responseHeaders();
}
```
