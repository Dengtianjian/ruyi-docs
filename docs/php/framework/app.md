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
- 载入 `Common.php` 全局函数（`getApp` / `import` / `config` 等，见 [Common 全局函数](./common.md)）
- 初始化配置（按优先级读取 Configs/ 下的文件）
- 注册异常/错误处理
- 加载错误码
- 实例化 Router（构造内自动加载路由：先内核 Routes，再应用 Routes；CLI 下同样加载以便注册命令）
- 创建 Request 实例（HTTP 与 CLI 均实例化；CLI 下 URI 为命中的命令名）

入口随后调用 `$App->setup(\{App}\Setup\Bootstrap::class)` 装配应用（`Setup/Bootstrap.php` 构造内手动 `new Lifecycle` 并通过 `$lifeCycle->onBootUp(Setup\Bootup::class)` / `$lifeCycle->onShutdown(Setup\Shutdown::class)` 注册引导/关闭装配类，再 `$app->set(["lifeCycle" => $lifeCycle])` 注入），由 `run()` 在对应时机实例化装配类（构造即装配），最后 `$App->run()` 启动应用。参见 [Lifecycle 应用装配](./lifecycle.md)。

```php
$App = new App("my-app");            // AppId = "my-app"，目录名必须是 "my-app"
$App = new App("myapp", "kernel");   // 指定内核目录为 "kernel"
```

### `setup($call)`

装配应用，**必须在 `run()` 之前调用**（调用即执行）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$call` | `string\|callable\|Closure` | 装配类名（如 `\myapp\Setup\Bootstrap::class`）或装配闭包 |

- 传**类名**：`new $call($this)`（构造即装配，构造参数为当前 App 实例 `$app`，Bootstrap 签名 `__construct($app)`）；若类为无参构造（旧式）自动 `new $call()` 兼容
- 传**闭包**：`$call($this)`，闭包内可用 `$app->set([...])` 注入组件

```php
$App = new App("my-app");
$App->setup(\myapp\Setup\Bootstrap::class);   // setup() 必须在 run() 之前调用
$App->run();
```

### `set(array $instances)`

批量注入组件实例。白名单键：`router` / `request` / `lifeCycle` / `middleware`，值替换 App 对应属性；其余键忽略。组件装配统一在 `Bootstrap` 构造（或装配闭包）内手动 `new` 后注入：

```php
$App->set(["middleware" => $middleware]);
$App->set(["lifeCycle"  => $lifeCycle]);
$App->set(["router"     => $router]);
$App->set(["request"    => $request]);
```

> `setRouter()` / `setRequest()` / `setLifeCycle()` / `setMiddleware()` 等 setter 已全部删除，统一使用 `set([...])` 注入。

### `set(["middleware" => $middleware])`

注入全局中间件管理器，全局中间件对每个请求都会执行。中间件在实例上 `set()` 注册后再注入 App：

```php
$middleware = new Middleware;
$middleware->set(GlobalAuthMiddleware::class);
$App->set(["middleware" => $middleware]);
```

> `run()` 之前未注入时，会由 `ensureInstances()` 兜底 `new Middleware()`（此时没有注册的全局中间件）。中间件注册与执行见 [Middleware](./middleware.md)。

### `lifeCycle()` / `middleware()` / `router()` / `request()`

获取已注入的组件实例（未注入时懒实例化兜底）：

```php
$lifeCycle   = $App->lifeCycle();     // Lifecycle 实例，可注册钩子
$middleware  = $App->middleware();    // Middleware 管理器
$router      = $App->router();        // Router 实例
$request     = $App->request();       // Request 实例
```

> 生命周期钩子（`onBootUp` / `onShutdown` / `onError`）只在 **Lifecycle 实例**上调用（`$App->lifeCycle()->onShutdown(...)` 或 Setup 里 `$lifeCycle->onShutdown(...)`），App 上不再提供这些注册方法。详见 [Lifecycle 应用装配](./lifecycle.md)。

### `run()`

运行应用主流程。这是应用启动的最后一步。

**执行流程**：
1. 设置 CORS 响应头（预检请求 OPTIONS 也会执行 `shutdown` 钩子后返回）
2. 加载扩展
3. 调用 `bootup` 钩子（实例化引导装配类 `Setup\Bootup`，构造即装配）
4. 路由匹配（`Router::match()`）→ 结果写入 `request->route`、参数写入 `request->params` → 找到对应控制器
5. 合并全局中间件和路由中间件
6. 执行中间件链
7. 执行控制器（`before()` → `data()` → `after()`）
8. 调用 `shutdown` 钩子（实例化关闭装配类 `Setup\Shutdown`，构造即装配；**正常或异常结束都会执行**）
9. 输出响应
10. `exit` 终止程序

其中步骤 2~8 任一环节抛出异常时，会先触发错误钩子（`onError`）再执行 `shutdown` 钩子（异常必达，可通过 `$App->exception()` 读取异常），最后交由全局异常处理器输出错误响应。

```php
$App->run();  // 启动应用
```

### `request()`

获取当前请求实例。

返回值：`Request`

```php
$request = $App->request();
echo $request->method();  // "get"
echo $request->uri();     // "/links"
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

入口文件只需引入内核 autoload、创建 App、`setup()` 装配并启动：

```php
<?php
// my-app/index.php
include_once("{$kernelRoot}/vendor/autoload.php");

use kernel\Foundation\App;

$App = new App("my-app");
$App->setup(\myapp\Setup\Bootstrap::class);   // 装配应用（Bootstrap 构造内注册引导/关闭装配类，见 lifecycle.md）
$App->run();
```

## 使用示例

### 基本用法

```php
<?php
// my-app/Setup/Bootstrap.php —— 应用装配类（index.php 通过 $App->setup(Bootstrap::class) 调用）
namespace myapp\Setup;

use kernel\Foundation\Cache;
use kernel\Foundation\Config;
use kernel\Foundation\FileSystem\FileSystem;
use kernel\Foundation\Lifecycle;
use kernel\Foundation\Middleware\Middleware;

class Bootstrap
{
    public function __construct($app)
    {
        new Config;      // 加载配置
        new FileSystem;  // 创建 Data/、Storage/ 等目录
        new Cache;       // 生成缓存 KEY

        // 中间件：手动 new Middleware 后 set() 注册全局中间件，再注入 App
        $middleware = new Middleware;
        $middleware->set(GlobalCorsMiddleware::class);
        $middleware->set(GlobalAuthMiddleware::class);
        $app->set(["middleware" => $middleware]);

        // 生命周期：手动 new Lifecycle 后注册引导/关闭装配类，再注入 App
        $lifeCycle = new Lifecycle;
        $lifeCycle->onBootUp(\myapp\Setup\Bootup::class);
        $lifeCycle->onShutdown(\myapp\Setup\Shutdown::class);
        $lifeCycle->onShutdown(function ($response) {   // 关闭闭包钩子（异常必达）
            Log::record("响应完成");
        });
        $app->set(["lifeCycle" => $lifeCycle]);
    }
}
```

```php
<?php
// my-app/index.php
include_once("{$kernelRoot}/vendor/autoload.php");

use kernel\Foundation\App;

$App = new App("my-app");
$App->setup(\myapp\Setup\Bootstrap::class);   // setup() 必须在 run() 之前调用
$App->run();
```

### 多应用示例

同一项目下的两个应用各自独立：

```php
<?php
// app-api/Setup/Bootstrap.php     —— API 服务装配类
namespace appapi\Setup;

use kernel\Foundation\Lifecycle;
use kernel\Foundation\Middleware\Middleware;

class Bootstrap
{
    public function __construct($app)
    {
        $middleware = new Middleware;
        $middleware->set(ApiAuthMiddleware::class);
        $app->set(["middleware" => $middleware]);

        $lifeCycle = new Lifecycle;
        $lifeCycle->onBootUp(\appapi\Setup\Bootup::class);   // 引导装配类
        $app->set(["lifeCycle" => $lifeCycle]);
    }
}
```

```php
<?php
// app-admin/Setup/Bootstrap.php   —— 管理后台装配类
namespace appadmin\Setup;

use kernel\Foundation\Lifecycle;
use kernel\Foundation\Middleware\Middleware;

class Bootstrap
{
    public function __construct($app)
    {
        $middleware = new Middleware;
        $middleware->set(AdminAuthMiddleware::class);
        $app->set(["middleware" => $middleware]);

        $lifeCycle = new Lifecycle;
        $lifeCycle->onBootUp(\appadmin\Setup\Bootup::class);   // 引导装配类
        $app->set(["lifeCycle" => $lifeCycle]);
    }
}
```

两个应用共用 `kernel/`，各自通过不同的 Nginx server 或 location 对外提供服务。

### 生命周期图示

```
new App("my-app")
    │
    │  初始化: 定义常量、加载配置、注册异常处理
    │
    ▼
setup(Bootstrap::class)  ← 装配应用（Bootstrap 构造内手动 new 组件并 $app->set([...]) 注入）
    │
    ├─ new Middleware → set() 注册全局中间件 → $app->set(["middleware" => ...])
    ├─ new Lifecycle → onBootUp(Setup\Bootup) / onShutdown(Setup\Shutdown) → $app->set(["lifeCycle" => ...])
    │
    ▼
run()              ← 启动应用
    │
    ├─ 1. 设置 CORS 头（OPTIONS 预检在此执行 shutdown 钩子后返回）
    ├─ 2. 实例化引导装配类 Setup\Bootup（构造即装配，收到 $request）
    ├─ 3. [Router::match()] 路由匹配 → 结果写入 request->route
    ├─ 4. 实例化控制器 → __construct() → boot()
    ├─ 5. 执行中间件链
    ├─ 6. before()
    │         ├─ 校验失败 → 跳过 handle 方法
    ├─ 7. 执行控制器 handle 方法（data() 或自定义）
    │         ├─ 控制器内可 $this->lifeCycle()->onShutdown(闭包) 动态注册结束钩子
    ├─ 8. after() → transform() → serialization()
    ├─ 9. 实例化关闭装配类 Setup\Shutdown（构造即装配，收到 $response；正常或异常结束都会执行）
    ├─ 10. 输出响应
    └─ 11. exit

异常路径：步骤 2~8 任一环节抛出异常（如外部 SDK 直接报错）→ 先触发 onError 错误钩子，再执行 shutdown 钩子
（含动态注册的 onShutdown 回调，可通过 App::exception() 读取异常）→ 最后交由全局异常处理器输出错误响应。
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Router](./router.md) | App 构造 `new Router`（构造内加载路由），run() 调用 `Router::match()` | 匹配结果写入 `request->route` |
| [Controller](./controller.md) | App 实例化控制器并执行 | 业务逻辑处理 |
| [Middleware](./middleware.md) | App 管理全局中间件并执行中间件链 | 请求拦截 |
| [Config](./config.md) | Setup 里手动 `new Config` | 配置管理 |
| [Request](./request.md) | `$App->request()` 获取请求实例 | 请求信息 |
| [Lifecycle](./lifecycle.md) | Setup 里 `new Lifecycle` 后 `->onBootUp(Setup\Bootup::class)` / `->onShutdown(Setup\Shutdown::class)` 注册装配类，再 `$app->set(["lifeCycle" => $lifeCycle])` 注入（`run()` 中实例化） | 应用引导、关闭与错误钩子 |

## 路径常量

`new App($AppId)` 自动设置以下常量与静态属性，应用代码可直接使用：

| 常量 / 静态属性 | 示例值 | 说明 |
|------|------|------|
| `Path::root()` | `/path/to/project/my-app` | 当前应用根目录 |
| `App::id()` | `"my-app"` | 当前应用 ID（= 目录名，静态属性） |
| `Path::projectRoot()` | `/path/to/project` | 项目根目录 |
| `Path::dir()` | `"my-app"` | 当前应用目录名 |
| `App::kernelId()` | `"kernel"` | 内核目录名（静态属性） |
| `Path::kernelRoot()` | `/path/to/project/kernel` | 内核根目录 |
| `App::mode()` | `"production"` | 运行模式 |
| `F_BASE_URL` | `"http://example.com"` | 应用 URL |
