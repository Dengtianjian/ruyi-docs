# RouteSame — 同 URI 注册器

- **文件位置**: `kernel/Foundation/Router/RouteSame.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 是
- **继承**: `RouteRegister`（**不继承 RouteGroup**）

用于同 URI 下细分 HTTP 方法。构造时设置 URI 并执行回调。

## 构造

```php
public function __construct($uri, $callback, $same = null, $group = null)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string` | 共用 URI |
| `$callback` | `callable` | 回调，注入 `RouteSame` 实例 |
| `$same` | `RouteSame\|null` | 所属同 URI 注册器 |
| `$group` | `RouteGroup\|null` | 所属组 |

## DSL 方法

同 URI DSL **只收 controller**（URI 已由构造给定），创建子路由并自动 `Routes::push`：

```php
function get($controller = null): RouteRegister
function post($controller = null): RouteRegister
function put($controller = null): RouteRegister
function patch($controller = null): RouteRegister
function delete($controller = null): RouteRegister
function head($controller = null): RouteRegister
function options($controller = null): RouteRegister
function any($controller = null): RouteRegister
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$controller` | `string\|array\|\Closure\|null` | 控制器 |

**示例**

```php
Route::same("links/{id}", function ($rs) {
    $rs->get(ShowLinkController::class);      // GET    /links/{id}
    $rs->put(UpdateLinkController::class);    // PUT    /links/{id}
    $rs->delete(RemoveLinkController::class); // DELETE /links/{id}
});
```

## 嵌套

```php
function same($uri = null, $callback = null): RouteSame|mixed
function group($prefix = null, $callback = null): RouteGroup|mixed
function fallback($controller = null): RouteRegister
```

无参调用读取所属父级，传值创建子级。

**示例**

```php
Route::same("links/{id}", function ($rs) {
    $rs->get(ShowLinkController::class);

    // 嵌套 same
    $rs->same("meta", function ($rs2) {
        $rs2->get(ShowMetaController::class);  // /links/{id}/meta (GET)
    });

    // 嵌套组
    $rs->group("admin", function ($g) {
        $g->get("edit", EditController::class); // /links/{id}/admin/edit (GET)
    });

    // 兜底
    $rs->fallback(NotFoundController::class);
});
```

## 继承自 RouteRegister

所有 `RouteRegister` 的读写一体 setter 和链式方法均可使用：

- `name()` / `prefix()` / `domain()` / `fallback()`
- `controller()` / `method()` / `uri()` / `parameters()`
- `middleware()` / `where()` / `whereNumber()` / `whereAlpha()` / ...
- `append()` / `params()` / `resolve()`
