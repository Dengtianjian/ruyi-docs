# Middleware — 中间件基类

Middleware 是所有中间件的基类。中间件用于在控制器执行前/后进行拦截处理，常用于认证、日志、CORS 等场景。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Middleware.php`

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$request` | `Request` | 当前请求实例 |
| `$controller` | `Controller\|AuthController\|Closure` | 当前控制器实例，如果是闭包则为 `null` |

## 方法列表

### `__construct($request, $controller)`

中间件构造函数。接收请求实例和控制器实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$request` | `Request` | 当前请求实例 |
| `$controller` | `Controller\|AuthController\|null` | 控制器实例，闭包控制器时为 `null` |

> 注意：子类必须实现 `handle()` 方法。

## handle() 方法约定

每个中间件都需要实现 `handle(\Closure $next)` 方法，该方法：

1. 接收 `$next` 闭包，调用 `$next()` 才会继续执行后续中间件或控制器
2. 返回 Response 实例
3. 如果返回错误响应，中间件链会中断

## 使用方式

### 1. 创建全局中间件

全局中间件对每个请求都执行，在入口文件中注册：

```php
// index.php
$App->setMiddlware(GlobalAuthMiddleware::class);
$App->setMiddlware(GlobalCorsMiddleware::class);
```

### 2. 创建路由级中间件

路由级中间件只对特定路由执行，在路由注册时指定：

```php
Router::post("notifications/send", SendNoticeController::class, [
    GlobalDingTalkMiddleware::class
]);

Router::group("admin", function () {
    // ...
}, [AdminMiddleware::class]);
```

### 3. 自定义中间件示例

```php
<?php
namespace myapp\Middleware;

use kernel\Foundation\Middleware;
use kernel\Foundation\ReturnResult\ReturnResult;

class RateLimitMiddleware extends Middleware
{
    public function handle(\Closure $next)
    {
        $ip = \kernel\Foundation\HTTP\Request::realClientIp();
        $key = "rate_limit:" . $ip;
        
        $count = \kernel\Foundation\Cache::read($key) ?: 0;
        
        if ($count > 100) {
            // 超过限制，返回错误
            $RR = new ReturnResult(false);
            $RR->error(429, "429001", "请求过于频繁，请稍后再试");
            return $RR;
        }
        
        \kernel\Foundation\Cache::overwrite($key, $count + 1, 1);
        
        // 继续执行后续中间件和控制器
        return $next();
    }
}
```

### 4. 闭包中间件

也可以用闭包直接作为中间件：

```php
$App->setMiddlware(function ($request, $next) {
    // 前置处理
    $startTime = microtime(true);
    
    // 执行后续
    $response = $next();
    
    // 后置处理
    $duration = microtime(true) - $startTime;
    $response->addBody(["duration" => $duration . "s"]);
    
    return $response;
});
```

## 中间件执行顺序

```
请求
  │
  ▼
┌─────────────────────────┐
│  全局中间件 1 (Global1)  │  ← 先注册先执行
│        ↓ $next()        │
│  全局中间件 2 (Global2)  │
│        ↓ $next()        │
│  路由级中间件 1          │
│        ↓ $next()        │
│  路由级中间件 2          │
│        ↓ $next()        │
│  控制器 data()           │
│        ↓ return         │
│  路由级中间件 2 (后置)    │  ← 洋葱模型：后进先出
│  路由级中间件 1 (后置)    │
│  全局中间件 2 (后置)      │
│  全局中间件 1 (后置)      │
└─────────────────────────┘
  │
  ▼
响应
```

## 内置全局中间件

### GlobalAuthMiddleware

**文件**: `kernel/Middleware/GlobalAuthMiddleware.php`

负责用户认证：
- 读取请求头中的 `Authorization` Token
- 验证 Token 有效性和过期时间
- Token 剩余有效期不足 20% 时自动刷新
- 支持 `AuthController` 的 `$Admin`/`$Auth` 属性

**方法**:

| 方法 | 说明 |
|------|------|
| `sameOrigin()` | 判断请求是否同源 |
| `verifyToken($strongCheck)` | 验证 Token，`$strongCheck=true` 时必须提供有效 Token |
| `handle(\Closure $next)` | 中间件入口，读取控制器认证需求并执行对应校验 |

### GlobalCorsMiddleware

**文件**: `kernel/Middleware/GlobalCorsMiddleware.php`

处理跨域请求（CORS）。

### GlobalWechatOfficialAccountMiddleware

**文件**: `kernel/Middleware/GlobalWechatOfficialAccountMiddleware.php`

处理微信公众号相关请求。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 注册全局中间件 | `setMiddlware()` |
| [Router](./router.md) | 路由级中间件 | 路由注册时指定 |
| [AuthController](./auth-controller.md) | 配合认证 | 中间件读取认证属性 |
| [Controller](./controller.md) | 拦截目标 | 中间件在控制器前后执行 |
| [ReturnResult](./return-result.md) | 错误返回 | 中间件用 ReturnResult 返回错误 |
