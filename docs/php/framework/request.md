# Request — HTTP 请求

Request 封装了 HTTP 请求的所有信息，包括请求方法、URI、查询参数、请求体、请求头等。

- **命名空间**: `kernel\Foundation\HTTP`
- **文件位置**: `kernel/Foundation/HTTP/Request.php`

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$query` | `RequestQuery` | 查询参数（URL ? 后的参数） |
| `$body` | `RequestBody` | 请求体数据（POST/PUT/PATCH 的数据） |
| `$header` | `RequestHeader` | 请求头 |
| `$params` | `RequestParams` | URI 参数（路由中的 `{param}`） |

> 请求方法、URI 不再暴露为属性，改为通过 `method()`、`uri()` 方法获取（见下方「请求方法」与「URI / 路由」）。**路由不再由 Request 持有**：匹配在 `App::run()` 内直接调用 App 持有的 Router，命中参数经 `$request->params->fill()` 注入。

## 方法列表

### 构造函数

框架在 App 初始化时自动创建 Request 实例，无需手动实例化。

```php
// 通过 App 获取
$request = $App->request();
// 或通过全局函数
$request = getApp()->request();
// 在控制器中通过 $this->request 获取
```

### `ip()`

静态方法，获取客户端真实 IP 地址。

返回值：`string|null`

```php
$ip = Request::ip();
echo $ip;  // "192.168.1.100"
```

### `preferredOutputType()`

根据请求头推断客户端期望的输出内容格式。**完全基于请求头 `Content-Type` 与 `Accept` 判断，不依赖任何 `ajax()` 标志**。框架的响应输出格式据此做兜底判断。

推断顺序：

1. 请求体 `Content-Type`：`application/json`（含 `+json`）→ `json`；`application/xml`、`text/xml`（含 `+xml`）→ `xml`；`text/html` → `html`；`text/plain` → `text`
2. `Accept` 请求头（逗号分隔逐项判定）：匹配规则同上；通配 MIME（`*/*`）跳过
3. 均无法推断 → 返回 `null`

返回值：`string|null` — `"json"`、`"xml"`、`"html"`、`"text"`、`null`

```php
$type = $request->preferredOutputType();  // "json" / "xml" / "html" / "text" / null
```

### `async()`

判断是否是异步请求。异步请求是服务器通过 CURL 向自己发起的内部请求，头部带有 `X-Async` 标识。

返回值：`bool`

```php
if ($request->async()) {
    // 是内部异步请求
}
```

## 请求参数访问

### 查询参数（Query String）

```php
// URL: /links?page=1&keyword=test

// 检查是否存在
$request->query->has("keyword");  // true

// 获取单个值（安全转义）
$keyword = $request->query->get("keyword");  // "test"

// 获取所有查询参数
$all = $request->query->all();  // ["page" => "1", "keyword" => "test"]
```

### 请求体（Body）

```php
// POST /links  { "name": "新链接", "url": "https://..." }

// 检查是否存在
$request->body->has("name");  // true

// 获取单个值
$name = $request->body->get("name");  // "新链接"

// 获取所有
$all = $request->body->all();  // ["name" => "新链接", "url" => "https://..."]
```

### 请求头（Header）

```php
// 检查是否存在
$request->header->has("Authorization");  // true

// 获取值
$token = $request->header->get("Authorization");  // "Bearer xxx..."

// 获取所有请求头
$all = $request->header->all();
```

### URI 参数（路由参数）

```php
// 路由: links/{linkId:\w+}
// URL: /links/123

$linkId = $request->params->get("linkId");  // "123"

// 检查是否存在
$request->params->has("linkId");  // true
```

## 请求方法

```php
$method = $request->method();  // "get", "post", "put", "patch", "delete"

// 语义化判断
$request->isMethod("post");  // bool
$request->isPost();          // bool
$request->isGet(); / isPut(); / isDelete(); / isPatch();
```

在开发模式下，可以通过 `_method` 参数覆盖 HTTP 方法：
```
POST /links?_method=put  → 实际被识别为 PUT 请求
```

## 便捷输入读取

统一读取输入（路由参数优先，其次 query、body）：

```php
$id = $request->input("id", 0);   // 按 params → query → body 取第一个
$has = $request->hasInput("name"); // bool
$all = $request->all();            // 合并后的全部输入
```

## 路径工具

```php
$request->path();         // "links/123"（去 query、去首尾斜杠）
$request->segments();     // ["links", "123"]
$request->segment(0);     // "links"
$request->isPath("links/{id}", $params);         // bool，纯判断；提取的参数经 $params 接收
$request->isPath("posts/{pid:[0-9]+}");          // 支持正则占位符
```

## 客户端信息

```php
$request->userAgent();   // User-Agent 头
$request->referrer();    // Referer 头
$request->scheme();      // "http" | "https"
$request->isSecure();    // bool
$request->host();        // 主机名
$request->fullUrl();     // scheme://host/path
$request->cookie("token"); // Cookie 值
$request->isCli();       // bool
```

## URI / 路由

```php
$uri = $request->uri();      // 请求 URI，如 "/links/123"
$params = $request->params;  // 路由参数（App::run() 匹配后经 params->fill() 注入）
```

CLI 命令模式下，`uri()` 返回命中的命令名（如 `"make:app"`）。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 创建者 | App 初始化时创建 Request |
| [Controller](./controller.md) | 依赖 | 控制器通过 `$this->request` 获取 |
| [Router](./router.md) | 参数注入方 | App::run() 直接调 Router 匹配，命中参数经 `$request->params->fill()` 注入 |
| [Middleware](./middleware.md) | 读取参数 | 中间件读取 Token、IP 等 |
| [Response](./response.md) | 配对 | 请求-响应对 |
