# 如意框架入门指南

本指南面向刚接触如意（Ruyi）PHP 框架的新手，帮助你快速理解框架的核心概念和基本用法。

## 框架简介

如意框架是一个轻量级 PHP 框架，采用 **内核 + 应用** 的分层架构，类似前端项目中将框架代码与业务代码分离的设计模式。

| 部分 | 目录 | 说明 |
|------|------|------|
| **内核** | `kernel/` | 框架核心，提供路由、控制器、中间件、ORM 等基础能力 |
| **应用** | `<app-id>/` | 业务应用代码，目录名 = `new App("app-id")` 传入的 AppId |

> **核心理念**：框架代码不干涉应用代码。`kernel/` 只提供通用能力，应用按自己的目录组织路由、控制器、模型、服务等。一个内核可以支撑多个应用。

### 多应用架构

```
项目根目录/
├── kernel/          # 内核（所有应用共享）
├── app1/            # 应用 1  →  new App("app1")
│   └── index.php    #     入口文件
├── app2/            # 应用 2  →  new App("app2")
│   └── index.php    #     入口文件
└── ...
```

应用目录名由 `new App("AppId")` 的第一个参数决定。`AppId` 就是应用文件夹的名称，框架通过它自动推导 `F_APP_ROOT`、`F_APP_ID` 等路径常量。

## 请求入口

所有 HTTP 请求通过 Nginx 统一指向应用的 `index.php`，框架内部完成路由匹配和分发。

### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/project/app1;     # 指向具体应用的目录

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }
}
```

> 每个应用通过各自的 Nginx `server` 块或 `location` 前缀指向对应目录的 `index.php`，共用同一个 `kernel/`。

### 入口文件

```php
<?php
// app1/index.php
include_once("../kernel/index.php");   // 引入内核自动加载

$App = new App("app1");                // AppId = 目录名
$App->run();                           // 启动应用
```

`new App("app1")` 做了以下初始化工作：

1. 定义路径常量：`F_ROOT`、`F_APP_ROOT`、`F_APP_ID`、`F_KERNEL_ROOT` 等
2. 载入 `Common.php` 全局函数
3. 读取 `Configs/` 下的配置文件（按优先级覆盖）
4. 注册全局异常/错误处理
5. 加载错误码
6. 加载路由文件（先内核路由，再应用路由）
7. 加载事件文件
8. 创建 `Request` 实例

## 整体架构

```
客户端请求
    │
    ▼ (Nginx → <app-id>/index.php)
┌─────────────┐     ┌──────────────────────────────────┐
│  index.php  │────▶│           App (应用入口)           │
│  (入口文件)  │     │  • 初始化配置                     │
└─────────────┘     │  • 加载路由                       │
                    │  • 设置中间件                      │
                    │  • 调用 run()                     │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │          生命周期钩子              │
                    │     bootUp() 回调执行              │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │          Router (路由匹配)         │
                    │  匹配 URL → 找到对应控制器          │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │        Middleware (中间件)         │
                    │  认证检查 / CORS 处理 / 权限验证    │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │        Controller (控制器)         │
                    │  before() → data() → after()      │
                    │  • 校验请求参数                     │
                    │  • 调用 Service / Model            │
                    │  • 返回响应数据                     │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │         Response (响应)            │
                    │  输出 JSON / XML / HTML            │
                    └──────────────────────────────────┘
```

## 核心概念

### 1. App — 应用入口

`App` 是整个应用的启动器，负责初始化配置、加载路由、执行中间件链和控制器。

```php
// <app-id>/index.php
$App = new App("my-app");       // AppId = 目录名，框架据此定位应用根目录
$App->setMiddlware(XXX::class); // 注册全局中间件
$App->run();                    // 启动应用
```

### 2. Router — 路由

路由定义了 URL 和控制器之间的映射关系。在 `Routes/index.php` 中配置。

```php
// 基本路由: GET /links → ListLinksController::data()
Router::get("links", ListLinksController::class);

// 参数路由: GET /links/123 → GetLinkController::data()
Router::get("links/{linkId:\\w+}", GetLinkController::class);

// 同一 URL 不同方法
Router::same("links/{?linkId:\\w+}", function () {
    Router::get(GetLinkController::class);    // GET 获取
    Router::post(PostLinkController::class);  // POST 创建
    Router::put(PutLinkController::class);    // PUT 更新
    Router::patch(PatchLinkController::class); // PATCH 删除
});

// 路由组
Router::group("admin", function () {
    Router::get("dashboard", DashboardController::class);
    Router::get("users", UserListController::class);
}, [AdminMiddleware::class]);
```

### 3. Controller — 控制器

控制器处理业务逻辑。所有控制器继承 `Controller` 或 `AuthController`。

```php
class ListLinksController extends AuthController
{
    // data() 是默认处理方法
    public function data()
    {
        $LM = new LinksModel();
        $links = $LM->page(1, 20)->order("sort", "ASC")->getAll();
        return $links;  // 返回的数据会由框架自动包装为 JSON 响应
    }
}
```

### 4. Middleware — 中间件

中间件在控制器执行前/后进行拦截处理，常用于认证、日志等。

```php
class GlobalAuthMiddleware extends Middleware
{
    public function handle(\Closure $next)
    {
        // 前置处理：验证 token
        $token = $this->request->header->get("Authorization");
        if (!$token) {
            return $this->response->error(401, "未登录");
        }
        // 调用下一个中间件或控制器
        return $next();
    }
}
```

### 5. Model — 数据模型

Model 封装数据库操作，提供 CRUD 方法。

```php
$model = new LinksModel();

// 查询
$link = $model->where("id", 5)->getOne();
$links = $model->where("deletedAt", null)->page(1, 20)->getAll();

// 创建
$model->insert(["name" => "新链接", "url" => "https://..."]);
$model->save();

// 更新
$link = $model->where("id", 5)->getOne();
$link->name = "新名称";
$link->save();

// 删除（软删除）
$link = $model->where("id", 5)->getOne();
$link->deletedAt = time();
$link->save();
```

### 6. Response — 响应

框架自动将控制器返回值包装为 JSON 响应，也可以手动构建响应。

```php
// 成功响应（自动）
return $data;

// 错误响应
return $this->response->error(400, "400001", "参数错误");

// 成功响应（手动）
return $this->response->success($data);

// 分页响应
return new ResponsePagination($request, $total, $data);

// 文件响应
return $this->response->file("/path/to/file.pdf");
```

## 请求处理生命周期

1. **App 启动** — 初始化配置、加载路由、注册全局中间件
2. **bootUp 回调** — 执行注册的启动回调
3. **路由匹配** — 根据 URL 和方法匹配路由
4. **实例化控制器** — 创建控制器实例
5. **before() 钩子** — 校验请求参数
6. **执行中间件链** — 按顺序执行全局中间件和路由中间件
7. **执行 data() 方法** — 控制器核心逻辑
8. **after() 钩子** — 数据序列化、pipe 处理
9. **shutdown 回调** — 执行注册的关闭回调
10. **输出响应** — 将结果以 JSON/XML/HTML 格式输出

## 目录结构

```
项目根目录/
├── kernel/                  # 框架内核（所有应用共享）
│   ├── index.php            #   内核入口（Composer 自动加载）
│   ├── Foundation/          #   核心类库
│   │   ├── App.php          #     应用启动器
│   │   ├── Router.php       #     路由器
│   │   ├── Middleware.php   #     中间件基类
│   │   ├── Config.php       #     配置管理
│   │   ├── Cache.php        #     缓存
│   │   ├── Controller/      #     控制器基类
│   │   ├── HTTP/            #     HTTP 请求/响应
│   │   ├── Data/            #     数据处理
│   │   ├── Validate/        #     数据校验
│   │   ├── Database/        #     数据库操作（PDO/MongoDB/SQLite）
│   │   ├── Storage/         #     文件存储
│   │   └── ...
│   ├── Routes/              #   内核级路由（可选）
│   ├── Middleware/          #   内核级中间件
│   └── Configs/             #   内核级配置
│
├── app1/                    # 应用 1（AppId = "app1"）
│   ├── index.php            #   入口文件  →  new App("app1")
│   ├── Configs/             #   应用配置
│   │   ├── Config.php       #     默认配置
│   │   └── Config.local.php #     本地覆盖配置
│   ├── Routes/              #   路由定义
│   │   └── index.php
│   ├── Controller/          #   控制器
│   ├── Model/               #   数据模型
│   ├── Middleware/          #   应用中间件
│   ├── Service/             #   业务服务
│   ├── Events/              #   事件定义
│   └── Storage/             #   文件存储
│
├── app2/                    # 应用 2（AppId = "app2"）
│   ├── index.php            #   入口文件  →  new App("app2")
│   ├── Configs/
│   ├── Routes/
│   ├── Controller/
│   ├── Model/
│   ├── Middleware/
│   └── Service/
│
└── docs/                    # 文档站点
```

> **关键约定**：应用目录名 = `new App()` 的第一个参数。框架通过 `dirname(__DIR__, 2) . '/' . $AppId` 自动定位应用根目录，因此两者必须一致。

## 快速上手

### 1. 创建应用目录和入口文件

```php
<?php
// myapp/index.php
include_once("../kernel/index.php");

use kernel\Foundation\App;

$App = new App("myapp");     // AppId 必须与目录名一致
$App->run();
```

### 2. 配置 Nginx

```nginx
server {
    listen 80;
    server_name myapp.local;
    root /path/to/project/myapp;

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

### 3. 配置数据库

```php
<?php
// myapp/index.php（在 new App() 之后，run() 之前）
use kernel\Foundation\Config;
use kernel\Foundation\Database\PDO\Connections;
use kernel\Foundation\Database\PDO\Driver;

$App = new App("myapp");

// 创建并注册数据库连接
$driver = new Driver(
    Config::get("database/mysql/host"),
    Config::get("database/mysql/username"),
    Config::get("database/mysql/password"),
    Config::get("database/mysql/name")
);
Connections::addDriver($driver);

$App->run();
```

对应的配置文件：

```php
<?php
// myapp/Configs/Config.php
return [
    "myapp" => [
        "mode" => "development",
        "database" => [
            "mysql" => [
                "host" => "localhost",
                "name" => "myapp",
                "username" => "root",
                "password" => ""
            ]
        ]
    ]
];
```

### 4. 定义路由

```php
<?php
// myapp/Routes/index.php
use myapp\Controller\IndexController;
use kernel\Foundation\Router;

Router::get("/", IndexController::class);
```

### 5. 创建控制器

```php
<?php
// myapp/Controller/IndexController.php
namespace myapp\Controller;

use kernel\Foundation\Controller\Controller;

class IndexController extends Controller
{
    public function data()
    {
        return ["message" => "Hello, 如意框架!"];
    }
}
```

### 6. 添加第二个应用

同一项目下创建新应用只需新增目录和入口文件：

```php
<?php
// anotherapp/index.php
include_once("../kernel/index.php");

$App = new App("anotherapp");  // 目录名 = "anotherapp"
$App->run();
```

两个应用共用 `kernel/`，独立拥有各自的路由、控制器、模型和配置。

## 框架路径常量

框架在 `new App()` 时自动定义以下常量，可在应用任意位置使用：

| 常量 | 值 | 说明 |
|------|------|------|
| `F_ROOT` | `/path/to/project` | 项目根目录绝对路径 |
| `F_APP_ID` | `"myapp"` | 当前应用 AppId |
| `F_APP_ROOT` | `/path/to/project/myapp` | 当前应用根目录 |
| `F_APP_DIR` | `"myapp"` | 当前应用相对路径名 |
| `F_KERNEL_ID` | `"kernel"` | 内核目录名 |
| `F_KERNEL_ROOT` | `/path/to/project/kernel` | 内核根目录 |
| `F_APP_MODE` | `"production"` / `"development"` | 当前运行模式 |
| `F_BASE_URL` | `"http://example.com"` | 应用基础 URL |

## 下一步

- [App 应用入口](./framework/app.md) — 深入了解应用生命周期
- [Router 路由](./framework/router.md) — 路由注册和匹配详解
- [Controller 控制器](./framework/controller.md) — 控制器开发指南
- [Middleware 中间件](./framework/middleware.md) — 中间件开发指南
- [Config 配置](./php/config) — 多环境配置管理
- [应用概览](./application/overview) — 控制器/模型/服务协作指南
