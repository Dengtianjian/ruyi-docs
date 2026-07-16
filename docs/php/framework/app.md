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

## 方法列表

### `__construct($AppId, $KernelId = "kernel")`

构造函数，初始化应用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$AppId` | `string` | 应用唯一 ID，**必须与应用目录名一致** |
| `$KernelId` | `string` | 内核目录名称，默认 `"kernel"` |

> **关键约定**：`$AppId` 就是应用的文件夹名称。框架通过 `dirname(__DIR__, 2) . '/' . $AppId` 定位应用根目录，因此传入的 AppId 必须与目录名完全一致。

构造函数执行以下初始化工作：
- 定义常量（`F_ROOT`、`F_APP_ROOT`、`F_APP_ID` 等）
- 载入 `Common.php` 全局函数
- 初始化配置（按优先级读取 Configs/ 下的文件）
- 注册异常/错误处理
- 加载错误码
- 加载路由文件（先内核路由，再应用路由）
- 加载事件文件
- 创建 Request 实例

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

### `bootUp($callback)`

注册启动生命周期回调。回调在路由匹配、中间件执行之前调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callback` | `callable\|Closure\|string` | 回调函数或类名 |

返回值：`$this`（支持链式调用）

```php
$App->bootUp(function ($request) {
    // 在应用启动时执行，比如初始化数据库连接
    Log::record("应用已启动");
});
```

### `shutdown($callback)`

注册关闭生命周期回调。回调在获取到响应数据之后、输出之前调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callback` | `callable\|Closure\|string` | 回调函数或类名 |

返回值：`$this`（支持链式调用）

```php
$App->shutdown(function ($response) {
    // 在响应输出前执行，比如记录响应日志
    Log::record("响应状态码: " . $response->statusCode());
});
```

### `run()`

运行应用主流程。这是应用启动的最后一步。

**执行流程**：
1. 设置 CORS 响应头
2. 加载扩展
3. 调用 `bootUp` 回调
4. 路由匹配 → 找到对应控制器
5. 合并全局中间件和路由中间件
6. 执行中间件链
7. 执行控制器（`before()` → `data()` → `after()`）
8. 调用 `shutdown` 回调
9. 输出响应
10. `exit` 终止程序

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

// 初始化数据库连接（在 run() 之前）
$driver = new Driver(...);
Connections::addDriver($driver);

// 注册全局中间件
$App->setMiddlware(GlobalCorsMiddleware::class);
$App->setMiddlware(GlobalAuthMiddleware::class);

// 注册启动回调
$App->bootUp(function ($request) {
    Log::record("收到请求: " . $request->URI);
});

// 注册关闭回调
$App->shutdown(function ($response) {
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
$App->setMiddlware(ApiAuthMiddleware::class);
$App->run();
```

```php
<?php
// app-admin/index.php   —— 管理后台
$App = new App("app-admin");
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
setMiddlware(...)  ← 注册全局中间件
    │
    ▼
bootUp(...)        ← 注册启动回调
    │
    ▼
shutdown(...)      ← 注册关闭回调
    │
    ▼
run()              ← 启动应用
    │
    ├─ 1. 设置 CORS 头
    ├─ 2. 执行 bootUp 回调
    ├─ 3. [Router::match()] 路由匹配
    ├─ 4. 实例化控制器 → __construct() → boot()
    ├─ 5. 执行中间件链
    ├─ 6. before()
    │         ├─ 校验失败 → 跳过 handle 方法
    ├─ 7. 执行控制器 handle 方法（data() 或自定义）
    ├─ 8. after() → transform() → serialization()
    ├─ 9. 执行 shutdown 回调
    ├─ 10. 输出响应
    └─ 11. exit
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Router](./router.md) | App 加载路由文件，调用 `Router::match()` | 路由匹配 |
| [Controller](./controller.md) | App 实例化控制器并执行 | 业务逻辑处理 |
| [Middleware](./middleware.md) | App 管理全局中间件并执行中间件链 | 请求拦截 |
| [Config](./config.md) | App 初始化时加载配置文件 | 配置管理 |
| [Request](./request.md) | App 创建 Request 实例 | 请求信息 |

## 路径常量

`new App($AppId)` 自动定义以下常量，应用代码可直接使用：

| 常量 | 示例值 | 说明 |
|------|------|------|
| `F_ROOT` | `/path/to/project` | 项目根目录 |
| `F_APP_ID` | `"my-app"` | 当前应用 ID（= 目录名） |
| `F_APP_ROOT` | `/path/to/project/my-app` | 当前应用根目录 |
| `F_APP_DIR` | `"my-app"` | 当前应用目录名 |
| `F_KERNEL_ID` | `"kernel"` | 内核目录名 |
| `F_KERNEL_ROOT` | `/path/to/project/kernel` | 内核根目录 |
| `F_APP_MODE` | `"production"` | 运行模式 |
| `F_BASE_URL` | `"http://example.com"` | 应用 URL |
