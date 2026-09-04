# GlobalCorsMiddleware — 全局 CORS 中间件

- **文件位置**: `kernel/Middleware/GlobalCorsMiddleware.php`
- **命名空间**: `kernel\Middleware`
- **继承**: `extends Foundation\Middleware\MiddlewareBase`
- **是否可继承**: 是

全局跨域（CORS）中间件，是 `kernel\Foundation\HTTP\Cors` 的薄封装：仅负责从请求头取 `Origin`，并在 `$next()` 返回 `Response` 后调用 `Cors::applyTo()` 后置注入 `Access-Control-*` 头。跨域计算与配置默认值集中在 `Cors` 类，详见 [CORS 配置说明](/php/api/middleware/cors)。

## 构造

```php
new GlobalCorsMiddleware()
```

## 方法

| 方法 | 说明 |
|------|------|
| `getOrigin()` | 获取请求来源（`$_SERVER['HTTP_ORIGIN']`，无则 `null`） |
| `handle($next)` | 后置注入 CORS 响应头（`$next()` 后调用 `Cors::applyTo()`） |

## 读取的配置

> 以下配置键均由 `Cors` 解析，未配置回退 `Cors::DEFAULTS`，详见 [CORS 配置说明](/php/api/middleware/cors)。

| 配置键 | 默认值 |
|--------|--------|
| `cors/allowOrigin` | `"*"` |
| `cors/allowMethods` | `["GET","POST","PUT","DELETE","PATCH","OPTIONS"]` |
| `cors/allowHeaders` | `["Authorization"]` |
| `cors/exposeHeaders` | `["Authorization"]` |
| `cors/maxAge` | `86400` |
| `cors/allowCredentials` | `false` |

## 使用

```php
use kernel\Middleware\GlobalCorsMiddleware;

$middleware = new Middleware();
$middleware->set(GlobalCorsMiddleware::class);
$app->set(["middleware" => $middleware]);
```
