# Curl — HTTP 客户端

Curl 类对 PHP cURL 扩展做了二次封装，提供**链式（Fluent）API**：先配置请求，再调用发送方法立即发送并返回实例，随后读取响应。内置 JSON 编解码、请求头、Cookie、代理、SSL、Basic 认证、文件上传等能力，是框架发起外部 HTTP 请求（调用第三方 API、微信/钉钉回调、推送等）的标准方式。

- **文件位置**: `kernel/Foundation/HTTP/Curl.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **可继承**: 是（`Curl::init()` 返回 `new static()`，子类继承可用）
- **依赖**: `kernel\Foundation\Data\Arr`
- 完整类级 API 参见 [API 参考 · Curl](../api/foundation/http/curl.md)。本文从 **使用场景** 角度介绍。

## 核心特性

- **链式调用**：`url()` / `data()` / `headers()` 等配置方法返回 `$this`，可连续拼接。
- **方法即发送**：`get()` / `post()` / `put()` / `patch()` / `delete()` / `head()` / `connect()` 调用时立即 `send()`；`file()` 仅配置上传，需由后续 `post()` / `send()` 触发。
- **Content-Type 自动强制**：无需手动设置，`send()` 按请求类型自动覆盖。
- **JSON 智能解析**：响应 Content-Type 为 JSON 时自动 `json_decode` 为数组。
- **实例可复用**：`reset()` 重置配置但保留句柄，适合循环批量请求。
- **全驼峰命名**：所有属性、方法均采用驼峰法。
- **PHP 8 兼容**：句柄为 `\CurlHandle` 对象，存活判断用 `is_object()`。

## 快速开始

### 发起一个 GET 请求

```php
use kernel\Foundation\HTTP\Curl;

$res = Curl::init()
    ->url('https://api.example.com/users')
    ->get();

echo $res->statusCode();          // 200
$data = $res->responseData();     // 响应体，JSON 自动转数组
$headers = $res->responseHeaders();
```

### 发起一个 POST JSON 请求

```php
$res = Curl::init()
    ->url('https://api.example.com/login')
    ->data(['username' => 'admin', 'password' => '123456'])
    ->timeout(10)
    ->post();
```

`data()` 传入关联数组时会自动 JSON 编码，并强制 `Content-Type: application/json`。

### 读取响应

| 方法 | 说明 |
|------|------|
| `responseData()` / `getData()` | 响应体，JSON 自动转数组 |
| `responseHeaders()` | 响应头数组 |
| `statusCode()` | HTTP 状态码 |
| `error()` | curl 层错误信息（连接失败、超时等），成功时返回 `false` |
| `errorNo()` | curl 错误码 |
| `curlInstance()` | 底层 `\CurlHandle` 句柄 |

## 两种实例化方式

```php
// 方式一：静态工厂（推荐，快速发起单次请求）
$res = Curl::init()->url($url)->post()->responseData();

// 方式二：new + 手动 send（可复用句柄，适合循环）
$curl = new Curl();
$curl->url($url)->data(['page' => 1]);
$curl->send();
echo $curl->statusCode();
```

## 支持的请求方法

| 方法 | 说明 | 是否立即发送 |
|------|------|------|
| `get()` | GET 请求 | 是 |
| `post()` | POST 请求 | 是 |
| `put()` | PUT 请求 | 是 |
| `patch()` | PATCH 请求 | 是 |
| `delete()` | DELETE 请求 | 是 |
| `head()` | HEAD 请求 | 是 |
| `connect()` | CONNECT 请求 | 是 |
| `file()` | 配置文件上传（需后续 `post()` / `send()` 触发） | 否 |
| `upload()` | `file()` 的别名 | 否 |

## Content-Type 自动强制规则

`send()` 会根据请求类型自动覆盖 `Content-Type`，无需手动设置：

| 请求类型 | Content-Type |
|----------|--------------|
| 文件上传（`file()`） | `multipart/form-data` |
| GET / HEAD | 移除 Content-Type |
| 传了 JSON 数据 | `application/json` |
| 其他 | `application/x-www-form-urlencoded` |

## 常见使用场景

### 调用第三方 JSON API

```php
$res = Curl::init()
    ->url('https://api.weixin.qq.com/sns/jscode2session')
    ->data(['appid' => $appId, 'secret' => $secret, 'js_code' => $code, 'grant_type' => 'authorization_code'])
    ->timeout(8)
    ->get();

$data = $res->responseData();
if ($res->error() || ($data['errcode'] ?? 0) != 0) {
    // 处理失败
}
```

### 携带自定义请求头与 Cookie

```php
$res = Curl::init()
    ->url('https://api.example.com/me')
    ->headers([
        'Authorization' => 'Bearer ' . $token,
        'X-Request-Id'  => uniqid(),
    ])
    ->cookie('session_id=' . $sessionId)
    ->get();
```

### Basic 认证 / Token 认证

```php
// Basic 认证
$res = Curl::init()
    ->url('https://api.example.com/secure')
    ->basicAuth('username', 'password')
    ->get();

// 通过请求头传 Token（Bearer 等）
$res = Curl::init()
    ->url('https://api.example.com/secure')
    ->headers(['Authorization' => 'Bearer xxx'])
    ->get();
```

### 代理与 SSL

```php
// 走代理
$res = Curl::init()->url($url)->proxy('http://127.0.0.1:8888')->get();

// 跳过 SSL 校验（仅限内网调试）
$res = Curl::init()->url($url)->https(false)->get();

// 携带客户端证书（双向 TLS）
$res = Curl::init()
    ->url($url)
    ->sslCert('/path/to/client.pem')
    ->sslKey('/path/to/client.key')
    ->get();
```

### 文件上传

`file()` 仅配置上传文件，需由 `post()` 或 `send()` 触发发送：

```php
$res = Curl::init()
    ->url('https://api.example.com/upload')
    ->file('media', '/path/to/image.png')
    ->post();
```

### 请求头伪装（User-Agent / Referer / 编码）

```php
$res = Curl::init()
    ->url($url)
    ->userAgent('Mozilla/5.0 (compatible; RuyiFramework)')
    ->referer('https://example.com')
    ->encoding('gzip, deflate')
    ->followLocation(true)   // 跟随重定向
    ->get();
```

## 批量请求（复用实例）

`reset()` 重置请求配置但保留句柄，适合循环批量请求：

```php
$curl = new Curl();
foreach ($urls as $url) {
    $res = $curl->url($url)->reset()->get();
    echo $curl->statusCode();
}
```

## 超时与连接超时

```php
$res = Curl::init()
    ->url($url)
    ->timeout(30)          // 总超时（秒）
    ->connectTimeout(5)    // 连接超时（秒）
    ->post();
```

## 完整错误处理示例

```php
use kernel\Foundation\HTTP\Curl;

$res = Curl::init()
    ->url('https://api.example.com/submit')
    ->data(['name' => 'foo'])
    ->timeout(10)
    ->post();

if ($res->error()) {
    // curl 层错误（连接失败、超时、DNS 解析失败等）
    throw new \RuntimeException($res->errorNo() . ': ' . $res->error());
}

if ($res->statusCode() >= 400) {
    // HTTP 层错误（4xx / 5xx）
    $body = $res->responseData();
    throw new \RuntimeException("HTTP " . $res->statusCode() . ": " . json_encode($body));
}

// 正常处理
$data = $res->responseData();
```

## 常见坑

1. **句柄判断**：PHP 8 下 `curl_init()` 返回 `\CurlHandle` 对象，判断存活用 `is_object()` 而非 `is_resource()`。
2. **Content-Type 覆盖**：不要手动在 `headers()` 里设置 `Content-Type`，`send()` 会按请求类型强制覆盖。
3. **`file()` 不立即发送**：它只配置上传，必须由后续 `post()` / `send()` 触发。
4. **`reset()` 不销毁句柄**：只清空配置，句柄被保留以便复用。
5. **响应 JSON 解析**：只有响应 `Content-Type` 为 JSON 时才自动 `json_decode`，其他类型返回原始字符串。

## 相关文档

- [API 参考 · Curl（完整类接口）](../api/foundation/http/curl.md)
- [Request 请求](./request.md)
- [Response 响应](./response.md)
