# Commands 命令体系

- **目录位置**: `kernel/Commands/`
- **命名空间**: `kernel\Commands`

框架自带的命令行命令，通过 `kernel/Setup/Console/Bootstrap.php` 装配类注册到 Console。

## 命令一览

| 命令 | 类 | 说明 |
|------|-----|------|
| `make:app` | [MakeAppCommand](make-app-command.md) | 创建新应用骨架 |
| `make:controller` | [MakeControllerCommand](make-controller-command.md) | 创建新控制器 |
| `make:model` | [MakeModelCommand](make-model-command.md) | 创建新模型 |
| `make:middleware` | [MakeMiddlewareCommand](make-middleware-command.md) | 创建新中间件 |
| `schedule:run` | [ScheduleRunCommand](schedule-run-command.md) | 执行定时任务 |
| `package` | `PackageCommand` | 打包业务应用与内核为 `{app}.zip` / `{kernel}.zip` |
| `unpack` | `UnpackCommand` | 解压 `{app}.zip` / `{kernel}.zip` 到对应目录 |

## 基类

- [MakeCommand](make-command.md) — 生成类命令的抽象基类（`make:model` / `make:controller` / `make:middleware` 继承）

## 装配

命令通过 `kernel/Setup/Console/Bootstrap.php` 装配类注册：

```php
namespace kernel\Setup\Console;

use kernel\Foundation\Console\Console;
use kernel\Commands\MakeAppCommand;
use kernel\Commands\MakeControllerCommand;
use kernel\Commands\MakeModelCommand;
use kernel\Commands\MakeMiddlewareCommand;
use kernel\Commands\ScheduleRunCommand;
use kernel\Commands\PackageCommand;
use kernel\Commands\UnpackCommand;

class Bootstrap
{
  public function __construct(Console $console)
  {
    $console
      ->register("make:app", MakeAppCommand::class, "Create a new application skeleton")
      ->register("make:controller", MakeControllerCommand::class, "Create a new controller class")
      ->register("make:model", MakeModelCommand::class, "Create a new model class")
      ->register("make:middleware", MakeMiddlewareCommand::class, "Create a new middleware class")
      ->register("schedule:run", ScheduleRunCommand::class, "Run scheduled tasks (Crons/)")
      ->register("package", PackageCommand::class, "Package the application and kernel into zip archives")
      ->register("unpack", UnpackCommand::class, "Unpack application and kernel zip archives into directories");
  }
}
```

## 执行

```bash
php kernel/console make:app hello
php kernel/console make:controller User
php kernel/console make:model User
php kernel/console make:middleware Auth
php kernel/console schedule:run
```

## 打包 / 解包（package / unpack）

框架内置命令，用于把**业务应用**与**内核**分别打包成 zip、或从 zip 还原。

- **应用名**默认取 `App::id()`（业务应用目录名，如 `isdtj`）
- **内核名**默认取 `App::kernelId()`（内核目录名，默认 `kernel`）
- 两者都可被**位置参数**（`[app] [kernel]`）或**选项**（`--app` / `--kernel`）覆盖
- 产物输出到项目根：`{app}.zip` / `{kernel}.zip`

```bash
# 从应用控制台运行：应用名自动取 App::id()=isdtj，内核名取 App::kernelId()=kernel
php isdtj/console package
php isdtj/console unpack

# 从内核控制台运行：内核控制台下 App::id() 为 kernel，需显式传入应用名
php kernel/console package isdtj
php kernel/console package isdtj kernel        # 同时指定应用名与内核名
php kernel/console package --app=isdtj --kernel=kernel

# 内核控制台同样可解包
php kernel/console unpack isdtj
```

> `package` 按内置忽略名单排除 `.git`、`/vendor`、`/Data`、`/Storage`、`/Secrets`、`Config.local.php` 等，并在打包前删除旧 zip；`unpack` 在归档缺失时跳过并告警。
