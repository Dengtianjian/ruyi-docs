# Crons — 定时任务管理器

- **文件位置**: `kernel/Foundation/Crontab/Crons.php`
- **命名空间**: `kernel\Foundation\Crontab`
- **类型**: 实例类（`class Crons`，无静态单例）
- **是否可继承**: 否（实例持有由门面 `kernel\Facades\Crons` 负责）

负责定时任务的**登记与执行**。本身不含静态单例：业务应用可手动 `new Crons()` 登记后交给门面共享，或直接经门面（`Crons::registerClass(...)`）登记——门面自动复用同一实例。

## 设计要点

1. **多种登记方式**：`register(Cron)` 按实例、`registerClass(string)` 按类名自动实例化、`discover()` 扫描目录批量登记。
2. **`discover()` 扫描目录下全部 `.php` 类文件**，按「命名空间 + 文件名」构造类名交给 `registerClass()`；类不存在记入 `notFound()`，非 `Cron` 子类静默跳过，均不报错。
3. **到期执行** `runDue()`：遍历任务，对 `due()` 为 `true` 的调用 `run()` 并记录数量。
4. **强制单次** `run(string $class)`：忽略到期判断，强制触发指定类名的任务。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `register(Cron $cron): static` | 登记一个任务实例 |
| `registerClass(string $class): static` | 按类名登记（自动实例化，非 `Cron` 子类跳过） |
| `discover(string $dir, string $ns): static` | 扫描目录下全部 `.php` 类文件并按命名空间登记 |
| `runDue(): int` | 执行所有到期任务，返回执行数量 |
| `run(string $class): bool` | 强制执行指定类名的任务（忽略到期） |
| `all(): Cron[]` | 返回已登记的任务实例列表 |
| `notFound(): string[]` | 返回扫描时未找到的类名 |

## 方法详解

### `register(Cron $cron): static`

追加一个已实例化的任务对象，返回自身（可链式）。

### `registerClass(string $class): static`

按类名登记。类不存在 → 追加到 `notFound`；不是 `Cron` 子类 → 静默跳过；否则 `new $class()` 并追加。

### `discover(string $directory, string $namespace): static`

扫描 `$directory` 下全部 `*.php` 文件，对每个文件以 `rtrim($namespace,"\\") . "\\" . 文件名` 构造类名调用 `registerClass()`。

```php
$crons->discover(Path::root() . "/Crons", "isdtj\\Crons");
```

### `runDue(): int`

遍历 `$this->tasks`，对 `due()` 为真的任务调用 `run()`，返回实际执行数量。

### `run(string $class): bool`

强制触发：匹配 `get_class() === $class` 或 `instanceof $class` 的任务并 `run()`，找到并执行返回 `true`，否则 `false`。

### `all(): Cron[]` / `notFound(): string[]`

分别返回已登记实例与扫描时未找到的类名（供 `schedule:run` 告警）。

## 典型用法

```php
use kernel\Foundation\Crontab\Crons as CronsManager;
use kernel\Facades\Crons;

// 方式一：手动 new 管理器登记后，经门面共享
$crons = new CronsManager();
$crons->registerClass(\isdtj\Crons\ClearAuthTokensCron::class);
Crons::registerClass(\isdtj\Crons\ClearAuthTokensCron::class); // 方式二：直接经门面登记

Crons::runDue();
```

## 相关

- 任务基类：[Cron](./cron.md)
- 门面：[Crons 门面](../../facades/crons.md)
- 执行命令：[schedule:run](../../commands/schedule-run-command.md)
