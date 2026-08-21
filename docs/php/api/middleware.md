# Middleware 中间件

- **目录位置**: `kernel/Foundation/Middleware/`
- **命名空间**: `kernel\Foundation\Middleware`

中间件体系。基础类在 `kernel/Foundation/Middleware/`；**全局中间件子类**在 `kernel/Middleware/`（namespace `kernel\Middleware`）。

## MiddlewareBase — 中间件基类（抽象）

- **文件位置**: `kernel/Foundation/Middleware/MiddlewareBase.php`
- **命名空间**: `kernel\Foundation\Middleware`

中间件抽象基类，定义 `handle()` 抽象方法。类中间件实例化为 `new $target($request, $controller)` 后调用 `handle()`。

```php
use kernel\Foundation\Middleware\MiddlewareBase;

class AuthMiddleware extends MiddlewareBase
{
    public function handle($request, $controller)
    {
        // 校验通过则返回 null 或 next，未通过返回错误响应
        return null;   // 继续
    }
}
```

## Middleware — 中间件管理器

- **文件位置**: `kernel/Foundation/Middleware/Middleware.php`
- **命名空间**: `kernel\Foundation\Middleware`

中间件管理器，无参构造。注册全局中间件并执行洋葱链。

### `set($classOrFun, $executeParams)`

注册一个中间件。`$classOrFun` 可为中间件类名或闭包。

```php
$middleware = new Middleware();
$middleware->set(GlobalCorsMiddleware::class);
$middleware->set(function ($request, ...$params) { /* ... */ });
```

### `execute($routeMiddlewares, $controller, \Closure $callback)`

执行中间件链。合并全局 + 路由级中间件，递归洋葱链（`executeMiddleware` 私有）。类中间件 `new $target($request, $controller)` 调 `handle`；闭包 `$target($request, ...$params)`。`null` 响应抛 `RuntimeException`。

```php
$middleware->execute($route['middlewares'], $controller, $callback);
```

### App 集成

通过 `$app->set(["middleware" => $m])` 注入，`run()` 时调用 `middleware->execute(...)`。

```php
$app->set(["middleware" => $middleware]);
```
