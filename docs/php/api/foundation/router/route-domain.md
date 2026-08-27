# RouteDomain — 域名组

- **文件位置**: `kernel/Foundation/Router/RouteDomain.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 是
- **继承**: `RouteRegister`

用于域名路由注册。构造时设置域名并执行回调。

## 构造

```php
public function __construct($domain, $callback, $same = null, $group = null)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `$domain` | `string` | 生效域名（如 `"api.example.com"`，不含协议/端口） |
| `$callback` | `callable` | 回调，注入 `RouteDomain` 实例 |
| `$same` | `RouteSame\|null` | 所属同 URI 注册器 |
| `$group` | `RouteGroup\|null` | 所属组 |

## DSL 方法

域名组 DSL 收 `($uri, $controller)`，创建子路由并自动 `Routes::push`：

```php
function get($uri = null, $controller = null): RouteRegister
function post($uri = null, $controller = null): RouteRegister
function put($uri = null, $controller = null): RouteRegister
function patch($uri = null, $controller = null): RouteRegister
function delete($uri = null, $controller = null): RouteRegister
function head($uri = null, $controller = null): RouteRegister
function options($uri = null, $controller = null): RouteRegister
function any($uri = null, $controller = null): RouteRegister
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string\|null` | 路由 URI（`null` 时读取所属父级） |
| `$controller` | `string\|array\|\Closure\|null` | 控制器 |

**示例**

```php
Route::domain("api.example.com", function ($d) {
    $d->get("users", ApiUserController::class);   // 仅 api.example.com
    $d->post("users", ApiStoreUserController::class);
});
```

## 嵌套

```php
function group($prefix = null, $callback = null): RouteGroup|mixed
function same($uri = null, $callback = null): RouteSame|mixed
function fallback($controller = null): RouteRegister
```

无参调用读取所属父级，传值创建子级。

**示例**

```php
Route::domain("api.example.com", function ($d) {
    $d->get("users", ApiUserController::class);

    // 嵌套组
    $d->group("v1", function ($g) {
        $g->get("users", V1ApiUserController::class); // api.example.com/v1/users
    });

    // 嵌套 same
    $d->same("links/{id}", function ($rs) {
        $rs->get(ShowLinkController::class);  // api.example.com/links/{id} (GET)
    });

    // 域名兜底
    $d->fallback(ApiNotFoundController::class);
});
```

## 继承自 RouteRegister

所有 `RouteRegister` 的读写一体 setter 和链式方法均可使用：

- `name()` / `prefix()` / `domain()` / `fallback()`
- `controller()` / `method()` / `uri()` / `parameters()`
- `middleware()` / `where()` / `whereNumber()` / `whereAlpha()` / ...
- `append()` / `params()` / `resolve()`
