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

class Bootstrap
{
  public function __construct(Console $console)
  {
    $console
      ->register("make:app", MakeAppCommand::class, "Create a new application skeleton")
      ->register("make:controller", MakeControllerCommand::class, "Create a new controller class")
      ->register("make:model", MakeModelCommand::class, "Create a new model class")
      ->register("make:middleware", MakeMiddlewareCommand::class, "Create a new middleware class")
      ->register("schedule:run", ScheduleRunCommand::class, "Run scheduled tasks (Crons/)");
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
