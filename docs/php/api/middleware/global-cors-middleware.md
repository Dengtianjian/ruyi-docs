# GlobalCorsMiddleware — 全局 CORS 中间件

- **文件位置**: `kernel/Middleware/GlobalCorsMiddleware.php`
- **命名空间**: `kernel\Middleware`
- **继承**: `extends Foundation\Middleware\MiddlewareBase`
- **是否可继承**: 是

全局跨域（CORS）中间件，是 `kernel\Foundation\HTTP\Cors` 的薄封装：负责从请求头取 `Origin` 后注入 `Access-Control-*` 头——**非开发模式后置**（`$next()` 返回 `Response` 后 `Cors::applyTo()`），**开发模式前置**（先 `Cors::emit()` 再 `$next()`，使错误响应也带 CORS 头且来源不限制）。跨域计算与配置默认值集中在 `Cors` 类，详见 [CORS 配置说明](/php/api/middleware/cors)。

## 构造

```php
new GlobalCorsMiddleware()
```

## 方法

| 方法 | 说明 |
|------|------|
| `getOrigin()` | 获取请求来源（`$_SERVER['HTTP_ORIGIN']`，无则 `null`） |
| `handle($next)` | 注入 CORS 响应头：开发模式前置 `Cors::emit()`，非开发模式后置 `Cors::applyTo()` |

## 错误响应（开发模式）

`$next()` 抛异常时，异常会穿透本中间件，后置的 `Cors::applyTo()` 不会执行 → 错误响应不带 CORS 头，浏览器会以跨域错误拦截、只看到空白。因此在**开发模式**下本中间件改为**前置** `Cors::emit()`：先输出 CORS 头再 `$next()`，业务抛异常时错误响应同样带 CORS 头，浏览器才能读到真正的报错。生产模式仍为后置注入。详见 [CORS 配置说明](/php/api/middleware/cors)。

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
