# Network 网络

- **目录位置**: `kernel/Foundation/Network/`
- **命名空间**: `kernel\Foundation\Network`

通用网络请求工具。`Http` 为高层封装，`Curl` 为底层 cURL 封装。

> `HTTP\Curl` 是 HTTP 层的 cURL 封装；`Network\Curl` 是通用网络层封装。

## Curl — cURL 封装

- **文件位置**: `kernel/Foundation/Network/Curl.php`
- **命名空间**: `kernel\Foundation\Network`

底层 cURL 请求。`Curl::init` 是独立初始化方法（与 Service 钩子无关）。

```php
use kernel\Foundation\Network\Curl;

Curl::init();    // 初始化 cURL 环境
$response = Curl::get("https://api.example.com/data");
```

### 常用静态方法

| 方法 | 说明 |
|------|------|
| `Curl::init()` | 初始化 cURL |
| `Curl::get($url, $query, $headers)` | GET 请求 |
| `Curl::post($url, $body, $headers)` | POST 请求 |
| `Curl::request($method, $url, $options)` | 通用请求 |

## Http — 网络请求封装

- **文件位置**: `kernel/Foundation/Network/Http.php`
- **命名空间**: `kernel\Foundation\Network`

高层 HTTP 客户端封装，更友好的调用方式。

```php
use kernel\Foundation\Network\Http;

$response = Http::get("https://api.example.com/data", ["token" => $token]);
$response = Http::post("https://api.example.com/create", $payload);
$response = Http::request("PUT", $url, $body, $headers);
```

### 常用静态方法

| 方法 | 说明 |
|------|------|
| `Http::get($url, $query, $headers)` | GET 请求 |
| `Http::post($url, $body, $headers)` | POST 请求 |
| `Http::put($url, $body, $headers)` | PUT 请求 |
| `Http::delete($url, $headers)` | DELETE 请求 |
| `Http::request($method, $url, $options)` | 通用请求 |

HTTP SDK 调用抛出的错误会被包装为 `Error`。
