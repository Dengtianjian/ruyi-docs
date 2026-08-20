# make:app — 创建应用

在 kernel 同级目录（项目根目录）创建指定名称的应用骨架，自动生成目录结构与基础文件。

## 语法

```bash
php kernel/console make:app <AppName>
```

- `<AppName>`：应用名，即应用目录名 = 命名空间前缀 = AppId（如 `myapp` → `myapp\`），必须以字母开头，仅限字母、数字、下划线

目标目录已存在时拒绝创建，报错并返回退出码 1。

## 生成目录

在项目根目录（kernel 同级）创建 `<AppName>/`，包含以下目录：

| 目录 | 用途 |
|------|------|
| `Controller/` | 控制器 |
| `Routes/` | 路由 |
| `Setup/` | 应用装配目录，存放装配类 `Setup\Bootstrap`、引导类 `Setup\Bootup` 与关闭类 `Setup\Shutdown`（由 `Setup/Bootstrap.php` 中 `$lifeCycle->onBootUp/onShutdown()` 注册） |
| `Data/` | 数据（日志等） |
| `Storage/` | 存储（文件） |

## 生成文件

| 文件 | 内容 |
|------|------|
| `Setup/Bootstrap.php` | 应用装配类（`{App}\Setup\Bootstrap`），构造参数为当前 App 实例 `$app`；手动 `new Config/FileSystem/Cache` 装配基础组件、`new Lifecycle` 后 `->onBootUp(Setup\Bootup::class)` / `->onShutdown(Setup\Shutdown::class)` 注册钩子，最后 `$app->set(["lifeCycle" => $lifeCycle])` 注入 |
| `Setup/Bootup.php` | 应用引导装配类（`{App}\Setup\Bootup`），请求处理开始前由 `run()` 实例化，构造即装配 |
| `Setup/Shutdown.php` | 应用关闭装配类（`{App}\Setup\Shutdown`），请求结束时（正常或异常）由 `run()` 实例化，构造即装配 |
| `Routes/index.php` | 路由入口，注册 `/` 指向 IndexController（HTTP 路由 + `Router::command` 命令注册统一在此） |
| `Controller/IndexController.php` | 示例控制器（继承 Controller 基类） |
| `index.php` | 应用 HTTP 入口，引导内核 vendor、`$app->setup(\{App}\Setup\Bootstrap::class)` 装配并运行 App |
| `console` | 应用 CLI 入口，`$console->setup(\{App}\Setup\Bootstrap::class)` 装配并运行 |

## 装配流程

`index.php` / `console` 均在 `run()` 之前调用 `setup(\{App}\Setup\Bootstrap::class)` 装配：

```php
<?php
// index.php
include_once("{$kernelRoot}/vendor/autoload.php");

use kernel\Foundation\App;

$app = new App("myapp");
$app->setup(\myapp\Setup\Bootstrap::class);   // setup() 必须在 run() 之前调用
$app->run();
```

`Setup/Bootstrap.php` 构造内手动实例化并注入组件：

```php
<?php
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

        // 生命周期：手动 new Lifecycle 后注册钩子，再注入 App
        $lifeCycle = new Lifecycle;
        $lifeCycle->onBootUp(\myapp\Setup\Bootup::class);
        $lifeCycle->onShutdown(\myapp\Setup\Shutdown::class);
        $app->set(["lifeCycle" => $lifeCycle]);
    }
}
```

## 退出码

- `0`：创建成功
- `1`：缺少或非法应用名，或目标目录已存在
