# Router — 路由器

Router 负责 URL 和控制器之间的映射。提供静态路由、参数路由、路由组、异步路由等多种路由注册方式。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Router.php`
- **特点**: 全部为静态方法

## 控制器指定方式

### 类名（默认调用 `data()` 方法）

```php
Router::get("links", ListLinksController::class);
// → 内部调用 ListLinksController::data()
```

### 数组（指定方法名）

```php
Router::get("categories", [
    ResourceCategoriesController::class,
    "get"
]);
// → ResourceCategoriesController::get()
```

### same() 闭包内指定方法

```php
Router::same("link/categories/{?categoryId:\\w+}", function () {
    Router::get([ResourceCategoriesController::class, "get"]);
    Router::post([ResourceCategoriesController::class, "post"]);
});
// → ResourceCategoriesController::get()
// → ResourceCategoriesController::post()
```

> **解析规则**：Router 内部通过 `resolveControllerTarget()` 统一处理类名和 `[类名, 方法名]` 数组两种格式。数组格式中第二个元素默认为 `"data"`。

### 闭包函数

```php
Router::get("health", function ($request) {
    return ["status" => "ok"];
});
```

## 方法列表

### `prefix($prefix, $append = false)`

设置路由前缀。后续注册的路由都会自动添加此前缀。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$prefix` | `string\|array\|null` | 前缀，传入 `null` 清除前缀 |
| `$append` | `bool` | `true` 时追加到现有前缀后面 |

返回值：`Router`

```php
Router::prefix("api");          // 设置前缀 /api
Router::get("users", ...);      // 实际匹配 /api/users
Router::prefix(null);           // 清除前缀
Router::get("users", ...);      // 实际匹配 /users

Router::prefix("v1")->prefix("admin", true);
// 前缀为 v1/admin
```

### `group($prefix, \Closure $callback, $middlewares = [])`

路由组。将一组路由共享相同的前缀和中间件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$prefix` | `string\|string[]` | 组前缀 |
| `$callback` | `\Closure` | 注册路由的回调函数 |
| `$middlewares` | `array` | 组内路由共享的中间件 |

返回值：`Router`

```php
Router::group("admin", function () {
    Router::get("dashboard", DashboardController::class);
    Router::get("users", UserListController::class);
    Router::post("users", CreateUserController::class);
}, [AdminMiddleware::class]);

// 生成的路由：
// GET  /admin/dashboard  → DashboardController
// GET  /admin/users      → UserListController
// POST /admin/users      → CreateUserController
```

### `same($URI, \Closure $callback)`

为同一 URI 注册不同 HTTP 方法的路由。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$URI` | `string` | 共享的 URI |
| `$callback` | `\Closure` | 注册不同方法路由的回调 |

返回值：`Router`

```php
Router::same("links/{?linkId:\\w+}", function () {
    Router::get(GetLinkController::class);     // GET    获取
    Router::post(PostLinkController::class);   // POST   创建
    Router::put(PutLinkController::class);     // PUT    更新
    Router::patch(PatchLinkController::class); // PATCH  删除
});
```

### `get($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册 GET 方法路由。

```php
Router::get("links", ListLinksController::class);
Router::get("links/{linkId:\\w+}", GetLinkController::class);
Router::get("admin/users", UserListController::class, [AdminMiddleware::class]);
```

### `post($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册 POST 方法路由。

```php
Router::post("users/register", RegisterController::class);
Router::post("notifications/send", SendNoticeController::class, [GlobalDingTalkMiddleware::class]);
```

### `put($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册 PUT 方法路由。

```php
Router::put("links/{linkId:\\w+}", PutLinkController::class);
```

### `patch($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册 PATCH 方法路由。

```php
Router::patch("users/{userId:\\w+}", UpdateUserController::class);
```

### `delete($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册 DELETE 方法路由。

```php
Router::delete("links/{linkId:\\w+}", DeleteLinkController::class);
```

### `options($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册 OPTIONS 方法路由。

### `any($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册匹配任意 HTTP 方法的路由。

```php
Router::any("webhook", WebhookController::class);
```

### `async($URI, $controller = null, $middlewares = [], $ControllerInstantiateParams = [])`

注册异步路由。只能通过服务器内部 CURL 调用（需要 `X-Async` 和 `X-Ajax` 请求头）。

```php
Router::async("tasks/cleanup", CleanupController::class);
```

### `dispatch($URI, $data = [], $headers = [], $timeout = 1)`

调用内部异步路由。通过 CURL 向自己发起 HTTP 请求。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$URI` | `string` | 请求的 URI |
| `$data` | `array` | 发送的数据 |
| `$headers` | `array` | 请求头 |
| `$timeout` | `int` | 超时秒数 |

```php
// 在控制器中异步调用另一个路由
$result = Router::dispatch("/notifications/send", [
    "title" => "新通知",
    "content" => "内容..."
]);
```

### `match(Request $request)`

匹配路由。框架内部调用，根据请求的 URI 和方法找到对应路由。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$request` | `Request` | 请求实例 |

返回值：`array|null` — 匹配到的路由信息数组，未匹配到返回 `null`

## 路由参数

### 静态路由

不包含动态参数，精确匹配：

```php
Router::get("links", ListLinksController::class);
// 匹配: GET /links
// 不匹配: GET /links/123
```

### 动态参数路由

使用 `{参数名:正则}` 定义动态参数：

```php
Router::get("links/{linkId:\\w+}", GetLinkController::class);
// 匹配: GET /links/123, GET /links/abc
// 不匹配: GET /links/

// 通过 $this->request->params->get("linkId") 获取参数值
```

### 可选参数

参数名以 `?` 开头表示可选：

```php
Router::get("articles/{?categoryId:\\w+}", ArticleController::class);
// 匹配: GET /articles, GET /articles/tech
```

### 多参数

```php
Router::get("articles/{categoryId:\\w+}/{articleId:\\d+}", ArticleDetailController::class);
// 匹配: GET /articles/tech/123
```

## 完整路由文件示例

```php
<?php
// Routes/index.php
use kernel\Foundation\Router;

// 首页
Router::get("/", IndexController::class);

// 用户相关
Router::post("users/register", RegisterController::class);
Router::post("users/login", LoginController::class);
Router::post("users/logout", LogoutController::class);

// 链接 CRUD
Router::get("links", ListLinksController::class);
Router::same("links/{?linkId:\\w+}", function () {
    Router::get(GetLinkController::class);
    Router::post(PostLinkController::class);
    Router::put(PutLinkController::class);
    Router::patch(PatchLinkController::class);
});

// 管理员路由组
Router::group("admin", function () {
    Router::get("dashboard", DashboardController::class);
    Router::get("users", AdminUserListController::class);
}, [AdminMiddleware::class]);
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 加载路由文件，调用 match() | 路由匹配入口 |
| [Controller](./controller.md) | 路由映射目标 | 匹配后实例化控制器 |
| [Request](./request.md) | 匹配依据 | 根据 URL 和 Method 匹配 |
| [Middleware](./middleware.md) | 路由中间件 | 路由级别的中间件 |
