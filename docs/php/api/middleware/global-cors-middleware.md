# GlobalCorsMiddleware — 全局 CORS 中间件

- **文件位置**: `kernel/Middleware/GlobalCorsMiddleware.php`
- **命名空间**: `kernel\Middleware`
- **继承**: `extends Foundation\Middleware\MiddlewareBase`
- **是否可继承**: 是

全局跨域（CORS）中间件，按 `Config::get("cors/*")` 配置设置响应头，处理 OPTIONS 预检。

## 构造

```php
new GlobalCorsMiddleware()
```

## 方法

| 方法 | 说明 |
|------|------|
| `getOrigin()` | 获取请求来源（HTTP_ORIGIN → HTTP_REFERER → REMOTE_ADDR） |
| `handle($next)` | 设置 CORS 响应头并处理预检 |

## 读取的配置

| 配置键 | 说明 |
|--------|------|
| `cors/allowOrigin` | 允许来源（`*` 或逗号分隔列表） |
| `cors/allowHeaders` | 允许请求头（默认 `Authorization`） |
| `cors/exposeHeaders` | 暴露响应头（默认 `Authorization`） |
| `cors/maxAge` | 预检缓存秒数（默认 86400） |
| `cors/sameOrigin` | 同源白名单（开发模式） |

## 使用

```php
use kernel\Middleware\GlobalCorsMiddleware;

$middleware = new Middleware();
$middleware->set(GlobalCorsMiddleware::class);
$app->set(["middleware" => $middleware]);
```
