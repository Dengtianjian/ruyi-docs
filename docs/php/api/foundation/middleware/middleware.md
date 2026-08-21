# Middleware — 中间件管理器

- **文件位置**: `kernel/Foundation/Middleware/Middleware.php`
- **命名空间**: `kernel\Foundation\Middleware`
- **是否可继承**: 是

全局中间件管理器。注册全局中间件并通过洋葱模型递归执行中间件链（全局中间件 + 路由级中间件）。通过 `$app->set(["middleware" => $m])` 注入应用，应用 `run()` 时调用 `execute()`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$middlewares` | `array` | `[]` | protected | 全局中间件列表，元素为 `["target" => 中间件, "params" => 执行参数]` |

## 方法

### `__construct()` — 构建中间件管理器

**参数**

- 无。

**返回值**

- 无。

### `set($classOrFun, $executeParams = null)` — 注册全局中间件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$classOrFun` | `\Closure\|object\|string` | 无 | 中间件。类名（构造接收 `Request` 与控制器，调 `handle` 方法）或闭包（首参为 `Request`） |
| `$executeParams` | `array` | `null` | 执行中间件时传入的参数，会追加到调用链中 |

**返回值**

- 无。

### `execute($routeMiddlewares, Controller $controller, \Closure $callback)` — 执行中间件链

将路由级中间件合并到全局中间件列表之后，统一以洋葱模型递归执行。最内层为 `$callback`（业务逻辑）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$routeMiddlewares` | `array\|null` | 无 | 路由级中间件列表，元素为中间件类名/闭包 |
| `$controller` | `Controller` | 无 | 控制器实例 |
| `$callback` | `\Closure` | 无 | 最内层回调，执行业务逻辑并返回 `Response` |

**返回值**

- `\kernel\Foundation\HTTP\Response`：中间件链最终返回的响应。

### `executeMiddleware($middlewares, Controller $controller, \Closure $callback)` — 递归执行中间件链

> private。洋葱模型核心：无剩余中间件时调用 `$callback()`；否则弹出首个中间件，构造 `$next` 递归函数作为该中间件执行的最后参数。类中间件以 `new $target(getApp()->request(), $controller)` 实例化并调 `handle(...$params, $next)`；闭包中间件以 `$target(getApp()->request(), ...$params, $next)` 调用。中间件返回 `null` 时抛 `RuntimeException`（提示缺少 `return $next()`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$middlewares` | `array` | 无 | 待执行中间件列表 |
| `$controller` | `Controller` | 无 | 控制器实例 |
| `$callback` | `\Closure` | 无 | 最内层回调 |

**返回值**

- `\kernel\Foundation\HTTP\Response`：中间件链最终返回的响应。

**异常**

- `RuntimeException`：中间件未返回 `Response` 时抛出。

## 示例

```php
use kernel\Foundation\Middleware\Middleware;

$m = new Middleware();
$m->set(\App\Middleware\GlobalCors::class);          // 全局类中间件
$m->set(function ($request, $next) {                  // 全局闭包中间件
    return $next();
});
$app->set(["middleware" => $m]);
```
