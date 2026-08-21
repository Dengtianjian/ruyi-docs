# HTTP 请求与响应

- **目录位置**: `kernel/Foundation/HTTP/`
- **命名空间**: `kernel\Foundation\HTTP`

HTTP 请求、响应、URL 与 cURL 工具。`Request/` 与 `Response/` 子目录提供扩展子类（如分页响应 `ResponsePagination`）。

## Request — 请求

- **文件位置**: `kernel/Foundation/HTTP/Request.php`
- **命名空间**: `kernel\Foundation\HTTP`

HTTP 请求对象，由 App 装配，业务通过 `$request` 或 `getApp()->request()` 访问。**路由信息写入 `$request->Route`**。

```php
$request = getApp()->request();
$uri = $request->URI;
$method = $request->method();
$route = $request->Route;             // 当前命中的路由
$params = $request->params;           // 路由参数
```

### 常用成员

| 成员 | 说明 |
|------|------|
| `$request->URI` | 请求 URI |
| `$request->Route` | 当前命中的路由配置 |
| `$request->params` | 路由参数集合 |
| `$request->query` | 查询参数（`ControllerQuery`） |
| `$request->body` | 请求体（`ControllerBody`） |
| `method()` | HTTP 方法 |
| `headers()` | 请求头 |
| `get($key, $default)` | 取输入参数 |

CLI 命令命中后写 `$request->URI = $name`。

## Response — 响应

- **文件位置**: `kernel/Foundation/HTTP/Response.php`
- **命名空间**: `kernel\Foundation\HTTP`

HTTP 响应基类。`Result` 继承自它（「调用结果 + HTTP 响应」合一）。

| 方法 | 说明 |
|------|------|
| `setStatusCode($code)` / `getStatusCode()` | 状态码 |
| `setHeader($key, $value)` / `getHeader($key)` | 响应头 |
| `setBody($body)` / `getBody()` | 响应体 |
| `success($data, $code)` | 成功响应（非静态实例方法） |
| `error($message, $code)` | 错误响应（非静态实例方法） |
| `output()` | 输出响应 |
| `toArray()` / `toJson()` | 序列化 |

> **注意**：`success()`/`error()` 是非静态实例方法，与 `Result` 的静态工厂 `succeeded()`/`failed()` 不同。

```php
$response = new Response();
$response->setStatusCode(200);
$response->setBody($payload);
$response->output();
```

## Curl — cURL 封装

- **文件位置**: `kernel/Foundation/HTTP/Curl.php`
- **命名空间**: `kernel\Foundation\HTTP`

cURL 请求封装（HTTP 层）。`Network\Curl` 为通用网络层封装。

```php
$result = Curl::get($url);
$result = Curl::post($url, $payload, $headers);
```

### 常用静态方法

| 方法 | 说明 |
|------|------|
| `Curl::get($url, $query, $headers)` | GET 请求 |
| `Curl::post($url, $body, $headers)` | POST 请求 |
| `Curl::put($url, $body, $headers)` | PUT 请求 |
| `Curl::delete($url, $headers)` | DELETE 请求 |
| `Curl::request($method, $url, $options)` | 通用请求 |

HTTP SDK 调用抛出的错误会被包装为 `Error`。

## URL — URL 工具

- **文件位置**: `kernel/Foundation/HTTP/URL.php`
- **命名空间**: `kernel\Foundation\HTTP`

URL 解析与拼接工具。

```php
URL::build($path, $query);      // 拼接 URL
URL::parse($url);               // 解析 URL 组件
URL::current();                 // 当前 URL
```

## 子目录

- `HTTP/Request/` — 请求子类（如分页请求等）
- `HTTP/Response/` — 响应子类（如 `ResponsePagination` 分页响应，配合 `ControllerResponse::list()`）

```php
$pagination = new ResponsePagination(getApp()->request(), $total, $data);
```
