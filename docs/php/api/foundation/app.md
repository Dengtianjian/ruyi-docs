# App — 应用核心

- **文件位置**: `kernel/Foundation/App.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

应用核心类，负责注册当前应用、定义常量、装配组件、运行生命周期。**构造时不实例化任何组件**（延迟实例化），组件在 `run()`/`handle()` 时由 `ensureInstances()` 兜底实例化，或由 `setup()` 手动注入自定义实例。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$id` | `string\|null` | `null` | protected | 当前应用的 ID，也是项目文件夹名称。取自已实例化 App 的第一个构造参数，后实例化者覆盖 |
| `$kernelId` | `string\|null` | `null` | protected | 内核的 ID，也是内核目录文件夹名称，默认 `"kernel"` |
| `$middleware` | `Middleware` | `null` | protected | 中间件管理器 |
| `$router` | `Router` | `null` | protected | 路由相关 |
| `$request` | `Request` | `null` | protected | 请求相关 |
| `$startTime` | `int\|float` | `null` | protected | 开始时间戳（构造时 `Date::milliseconds()`） |
| `$lifeCycle` | `Lifecycle` | `null` | protected | 生命周期管理器，委托管理引导/结束/错误钩子 |
| `$currentApp` | `App\|null` | `null` | protected static | 当前（最近实例化）的 App 实例；构造即自动注册 |
| `$ensuringInstances` | `bool` | `false` | protected static | `ensureInstances()` 进行中标记，防止 Lifecycle 构造触发钩子回调时递归 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 构造：注册当前 App、记录 startTime、定义常量、引入 Common、注册异常/错误处理器 |
| `setup()` | 应用装配：手动实例化组件并注入（类名或闭包） |
| `set()` | 批量注入自定义组件实例 |
| `run()` | 运行应用：兜底实例化、启动钩子、路由匹配、中间件链、控制器分发、结束钩子 |
| `executeController()` | 执行控制器目标方法，并包装异常 |
| `request()` / `router()` / `lifeCycle()` / `middleware()` | 组件访问器（懒实例化） |
| `getInstance()` / `id()` / `kernelId()` / `mode()` | 静态访问当前实例 / ID / 内核 ID / 运行模式 |
| `ensureInstances()` | （protected）延迟实例化兜底 |
| `defineConstants()` | （protected）定义常量（如 `F_BASE_URL`） |

---

## `__construct($id, $kernelId = "kernel")` — 构造

> 构造只做：注册当前 App、设置 `id`/`kernelId`/`startTime`、定义常量、`include Common.php`、注册全局异常与错误处理器。**不实例化任何组件**。

**签名**

```php
__construct($id, $kernelId = "kernel")
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | —（必填） | 应用唯一 ID，**必须与项目目录同名**（`Path::root()` 由此推导） |
| `$kernelId` | `string` | `"kernel"` | 内核 ID。内核也是 App 也有 ID，默认 `"kernel"`；仅自定义内核目录名时修改 |

**返回值**

- `App`（实例）。构造即自动注册为当前 App，`getApp()`/`App::getInstance()` 可立即取到。

**示例**

```php
use kernel\Foundation\App;

$app = new App("demo");           // 应用 ID 与目录名一致
$app = new App("demo", "kernel"); // 显式指定内核 ID
```

---

## `setup($call)` — 应用装配

> 必须在 `run()` 之前调用，调用时立即执行。用于手动实例化组件并注入 App。

**签名**

```php
setup($call)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$call` | `string\|callable` | —（必填） | **类名**：立即 `new $call($this)`（构造即装配，Bootstrap 构造签名 `__construct($app)`）；若为无参构造（旧式 Bootstrap）则 `new $call()`。<br>**闭包**：立即执行 `$call($this)`，闭包内可调用 `$app->set([...])` 注入 |

**返回值**

- `$this`（链式）。

**示例**

```php
$app->setup(\App\Setup\Bootstrap::class);  // 类名装配（推荐）
$app->setup(function ($app) {               // 闭包装配
    $app->set(["middleware" => new Middleware]);
});
```

> Bootstrap 内典型写法：手动 `new Config`/`new Cache`/`new FileSystem`；`new Middleware` 后 `->set(...)` 注册中间件；`new Lifecycle` 后 `->onBootUp(...)`/`->onShutdown(...)` 注册钩子；最后 `$app->set([...])` 批量注入。

---

## `set(array $instances)` — 批量注入组件

> 数组键为组件名，值为手动 new 出的实例，替换 App 对应组件。未注入的组件 `run()` 时自动兜底实例化。

**签名**

```php
set(array $instances)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$instances` | `array` | —（必填） | 关联数组 `组件名 => 实例`。**支持键**：`router` / `request` / `lifeCycle` / `middleware`（其余键忽略） |

**返回值**

- `$this`（链式）。

**示例**

```php
$app->set([
    "router"     => $router,
    "request"    => $request,
    "lifeCycle"  => $lifeCycle,
    "middleware" => $middleware,
]);
```

---

## `run()` — 运行应用

> 首行 `ensureInstances()` 兜底实例化（Config→Router→Request→Middleware→Lifecycle），随后按序执行。OPTIONS 预检请求也执行结束钩子（`$context["preflight"] = true`）。

**执行流程**：

1. `ensureInstances()` 兜底实例化未注入的组件
2. OPTIONS 预检：`fireShutdown()` 后 `return`
3. `fireBootUp()` 启动钩子
4. 直接调用 App 持有的 Router 的 `match()` 路由匹配；未命中抛 404
5. 命中参数经 `$request->params->fill()` 注入
6. 控制器实例化 + `before()` + 目标方法（默认 `data`）
7. `middleware->execute()` 中间件链（全局 + 路由级）
8. `after()` + 输出响应 + `fireShutdown()`
9. 异常路径：`fireError()` → `fireShutdown()` → 抛出交由全局异常处理器

**签名**

```php
run()
```

**参数**

- 无。

**返回值**

- `void`（正常结束内部 `exit`）。

---

## `executeController($callTarget, $callParams, &$controller)` — 执行控制器目标

> 用 `call_user_func_array` 调用目标，捕获异常并包装为 `Error`；处理控制器实例化与响应赋值。

**签名**

```php
executeController($callTarget, $callParams, &$controller)
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callTarget` | `callable\|array` | 可调用目标（闭包，或 `[控制器, 方法名]`） |
| `$callParams` | `array` | 传给目标的参数数组（`array_values` 处理后按顺序传参） |
| `$controller` | `Controller\|null` | 控制器实例（引用传递；为 `null` 或可调用时自动 `new Controller($request)`） |

**返回值**

- `void`。异常统一包装：非 `Error` 抛 `new Error($msg, 500, "500:ServerError", $trace)`。

---

## 组件访问器（懒实例化）

> 对应组件为 `null` 时先 `new` 再返回。

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `request()` | `Request` | 请求实例（CLI 下 URI 由 `Console::handle()` 置为命中的命令名；HTTP 下为请求 URI） |
| `router()` | `Router` | 路由实例 |
| `lifeCycle()` | `Lifecycle` | 生命周期管理器 |
| `middleware()` | `Middleware` | 中间件管理器 |

**示例**

```php
$app->request()->method;      // 请求方法
$app->middleware()->set(...); // 注册中间件
```

---

## 静态方法

### `App::getInstance()`

> 返回当前（最近实例化）的 App 实例，等价全局函数 `getApp()`。

**签名**

```php
static getInstance(): App|null
```

**参数**

- 无。

**返回值**

- `App|null`：当前 App 实例；尚未实例化返回 `null`。

### `App::id()`

**签名**

```php
static id(): ?string
```

**参数**

- 无。

**返回值**

- `string|null`：当前应用的 ID（项目文件夹名）；尚未实例化返回 `null`。

### `App::kernelId()`

**签名**

```php
static kernelId(): ?string
```

**参数**

- 无。

**返回值**

- `string|null`：内核的 ID（默认 `"kernel"`）；尚未实例化返回 `null`。

### `App::mode()`

> 读取配置 `"mode"` 键，替代原 `F_APP_MODE` 常量。

**签名**

```php
static mode(): string
```

**参数**

- 无。

**返回值**

- `string`：运行模式（`production` / `development` / `local` / `release` 等）；未配置默认 `"production"`。

---

## 受保护方法

| 方法 | 说明 |
|------|------|
| `ensureInstances()` | 延迟实例化兜底：Router/Request/Middleware/Lifecycle 未实例化则构造默认实例，Config 未加载则加载。**Cache/FileSystem 不在此列**，需装配类手动 new。带 `$ensuringInstances` 防递归标记。返回 `void` |
| `defineConstants()` | 定义常量（`F_BASE_URL`，按 `REQUEST_SCHEME`/`HTTPS`/`HTTP_HOST` 拼 URL）。返回 `void` |
| `__clone()` | 禁止克隆（protected 空实现） |

---

## 全局函数

构造时会 `include Common.php`，提供全局 `getApp()`、`config()`、`path()`、`abort()` 等便捷函数（见 Common 文档）。
