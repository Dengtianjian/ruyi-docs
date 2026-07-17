# Request — HTTP 请求

Request 封装了 HTTP 请求的所有信息，包括请求方法、URI、查询参数、请求体、请求头、分页信息等。

- **命名空间**: `kernel\Foundation\HTTP`
- **文件位置**: `kernel/Foundation/HTTP/Request.php`

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$method` | `string` | 请求方法（get/post/put/patch/delete） |
| `$URI` | `string` | 请求 URI |
| `$Route` | `array` | 当前匹配到的路由信息 |
| `$query` | `RequestQuery` | 查询参数（URL ? 后的参数） |
| `$body` | `RequestBody` | 请求体数据（POST/PUT/PATCH 的数据） |
| `$header` | `RequestHeader` | 请求头 |
| `$pagination` | `RequestPagination` | 分页信息（page、perPage） |
| `$params` | `RequestParams` | URI 参数（路由中的 `{param}`） |
| `$modelParams` | `RequestModelParams` | 模型查询参数 |

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

### `realClientIp()`

静态方法，获取客户端真实 IP 地址。

返回值：`string`

```php
$ip = Request::realClientIp();
echo $ip;  // "192.168.1.100"
```

### `ajax()`

判断是否是 AJAX 请求。检查 `X-Requested-With`、`X-Ajax` 请求头或 `isAjax` 查询参数。

返回值：`bool`

```php
if ($request->ajax()) {
    // 是 AJAX 请求
}
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

### 分页参数

```php
// URL: /links?page=2&perPage=20

$page = $request->pagination->page();      // 2
$perPage = $request->pagination->perPage(); // 20
```

## 请求方法

```php
$method = $request->method;  // "get", "post", "put", "patch", "delete"
```

在开发模式下，可以通过 `_method` 参数覆盖 HTTP 方法：
```
POST /links?_method=put  → 实际被识别为 PUT 请求
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 创建者 | App 初始化时创建 Request |
| [Controller](./controller.md) | 依赖 | 控制器通过 `$this->request` 获取 |
| [Router](./router.md) | 匹配依据 | 根据 URI 和 method 匹配路由 |
| [Middleware](./middleware.md) | 读取参数 | 中间件读取 Token、IP 等 |
| [Response](./response.md) | 配对 | 请求-响应对 |
