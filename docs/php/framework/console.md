# Console — 控制台与命令执行

Console 子系统为框架提供 CLI 能力，由两个类组成：

- **Console**：控制台应用，继承 App，负责命令注册、参数解析、彩色输出与交互输入
- **Command**：系统命令执行器，基于 proc_open，负责执行 shell 命令（支持会话复用、异步执行、超时与输出限制）

- **命名空间**: `kernel\Foundation\Console`
- **文件位置**:
  - `kernel/Foundation/Console/Console.php`
  - `kernel/Foundation/Console/Command.php`
- **入口脚本**: 内核自带 `kernel/console`（内核自身调试用）；每个应用在应用根目录维护自己的 console 入口（文件名自定，如 `app/console`）

## 快速开始

### 1. 应用入口脚本

Console 是通用类，每个应用在应用根目录提供自己的 console 入口（如 `app/console`），引导方式与内核入口相同：

```php
#!/usr/bin/env php
<?php
// 定位 autoload：优先内核的 vendor（提供 kernel\ 命名空间），应用自身 vendor 其次
$kernelVendor = dirname(__DIR__) . "/kernel/vendor/autoload.php";
$appVendor = __DIR__ . "/vendor/autoload.php";

if (!file_exists($kernelVendor)) {
  fwrite(STDERR, "kernel autoload.php not found. Please run composer install in kernel.\n");
  exit(1);
}

include_once($kernelVendor);

// 应用自身的 vendor（提供 app\ 命名空间与第三方依赖）
if (file_exists($appVendor)) {
  include_once($appVendor);
}

use kernel\Foundation\Console\Console;
use app\Lifecycle\Bootup;
use app\Lifecycle\Shutdown;

// 命令统一在 Routes/index.php 中注册（Router::command），CLI 按命令名分发，不解析 URI
$console = new Console("app");

// 加载应用引导装配类与关闭装配类（CLI 同样生效）
$console->onBootUp(Bootup::class);
$console->onShutdown(Shutdown::class);

// 执行命令分发，并以退出码结束（Console::run 内部调用 handle 后 exit）
$console->run();
```

调用：

```bash
php app/console --help
```

### 2. 注册命令

命令与 HTTP 路由统一在应用 `Routes/index.php` 中注册：

```php
use kernel\Foundation\Router;
use app\Controller\HelloController;

Router::command("hello", HelloController::class, "Say hello");
```

命令控制器迁移到 `Controller/` 目录（内核内置命令放 `Controller/Commands/`），实现 `handle($console, $args, $options): int`：

```php
namespace app\Controller\Commands;

use kernel\Foundation\Console\Console;

class HelloController
{
  public function handle(Console $console, $args, $options): int
  {
    $console->success("Hello " . ($args[0] ?? "World"));
    return 0;
  }
}
```

也可在 console 入口用 `register()` 补充实例级命令（同名覆盖 Router 命令）：

```php
$console->register("hello", function ($console, $args, $options) {
  $console->info("Hello " . ($args[0] ?? "World") . "!");
  return 0;
}, "Say hello");
```

### 3. 运行命令

```bash
php app/console hello Tianjian --name=john
# 输出: Hello Tianjian!
```

未定义命令时输出错误并列出全部命令，返回退出码 1。

## 命令处理器

支持三种形式：

| 形式 | 签名 | 说明 |
|------|------|------|
| 命令控制器类 | `handle(Console $console, array $args, array $options): int` | `Router::command()` 传入类名，由框架实例化并调用 |
| 类名 + 方法名 | `[类名, 方法名]`（方法签名同 `handle`） | `Router::command("name", [Class::class, "run"])` 指定处理方法 |
| 闭包 | `function (Console $console, array $args, array $options): int` | 注册时直接传入闭包（`Router::command` 或 `register()` 均可） |

处理器返回整数作为命令退出码；返回非整数时按 0 处理。

### 命令注册与分发（Routes 统一注册）

**命令与 HTTP 路由统一在 Routes 文件中注册**，不再有独立的 Commands/ 目录自动发现机制：

| 场景 | 匹配依据 | 说明 |
|------|----------|------|
| CLI（Console） | **命令名**（Router 命令表） | `Router::match()`（command 模式）按命令名匹配，不解析 URI |
| HTTP | **URI**（路由表） | `Router::match()` 只匹配 URI 路由，不匹配命令 |

- 内核命令在 `kernel/Routes/index.php` 注册；应用命令在应用 `Routes/index.php` 注册
- CLI 下实例化 `Console`（继承 App）同样加载 Routes，命令表因此就绪
- `register()`/`discover()` 为实例级补充注册（可选）：同名命令覆盖 Router 命令
- `discover($directory, $namespace)` 仍可用于手动扫描其他目录中的命令控制器类（约定：类名取文件名，静态 `$name` 声明命令名，`$description` 声明说明）：

```php
$console->discover(Path::root() . "/VendorCommands", "App\\VendorCommands");
```

## 内置命令

内核自带一组命令，命令控制器放 `kernel/Controller/Commands/`，在 `kernel/Routes/index.php` 中通过 `Router::command()` 注册，用于生成应用骨架文件与定时任务调度。每个命令的详细用法见对应文档：

| 命令 | 用途 | 文档 |
|------|------|------|
| `make:app` | 创建应用（kernel 同级目录生成完整骨架） | [make:app](/php/framework/commands/make-app) |
| `make:model` | 生成模型（继承 PDO Model，自动推断表名） | [make:model](/php/framework/commands/make-model) |
| `make:controller` | 生成控制器（继承 Controller 基类） | [make:controller](/php/framework/commands/make-controller) |
| `make:middleware` | 生成中间件（继承 Middleware 基类） | [make:middleware](/php/framework/commands/make-middleware) |
| `schedule:run` | 运行定时任务（扫描 Crons/ 目录任务类，按 `$schedule` 按需执行） | [schedule:run](/php/framework/commands/schedule-run) |

**生成位置**：写入当前应用 `{Path::root()}` 对应目录（`Model/`、`Controller/`、`Middleware/`），命名空间取 `{App::id()}\Model` 等，支持 `/` 分隔的子命名空间。

**常用选项**：

- 名称支持 `目录/类名` 形式（如 `make:controller Admin/User`），子目录同时影响文件路径与命名空间
- `--force` 覆盖已存在文件；未加 `--force` 时文件已存在则报错并返回退出码 1

## 参数解析

命令名取第一个非选项参数；其余非选项参数为位置参数，选项支持四种形式：

| 形式 | 示例 | 解析结果 |
|------|------|----------|
| `--key=value` | `--name=john` | `$options["name"] = "john"` |
| `--key value` | `--name john` | `$options["name"] = "john"` |
| `-k value` | `-x value` | `$options["x"] = "value"` |
| `--flag` | `--force` | `$options["force"] = true` |

```php
// php app/console hello Tianjian --name=john --force -x value
$console->argument(0);            // "Tianjian"
$console->option("name");         // "john"
$console->option("force");        // true
$console->option("x");            // "value"
$console->option("not-exist");    // null（可传默认值）
```

命令名支持冒号命名空间，如 `make:controller`。

## 输出

| 方法 | 颜色 | 流向 | 说明 |
|------|------|------|------|
| `line($text, $color)` | 自定义 | STDOUT | 基础输出，可指定 ANSI 颜色码 |
| `success($text)` | 绿色 32 | STDOUT | 成功信息 |
| `info($text)` | 青色 36 | STDOUT | 提示信息 |
| `warning($text)` | 黄色 33 | STDOUT | 警告信息 |
| `error($text)` | 红色 31 | STDERR | 错误信息，写入标准错误 |

颜色自动检测：非 TTY（如重定向到文件）或设置了 `NO_COLOR` 环境变量时自动禁用 ANSI 颜色。

## 交互输入

| 方法 | 说明 |
|------|------|
| `ask($question, $default)` | 提示输入，回车使用默认值 |
| `confirm($question, $default)` | 确认询问，返回布尔值（默认提示 `Y/n`） |
| `secret($question)` | 静默输入（关闭回显），用于密码等敏感信息 |

```php
$name = $console->ask("应用名称", "my-app");
if ($console->confirm("确认创建应用?")) {
  $password = $console->secret("数据库密码");
}
```

## Command — 系统命令执行器

### 基本用法

```php
use kernel\Foundation\Console\Command;

// 一行式
$output = Command::run("php -v");

// 实例化
$cmd = new Command();
$out = $cmd->exec("ls -la /var/www");          // 返回 stdout
$result = $cmd->execResult("git status");      // 返回完整结果
```

`execResult()` 返回完整结构：

```php
[
  "exitcode" => 0,              // 退出码，进程未结束时为 null
  "stdout" => "...",            // 标准输出
  "stderr" => "",               // 标准错误
  "timedout" => false,          // 是否超时
  "output_exceeded" => false,   // 是否输出超限
  "command" => "git status"     // 执行的命令
]
```

### 三种执行模式

**1. 单次进程（默认）**：每次 `exec()` 打开一个新进程，执行后关闭。

**2. 会话复用**：`open()` 后复用长驻 shell，多次执行共享进程，`cd()` 设置的目录持续生效：

```php
$cmd->open();
$cmd->cd("/var/www");
$cmd->exec("npm install");
$cmd->exec("npm run build");
$cmd->close();
```

> 会话模式仅支持 Unix/Linux，Windows 下 `open()` 返回 false。

**3. 异步执行**：`start()` 非阻塞启动，`poll()`/`wait()` 轮询：

```php
$cmd->start("composer install");
while ($cmd->isRunning()) {
  $cmd->poll();
  usleep(100000);
}
$result = $cmd->wait();
```

### 实时输出回调

```php
$cmd->onStdout(function ($chunk) { echo $chunk; });
$cmd->onStderr(function ($chunk) { fwrite(STDERR, $chunk); });
$cmd->exec("composer install");
```

### 超时与输出限制

```php
$cmd->setTimeout(30);        // 30 秒超时自动终止，0 表示不限制（默认 60）
$cmd->setMaxOutput(10485760); // 输出超过 10MB 自动终止，0 表示不限制

$result = $cmd->execResult("tar -xzf big.tar.gz");
if ($result["timedout"]) { /* 超时 */ }
if ($result["output_exceeded"]) { /* 输出超限 */ }
```

### 交互式输入

```php
$cmd->start("mysql -u root -p");
$cmd->input("password\n");
$cmd->input("SELECT 1;\n");
$result = $cmd->wait();
```

### 便捷方法

| 方法 | 说明 |
|------|------|
| `cd($cwd)` | 设置工作目录 |
| `echo($content)` | 输出内容（参数自动转义） |
| `which($fileName)` | 查找可执行文件路径 |
| `pwd()` | 获取当前工作目录 |
| `exitcode()` | 最近一次执行退出码（`int\|null`） |
| `isSuccessful()` | 最近一次是否成功（退出码为 0） |
| `isTimedOut()` / `isOutputExceeded()` | 超时/超限标记 |
| `ln($source, $target, $options)` | 创建软链接（默认 `-s`） |
| `whereis($target)` | 查找文件位置 |
| `terminate($signal, $escalateAfter)` | 终止进程，先 SIGTERM，2 秒未退升级 SIGKILL |

### 安全说明

- 所有参数型便捷方法（`echo`/`which`/`ln`/`whereis`）均使用 `escapeshellarg` 转义
- 命令本体经 `escapeshellcmd` 转义；拼接参数时请使用 `escapeshellarg`
- 不要直接拼接用户输入构造命令，建议配合 `escapeshellarg` 使用
- 需要 `sudo` 时由调用方自行在命令前添加，如 `exec("sudo " . ...)`

## 完整示例

```php
use kernel\Foundation\Console\Console;

$console = new Console("app");

// 基于 Command 的命令
$console->register("cache:clear", function ($console) {
  $console->info("Clearing cache...");
  $result = (new \kernel\Foundation\Console\Command())->execResult("rm -rf " . \kernel\Foundation\FileSystem\Path::root() . "/Storage/cache/*");
  if ($result["exitcode"] === 0) {
    $console->success("Cache cleared.");
    return 0;
  }
  $console->error($result["stderr"]);
  return 1;
}, "Clear application cache");

exit($console->handle(isset($GLOBALS['argv']) ? array_slice($GLOBALS['argv'], 1) : []));
```
