# Curl — HTTP 请求封装

- **文件位置**: `kernel/Foundation/HTTP/Curl.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **是否可继承**: 是（`Curl::init()` 返回 `new static()`，子类继承可用）
- **依赖**: `kernel\Foundation\Data\Arr`

对 PHP cURL 的二次封装，提供**链式（Fluent）API**：先配置请求，再调用发送方法立即发送并返回实例，随后读取响应。自动处理 JSON 编解码、请求头、Cookie、代理、SSL、Basic 认证、文件上传等。

**核心特性**：
- **链式调用**：`url()`/`data()`/`headers()` 等配置方法返回 `$this`，可连续拼接。
- **方法即发送**：`get()`/`post()`/`put()`/`patch()`/`delete()`/`head()`/`connect()` 在调用时立即 `send()`；`file()` 仅配置上传，需由后续 `post()`/`send()` 触发。
- **Content-Type 自动强制**：无需手动设置，`send()` 按请求类型自动覆盖（见下文「Content-Type 规则」）。
- **JSON 智能解析**：响应 Content-Type 为 JSON 时自动 `json_decode` 为数组。
- **实例可复用**：`reset()` 重置配置但保留句柄，适合循环批量请求。
- **全驼峰命名**：所有属性、方法均采用驼峰法。
- **PHP 8 兼容**：句柄为 `\CurlHandle` 对象，存活判断用 `is_object()`。

---

## 一、快速开始

### 基本请求（POST JSON）

```php
use kernel\Foundation\HTTP\Curl;

$res = Curl::init()
    ->url('https://api.example.com/login')
    ->data(['username' => 'admin', 'password' => '123456'])
    ->timeout(10)
    ->post();

if ($res->error()) {
    // curl 层错误（连接失败、超时等）
    echo $res->errorNo() . ': ' . $res->error();
} else {
    $data = $res->responseData();   // 响应体，JSON 自动转数组
    $code = $res->statusCode();      // HTTP 状态码
    $headers = $res->responseHeaders();
}
```

### 两种实例化方式

```php
// 方式一：静态工厂（推荐，快速请求）
$res = Curl::init()->url($url)->post()->responseData();

// 方式二：new + 手动 send（可复用句柄）
$curl = new Curl();
$curl->url($url)->data(['page' => 1]);
$curl->send();
echo $curl->statusCode();
```

### 循环批量请求（复用实例）

```php
$curl = new Curl();
foreach ($urls as $url) {
    $res = $curl->url($url)->get()->responseData();
    $curl->reset();   // 重置配置，保留句柄复用连接
}
$curl->close();       // 用完释放
```

---

## 二、请求方法参考

本类覆盖常见 HTTP 方法。发送方法在调用时即发送请求，返回 `$this`。

| 方法 | HTTP 动词 | Content-Type | 请求体 | 说明 |
|------|-----------|--------------|--------|------|
| [`get()`](#getquery---发送-get-请求) | GET | 移除 | 并入 URL 查询串 | 查询参数自动拼接 |
| [`post()`](#postbody---发送-post-请求) | POST | `application/json` 或 `application/x-www-form-urlencoded` | 支持 | 最常用 |
| [`put()`](#putbody---发送-put-请求) | PUT | 同上 | 支持 | 整体更新资源 |
| [`patch()`](#patchbody---发送-patch-请求) | PATCH | 同上 | 支持 | 部分更新资源 |
| [`delete()`](#deletebody---发送-delete-请求) | DELETE | 同上 | 支持（部分服务忽略） | 删除资源 |
| [`head()`](#head---发送-head-请求) | HEAD | 移除 | 无 | 仅响应头，无响应体 |
| [`connect()`](#connect---发送-connect-请求) | CONNECT | — | — | 代理隧道建连 |
| [`file()`](#filefilepath-null-fieldname-file-filename-null-mimetype---文件上传) / [`upload()`](#uploadfieldname-filepath-filename-null-mimetype---添加上传文件) | POST | `multipart/form-data` | CURLFile 数组 | 文件上传 |

### Content-Type 自动强制规则

`send()` 会**忽略手动设置的 Content-Type**，按请求类型强制覆盖：

| 场景 | Content-Type |
|------|--------------|
| 文件上传（method 为 `file` 或存在 `uploadFile`） | `multipart/form-data` |
| GET / HEAD | 移除（无请求体） |
| `json(true)`（默认） | `application/json` |
| `json(false)` | `application/x-www-form-urlencoded` |

---

## 三、属性

以下属性均为 `protected`，通过方法读写，一般不直接访问。

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$requestUrl` | `string\|null` | `null` | 请求地址 |
| `$curlHeaders` | `array` | `["Accept" => "application/json, text/javascript, */*; q=0.01", "Content-Type" => "application/json"]` | 请求头（键值对） |
| `$curlDatas` | `array` | `[]` | 请求体数据 |
| `$curlMethod` | `string` | `"get"` | 请求方法（`get`/`post`/`put`/`patch`/`delete`/`head`/`connect`/`file`） |
| `$curlTimeout` | `int` | `60` | 请求总超时（秒） |
| `$curlConnectTimeout` | `int` | `0` | 连接超时（秒），0 不单独设置 |
| `$isJson` | `bool` | `true` | 是否 JSON 请求/响应 |
| `$curlCookie` | `array` | `[]` | Cookie 数据 |
| `$uploadFile` | `array` | `[]` | 上传文件集合（key 为字段名，value 为 CURLFile） |
| `$bypassSslVerification` | `bool` | `false` | 是否跳过 SSL 校验 |
| `$sslCertType` | `string` | `"PEM"` | 客户端 SSL 证书类型 |
| `$sslCertFilePath` | `string\|null` | `null` | 客户端 SSL 证书路径 |
| `$sslKeyType` | `string` | `"PEM"` | 客户端 SSL 密钥类型 |
| `$sslKeyFilePath` | `string\|null` | `null` | 客户端 SSL 密钥路径 |
| `$curlOptions` | `array` | `[]` | 附加 cURL 选项（键为 `CURLOPT_*` 常量值） |
| `$responseData` | `mixed` | `null` | 响应数据（JSON 自动解析为数组） |
| `$curlErrorMsg` | `string\|null` | `null` | cURL 错误信息 |
| `$curlErrorNo` | `int\|null` | `null` | cURL 错误码 |
| `$responseHeadersData` | `array\|null` | `null` | 响应头关联数组 |
| `$responseStatusCode` | `int` | `200` | HTTP 响应状态码 |
| `$proxy` | `array` | `["open"=>false, "url"=>"", "port"=>"", "username"=>"", "password"=>""]` | 代理配置 |
| `$curlInstance` | `\CurlHandle\|null` | `null` | cURL 句柄（构造时 `curl_init()`） |

---

## 四、方法速查表

| 分类 | 方法 |
|------|------|
| 实例化 | `init()` |
| 配置 URL | `url($url, $query)` |
| 请求体 | `data($datas)`、`json($yes)` |
| 请求头 | `headers($params)`、`referer($referer)`、`userAgent($ua)`、`encoding($enc)` |
| 认证 | `basicAuth($u, $p)` |
| Cookie | `cookie($datas)` |
| 超时 | `timeout($sec)`、`connectTimeout($sec)` |
| 重定向/HTTPS | `followLocation($yes)`、`https($yes)` |
| SSL 证书 | `sslCert($path, $type)`、`sslKey($path, $type)` |
| 代理 | `proxy($options)` |
| 底层选项 | `options($options)` |
| 发送 | `send()`、`get()`、`post()`、`put()`、`patch()`、`delete()`、`head()`、`connect()` |
| 文件上传 | `file()`、`upload()` |
| 重置/句柄 | `reset()`、`pause()`、`close()`、`curlInstance()` |
| 读取响应 | `responseData()`、`getData()`、`responseHeaders()`、`statusCode()`、`error()`、`errorNo()` |

---

## 五、方法详解

### `Curl::init()` — 实例化

静态工厂，返回 `new static()`。子类调用时返回子类实例。

**参数**：无。

**返回值**：`Curl`（或子类）新实例。

**示例**

```php
$curl = Curl::init();
```

---

### `url($url, $query = [])` — 设置请求地址

设置请求 URL。`$query` 会通过 `http_build_query` 自动拼接，自动处理 URL 中已存在的 `?`（用 `&` 分隔，避免双问号）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$url` | `string` | 无 | 请求 URL |
| `$query` | `array` | `[]` | 查询参数（键值对） |

**返回值**：`$this`。

**示例**

```php
// 自动生成 https://api.example.com/users?page=1&size=20
Curl::init()->url('https://api.example.com/users', ['page' => 1, 'size' => 20]);

// 原 URL 已带 ? 时正确追加 &
Curl::init()->url('https://a.com/list?x=1', ['y' => 2]); // https://a.com/list?x=1&y=2
```

---

### `data($datas)` — 设置请求体数据

为请求设置主体数据。**每次调用整体覆盖**（非合并）。序列化规则由 `json()` 决定。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array\|string` | 无 | 请求体（数组或原始字符串） |

**返回值**：`$this`。

**注意**：对 GET 请求，`data()` 设置的数据会自动拼接到 URL 查询串（GET 无请求体）。

---

### `json($yes = true)` — 设置 JSON 模式

控制请求体序列化方式及 Content-Type。

- `true`（默认）：请求体 `json_encode`，Content-Type `application/json`；
- `false`：请求体 `http_build_query`，Content-Type `application/x-www-form-urlencoded`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | `true` | 是否 JSON 模式 |

**返回值**：`$this`。

**示例**

```php
// JSON 请求（默认）
Curl::init()->url($url)->data(['a' => 1])->post();

// 表单请求（application/x-www-form-urlencoded）
Curl::init()->url($url)->data(['a' => 1])->json(false)->post();
```

---

### `headers($params)` — 设置请求头

与现有请求头合并（同名覆盖）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 请求头键值对，如 `["X-Token" => "abc"]` |

**返回值**：`$this`。

**示例**

```php
Curl::init()->url($url)
    ->headers(['Authorization' => 'Bearer xxxx', 'X-Request-Id' => 'uuid'])
    ->get();
```

---

### `referer($referer)` — 设置 Referer 请求头

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$referer` | `string` | 无 | 来源地址 |

**返回值**：`$this`。

---

### `userAgent($userAgent)` — 设置 User-Agent 请求头

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$userAgent` | `string` | 无 | 用户代理字符串 |

**返回值**：`$this`。

---

### `encoding($encoding)` — 设置 Accept-Encoding 请求头

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$encoding` | `string` | 无 | 编码类型，如 `gzip`、`deflate`、`gzip, deflate` |

**返回值**：`$this`。

---

### `followLocation($yes = true)` — 设置是否跟随重定向

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | `true` | 是否跟随 3xx 重定向 |

**返回值**：`$this`。

---

### `basicAuth($username, $password)` — 设置 HTTP Basic 认证

通过 `CURLOPT_USERPWD` + `CURLAUTH_BASIC` 实现，自动发送 `Authorization: Basic base64(user:pass)`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$username` | `string` | 无 | 用户名 |
| `$password` | `string` | 无 | 密码 |

**返回值**：`$this`。

**示例**

```php
Curl::init()->url($url)->basicAuth('admin', 'secret')->get()->responseData();
```

---

### `cookie($datas)` — 设置 Cookie

与现有 Cookie 合并（同名覆盖），发送时自动拼接为 `"k1=v1; k2=v2"`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$datas` | `array` | 无 | Cookie 键值对 |

**返回值**：`$this`。

**示例**

```php
Curl::init()->url($url)->cookie(['session_id' => 'abc123'])->get();
```

---

### `timeout($seconds = 60)` — 设置请求总超时

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seconds` | `int` | `60` | 整个请求（含连接与传输）最长耗时（秒） |

**返回值**：`$this`。

---

### `connectTimeout($seconds = 0)` — 设置连接超时

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seconds` | `int` | `0` | 连接阶段超时（秒）；0 表示不单独设置，走 curl 默认 |

**返回值**：`$this`。

---

### `proxy($options = [])` — 设置代理

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$options` | `array` | `[]` | 代理配置，可用键：`open`、`url`、`port`、`username`、`password` |

**返回值**：`$this`。

**示例**

```php
Curl::init()->url($url)
    ->proxy(['open' => true, 'url' => 'http://proxy.example.com', 'port' => '8080'])
    ->get();
```

---

### `https($yes = true)` — 设置 HTTPS 验证

`true` 校验服务端 SSL 证书（默认）；`false` 跳过校验（仅调试自签名证书用，生产勿关）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$yes` | `bool` | `true` | 是否校验 SSL 证书 |

**返回值**：`$this`。

---

### `sslCert($filePath, $type = "PEM")` — 设置客户端 SSL 证书

用于双向 TLS 认证（如微信支付证书、内部 mTLS 接口）。配合 `sslKey()` 使用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 客户端证书文件路径 |
| `$type` | `string` | `"PEM"` | 证书类型（PEM/DER/ENG） |

**返回值**：`$this`。

**示例**

```php
Curl::init()->url($url)
    ->sslCert('/path/apiclient_cert.pem')
    ->sslKey('/path/apiclient_key.pem')
    ->post();
```

---

### `sslKey($filePath, $type = "PEM")` — 设置客户端 SSL 密钥

配合 `sslCert()` 使用，提供私钥文件。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 密钥文件路径 |
| `$type` | `string` | `"PEM"` | 密钥类型（PEM/DER/ENG） |

**返回值**：`$this`。

---

### `options($options)` — 传递额外 cURL 选项

直接注入任意 cURL 选项，覆盖/补充内置默认（优先级最高）。注意 `CURLOPT_HEADER`、`CURLOPT_RETURNTRANSFER` 等会被 `send()` 强制开启，可能无法覆盖。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$options` | `array` | 无 | 选项集合，键为 `CURLOPT_*` 常量值 |

**返回值**：`$this`。

**示例**

```php
Curl::init()->url($url)->options([CURLOPT_SSL_VERIFYPEER => false])->get();
```

---

### `get($query = [])` — 发送 GET 请求

发送 GET 请求。`$query` 与 `data()` 设置的请求体都会拼接到 URL 查询串（GET 不携带请求体）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `array` | `[]` | 追加到 URL 的查询参数 |

**返回值**：`$this`（已发送）。

**示例**

```php
$res = Curl::init()
    ->url('https://api.example.com/users')
    ->headers(['X-Token' => 'abc'])
    ->get(['page' => 1, 'size' => 20])
    ->responseData();
```

---

### `post($body = null)` — 发送 POST 请求

发送 POST 请求。传入 `$body` 会**整体替换**请求数据；不传沿用 `data()` 设置的数据。请求体默认按 JSON 发送，可用 `json(false)` 改为表单。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `array\|string\|null` | `null` | 请求体（整体替换） |

**返回值**：`$this`（已发送）。

**示例**

```php
// JSON 请求体
$res = Curl::init()
    ->url('https://api.example.com/login')
    ->post(['username' => 'admin', 'password' => '123'])
    ->responseData();

// 表单请求体
$res = Curl::init()
    ->url('https://api.example.com/login')
    ->data(['username' => 'admin'])
    ->json(false)
    ->post();
```

---

### `put($body = null)` — 发送 PUT 请求

发送 PUT 请求，用于**整体更新**资源。请求体规则同 `post()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `array\|string\|null` | `null` | 请求体（整体替换） |

**返回值**：`$this`（已发送）。

**示例**

```php
$res = Curl::init()->url('https://api.example.com/users/1')
    ->put(['name' => '李四', 'age' => 30])
    ->responseData();
```

---

### `patch($body = null)` — 发送 PATCH 请求

发送 PATCH 请求，用于**部分更新**资源。请求体规则同 `post()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `array\|string\|null` | `null` | 请求体（整体替换） |

**返回值**：`$this`（已发送）。

**示例**

```php
$res = Curl::init()->url('https://api.example.com/users/1')
    ->patch(['age' => 21])
    ->responseData();
```

---

### `delete($body = null)` — 发送 DELETE 请求

发送 DELETE 请求，删除资源。部分服务允许携带请求体（通过 `data()` 或 `$body` 设置），多数忽略。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$body` | `array\|string\|null` | `null` | 请求体（整体替换） |

**返回值**：`$this`（已发送）。

**示例**

```php
$res = Curl::init()->url('https://api.example.com/users/1')->delete()->responseData();
```

---

### `head()` — 发送 HEAD 请求

发送 HEAD 请求，仅获取响应头（通过 `CURLOPT_NOBODY` 实现，无响应体）。常用于探测资源存在性、读取响应头元信息。

**参数**：无。

**返回值**：`$this`（已发送）。

**示例**

```php
$res = Curl::init()->url('https://api.example.com/files/1')->head();
$exists = $res->statusCode() === 200;
$length = $res->responseHeaders()['Content-Length'] ?? null;
```

---

### `connect()` — 发送 CONNECT 请求

发送 CONNECT 请求，用于通过代理建立 HTTP 代理隧道（TLS over proxy）。一般场景较少涉及。

**参数**：无。

**返回值**：`$this`（已发送）。

---

### `file($filePath = null, $fieldName = "file", $fileName = null, $mimeType = "")` — 文件上传

配置 `multipart/form-data` 文件上传。**不自动发送**，需由后续 `post()`/`send()` 触发。

两种用法：
1. 直接传文件路径 + 字段名，随后 `post()` 触发；
2. 先 `upload()` 注册 CURLFile、`data()` 设置普通字段，再 `file()` 声明上传并触发。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string\|null` | `null` | 文件路径（可选，直接上传单文件） |
| `$fieldName` | `string` | `"file"` | 表单字段名（服务端 `$_FILES` 的 key） |
| `$fileName` | `string\|null` | `null` | 上传文件名（默认取路径 basename） |
| `$mimeType` | `string` | `""` | 文件 MIME 类型（默认由 curl 推断） |

**返回值**：`$this`（不自动发送）。

**示例**

```php
// 用法一：直接传路径上传单文件
$res = Curl::init()
    ->url('https://api.example.com/upload')
    ->file('/path/to/a.jpg', 'media')
    ->post()
    ->responseData();

// 用法二：普通字段 + 多文件
$curl = Curl::init()->url('https://api.example.com/upload');
$curl->upload('pic1', '/path/a.jpg');
$curl->upload('pic2', '/path/b.png');
$curl->data(['title' => '相册']);
$res = $curl->file()->post()->responseData();
```

---

### `upload($fieldName, $filePath, $fileName = null, $mimeType = "")` — 添加上传文件

将文件注册到上传集合（不触发发送），可多次调用上传多文件，之后由 `file()` 或 `post()` 触发。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fieldName` | `string` | 无 | 表单字段名 |
| `$filePath` | `string` | 无 | 文件绝对路径 |
| `$fileName` | `string\|null` | `null` | 上传文件名（默认取路径 basename） |
| `$mimeType` | `string` | `""` | 文件 MIME 类型 |

**返回值**：`$this`。

---

### `reset()` — 重置请求配置

将 url/headers/data/method/timeout/cookie/ssl/代理/选项等全部恢复初始状态，但**保留 cURL 句柄**复用。适合同一实例循环连续请求。

**参数**：无。

**返回值**：`$this`。

---

### `send()` — 发送请求

核心方法，由各 HTTP 方法自动调用，也可手动触发。执行流程见类注释。

**参数**：无。

**返回值**：`$this`（便于链式读响应）。

---

### `pause($isPause = true)` — 暂停请求

对进行中的底层传输挂起/继续。同步 `curl_exec` 场景通常无实际效果；句柄被 `close()` 后返回 `false`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$isPause` | `bool` | `true` | `true` 暂停，`false` 继续 |

**返回值**：`int\|false`：`curl_pause` 结果；句柄不可用为 `false`。

---

### `close()` — 关闭底层句柄

`curl_close()` 释放句柄，句柄置 `null`。之后若再调用 `send()` 会自动重建句柄。

**参数**：无。

**返回值**：`void`。

---

### `curlInstance()` — 获取底层 cURL 句柄

供低层操控（`curl_multi` 等）使用。PHP 8 下为 `\CurlHandle` 对象，`close()` 后为 `null`。判存活用 `is_object()`。

**参数**：无。

**返回值**：`\CurlHandle\|null`。

---

### `responseData()` — 获取响应数据

返回响应体。Content-Type 为 JSON（或 `json()` 开启）时自动 `json_decode` 为数组；解析失败则原样返回字符串；请求失败时为 `null`。

**参数**：无。

**返回值**：`mixed`。

---

### `getData()` — 获取响应数据（别名）

与 `responseData()` 等价，兼容旧用法。

**参数**：无。

**返回值**：`mixed`。

---

### `responseHeaders()` — 获取响应头

返回响应头关联数组（key 为头名，value 为值，均 trim）。请求失败时为 `null`。

**参数**：无。

**返回值**：`array\|null`。

---

### `statusCode()` — 获取响应状态码

请求成功返回服务端状态码（如 200/404）；请求失败（未建立连接等）为 0。

**参数**：无。

**返回值**：`int`。

---

### `error()` — 获取 cURL 错误信息

返回 `curl_error()` 描述；成功为 `null`；URL 未设置为 `"请求地址未设置"`。

**参数**：无。

**返回值**：`string\|null`。

---

### `errorNo()` — 获取 cURL 错误码

返回 `curl_errno()` 错误码（如 `CURLE_COULDNT_CONNECT`）；成功为 `null`；URL 未设置为 `-1`。

**参数**：无。

**返回值**：`int\|null`。

---

## 六、综合示例

### 完整错误处理

```php
$res = Curl::init()
    ->url('https://api.example.com/login')
    ->data(['username' => 'admin', 'password' => '123'])
    ->timeout(10)
    ->post();

if ($res->error()) {
    throw new \Exception("请求失败 [{$res->errorNo()}]: {$res->error()}");
}
if ($res->statusCode() !== 200) {
    throw new \Exception("HTTP 错误: {$res->statusCode()}");
}
$data = $res->responseData();
```

### 第三方接口（DingTalk 风格：上传 + 普通字段）

```php
$res = Curl::init()
    ->url('https://oapi.dingtalk.com/media/upload?access_token=xxx')
    ->file('/tmp/image.png', 'media')
    ->data(['type' => 'image'])
    ->post()
    ->responseData();
```

### SSL 客户端证书（如微信支付）

```php
$res = Curl::init()
    ->url('https://api.mch.weixin.qq.com/v3/...')
    ->sslCert('/path/apiclient_cert.pem')
    ->sslKey('/path/apiclient_key.pem')
    ->post(['out_trade_no' => '20260101'])
    ->responseData();
```

### 批量请求（复用实例 + reset）

```php
$curl = new Curl();
$results = [];
foreach ($ids as $id) {
    $results[$id] = $curl->url("https://api.example.com/users/{$id}")->get()->responseData();
    $curl->reset();
}
$curl->close();
```

---

## 七、常见坑

1. **Content-Type 会被强制覆盖**：手动 `headers(['Content-Type' => ...])` 在 `send()` 时会被按请求类型覆盖，勿依赖手动设置；如需自定义请用 `options()` 或接受自动规则。
2. **`file()` 不自动发送**：只配置上传，必须 `post()` 或 `send()` 触发，否则无请求发出。
3. **GET/HEAD 无请求体**：`data()` 在 GET 下并入 URL 查询串；HEAD 丢弃请求体。
4. **失败后 `responseData()` 为 null**：应优先判断 `error()`/`statusCode()`。
5. **句柄判活用 `is_object()`**：PHP 8 下 `is_resource()` 对 `\CurlHandle` 返回 `false`。
