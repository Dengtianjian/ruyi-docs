# Router — 路由器

Router 负责 URL 和控制器之间的映射，同时承担 CLI 命令注册。提供静态路由、参数路由、路由组、异步路由与命令注册能力。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Router.php`
- **特点**: 构造时自动加载路由文件（内核 + 应用 Routes）；支持 http/command 双运行模式；路由匹配结果写入 `Request::$Route`

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

## 运行模式

Router 按运行模式分发：**http** 模式按 URI 匹配路由，**command** 模式按命令名匹配（均由 `match()` 内部分发到对应表，command 模式不解析 URI）。`new Router()` 时自动判断（`PHP_SAPI !== "cli"` 为 http，CLI 为 command），也可用 `setMode()` 显式覆盖。

| 模式 | 值 | 用途 |
|------|-----|------|
| http | `"http"` | HTTP 请求，按 URI 匹配路由 |
| command | `"command"` | CLI 请求，按命令名分发 |

## 方法列表

### `__construct($mode = null)`

构造函数。设置运行模式并自动加载路由文件（先内核 `kernel/Routes`，再应用 `{AppId}/Routes`，`include_once` 去重）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$mode` | `string\|bool\|null` | 运行模式；`null`（默认）自动判断（`PHP_SAPI !== "cli"` 为 http，CLI 为 command），`true` 强制 http、`false` 强制 command，字符串传 `"http"`/`"command"` |

```php
$router = new Router();       // 自动判断模式
$router = new Router(true);   // 强制 http
$router = new Router(false);  // 强制 command
```

### `setMode($mode)`

设置运行模式，返回 `$this` 支持链式调用。

```php
Router::setMode("http");   // 显式切换为 http（如 CLI 冒烟测试模拟 HTTP）
```

### `mode()`

获取当前运行模式。

返回值：`"http"` 或 `"command"`。

```php
$mode = Router::mode();  // "http" | "command"
```

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

### `same($uri, \Closure $callback)`

为同一 URI 注册不同 HTTP 方法的路由。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string` | 共享的 URI |
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

### `get($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册 GET 方法路由。

```php
Router::get("links", ListLinksController::class);
Router::get("links/{linkId:\\w+}", GetLinkController::class);
Router::get("admin/users", UserListController::class, [AdminMiddleware::class]);
```

### `post($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册 POST 方法路由。

```php
Router::post("users/register", RegisterController::class);
Router::post("notifications/send", SendNoticeController::class, [GlobalDingTalkMiddleware::class]);
```

### `put($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册 PUT 方法路由。

```php
Router::put("links/{linkId:\\w+}", PutLinkController::class);
```

### `patch($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册 PATCH 方法路由。

```php
Router::patch("users/{userId:\\w+}", UpdateUserController::class);
```

### `delete($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册 DELETE 方法路由。

```php
Router::delete("links/{linkId:\\w+}", DeleteLinkController::class);
```

### `options($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册 OPTIONS 方法路由。

### `any($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册匹配任意 HTTP 方法的路由。

```php
Router::any("webhook", WebhookController::class);
```

### `async($uri, $controller = null, $middlewares = [], $controllerInstantiateParams = [])`

注册异步路由。只能通过服务器内部 CURL 调用（需要 `X-Async` 和 `X-Ajax` 请求头）。

```php
Router::async("tasks/cleanup", CleanupController::class);
```

### `dispatch($uri, $data = [], $headers = [], $timeout = 1)`

调用内部异步路由。通过 CURL 向自己发起 HTTP 请求。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string` | 请求的 URI |
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

匹配路由。框架内部调用，按运行模式分发：**http** 模式根据请求的 URI 和方法匹配 URI 路由；**command** 模式按 `request->URI`（即命中的命令名）匹配命令表，不解析 URI。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$request` | `Request` | 请求实例 |

返回值：`array|null` — 匹配到的路由/命令信息数组，未匹配到返回 `null`

> **路由放在 Request 中**：匹配结果由 `App::run()` 写入 `$request->Route`，路由参数写入 `$request->params`。业务代码获取当前路由统一从请求读取：控制器内 `$this->request->Route`，其它位置 `getApp()->request()->Route`。

### `command($name, $controller, $description = "")`

注册 CLI 命令（命令与 HTTP 路由统一在 Routes 文件中注册，CLI 按命令名分发）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 命令名，如 `"make:app"` |
| `$controller` | `string\|array\|Closure` | 命令控制器类名（实现 `handle()`）、`[类名, 方法名]` 或闭包 |
| `$description` | `string` | 命令说明（`--help` 展示） |

```php
Router::command("hello", HelloController::class, "Say hello");
Router::command("hi", [HelloController::class, "run"]);
Router::command("ping", function ($console, $args, $options) { ... });
```

### `commands()`

获取全部已注册命令表。

返回值：`array` — `[$name => ["controller" => ..., "handleMethodName" => ..., "description" => ...]]`

> 命令分发时序：CLI 下 `Console::handle()` 按命令名命中后写入 `$request->URI = $name`，随后装配 Bootup。

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
| [App](./app.md) | 构造时 `new Router`（构造内加载路由），run() 调用 match() | 匹配结果写入 request->Route |
| [Controller](./controller.md) | 路由映射目标 | 匹配后实例化控制器 |
| [Request](./request.md) | 匹配依据 | 根据 URL 和 Method 匹配 |
| [Middleware](./middleware.md) | 路由中间件 | 路由级别的中间件 |
