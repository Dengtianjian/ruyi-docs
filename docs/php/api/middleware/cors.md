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
- **开发模式不限制来源**：`mode=development` 时忽略 `allowOrigin` 白名单，任意合法 `Origin` 一律放行并回显（`Cors::isDevelopment()` 命中即短路白名单校验），便于本地联调。
- **开发模式下错误响应也带 CORS 头**：抛出异常时响应不经过后置中间件（异常会穿透 `$next()`），因此开发模式下 `GlobalCorsMiddleware` 改为**前置**调用 `Cors::emit()` 输出头，保证错误响应同样带 CORS 头，浏览器才能读到真正的报错（否则只看到空白）。生产模式仍为**后置**注入（`Cors::applyTo()`）。

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

`mode=development` 时框架**自动不限制来源**（忽略 `allowOrigin` 白名单），无需为此专门配置：

```php
// Config.local.php
return [
  "mode" => "development",
  "cors" => [
    // allowOrigin 会被开发模式绕过；如前端带了自定义头，可按需放开
    "allowHeaders" => "*",
  ],
];
```

> 如需在**非开发模式**下放开所有来源，直接设 `"allowOrigin" => "*"` 即可（此时 `allowHeaders` 等仍需按需配置）。

## 与 OPTIONS 预检的配合

跨域预检（OPTIONS）的 `Access-Control-*` 头由 `GlobalCorsMiddleware` 后置注入。**OPTIONS 路由无需手写响应**：

```php
use kernel\Foundation\Router\Route;

Route::options();            // 任意 URI 的 OPTIONS 请求自动返回 204 空响应
Route::options("users");     // 仅该 URI 的 OPTIONS 放行
```

中间件在 `$next()` 拿到 `Response` 后统一补 `Access-Control-*` 头，业务控制器只关心正常响应即可。

## 相关文件

- `kernel/Middleware/GlobalCorsMiddleware.php`：全局中间件，薄封装——取 `Origin` 后：非开发模式**后置** `Cors::applyTo()`；开发模式**前置** `Cors::emit()`。
- `kernel/Foundation/HTTP/Cors.php`：CORS 计算与响应头装配（含 `DEFAULTS` 默认值）。`headers()` 产出头部数组、`applyTo()` 写入 `Response`、`emit()` 直接 `header()` 输出。
