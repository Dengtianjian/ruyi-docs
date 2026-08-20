# Lifecycle — 应用装配与生命周期

`Lifecycle` 是框架的生命周期管理器：用于装配应用引导（`Bootup`）、关闭（`Shutdown`）与错误处理（`onError`）。装配类全部放在**应用命名空间下的 `Setup/` 目录**，由应用装配类 `Setup/Bootstrap.php` 中通过 `$lifeCycle->onBootUp(...)` / `$lifeCycle->onShutdown(...)` 显式注册。

## 位置与约定

- **装配入口**: `<AppRoot>/Setup/Bootstrap.php`（如 `myapp/Setup/Bootstrap.php`，命名空间 `myapp\Setup`），由 `make:app` 默认生成；`index.php` / `console` 调用 `$app->setup(\myapp\Setup\Bootstrap::class)` 装配
- **装配目录**: `<AppRoot>/Setup/`（如 `myapp/Setup/`），存放装配类与引导/关闭类
  - `Setup/Bootstrap.php` → `{App}\Setup\Bootstrap`（如 `myapp\Setup\Bootstrap`），应用装配类（`__construct($app)`）
  - `Setup/Bootup.php` → `{App}\Setup\Bootup`（如 `myapp\Setup\Bootup`），由 `make:app` 默认生成
  - `Setup/Shutdown.php` → `{App}\Setup\Shutdown`（如 `myapp\Setup\Shutdown`），由 `make:app` 默认生成
- **加载时机**: 由 `run()`（HTTP）或 `Console::handle()`（CLI）在对应时机实例化（**构造即装配**）：
  - `Bootup` 在请求到达后、路由匹配前实例化（收到 `$request`）
  - `Shutdown` 在请求结束（**正常或异常**）时实例化（收到 `$response`；CLI 下收到命令退出码）

## 装配流程

`index.php` / `console` 在 `run()` 之前调用 `setup()` 装配：

```php
<?php
// myapp/index.php
include_once("{$kernelRoot}/vendor/autoload.php");

use kernel\Foundation\App;

$app = new App("myapp");
$app->setup(\myapp\Setup\Bootstrap::class);   // setup() 必须在 run() 之前调用
$app->run();
```

`Setup/Bootstrap.php` 构造内手动实例化 `Lifecycle` 并注册装配类，再注入 App：

```php
<?php
// myapp/Setup/Bootstrap.php
namespace myapp\Setup;

use kernel\Foundation\Lifecycle;

class Bootstrap
{
    public function __construct($app)
    {
        $lifeCycle = new Lifecycle;
        $lifeCycle->onBootUp(\myapp\Setup\Bootup::class);       // 引导装配类
        $lifeCycle->onShutdown(\myapp\Setup\Shutdown::class);   // 关闭装配类
        $app->set(["lifeCycle" => $lifeCycle]);
    }
}
```

## 引导装配类 `Setup/Bootup.php`

由 `run()` 在**请求到达后、路由匹配前**实例化（构造即装配）：初始化数据库连接、加载全局状态等，构造参数为当前请求 `$request`（CLI 下为 null）：

```php
<?php
// myapp/Setup/Bootup.php
namespace myapp\Setup;

use kernel\Foundation\HTTP\Request;

class Bootup
{
    public function __construct(?Request $request = null)
    {
        // 请求到达后、路由匹配前执行（CLI 下收到 null）
        $request->params->set("appStartAt", microtime(true));
    }
}
```

## 关闭装配类 `Setup/Shutdown.php`

由 `run()` 在**请求结束（正常或异常）时**实例化（构造即装配）：记录日志、释放资源等，构造参数为 `$response`（CLI 下为命令退出码）：

```php
<?php
// myapp/Setup/Shutdown.php
namespace myapp\Setup;

use kernel\Foundation\HTTP\Response;

class Shutdown
{
    public function __construct(?Response $response = null)
    {
        // 异常场景下可通过 getApp()->exception() 判断是否出错、读取错误信息
        if ($exception = getApp()->exception()) {
            // 例如：记录失败日志、上报监控
        }

        // 例如：记录日志、释放资源等
    }
}
```

## 动态注册钩子

`Lifecycle` 实例上的 `on*` 方法可注册闭包钩子，也可注册装配类（传类名）。回调在对应时机触发，异常路径**必达**——即使控制器/中间件抛出异常，关闭钩子仍会执行，保证记录现场、释放资源有始有终。

### 关闭钩子 `onShutdown()`

在任意位置注册闭包结束钩子——包括 Setup、业务服务等。最常见的场景：控制器调用外部 SDK 时维护步骤数组，SDK 直接抛错冒泡到框架，仍能在结束钩子里记录"错误结束于哪一步"。

```php
<?php
// 任意业务代码中（Setup / 控制器 / 服务）
$lifeCycle->onShutdown(function ($response, $context = null) {
    if ($context['error']) {
        Log::info("FAIL:" . get_class($context['exception']));
    } else {
        Log::info("SUCCESS");
    }
});
```

回调签名 `function ($response, $context = null)`：
- `$response`：当前响应对象（异常路径可能为 null；CLI 下为命令退出码）
- `$context["exception"]`：非空表示异常结束，可读取错误对象（也可通过 `getApp()->exception()` 读取）
- `$context["error"]`：是否异常结束
- `$context["preflight"]`：是否 CORS 预检请求（仅 HTTP）

普通闭包只写 `function ($response)` 也完全兼容（多余参数自动忽略）。类名装配类（`Setup\Shutdown`）只收到 `$response` 单参数，异常信息通过 `getApp()->exception()` 获取。

### 错误钩子 `onError()`

请求处理过程中**捕获到异常时**，框架会先触发错误钩子（`onError`），再触发关闭钩子（`onShutdown`），最后交由全局异常处理器输出。错误钩子与关闭钩子分工：`onError` 管错误处理（统一上报监控、记录错误日志），`onShutdown` 管资源释放/执行轨迹记录。可叠加、可重复注册，按注册顺序依次执行；同一异常只触发一次。

```php
<?php
// 在 Lifecycle 实例上注册（全局错误上报）
$lifeCycle->onError(function (\Throwable $exception) {
    Monitor::report("request_error", [
        "message" => $exception->getMessage(),
        "code"    => $exception->getCode(),
    ]);
});
```

HTTP（`App::run()`）与 CLI（`Console::handle()`）的异常路径都会触发：

```
捕获异常 → onError(错误钩子) → onShutdown(关闭钩子) → 全局异常处理器输出
```

## 入口调用

`make:app` 生成的 `index.php` / `console` 均通过 `setup()` 装配，不再直接在入口调用 `onBootUp()` / `onShutdown()`。注册装配类与钩子统一放在 `Setup/Bootstrap.php` 构造中。

## 注意事项

1. **构造即装配**：装配类构造时执行装配代码——`Bootup` 构造收到当前请求 `$request`（CLI 下为 null），`Shutdown` 构造收到 `$response`（CLI 下为命令退出码），构造内直接写装配逻辑即可。
2. **类内无需任何方法**：装配类只有构造函数，没有 `bootUp()` / `onShutdown()` 方法约定。
3. **实例化时机由 run() 控制**：`onBootUp(类名)` / `onShutdown(类名)` 只是把类名注册进生命周期数组，真正的实例化（构造即装配）由 `run()` 在请求到达后、路由匹配前（Bootup）与响应输出前（Shutdown）统一执行。
4. **引导与关闭分离**：`Setup/Bootup.php` 只做引导装配（初始化数据库连接等），关闭相关代码（记录日志、资源释放）请放在 `Setup/Shutdown.php`。
5. **类不存在时跳过**：装配类不存在（未创建或未配置 autoload）时 `onBootUp()` / `onShutdown()` 静默跳过，不影响启动。
6. **结束钩子异常必达**：`shutdown` 阶段在正常结束与异常结束（控制器/中间件/路由等任意环节抛错）都会触发；同一请求只执行一次（幂等），异常路径下先执行关闭钩子、再交由全局异常处理器输出错误响应。
7. **关闭钩子可动态注册**：业务代码中可动态注册关闭闭包钩子（闭包注册不受类名幂等限制）。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 注入方 | `$app->setup(Bootstrap::class)` 触发装配；`$app->set(["lifeCycle" => $lifeCycle])` 注入 Lifecycle；`$app->exception()` 读取异常 |
| [Setup](./app.md) | 装配入口 | `new Lifecycle` 后 `->onBootUp/onShutdown/onError()` 注册，再 `$app->set([...])` 注入 |
