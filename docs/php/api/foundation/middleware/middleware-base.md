# MiddlewareBase — 中间件基类

- **文件位置**: `kernel/Foundation/Middleware/MiddlewareBase.php`
- **命名空间**: `kernel\Foundation\Middleware`
- **类型**: 抽象类
- **是否可继承**: 是（必须继承并实现 `handle()`）

所有类中间件的基类。构造时接收请求实例与控制器实例并保存为受保护属性，供子类在 `handle()` 中使用。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$request` | `Request` | — | protected | 请求实例，由构造注入 |
| `$controller` | `Controller\|AuthController\|\Closure\|null` | — | protected | 控制器实例；闭包路由时（无控制器）为 `null`，由构造注入 |

## 方法

### `__construct(Request $request, $controller = null)` — 中间件基类构造函数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$request` | `Request` | 无 | 请求实例 |
| `$controller` | `Controller\|AuthController\|\Closure\|null` | `null` | 控制器实例；闭包路由时为 `null` |

**返回值**

- 无。

## 子类实现约定

子类需实现 `handle()` 方法。由 `Middleware::execute()` 调用，接收中间件执行参数并以 `$next` 闭包作为最后一个参数；必须调用 `return $next()` 继续执行并返回其响应。

**示例**

```php
use kernel\Foundation\Middleware\MiddlewareBase;
use kernel\Foundation\HTTP\Response;

class AuthMiddleware extends MiddlewareBase
{
    public function handle($next)
    {
        if (!$this->request->header('Authorization')) {
            return Response::error('未登录', 401);
        }
        return $next();
    }
}
```
