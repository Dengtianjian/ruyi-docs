# Route — 静态门面

- **文件位置**: `kernel/Foundation/Router/Route.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 否（final 语义，纯静态入口）

路由定义的唯一入口。所有方法返回路由载体对象（`RouteRegister` / `RouteGroup` / `RouteSame` / `RouteDomain`），供链式设置。

## HTTP 方法注册

```php
static function get($uri, $controller = null): RouteRegister
static function post($uri, $controller = null): RouteRegister
static function put($uri, $controller = null): RouteRegister
static function patch($uri, $controller = null): RouteRegister
static function delete($uri, $controller = null): RouteRegister
static function head($uri, $controller = null): RouteRegister
static function options($uri, $controller = null): RouteRegister
static function any($uri, $controller = null): RouteRegister  // 任意方法，method="*"
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string` | 路由 URI，如 `"users"`、`"blog/{id:\d+}"` |
| `$controller` | `string\|array\|\Closure\|null` | 控制器：类名 / `[类,方法]` / 闭包，可省略 |

**示例**

```php
Route::get("users", UserController::class);
Route::post("users", StoreUserController::class);
Route::get("users/{id}", ShowUserController::class)->whereNumber("id");
Route::any("fallback", FallbackController::class);
```

> **OPTIONS 快捷放行**：`Route::options($uri, $controller = null)`——省略控制器时自动返回 **204 空响应**，跨域场景下由 `GlobalCorsMiddleware` 等中间件按需补 `Access-Control-*` 头。
>
> - `Route::options("users")`：仅该 URI 的 OPTIONS 请求返回 204。
> - `Route::options()`（`$uri` 为 `null`）：通配任意 URI，全量放行 OPTIONS 预检——适合「不想逐个 URI 设置」的场景，一行即可全放行。
> - 如需自定义预检逻辑，显式传入控制器/闭包即可。
>
> ```php
> Route::options("users"); // 该 URI 的 OPTIONS 请求自动返回 204 空响应
> Route::options();        // 任意 URI 的 OPTIONS 请求统一返回 204 空响应
> ```
>
> 优先级：若某 URI 另有更具体的 `Route::options($uri, ...)` 或显式 OPTIONS 路由，以其为准；其余 OPTIONS 一律落回 `Route::options()`（null）的 204 兜底。

## `group($prefix, $callback)` — 路由组

```php
static function group($prefix, $callback): RouteGroup
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$prefix` | `string` | 组前缀 |
| `$callback` | `callable` | 组回调，注入 `RouteGroup` 实例 |

**示例**

```php
Route::group("api", function ($g) {
    $g->get("users", UserController::class);     // /api/users
    $g->group("v1", function ($g2) {             // 嵌套组
        $g2->get("users", V1UserController::class); // /api/v1/users
    });
});
```

## `same($uri, $callback)` — 同 URI 注册器

```php
static function same($uri, $callback): RouteSame
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string` | 共用 URI |
| `$callback` | `callable` | 回调，注入 `RouteSame` 实例 |

**示例**

```php
Route::same("links/{id}", function ($rs) {
    $rs->get(ShowLinkController::class);      // GET    /links/{id}
    $rs->put(UpdateLinkController::class);    // PUT    /links/{id}
    $rs->delete(RemoveLinkController::class); // DELETE /links/{id}
});
```

## `domain($domain, $callback)` — 域名组

```php
static function domain($domain, $callback): RouteDomain
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$domain` | `string` | 生效域名（如 `"api.example.com"`，不含协议/端口） |
| `$callback` | `callable` | 回调，注入 `RouteDomain` 实例 |

**示例**

```php
Route::domain("api.example.com", function ($d) {
    $d->get("users", ApiUserController::class);  // 仅 api.example.com
});
```

## `fallback($controller, $domain)` — 兜底路由

```php
static function fallback($controller = null, $domain = null): RouteRegister
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$controller` | `string\|array\|\Closure\|null` | `null` | 兜底控制器/闭包 |
| `$domain` | `string\|null` | `null` | 生效域名（`null` = 全局兜底） |

**示例**

```php
Route::fallback(NotFoundController::class);
Route::fallback(ApiNotFoundController::class, "api.example.com");
```

## `pattern($name, $regex)` — 全局参数约束

```php
static function pattern($name, $regex = null): void
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string\|array` | 参数名或 `参数名=>正则` 映射 |
| `$regex` | `string\|null` | 当 `$name` 为字符串时必填的正则 |

**示例**

```php
Route::pattern("id", "[0-9]+");
Route::pattern(["id" => "[0-9]+", "slug" => "[a-z-]+"]);
```

## `url($name, $params, $domain, $https)` — 反向生成 URL

```php
static function url($name, $params = [], $domain = null, $https = false): string
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 必填 | 路由名 |
| `$params` | `array` | `[]` | 路由参数（参数名 => 值） |
| `$domain` | `string\|null` | `null` | 域名（非 null 时生成绝对 URL） |
| `$https` | `bool` | `false` | 是否 HTTPS |

**返回值**

- `string`：相对路径或绝对 URL
- 路由名不存在抛 `InvalidArgumentException`
- 必选参数缺失抛 `InvalidArgumentException`

**示例**

```php
Route::get("users/{id}/posts", PostController::class)->name("user.posts");

Route::url("user.posts", ["id" => 42]);
// "users/42/posts"

Route::url("user.posts", ["id" => 42, "page" => 2]);
// "users/42/posts?page=2"

Route::url("user.posts", ["id" => 42], "example.com");
// "http://example.com/users/42/posts"

Route::url("user.posts", ["id" => 42], "example.com", true);
// "https://example.com/users/42/posts"
```

## `redirect($name, $params)` — 重定向响应

```php
static function redirect($name, $params = []): Result
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 路由名 |
| `$params` | `array` | 路由参数 |

**返回值**

- `Result`：302 重定向响应（含 `Location` 头）

**示例**

```php
return Route::redirect("login");
return Route::redirect("user.posts", ["id" => 42]);
```
