# Console 控制台

- **目录位置**: `kernel/Foundation/Console/`
- **命名空间**: `kernel\Foundation\Console`

控制台命令的基础设施。命令控制器放置于 `kernel/Commands/`（namespace `kernel\Commands`），通过 `kernel/Setup/Console/Bootstrap.php` 装配类注册到 Console。

## Command — 命令基类

- **文件位置**: `kernel/Foundation/Console/Command.php`
- **命名空间**: `kernel\Foundation\Console`

命令行命令基类，命令控制器继承它。核心方法是 `handle($console, $args, $options): int`。

### `handle($console, $args, $options): int`

| 参数 | 类型 | 说明 |
|------|------|------|
| `$console` | `Console` | 控制台实例 |
| `$args` | `array` | 位置参数 |
| `$options` | `array` | 选项参数 |

返回 `int` 作为命令退出码。

```php
namespace app\Commands;

use kernel\Foundation\Console\Command;

class CacheClearCommand extends Command
{
    public function handle($console, $args, $options): int
    {
        $console->success("缓存已清理");
        return 0;
    }
}
```

## Console — 控制台管理器

- **文件位置**: `kernel/Foundation/Console/Console.php`
- **命名空间**: `kernel\Foundation\Console`

控制台执行器与输出工具。

```php
$console->success("完成");
$console->error("失败");
$console->line("普通消息");
```

### 常用输出方法

| 方法 | 说明 |
|------|------|
| `line($message)` | 输出一行 |
| `success($message)` | 绿色成功消息 |
| `error($message)` | 红色错误消息 |
| `warning($message)` | 警告消息 |

### 执行命令

命令由 `Console::register("name", Class::class, "说明")` 注册（命令完全由 Console 管理，不再依赖 Router）。`Console::handle()` 按命令名从实例命令表分发并执行。

```php
$console->register("cache:clear", CacheClearCommand::class, "清理缓存");
```

### 装配类

框架命令通过 `kernel/Setup/Console/Bootstrap.php` 装配类注册：

```php
namespace kernel\Setup\Console;

use kernel\Foundation\Console\Console;
use kernel\Commands\MakeAppCommand;
// ...

class Bootstrap
{
  public function __construct(Console $console)
  {
    $console
      ->register("make:app", MakeAppCommand::class, "Create a new application skeleton")
      // ...
  }
}
```

入口文件调用：

```php
$console = new Console("kernel");
$console->setup(Bootstrap::class);
$console->run();
```

命令行执行：

```bash
php kernel/console cache:clear
```

## 框架自带命令

详见 [Commands 命令体系](commands.md)。
