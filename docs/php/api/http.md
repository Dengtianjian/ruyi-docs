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

cURL 请求封装（HTTP 层）。采用**链式实例 API**，通过 `Curl::init()` 创建实例后配置并发送。

```php
use kernel\Foundation\HTTP\Curl;

$result = Curl::init()
    ->url($url)
    ->data($payload)
    ->headers($headers)
    ->post()
    ->getData();
```

### 请求方法

| 方法 | HTTP 动词 | 说明 |
|------|-----------|------|
| `get($query)` | GET | 查询参数自动拼接 URL |
| `post($body)` | POST | 表单或 JSON 请求体 |
| `put($body)` | PUT | 整体更新资源 |
| `patch($body)` | PATCH | 部分更新资源 |
| `delete($body)` | DELETE | 删除资源 |
| `head()` | HEAD | 仅响应头，无响应体 |
| `connect()` | CONNECT | 代理隧道建连 |
| `file()` / `upload()` | POST/multipart | 文件上传 |

### 常用配置与读取

| 方法 | 说明 |
|------|------|
| `Curl::init()` | 创建实例（静态工厂） |
| `url($url, $query)` | 设置 URL 与 query |
| `data($body)` | 设置请求体 |
| `headers($headers)` | 设置请求头 |
| `basicAuth($u, $p)` | HTTP Basic 认证 |
| `cookie($cookies)` | 设置 Cookie |
| `json($yes)` | 切换 JSON / 表单模式 |
| `timeout($sec)` / `connectTimeout($sec)` | 超时 |
| `sslCert()/sslKey()` | 客户端 SSL 证书 |
| `proxy($options)` | 代理 |
| `options($options)` | 额外 cURL 选项 |
| `reset()` | 重置配置、复用句柄 |
| `responseData()` / `getData()` | 响应体 |
| `responseHeaders()` | 响应头 |
| `statusCode()` | HTTP 状态码 |
| `error()` / `errorNo()` | 请求失败信息/码 |

每种请求方法的完整说明、参数与示例见 [HTTP/Curl](./foundation/http/curl.md)。HTTP SDK 调用抛出的错误会被包装为 `Error`。

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
