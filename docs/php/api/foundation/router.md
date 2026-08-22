# Router — 路由注册与匹配

- **文件位置**: `kernel/Foundation/Router.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

路由注册与匹配。维护全局路由表，提供链式 DSL 风格的 API。构造时按模式加载路由文件：**http 模式**注册 URI 路由、**command 模式**注册 CLI 命令。

**运行模式**：构造时自动判断（非 CLI 环境为 `http`，CLI 为 `command`），可用 `setMode()` 显式覆盖（如 CLI 下模拟 HTTP 请求）。

**匹配优先级**（http 模式）：
1. 静态 `common` 路由
2. 静态 `async` 路由（仅 async 请求）
3. 静态 `any` 路由
4. 动态路由逐条 `preg_match`

**路由注册形式**（`$controller` 参数）：
- 字符串类名：`Controller` → 默认调用 `data()` 方法
- 数组 `[Controller::class, "method"]`：指定方法名
- 闭包：直接执行

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$staticRoutes` | `array` | `[]` | static private | 静态路由表，结构 `$staticRoutes[$type][$method][$uri]` |
| `$paramsRoutes` | `array` | `[]` | static private | 动态路由表（含正则参数的 URI），结构 `$paramsRoutes[$type][$method][$pattern]` |
| `$inGroup` | `bool` | `false` | static private | 是否处于 `group()` 回调中 |
| `$groupMiddlewares` | `array` | `[]` | static private | `group()` 上下文中的共享中间件 |
| `$prefix` | `string[]` | `[]` | static private | 路由前缀栈，由 `group()` / `prefix()` 设置 |
| `$sameUri` | `string\|null` | `null` | static private | `same()` 上下文中的共用 URI |
| `$mode` | `string\|null` | `null` | static private | 运行模式：`http` / `command` |
| `$commands` | `array` | `[]` | static private | CLI 命令表，结构 `$commands[$name] = ["controller","handleMethodName","description"]` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($mode = null)` | 构造：设置模式并加载路由文件 |
| `setMode($mode)` | 显式设置运行模式 |
| `mode()` | 获取运行模式 |
| `loadRoutes()` | 扫描 kernel/App 的 Routes 目录并 include（protected） |
| `prefix($prefix, $append = false)` | 设置路由前缀 |
| `group($prefix, $callback, $middlewares = [])` | 路由组：共享前缀与中间件 |
| `same($uri, $callback)` | 同一 URI 注册不同方法 |
| `register($type, $method, $uri, $controller, $middlewares, $params)` | 注册路由（核心） |
| `buildParamsPattern($uri)` | 构建动态路由正则（protected） |
| `resolveControllerTarget($controller)` | 解析控制器目标（protected） |
| `get($uri, $controller, $middlewares, $params)` | 注册 GET 路由 |
| `post($uri, $controller, $middlewares, $params)` | 注册 POST 路由 |
| `put($uri, $controller, $middlewares, $params)` | 注册 PUT 路由 |
| `patch($uri, $controller, $middlewares, $params)` | 注册 PATCH 路由 |
| `delete($uri, $controller, $middlewares, $params)` | 注册 DELETE 路由 |
| `options($uri, $controller, $middlewares, $params)` | 注册 OPTIONS 路由 |
| `head($uri, $controller, $middlewares, $params)` | 注册 HEAD 路由 |
| `any($uri, $controller, $middlewares, $params)` | 注册任意方法路由 |
| `async($uri, $controller, $middlewares, $params)` | 注册异步路由（内部调用） |
| `match(Request $request)` | 匹配当前请求的路由 |
| `dispatch($uri, $data, $headers, $timeout)` | 内部 CURL 调用异步路由 |
| `command($name, $controller, $description)` | 注册 CLI 命令 |
| `commands()` | 获取 CLI 命令表 |

## 方法

### `__construct($mode = null)` — 构造并加载路由

设置运行模式并调用 `loadRoutes()` 加载路由文件。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mode` | `string\|bool\|null` | `null` | `http`/`command`；`true` 视为 `http`、`false` 视为 `command`；`null` 自动判断（非 CLI 为 `http`，否则 `command`） |

**返回值**

- 无。

### `setMode($mode)` — 设置运行模式

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mode` | `string\|bool` | 无 | `http`/`command`；`true` 视为 `http`、`false` 视为 `command` |

**返回值**

- `string`：类名（供链式调用）。

**示例**

```php
Router::setMode("http");   // CLI 下模拟 HTTP 请求
```

### `mode()` — 获取运行模式

**参数**

- 无。

**返回值**

- `string|null`：当前运行模式（`http` / `command`）。

### `loadRoutes()` — 加载路由文件

扫描 `{Path::kernelRoot()}/Routes` 与 `{Path::root()}/Routes` 下所有 PHP 文件并 `include_once`（先去重），文件内通过 `Router::get/command` 等注册路由。按运行模式收集：http 仅收集 URI 路由，command 仅收集 CLI 命令。

> protected，构造时自动调用。

**参数**

- 无。

**返回值**

- `bool`：`true`。

### `prefix($prefix, $append = false)` — 设置路由前缀

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$prefix` | `string\|array\|null` | 无 | 前缀（字符串按 `/` 切分为多段）；`null` 清空前缀 |
| `$append` | `bool` | `false` | `true` 追加到现有前缀之后；`false` 替换现有前缀 |

**返回值**

- `string`：类名（供链式调用）。

### `group($prefix, \Closure $callback, $middlewares = [])` — 路由组

共享前缀与中间件。回调内注册的路由自动带上组前缀，并叠加组中间件。回调结束后自动恢复现场。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$prefix` | `string\|array` | 无 | 组前缀 |
| `$callback` | `\Closure` | 无 | 组内注册路由的回调 |
| `$middlewares` | `array` | `[]` | 组共享中间件 |

**返回值**

- `string`：类名（供链式调用）。

**示例**

```php
Router::group("notifications", function () {
    Router::get("", ListNoticeController::class);
    Router::post("send", SendNoticeController::class);
}, [AuthMiddleware::class]);
```

### `same($uri, \Closure $callback)` — 同一 URI 注册不同方法

回调内 `get/post` 等方法**不再传 URI**，仅传控制器。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string` | 无 | 共用的 URI |
| `$callback` | `\Closure` | 无 | 注册回调（内部只传控制器） |

**返回值**

- `string`：类名（供链式调用）。

**示例**

```php
Router::same("links/{linkId:\w+}", function () {
    Router::get(GetLinkController::class);
    Router::put(PutLinkController::class);
});
```

### `register($type, $method, $uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册路由（核心）

构造路由条目并入静态/动态路由表。command 模式下不注册 URI 路由。含 `{` 的 URI 判定为动态路由，构建正则后存入 `paramsRoutes`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$type` | `string` | 无 | 类型：`common` / `async` / `any` |
| `$method` | `string` | 无 | HTTP 方法（小写，`any`/`async` 用 `*`） |
| `$uri` | `string` | 无 | 路由 URI（非根 URI 不含前导斜杠，根 `/` 除外） |
| `$controller` | `string\|array\|\Closure` | 无 | 控制器类名、`[类名, 方法名]` 或闭包 |
| `$middlewares` | `array` | `[]` | 路由中间件（会与组中间件合并） |
| `$controllerInstantiateParams` | `array` | `[]` | 控制器实例化参数 |

**返回值**

- `string`：类名（供链式调用）。

### `buildParamsPattern($uri)` — 构建动态路由正则

将 `{paramName:regex}` 转成 `(?P<paramName>regex)`；`{?paramName:regex}`（可选参数）转成 `(?P<paramName>regex)?`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string` | 无 | 含参数的 URI |

**返回值**

- `string`：匹配正则（形如 `#^...$#`）。

### `resolveControllerTarget($controller)` — 解析控制器目标

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$controller` | `string\|array\|\Closure` | 无 | 类名 / `[类名, 方法名]` / 闭包 |

**返回值**

- `array`：`["controller" => 控制器, "handleMethodName" => string|null]`。字符串类名方法名为 `null`（默认 `data()`）；数组取第二项（默认 `data`）；闭包为 `null`。

### `get($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 GET 路由

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string\|null` | 无 | 路由 URI（`same()` 回调中传控制器，URI 自动取同值） |
| `$controller` | `string\|array\|\Closure\|null` | 无 | 控制器 |
| `$middlewares` | `array` | `[]` | 路由中间件 |
| `$controllerInstantiateParams` | `array` | `[]` | 控制器实例化参数 |

**返回值**

- `string`：类名（供链式调用）。

**示例**

```php
Router::get("links", ListLinksController::class);
Router::get("links/{linkId:\w+}", GetLinkController::class);
```

### `post($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 POST 路由

参数与返回同 `get()`。

### `put($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 PUT 路由

参数与返回同 `get()`。

### `patch($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 PATCH 路由

参数与返回同 `get()`。

### `delete($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 DELETE 路由

参数与返回同 `get()`。

### `options($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 OPTIONS 路由

参数与返回同 `get()`。

### `head($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册 HEAD 路由

参数与返回同 `get()`。

### `any($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册任意方法路由

匹配任意 HTTP 方法，以 `*` 注册。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string\|null` | 无 | 路由 URI |
| `$controller` | `string\|array\|\Closure\|null` | 无 | 控制器 |
| `$middlewares` | `array` | `[]` | 路由中间件 |
| `$controllerInstantiateParams` | `array` | `[]` | 控制器实例化参数 |

**返回值**

- `string`：类名（供链式调用）。

### `async($uri, $controller, $middlewares = [], $controllerInstantiateParams = [])` — 注册异步路由

仅能通过服务器内部 CURL 调用（自动带 `X-Async` 与 `X-Ajax` 请求头），用于后台任务、内部接口等，由 `dispatch()` 触发。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string\|null` | 无 | 路由 URI |
| `$controller` | `string\|array\|\Closure\|null` | 无 | 控制器 |
| `$middlewares` | `array` | `[]` | 路由中间件 |
| `$controllerInstantiateParams` | `array` | `[]` | 控制器实例化参数 |

**返回值**

- `string`：类名（供链式调用）。

### `match(Request $request)` — 匹配路由

command 模式：按命令名匹配（`$commands[$request->uri()]`）。http 模式：URI 去掉前导斜杠（根 `/` 除外）后按优先级匹配。动态路由匹配成功后填充 `params`（命名参数）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$request` | `Request` | 无 | 请求实例 |

**返回值**

- `array|null`：匹配到的路由（含 `params`）；未匹配返回 `null`。

### `dispatch($uri, $data = [], $headers = [], $timeout = 1)` — 内部调用异步路由

通过 `Curl` 向 `F_BASE_URL . $uri` 发起内部 POST 请求，自动附加 `X-Async` 与 `X-Ajax` 请求头，使 async 路由可被命中。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$uri` | `string` | 无 | 目标 URI |
| `$data` | `array` | `[]` | 请求数据 |
| `$headers` | `array` | `[]` | 附加请求头 |
| `$timeout` | `int` | `1` | 超时秒数 |

**返回值**

- `mixed`：响应数据。

### `command($name, $controller, $description = "")` — 注册 CLI 命令

http 模式下不注册。控制器支持：类名（默认调用 `handle()`）、`[类名, 方法名]`、闭包。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 命令名 |
| `$controller` | `string\|array\|\Closure` | 无 | 命令控制器 |
| `$description` | `string` | `""` | 命令说明 |

**返回值**

- `string`：类名（供链式调用）。

**示例**

```php
Router::command("make:app", MakeAppCommand::class, "创建新应用");
```

### `commands()` — 获取 CLI 命令表

**参数**

- 无。

**返回值**

- `array`：命令表 `$commands[$name] = ["controller","handleMethodName","description"]`。
