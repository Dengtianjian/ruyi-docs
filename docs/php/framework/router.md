# 路由

## 概述

- **命名空间**: `kernel\Foundation\Router`
- **文件位置**: `kernel/Foundation/Router/`
  - `Route.php` — 静态门面（唯一注册入口）
  - `RouteRegister.php` — 单路由载体
  - `RouteGroup.php` — 路由组（extends RouteRegister）
  - `RouteSame.php` — 同 URI 注册器（extends RouteRegister）
  - `RouteDomain.php` — 域名组（extends RouteRegister）
  - `Routes.php` — 静态容器（存储/匹配/URL 生成）
  - `Router.php` — 薄实例（App 持有，加载路由文件 + 匹配）
- **特点**:
  - 路由文件自动加载（`kernel/Routes/` + `{App}/Routes/`）
  - 只负责 HTTP 路由（CLI 命令由 `Console::register()` 独立管理）
  - 匹配在 `App::run()` 内通过 `Router::route()` → `Routes::match()` 完成
  - 命中参数经 `$request->params->fill()` 注入

## 类关系

```
Route（静态门面，唯一入口）
  ├── RouteRegister（单路由载体，读写一体 setter）
  │     ├── RouteGroup（路由组，DSL 收 uri + controller）
  │     ├── RouteSame（同 URI 注册器，DSL 只收 controller）
  │     └── RouteDomain（域名组，DSL 收 uri + controller）
  └── Routes（静态容器，存储/匹配/URL 生成）

Router（薄实例，App 持有）
  └── 构造加载路由文件 → route() 委托 Routes::match()
```

## 基本用法

路由文件放在 `{App}/Routes/` 目录下，通过 `Route` 门面注册：

```php
// {App}/Routes/index.php
use kernel\Foundation\Router\Route;

Route::get("users", UserController::class);
Route::post("users", StoreUserController::class);
Route::get("users/{id}", ShowUserController::class)->whereNumber("id");
```

### HTTP 方法

| 方法 | 说明 |
|------|------|
| `Route::get($uri, $controller)` | GET 请求 |
| `Route::post($uri, $controller)` | POST 请求 |
| `Route::put($uri, $controller)` | PUT 请求 |
| `Route::patch($uri, $controller)` | PATCH 请求 |
| `Route::delete($uri, $controller)` | DELETE 请求 |
| `Route::head($uri, $controller)` | HEAD 请求 |
| `Route::options($uri, $controller)` | OPTIONS 请求 |
| `Route::any($uri, $controller)` | 任意方法（兜底） |

`$controller` 支持三种形式：
- 类名字符串：`UserController::class`（默认调用 `data()` 方法）
- `[类名, 方法名]` 数组：`[UserController::class, "index"]`
- 闭包：`function () { return "hello"; }`

### 动态参数

URI 中用 `{param}` 定义动态参数，支持内联正则和可选参数：

```php
Route::get("users/{id}", ShowUserController::class);           // {id} 匹配 [^/]+
Route::get("users/{id:\d+}", ShowUserController::class);       // 内联正则
Route::get("posts/{?page}", ListController::class);            // 可选参数
```

### 参数约束（where）

```php
// 单参数
Route::get("users/{id}", UserController::class)->where("id", "[0-9]+");

// 多参数
Route::get("users/{id}/posts/{slug}", PostController::class)
    ->where(["id" => "[0-9]+", "slug" => "[a-z-]+"]);

// where 助手方法
Route::get("users/{id}", UserController::class)->whereNumber("id");
Route::get("tags/{name}", TagController::class)->whereAlpha("name");
Route::get("items/{code}", ItemController::class)->whereAlphaNumeric("code");
Route::get("status/{s}", StatusController::class)->whereIn("s", ["active", "pending", "closed"]);
Route::get("items/{uuid}", ItemController::class)->whereUuid("uuid");
```

| 助手方法 | 正则 | 说明 |
|----------|------|------|
| `whereNumber(...$names)` | `[0-9]+` | 数字 |
| `whereAlpha(...$names)` | `[a-zA-Z]+` | 字母 |
| `whereAlphaNumeric(...$names)` | `[a-zA-Z0-9]+` | 字母数字 |
| `whereIn($name, $values)` | `val1\|val2\|...` | 枚举值 |
| `whereUuid(...$names)` | UUID v4 正则 | UUID 格式 |

### 全局参数约束（pattern）

一次定义，对所有路由生效（路由自身 where 优先覆盖）：

```php
Route::pattern("id", "[0-9]+");
Route::pattern(["id" => "[0-9]+", "slug" => "[a-z-]+"]);

// 后续路由 id 自动约束为数字
Route::get("users/{id}", UserController::class);
```

## 路由组

### 前缀组

```php
Route::group("api", function ($g) {
    $g->get("users", UserController::class);     // /api/users
    $g->get("posts", PostController::class);      // /api/posts

    // 嵌套组
    $g->group("v1", function ($g2) {
        $g2->get("users", V1UserController::class); // /api/v1/users
    });
});
```

### 同 URI 注册器

同一 URI 下不同 HTTP 方法对应不同控制器：

```php
Route::same("links/{id}", function ($rs) {
    $rs->get(ShowLinkController::class);      // GET    /links/{id}
    $rs->put(UpdateLinkController::class);    // PUT    /links/{id}
    $rs->delete(RemoveLinkController::class); // DELETE /links/{id}
});
```

### 域名组

按生效域名声明路由：

```php
Route::domain("api.example.com", function ($d) {
    $d->get("users", ApiUserController::class);  // 仅 api.example.com
});

Route::get("users", WebUserController::class);   // 其他域名
```

### 交叉嵌套

组/same/域名可自由嵌套：

```php
Route::group("api", function ($g) {
    $g->same("users", function ($rs) {
        $rs->get(ShowUserController::class);  // /api/users (GET)
        $rs->put(UpdateUserController::class); // /api/users (PUT)
    });
});
```

## 中间件

### 路由中间件

```php
Route::get("users", UserController::class)
    ->middleware(AuthMiddleware::class);

// 多个中间件
Route::get("admin", AdminController::class)
    ->middleware([AuthMiddleware::class, AdminMiddleware::class]);

// 或使用别名
Route::get("api/data", ApiController::class)->middleware("auth");
```

### 中间件别名

在 `Middleware::set()` 时注册别名，路由中直接引用：

```php
// 注册
$middleware = new Middleware;
$middleware->set(AuthMiddleware::class, null, "auth");
$middleware->set(CorsMiddleware::class, null, "cors");
$App->set(["middleware" => $middleware]);

// 路由使用
Route::get("api/data", ApiController::class)->middleware("auth");
Route::get("api/users", UserController::class)->middleware(["auth", "cors"]);
```

## 命名路由

```php
Route::get("users/{id}/posts", PostController::class)->name("user.posts");

// 反向生成 URL
Route::url("user.posts", ["id" => 42]);
// "users/42/posts"

Route::url("user.posts", ["id" => 42, "page" => 2]);
// "users/42/posts?page=2"

// 绝对 URL
Route::url("user.posts", ["id" => 42], "example.com");
// "http://example.com/users/42/posts"

Route::url("user.posts", ["id" => 42], "example.com", true);
// "https://example.com/users/42/posts"
```

## 重定向

```php
Route::get("login", LoginController::class)->name("login");

// 在控制器中
return Route::redirect("login");                    // 302 到 /login
return Route::redirect("user.posts", ["id" => 42]); // 302 到 /users/42/posts
```

## 兜底路由

所有正常路由未命中时触发：

```php
// 全局兜底
Route::fallback(NotFoundController::class);

// 指定域名兜底
Route::fallback(ApiNotFoundController::class, "api.example.com");

// 域名组内兜底
Route::domain("api.example.com", function ($d) {
    $d->fallback(ApiNotFoundController::class);
});
```

## 额外参数（append）

隐式传值，不在 URL 中，匹配后合并进请求参数：

```php
Route::get("blog/{id}", BlogController::class)
    ->append(["status" => 1, "app_id" => 5]);
```

## 继承规则

路由属性沿祖先链（group → same → domain）继承：

| 属性 | 继承规则 |
|------|----------|
| `uri` | 外层在前拼接（`group("api")` + `same("users")` → `/api/users`） |
| `name` | 外层前缀 + 自身名拼接 |
| `middleware` | 父在前、自身在后合并 |
| `parameters` | 父在前、自身在后合并 |
| `where` | 父在前、自身在后合并（同名键后者覆盖） |
| `append` | 父在前、自身在后合并 |
| `controller` | 自身优先，否则沿祖先取第一个非 null |
| `method` | 自身优先，否则沿祖先取第一个非空 |
| `domain` | 自身优先，否则沿祖先取第一个非 `"*"` |

## 匹配规则

1. **域名查找序**：指定域名优先 → 全局（`"*"`）回退
2. **静态路由**：精确匹配 URI，方法优先 → `any` 兜底
3. **动态路由**：按段数从多到少 + 同段 URI 长度排序（最具体优先），逐条 `preg_match`
4. **HEAD 语义**：未注册 `head` 路由时回退 `get` 路由
5. **兜底路由**：所有正常路由未命中时，按域名序查 fallback

## 性能优化

- **脏标记缓存**：`distribute()` 使用 `$dirty` 标记，仅在有变更时重建路由表
- **编译缓存**：动态路由正则预编译并固化进 `compiledPattern`，避免每次匹配重复编译
- **重复注册检测**：重复注册同名/同路径路由触发 `E_USER_WARNING`
