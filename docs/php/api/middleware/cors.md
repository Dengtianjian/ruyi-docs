# CORS 配置说明

框架通过 `GlobalCorsMiddleware`（全局中间件）统一处理跨域，跨域逻辑由 `kernel\Foundation\HTTP\Cors` 静态辅助类实现。所有行为均由 `cors.*` 配置驱动，**未配置时回退到 `Cors::DEFAULTS` 默认值**。

> 配置读取：`Config::get("cors/{key}", Cors::DEFAULTS[{key}])`，即应用配置 `cors.php` 或 `Config::set("cors/...")` 的任意形态均可生效。

## 配置键一览

| 配置键 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `cors/allowOrigin` | `string\|string[]` | `"*"` | 允许的来源。`"*"`（通配）/ 逗号分隔字符串 / 数组 |
| `cors/allowMethods` | `string[]` | `["GET","POST","PUT","DELETE","PATCH","OPTIONS"]` | 允许的 HTTP 方法 |
| `cors/allowHeaders` | `string[]` | `["Authorization"]` | 允许的请求头 |
| `cors/exposeHeaders` | `string[]` | `["Authorization"]` | 允许浏览器读取的响应头 |
| `cors/maxAge` | `int` | `86400` | 预检结果缓存秒数 |
| `cors/allowCredentials` | `bool` | `false` | 是否允许携带凭据（Cookie/Authorization） |

## 行为说明

- **来源仅取自请求头 `Origin`**：畸形或伪造（缺 `scheme://host`）一律按非同源处理，不输出 `Access-Control-Allow-Origin`。
- **`allowOrigin` 命中判定**：支持 `"*"`、逗号分隔字符串、数组三种形态；命中后**精确回显请求 origin**（便于配合 `credentials`）；未命中则**不发送** `Access-Control-Allow-Origin` 头（符合规范，避免脏头）。
- **`allowCredentials = true`**：额外输出 `Access-Control-Allow-Credentials: true`。注意凭据模式下 `Allow-Origin` 不可为字面量 `*`，本实现按请求 origin 动态回显，天然兼容。
- **`Vary: Origin`**：当 `allowOrigin` 非通配时自动添加，提示缓存按来源区分。
- **常驻头**：无论是否跨域，以下头始终输出：`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers`、`Access-Control-Expose-Headers`、`Access-Control-Max-Age`。

## 配置示例

### 允许所有来源（默认，最简）

```php
// config/cors.php 不配置即可；等价于：
return [
  "allowOrigin" => "*",
];
```

### 限定具体来源 + 允许凭据

```php
return [
  "allowOrigin" => ["https://app.example.com", "https://admin.example.com"],
  "allowMethods" => ["GET", "POST", "PUT", "DELETE"],
  "allowHeaders" => ["Authorization", "Content-Type"],
  "exposeHeaders" => ["Authorization", "X-Total-Count"],
  "maxAge" => 3600,
  "allowCredentials" => true,
];
```

### 开发期放开（任意来源 + 任意头）

```php
return [
  "allowOrigin" => "*",
  "allowHeaders" => ["*"], // 注意：此形态需自行保证安全
];
```

## 与 OPTIONS 预检的配合

跨域预检（OPTIONS）的 `Access-Control-*` 头由 `GlobalCorsMiddleware` 后置注入。**OPTIONS 路由无需手写响应**：

```php
use kernel\Foundation\Router\Route;

Route::options();            // 任意 URI 的 OPTIONS 请求自动返回 204 空响应
Route::options("users");     // 仅该 URI 的 OPTIONS 放行
```

中间件在 `$next()` 拿到 `Response` 后统一补 `Access-Control-*` 头，业务控制器只关心正常响应即可。

## 相关文件

- `kernel/Middleware/GlobalCorsMiddleware.php`：全局中间件，薄封装，仅负责取 `Origin` 并调用 `Cors::applyTo()`。
- `kernel/Foundation/HTTP/Cors.php`：CORS 计算与响应头装配（含 `DEFAULTS` 默认值）。
