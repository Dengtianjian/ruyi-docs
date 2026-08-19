# App — 应用入口

App 是如意框架的应用启动器，负责初始化配置、加载路由、执行中间件链和控制器。每个应用都需要创建一个 App 实例。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/App.php`

## 多应用架构

如意框架采用 **内核 + 应用** 分离设计，类似前端项目的 `node_modules` + `src` 模式：

```
项目根目录/
├── kernel/          # 框架内核（所有应用共享）
├── app1/            # 应用 1
│   └── index.php    #   入口  →  new App("app1")
├── app2/            # 应用 2
│   └── index.php    #   入口  →  new App("app2")
└── ...
```

- `kernel/` 只提供通用能力（路由、ORM、校验等），不干涉业务代码
- 每个应用有独立的路由、控制器、模型、服务、配置
- 多个应用共用同一份框架代码，互不影响

### 当前 App 实例与 `getApp()`

实例化 App（`new App($AppId)`）时即自动注册为**当前实例**（后实例化者覆盖前者）。全局函数 `getApp()` 与静态方法 `App::getInstance()` 均返回该当前实例：

```php
$App = new App("isdtj");  // 注册为当前实例
getApp();                  // 返回 isdtj 实例
\kernel\Foundation\App::getInstance(); // 等价写法（静态方法）
```

> 同一进程内后实例化的 App 会覆盖成为新的当前实例；尚未实例化任何 App 时返回 `null`。

## 方法列表

### `__construct($AppId, $KernelId = "kernel")`

构造函数，初始化应用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$AppId` | `string` | 应用唯一 ID，**必须与应用目录名一致** |
| `$KernelId` | `string` | 内核目录名称，默认 `"kernel"` |

> **关键约定**：`$AppId` 就是应用的文件夹名称。框架通过 `dirname(__DIR__, 2) . '/' . $AppId` 定位应用根目录，因此传入的 AppId 必须与目录名完全一致。

构造函数执行以下初始化工作：
- 设置静态属性（`App::id()`、`App::kernelId()`）并实例化 FileSystem（`defineConstants()` 之后 `new FileSystem`，无需传参，构造时确保 `data`/`storage` 目录存在；7 个路径 getter 在每次静态方法调用时自动计算，无任何静态属性）
- 载入 `Common.php` 全局函数
- 初始化配置（按优先级读取 Configs/ 下的文件）
- 注册异常/错误处理
- 加载错误码
- 实例化 Router（构造内自动加载路由：先内核 Routes，再应用 Routes；CLI 下同样加载以便注册命令）
- 创建 Request 实例（HTTP 与 CLI 均实例化；CLI 下 URI 为命中的命令名）

入口随后调用 `$App->onBootUp(Bootup::class)` 与 `$App->onShutdown(Shutdown::class)` 注册应用引导装配类与关闭装配类，由 `run()` 在对应时机实例化（构造即装配），最后 `$App->run()` 启动应用。参见 [Lifecycle 应用装配](./lifecycle.md)。

```php
$App = new App("my-app");            // AppId = "my-app"，目录名必须是 "my-app"
$App = new App("myapp", "kernel");   // 指定内核目录为 "kernel"
```

### `setMiddlware($classOrFun, $executeParams = null)`

注册全局中间件。全局中间件对每个请求都会执行。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$classOrFun` | `string\|Closure\|object` | 中间件类名或闭包函数 |
| `$executeParams` | `array` | 执行中间件时传入的参数 |

```php
$App->setMiddlware(GlobalAuthMiddleware::class);
$App->setMiddlware(GlobalCorsMiddleware::class);
$App->setMiddlware(function ($request, $next) {
    // 自定义中间件逻辑
    return $next();
});
```

### `onBootUp($callback = null)`

双语义方法：**加载应用引导装配类**，或**注册启动生命周期回调**。

**传类名 / 不传参 —— 加载应用引导装配类**：

将指定的应用引导装配类（如 `\myapp\Lifecycle\Bootup::class`）注册进生命周期数组，由 `run()` 在**请求到达后、路由匹配前**实例化（构造即装配）：构造参数为当前请求 `$request`（CLI 下为 null），构造内可立即执行装配——注册事件（`new Event`）、引入 `Lifecycle/` 下其它文件、初始化数据库连接等。

不传类名时默认使用 `App::id()\Lifecycle\Bootup`（应用命名空间下的 `Lifecycle\Bootup`）；引导类不存在时静默跳过；多次调用只注册一次（幂等）。HTTP 与 CLI（Console）入口都应在 `run()`/`handle()` 之前调用。

**传回调 —— 注册启动钩子**：回调在路由匹配、中间件执行之前调用。若在启动阶段已触发之后（如控制器内）注册，回调会**立即执行**（业务阶段的按需初始化，收到当前 `$request`）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callback` | `string\|callable\|Closure` | 引导装配类名，或启动回调函数；不传时默认 `App::id()\Lifecycle\Bootup` |

返回值：`$this`（支持链式调用）

```php
$App = new App("myapp");
$App->onBootUp(\myapp\Lifecycle\Bootup::class);   // 加载应用引导装配类
$App->onBootUp(function ($request) {              // 或直接注册启动钩子
    // 在应用启动时执行，比如初始化数据库连接
    Log::record("应用已启动");
});
$App->run();
```

### `onShutdown($callback)`

双语义方法：**加载应用关闭装配类**，或**注册关闭生命周期回调**。

**传类名 —— 注册应用关闭装配类**：将指定的关闭装配类（如 `\myapp\Lifecycle\Shutdown::class`）注册进生命周期数组，由 `run()` 在**请求结束（正常或异常）时**实例化（构造即装配：释放资源、记录日志等，构造参数为 `$response`，CLI 下为命令退出码），多次调用只注册一次（幂等）。

**传回调 —— 注册关闭钩子**：回调在请求结束（正常或异常）时调用，**异常必达**——即使控制器/中间件抛出异常（如外部 SDK 直接报错），关闭钩子仍会执行。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callback` | `string\|callable\|Closure` | 关闭装配类名，或关闭回调函数 |

返回值：`$this`（支持链式调用）

回调签名 `function ($response, $context = null)`：
- `$response`：当前响应对象（异常路径可能为 null；CLI 下为命令退出码）
- `$context["exception"]`：非空表示异常结束（也可通过 `$App->exception()` 读取异常对象）
- `$context["error"]`：是否异常结束
- `$context["preflight"]`：是否 CORS 预检请求

```php
$App->onShutdown(\myapp\Lifecycle\Shutdown::class);   // 加载应用关闭装配类
$App->onShutdown(function ($response, $context = null) {   // 或直接注册关闭钩子
    // 请求结束（正常或异常）时执行；异常场景下记录现场
    if ($context && $context['error']) {
        Log::record("请求异常结束: " . get_class($context['exception']));
    } else {
        Log::record("响应状态码: " . $response->statusCode());
    }
});
```

关闭钩子支持在控制器或任意业务代码中动态注册（`Controller::onShutdown(闭包)` 等价于 `getApp()->onShutdown(闭包)`），适合记录外部 SDK 调用失败时已执行到的步骤。

### `onError($callback)`

注册**错误钩子**：请求处理过程中捕获到异常时触发（HTTP 与 CLI 异常路径均生效）。回调签名 `function (\Throwable $exception)`，可叠加、可重复注册，按注册顺序执行；同一异常只触发一次。异常路径执行顺序为 `onError → onShutdown → 全局异常处理器`，与结束钩子分工（错误上报 vs 资源释放）：

```php
$App->onError(function (\Throwable $exception) {
    Monitor::report("request_error", ["message" => $exception->getMessage()]);
});
```

引导装配类与关闭装配类详见 [Lifecycle 应用装配](./lifecycle.md)。

### `run()`

运行应用主流程。这是应用启动的最后一步。

**执行流程**：
1. 设置 CORS 响应头（预检请求 OPTIONS 也会执行 `shutdown` 钩子后返回）
2. 加载扩展
3. 调用 `bootup` 钩子（实例化引导装配类 `Bootup`，构造即装配）
4. 路由匹配（`Router::match()`）→ 结果写入 `request->Route`、参数写入 `request->params` → 找到对应控制器
5. 合并全局中间件和路由中间件
6. 执行中间件链
7. 执行控制器（`before()` → `data()` → `after()`）
8. 调用 `shutdown` 钩子（实例化关闭装配类 `Shutdown`，构造即装配；**正常或异常结束都会执行**）
9. 输出响应
10. `exit` 终止程序

其中步骤 3~9 任一环节抛出异常时，会先执行 `shutdown` 钩子（异常必达，可通过 `$App->exception()` 读取异常），再交由全局异常处理器输出错误响应。

```php
$App->run();  // 启动应用
```

### `request()`

获取当前请求实例。

返回值：`Request`

```php
$request = $App->request();
echo $request->method;  // "get"
echo $request->URI;     // "/links"
```

### `executeController($callTarget, $callParams, &$Controller)`

执行控制器方法。框架内部使用，一般不直接调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callTarget` | `callable` | 要执行的控制器方法 |
| `$callParams` | `array` | 传入控制器的参数 |
| `$Controller` | `Controller` | 控制器实例（引用传递） |

## 请求入口

所有 HTTP 请求通过 Nginx 指向应用的 `index.php`：

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/project/my-app;     # 指向应用目录

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }
}
```

入口文件只需引入内核、创建 App 并启动：

```php
<?php
// my-app/index.php
include_once("../kernel/index.php");

use kernel\Foundation\App;

$App = new App("my-app");
$App->onBootUp(\myapp\Lifecycle\Bootup::class);   // 注册应用引导装配类（run() 中实例化）
$App->onShutdown(\myapp\Lifecycle\Shutdown::class);     // 注册应用关闭装配类（run() 中实例化）
$App->run();
```

## 使用示例

### 基本用法

```php
<?php
// my-app/index.php
include_once("../kernel/index.php");

use kernel\Foundation\App;

$App = new App("my-app");

// 注册应用引导装配类与关闭装配类
$App->onBootUp(\myapp\Lifecycle\Bootup::class);
$App->onShutdown(\myapp\Lifecycle\Shutdown::class);

// 初始化数据库连接（在 run() 之前）
$driver = new Driver(...);
Connections::addDriver($driver);

// 注册全局中间件
$App->setMiddlware(GlobalCorsMiddleware::class);
$App->setMiddlware(GlobalAuthMiddleware::class);

// 注册启动回调
$App->onBootUp(function ($request) {
    Log::record("收到请求: " . $request->URI);
});

// 注册关闭回调
$App->onShutdown(function ($response) {
    Log::record("响应完成");
});

// 启动应用
$App->run();
```

### 多应用示例

同一项目下的两个应用各自独立：

```php
<?php
// app-api/index.php     —— API 服务
$App = new App("app-api");
$App->onBootUp(\appapi\Lifecycle\Bootup::class);   // 加载应用引导装配类
$App->setMiddlware(ApiAuthMiddleware::class);
$App->run();
```

```php
<?php
// app-admin/index.php   —— 管理后台
$App = new App("app-admin");
$App->onBootUp(\appadmin\Lifecycle\Bootup::class);   // 加载应用引导装配类
$App->setMiddlware(AdminAuthMiddleware::class);
$App->run();
```

两个应用共用 `kernel/`，各自通过不同的 Nginx server 或 location 对外提供服务。

### 生命周期图示

```
new App("my-app")
    │
    │  初始化: 定义常量、加载配置、加载路由、创建 Request
    │
    ▼
onBootUp()        ← 注册应用引导装配类（run() 中请求到达后实例化，构造即装配）
    │
    ▼
setMiddlware(...)  ← 注册全局中间件
    │
    ▼
onBootUp(...)        ← 注册启动回调
    │
    ▼
onShutdown(...)      ← 注册关闭回调
    │
    ▼
run()              ← 启动应用
    │
    ├─ 1. 设置 CORS 头（OPTIONS 预检在此执行 shutdown 钩子后返回）
    ├─ 2. 实例化引导装配类 Bootup（构造即装配，收到 $request）
    ├─ 3. [Router::match()] 路由匹配 → 结果写入 request->Route
    ├─ 4. 实例化控制器 → __construct() → boot()
    ├─ 5. 执行中间件链
    ├─ 6. before()
    │         ├─ 校验失败 → 跳过 handle 方法
    ├─ 7. 执行控制器 handle 方法（data() 或自定义）
    │         ├─ 控制器内可 $this->onShutdown(闭包) 动态注册结束钩子
    ├─ 8. after() → transform() → serialization()
    ├─ 9. 实例化关闭装配类 Shutdown（构造即装配，收到 $response；正常或异常结束都会执行）
    ├─ 10. 输出响应
    └─ 11. exit

异常路径：步骤 2~9 任一环节抛出异常（如外部 SDK 直接报错）→ 先执行 shutdown 钩子
（含控制器动态注册的 onShutdown 回调，可通过 App::exception() 读取异常）→ 再交由全局异常处理器输出错误响应。
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Router](./router.md) | App 构造 `new Router`（构造内加载路由），run() 调用 `Router::match()` | 匹配结果写入 `request->Route` |
| [Controller](./controller.md) | App 实例化控制器并执行 | 业务逻辑处理 |
| [Middleware](./middleware.md) | App 管理全局中间件并执行中间件链 | 请求拦截 |
| [Config](./config.md) | App 初始化时加载配置文件 | 配置管理 |
| [Request](./request.md) | App 创建 Request 实例 | 请求信息 |
| [Lifecycle](./lifecycle.md) | `$App->onBootUp(Bootup::class)` / `$App->onShutdown(Shutdown::class)` 注册装配类（`run()` 中实例化） | 应用引导、关闭与事件注册 |

## 路径常量

`new App($AppId)` 自动设置以下常量与静态属性，应用代码可直接使用：

| 常量 / 静态属性 | 示例值 | 说明 |
|------|------|------|
| `FileSystem::root()` | `/path/to/project` | 项目根目录 |
| `App::id()` | `"my-app"` | 当前应用 ID（= 目录名，静态属性） |
| `FileSystem::appRoot()` | `/path/to/project/my-app` | 当前应用根目录 |
| `FileSystem::appDir()` | `"my-app"` | 当前应用目录名 |
| `App::kernelId()` | `"kernel"` | 内核目录名（静态属性） |
| `FileSystem::kernelRoot()` | `/path/to/project/kernel` | 内核根目录 |
| `App::mode()` | `"production"` | 运行模式 |
| `F_BASE_URL` | `"http://example.com"` | 应用 URL |
