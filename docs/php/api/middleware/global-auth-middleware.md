# GlobalAuthMiddleware — 全局认证中间件

- **文件位置**: `kernel/Middleware/GlobalAuthMiddleware.php`
- **命名空间**: `kernel\Middleware`
- **继承**: `extends Foundation\Middleware\MiddlewareBase`
- **是否可继承**: 是

全局认证中间件。验证 `Authorization` Token、处理过期与自动刷新，并对 `AuthController` 做管理员/用户认证分发。

## 构造

```php
new GlobalAuthMiddleware(Request $request, Controller $controller)
```

- 绑定 `LoginsModel` 校验 Token

## 认证流程

对继承 `AuthController` 的控制器：
1. `$controller->Admin` 为真 → `verifyToken()` 严格校验 + `verifyAdmin()`
2. `$controller->Auth` 为真 → `verifyToken()` 严格校验 + `verifyAuth()`
3. 否则 → `verifyToken(false)` 宽松校验

对普通控制器 → 宽松校验 Token。

## 方法

| 方法 | 说明 |
|------|------|
| `sameOrigin()` | 判断是否同源（Sec-Fetch-Site / Origin / Referer） |
| `verifyToken($strongCheck = true)` | 验证 Token（校验前缀、过期、自动刷新） |
| `handle(\Closure $next)` | 中间件逻辑 |

## Token 自动刷新

有效期剩余不足 20% 时自动刷新 Token，并通过响应头 `Authorization` 返回新 Token。

## 使用

```php
use kernel\Middleware\GlobalAuthMiddleware;

$middleware = new Middleware();
$middleware->set(GlobalAuthMiddleware::class);
$app->set(["middleware" => $middleware]);
```
