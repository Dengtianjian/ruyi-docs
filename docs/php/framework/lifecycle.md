# Lifecycle — 应用装配

`Lifecycle` 是应用级的装配目录：用于放置**属于当前应用本身**、又不属于 Routes / Controller / Model 等业务分层的装配代码——引导装配类（`Bootup.php`）、关闭装配类（`Shutdown.php`）、事件注册（`events.php`）等。通过入口中的 **`$app->onBootUp(Bootup::class)`** 与 **`$app->onShutdown(Shutdown::class)`** 显式注册。

- **位置**: `<AppRoot>/Lifecycle/`（如 `myapp/Lifecycle/`）
- **引导类**: `Lifecycle/Bootup.php` 定义引导装配类 `{App}\Lifecycle\Bootup`（如 `myapp\Lifecycle\Bootup`），由 `make:app` 默认生成
- **关闭类**: `Lifecycle/Shutdown.php` 定义关闭装配类 `{App}\Lifecycle\Shutdown`（如 `myapp\Lifecycle\Shutdown`），由 `make:app` 默认生成
- **加载时机**: 入口文件调用 `$app->onBootUp(...)` / `$app->onShutdown(...)` 时——通常在 `new App(...)` 之后、`run()` 之前；CLI（Console）环境同样生效
- **加载方式**: `onBootUp()` / `onShutdown()` 将装配类**注册进生命周期数组**，由 `run()` 在对应时机实例化（**构造即装配**）：`Bootup` 在请求到达后、路由匹配前实例化（收到 `$request`）；`Shutdown` 在请求结束（**正常或异常**）时实例化（收到 `$response`；CLI 下收到命令退出码）

完整生命周期：**`bootUp`（引导装配）→ Controller（中间件包裹）→ `shutdown`（结束装配）→ 输出响应**。`shutdown` 阶段**异常必达**——即使控制器/中间件抛出异常（如外部 SDK 直接报错），结束钩子仍会执行，保证记录现场、释放资源有始有终。
- **其它文件**: `Lifecycle/` 下的其它文件（如 `events.php`）**不会自动加载**，由装配类按需引入或由入口其它方式引用

## 目录约定

```
myapp/
├── Lifecycle/               # 应用装配目录（入口中 onBootUp()/onShutdown() 引用装配类）
│   ├── Bootup.php           # 引导装配类（{App}\Lifecycle\Bootup，入口显式引用）
│   ├── Shutdown.php         # 关闭装配类（{App}\Lifecycle\Shutdown，入口显式引用）
│   └── events.php           # 事件注册（非自动加载，由 Bootup 按需 include_once）
└── Event/                   # 事件订阅者类（命名空间: myapp\Event\）
```

`make:app` 生成的应用骨架默认创建 `Lifecycle/Bootup.php` 与 `Lifecycle/Shutdown.php` 装配类；`events.php` 等其它装配文件可按职责自行拆分，并在装配类中按需引入。

## 使用方式

### 引导装配类 `Bootup.php`

引导装配类由 `run()` 在**请求到达后、路由匹配前**实例化（构造即装配）：注册事件（`new Event` 构造即注册）、引入 `Lifecycle/` 下其它文件、初始化数据库连接等，构造参数为当前请求 `$request`（CLI 下每条命令执行前，收到 null）：

```php
<?php
// myapp/Lifecycle/Bootup.php
namespace myapp\Lifecycle;

class Bootup
{
    public function __construct($request)
    {
        // 请求到达后、路由匹配前执行（CLI 下收到 null）

        // 注册事件（构造即注册；订阅者类建议放在 Event/ 目录）
        new \kernel\Foundation\Event("user.registered", [
            [\myapp\Event\SendWelcomeEmail::class, "handle"],
            [\myapp\Event\CreateDefaultProfile::class, "handle"],
        ]);

        // 按需引入 Lifecycle/ 下的其它装配文件（不会自动加载）
        include_once(__DIR__ . "/events.php");

        // 例如：初始化数据库连接、加载全局状态等
        $request->params->set("appStartAt", microtime(true));
    }
}
```

### 关闭装配类 `Shutdown.php`

关闭装配类由 `run()` 在**请求结束（正常或异常）时**实例化（构造即装配）：记录日志、释放资源等，构造参数为 `$response`（CLI 下传命令退出码）。引导与关闭分离——关闭相关代码放在这里，而不是 `Bootup.php`：

```php
<?php
// myapp/Lifecycle/Shutdown.php
namespace myapp\Lifecycle;

class Shutdown
{
    public function __construct($response)
    {
        // 请求结束（正常或异常）时执行（CLI 下收到命令退出码）

        // 异常场景下可通过 getApp()->exception() 判断是否出错、读取错误信息
        if ($exception = getApp()->exception()) {
            // 例如：记录失败日志、上报监控
        }

        // 例如：记录日志、释放资源等
        Log::info("请求耗时", ["ms" => round((microtime(true) - $GLOBALS['_STORE']['start']) * 1000)]);
    }
}
```

### 动态注册结束钩子（异常必达）

`onShutdown()` 支持在**任意位置**动态注册闭包钩子——包括控制器内部、服务类、中间件等，不必预先在入口注册。最常见的场景：控制器调用外部 SDK 时维护步骤数组，SDK 直接抛错冒泡到框架，仍能在结束钩子里记录"错误结束于哪一步"。

控制器内通过基类便捷方法 `$this->onShutdown($callback)` 注册（等价于 `getApp()->onShutdown($callback)`）：

```php
<?php
// myapp/Controller/SdkController.php
class SdkController extends \kernel\Foundation\Controller\Controller
{
    protected $steps = [];

    public function data()
    {
        // 动态注册结束钩子：无论成功还是异常结束都会执行
        $this->onShutdown(function ($response, $context = null) {
            $this->steps[] = $context['error'] ? "FAIL:" . get_class($context['exception']) : "SUCCESS";
            Log::info("SDK 调用轨迹", ["steps" => $this->steps]);   // 记录执行到了哪一步
        });

        $this->steps[] = "step:准备参数";
        $sdk = new ExternalSdk();
        $this->steps[] = "step:调用 SDK";
        $result = $sdk->request();   // SDK 直接抛错，冒泡到框架
        $this->steps[] = "step:处理结果";
    }
}
```

回调签名 `function ($response, $context = null)`：
- `$response`：当前响应对象（异常路径可能为 null；CLI 下为命令退出码）
- `$context["exception"]`：非空表示异常结束，可读取错误对象（也可通过 `getApp()->exception()` 读取）
- `$context["error"]`：是否异常结束
- `$context["preflight"]`：是否 CORS 预检请求（仅 HTTP）

普通闭包只写 `function ($response)` 也完全兼容（多余参数自动忽略）。类名装配类（`Shutdown.php`）只收到 `$response` 单参数，异常信息通过 `getApp()->exception()` 获取。

### 错误钩子 `onError()`（仿 Vue 3 `onErrorCaptured`）

请求处理过程中**捕获到异常时**，框架会先触发错误钩子（`onError`），再触发结束钩子（`onShutdown`），最后交由全局异常处理器输出。错误钩子与结束钩子分工：`onError` 管错误处理（统一上报监控、记录错误日志），`onShutdown` 管资源释放/执行轨迹记录。可叠加、可重复注册，按注册顺序依次执行；同一异常只触发一次。

```php
<?php
// 入口或任意业务代码中注册（全局错误上报）
getApp()->onError(function (\Throwable $exception) {
    Monitor::report("request_error", [
        "message" => $exception->getMessage(),
        "code"    => $exception->getCode(),
    ]);
});
```

HTTP（`App::run()`）与 CLI（`Console::handle()`）的异常路径都会触发：

```
捕获异常 → onError(错误钩子) → onShutdown(结束钩子) → 全局异常处理器输出
```

### `events.php` — 注册事件

`Lifecycle/events.php` 不会自动加载，由装配类（或入口）显式 `include_once` 引入。集中注册事件（订阅者类建议放在 `Event/` 目录）：

```php
<?php
// myapp/Lifecycle/events.php
use kernel\Foundation\Event;

new Event("order.created", [
    [\myapp\Event\SendOrderNotification::class, "handle"],
    [\myapp\Event\UpdateInventory::class, "handle"],
]);
```

## 入口调用

HTTP 入口（`index.php`）与 CLI 入口（`console`）都在启动前调用 `onBootUp()` 与 `onShutdown()` 并传入对应装配类：

```php
<?php
// myapp/index.php
include_once("../kernel/index.php");

use kernel\Foundation\App;
use myapp\Lifecycle\Bootup;
use myapp\Lifecycle\Shutdown;

$App = new App("myapp");

// 注册应用引导装配类与关闭装配类（run() 中实例化，构造即装配）
$App->onBootUp(Bootup::class);
$App->onShutdown(Shutdown::class);

$App->run();
```

不传类名时，`onBootUp()` 默认使用 `{App::id()}\Lifecycle\Bootup`；`onShutdown()` 无默认类名，需显式传入装配类名（传入已存在的类名即注册关闭装配类）：

```php
$App->onBootUp();   // 等价于 $App->onBootUp(\myapp\Lifecycle\Bootup::class);
$App->onShutdown(\myapp\Lifecycle\Shutdown::class);
```

CLI 入口同样适用：

```php
$console = new Console("myapp");
$console->onBootUp(\myapp\Lifecycle\Bootup::class);
$console->onShutdown(\myapp\Lifecycle\Shutdown::class);   // CLI 同样生效
$console->run();
```

## 自由注册

事件不限于 `Lifecycle/` 目录——可在**任意位置** `new Event(...)` 完成注册（构造即注册）：

```php
// 实例化 App 之后
$App = new App("myapp");
new Event("app.started", [[WarmupCache::class, "handle"]]);
$App->run();

// 或业务模块内部按需注册
class OrderService
{
    public function pay($orderId)
    {
        new Event("order.paid", [[SendReceipt::class, "handle"]]);
        // ...
    }
}
```

推荐在装配类（`Lifecycle/Bootup.php`）或实例化 App 之后集中注册，保证事件在触发前一定已注册。

## 注意事项

1. **构造即装配**：装配类构造时执行装配代码——`Bootup` 构造收到当前请求 `$request`（CLI 下为 null），`Shutdown` 构造收到 `$response`（CLI 下为命令退出码），构造内直接写装配逻辑即可。
2. **类内无需任何方法**：装配类只有构造函数，没有 `bootUp()` / `onShutdown()` 方法约定，也没有手动 `$app->onBootUp(闭包)` 调用。
3. **实例化时机由 run() 控制**：`$app->onBootUp(Bootup::class)` / `$app->onShutdown(Shutdown::class)` 只是把类名注册进生命周期数组，真正的实例化（构造即装配）由 `run()` 在请求到达后、路由匹配前（Bootup）与响应输出前（Shutdown）统一执行。
4. **引导与关闭分离**：`Bootup.php` 只做引导装配（注册事件、初始化数据库连接等），关闭相关代码（记录日志、资源释放）请放在 `Shutdown.php`。
5. **其它文件不自动加载**：`Lifecycle/` 下除装配类外不会自动加载，请由装配类按需引入。
6. **类不存在时跳过**：装配类不存在（未创建或未配置 autoload）时 `onBootUp()` / `onShutdown()` 静默跳过，不影响启动。
7. **结束钩子异常必达**：`shutdown` 阶段在正常结束与异常结束（控制器/中间件/路由等任意环节抛错）都会触发；同一请求只执行一次（幂等），异常路径下先执行结束钩子、再交由全局异常处理器输出错误响应。
8. **运行时可动态注册**：`getApp()->onShutdown(闭包)` / `Controller::onShutdown(闭包)` 可在控制器或任意业务代码中注册结束钩子（闭包注册不受类名幂等限制）；`onBootUp(闭包)` 在启动阶段已触发后注册会立即执行（业务阶段按需初始化）。
9. **事件先注册后触发**：`dispatch` 对未注册事件会抛异常；`distribute` 返回的闭包在校验上已延迟，可在注册前创建、注册后调用。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 注册方 | `$app->onBootUp(Bootup::class)` 注册引导装配类（`run()` 中实例化）；`$app->onShutdown(Shutdown::class)` 注册关闭装配类（`run()` 中实例化，异常必达）；`$app->exception()` 读取异常；`$app->onShutdown(闭包)` 运行时动态注册结束钩子 |
| [Controller](./controller.md) | 注册方 | `$this->onBootUp(闭包)` / `$this->onShutdown(闭包)` 在控制器内动态注册生命周期钩子（`onShutdown` 异常必达） |
| [Event](./event.md) | 事件注册 | 装配类中 `new Event(...)` 注册 |
