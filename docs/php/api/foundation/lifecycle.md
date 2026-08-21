# Lifecycle — 生命周期

- **文件位置**: `kernel/Foundation/Lifecycle.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

应用生命周期管理器，统一管理三个生命周期阶段：**引导（bootUp）**、**结束（shutdown）**、**错误（error）**。

- `onBootUp()` / `onShutdown()` 是**双语义**方法：传**类名**注册"装配类"（触发时实例化、构造即装配），传**回调**注册"钩子"（触发时直接调用）。
- `fireBootUp()` / `fireShutdown()` / `fireError()` 由 `App::run()` / `Console::handle()` 在对应时机触发，触发后各自置幂等标记，保证同一请求只执行一次。
- 启动已触发后（`bootupFired`）再注册的启动回调会**立即执行**，避免注册后永不执行。
- `fireError()` 会记录当前异常，可通过 `exception()` 读取（`App::exception()` 委托本方法）。

应用侧在 `Setup` 装配类中手动 `new Lifecycle` 后调用实例方法注册钩子，再通过 `$app->set(["lifeCycle" => $lifeCycle])` 注入。控制器内可用 `$this->onBootUp()` / `$this->onShutdown()` 动态注册（委托当前 App 的 Lifecycle 实例）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$bootUp` | `array` | `[]` | protected | 引导钩子/装配类注册表 |
| `$shutdown` | `array` | `[]` | protected | 结束钩子/装配类注册表 |
| `$error` | `array` | `[]` | protected | 错误钩子注册表 |
| `$bootupLoaded` | `bool` | `false` | protected | 是否已注册过引导装配类（幂等，避免重复实例化） |
| `$shutdownLoaded` | `bool` | `false` | protected | 是否已注册过关闭装配类（幂等，避免重复实例化） |
| `$bootupFired` | `bool` | `false` | protected | 启动钩子是否已触发（触发后注册的启动回调立即执行） |
| `$shutdownFired` | `bool` | `false` | protected | 结束钩子是否已触发（保证异常路径只执行一次） |
| `$exception` | `\Throwable\|null` | `null` | protected | 请求处理过程中捕获的异常对象，结束/错误钩子可读取 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 构建生命周期管理器 |
| `onBootUp($callback = null)` | 注册引导装配类或启动钩子（默认 `{App}\Setup\Bootup`） |
| `onShutdown($callback)` | 注册关闭装配类或关闭钩子 |
| `onError($callback)` | 注册错误钩子 |
| `fireBootUp()` | 触发"启动"钩子 |
| `fireShutdown($arg = null, $context = null)` | 触发"结束"钩子（正常与异常都执行） |
| `fireError($exception)` | 触发"错误"钩子并记录异常 |
| `exception()` | 获取当前请求捕获的异常 |

## 方法

### `__construct()` — 构建生命周期管理器

**参数**

- 无。

**返回值**

- 无。

### `onBootUp($callback = null)` — 注册引导装配类或启动钩子

**双语义**：
- 传**字符串类名**或不传：注册启动装配类——由 `run()` 在请求到达后、路由匹配前实例化（构造即装配，构造参数为当前请求 `$request`；CLI 下同样收到 Request 实例，其 URI 为命中的命令名）。只注册一次（幂等），类不存在时静默跳过。
- 传**回调**（闭包/数组等）：注册启动钩子。

不传类名时默认使用 `{App}\Setup\Bootup`（应用命名空间下的 `Setup` 目录引导类）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `string\|callable\|null` | `null` | 应用引导装配类名，或启动钩子回调；`null` 时默认 `{App}\Setup\Bootup` |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
use kernel\Foundation\Lifecycle;

$lifecycle = new Lifecycle();
$lifecycle->onBootUp(\App\Setup\Bootup::class);   // 类名：启动时实例化（收到 $request）
$lifecycle->onBootUp(function ($request) {         // 闭包：启动时收到当前请求对象
    // 初始化、注册事件等
});
$app->set(["lifeCycle" => $lifecycle]);
```

### `onShutdown($callback)` — 注册关闭装配类或关闭钩子

**双语义**：
- 传**字符串类名**：注册关闭装配类——由 `run()` 在请求结束（正常或异常）时实例化（构造即装配，构造参数为 `$controller->response`；CLI 下传命令退出码）。只注册一次（幂等），类不存在时静默跳过。
- 传**回调**：注册关闭钩子。回调签名 `function ($response, $context = null)`：
  - `$response`：当前响应对象（异常路径可能为 `null`；CLI 下为命令退出码）
  - `$context["exception"]`：非空表示异常结束（可通过 `exception()` 读取）
  - `$context["error"]`：是否异常结束

关闭钩子无论请求正常结束还是异常结束都会执行（异常必达）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable\|string` | 无 | 关闭钩子回调，或关闭装配类名（如 `\App\Setup\Shutdown::class`） |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
$lifecycle->onShutdown(function ($response, $context = null) {
    // $response 为当前响应对象；$context["error"] 为 true 表示异常结束
    if (!empty($context["exception"])) {
        // 异常结束，记录错误
    }
});
```

### `onError($callback)` — 注册错误钩子

请求处理过程中捕获到异常时触发。异常路径下先触发错误钩子（`onError`），再触发结束钩子（`onShutdown`），最后交由全局异常处理器输出。可叠加、可重复注册，按注册顺序依次执行；同一异常只触发一次。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable` | 无 | 错误钩子回调，签名 `function (\Throwable $exception)` |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
$lifecycle->onError(function (\Throwable $exception) {
    // 记录异常、报警等
});
```

### `fireBootUp()` — 触发"启动"钩子

遍历 `bootUp` 注册表：可调用对象直接执行（收到 `$request`），类名则实例化（构造即装配）。触发后将 `bootupFired` 置位，此后 `onBootUp(闭包)` 注册的启动回调将立即执行。

> 由 `App::run()` / `Console::handle()` 内部调用，一般无需手动触发。

**参数**

- 无。

**返回值**

- 无（`void`）。

### `fireShutdown($arg = null, $context = null)` — 触发"结束"钩子

正常结束与异常结束都会执行（`run()` 的 catch 分支也会调用）。遍历 `shutdown` 注册表：可调用对象执行时传入 `($arg, $context)`，类名则以 `$arg` 单参数实例化。同一请求只触发一次（`shutdownFired` 幂等）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$arg` | `mixed` | `null` | 传给钩子的数据（HTTP：`$controller->response`；CLI：命令退出码；异常路径可能为 `null`） |
| `$context` | `array\|null` | `null` | 结束上下文：`["exception" => Throwable\|null, "error" => bool, "preflight" => bool]` |

**返回值**

- 无（`void`）。

### `fireError($exception)` — 触发"错误"钩子

由 `App::run()` / `Console::handle()` 的 catch 分支调用：按注册顺序执行 `onError()` 注册的错误钩子（每个回调收到异常对象），之后才执行结束钩子并抛给全局异常处理器。同时记录当前异常，供 `exception()` 读取。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$exception` | `\Throwable` | 无 | 当前请求捕获的异常对象 |

**返回值**

- 无（`void`）。

### `exception()` — 获取当前请求捕获的异常

正常结束返回 `null`；控制器/中间件/引导等任意环节抛出并被框架捕获后，shutdown 回调可通过该方法判断是否异常结束、读取错误信息。

**参数**

- 无。

**返回值**

- `\Throwable|null`：捕获的异常对象；无异常返回 `null`。
