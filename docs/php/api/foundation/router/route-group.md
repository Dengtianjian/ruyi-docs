# RouteGroup — 路由组

- **文件位置**: `kernel/Foundation/Router/RouteGroup.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 是
- **继承**: `RouteRegister`

用于路由组注册，构造时设置前缀并执行回调。

## 构造

```php
public function __construct($prefix, $callback, $same = null, $group = null)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `$prefix` | `string` | 组前缀 |
| `$callback` | `callable` | 组回调，注入 `RouteGroup` 实例 |
| `$same` | `RouteSame\|null` | 所属同 URI 注册器 |
| `$group` | `RouteGroup\|null` | 所属父组 |

## DSL 方法

组内 DSL 收 `($uri, $controller)`，创建子路由并自动 `Routes::push`：

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
Route::group("api", function ($g) {
    $g->get("users", UserController::class);     // /api/users
    $g->post("users", StoreUserController::class); // POST /api/users
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
Route::group("api", function ($g) {
    // 嵌套组
    $g->group("v1", function ($g2) {
        $g2->get("users", V1UserController::class); // /api/v1/users
    });

    // 嵌套 same
    $g->same("links/{id}", function ($rs) {
        $rs->get(ShowLinkController::class);      // /api/links/{id} (GET)
        $rs->put(UpdateLinkController::class);    // /api/links/{id} (PUT)
    });

    // 组内兜底
    $g->fallback(ApiNotFoundController::class);
});
```

## 继承自 RouteRegister

所有 `RouteRegister` 的读写一体 setter 和链式方法均可使用：

- `name()` / `prefix()` / `domain()` / `fallback()`
- `controller()` / `method()` / `uri()` / `parameters()`
- `middleware()` / `where()` / `whereNumber()` / `whereAlpha()` / ...
- `append()` / `params()` / `resolve()`
