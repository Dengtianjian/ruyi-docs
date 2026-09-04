# Cron — 定时任务基类

- **文件位置**: `kernel/Foundation/Crontab/Cron.php`
- **命名空间**: `kernel\Foundation\Crontab`
- **类型**: 抽象基类（`abstract class Cron`）
- **是否可继承**: 是（业务/模块定时任务均继承此类）

定时任务的抽象基类。子类实现 `plan()`（执行计划）与 `handle()`（任务逻辑），由管理器统一驱动：对到期任务调用 `run()`。`plan()` 返回结构化计划描述，可用基类助手方法构造。

## 设计要点

1. **计划声明**：`plan()` 返回 `array{type:string, ...}`，支持 `interval` / `daily` / `cron` 三种类型。
2. **到期判定** `due()`：以「最近一次应触发时刻」与「上次执行时间」比较，保证周期去重。
3. **执行幂等** `run()`：先 `handle()` 再 `markRun()` 记录时间，避免同一周期内重复执行。
4. **执行时间持久化**：`lastRunFile()` 持久化在 **Data 目录**（`Path::data()/cron/{sha1(class)}.last`），而非 Storage，进程重启后仍按周期去重。
5. **标准 cron 语义** `prevCronTick()`：支持通配/步长/区间/列表及其组合；dom 与 dow 同时受限时按 Vixie cron 取「或」，否则取「且」。

## 计划助手

| 助手 | 返回计划 | 含义 |
|------|----------|------|
| `everyMinute()` | `interval 60` | 每分钟 |
| `everyFiveMinutes()` | `interval 300` | 每 5 分钟 |
| `hourly()` | `interval 3600` | 每小时整点 |
| `daily(int $hour = 0, int $minute = 0)` | `daily` | 每天指定时分 |
| `cron(string $expr)` | `cron` 五段表达式 | 标准 `分 时 日 月 周` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `plan(): array` | 定义执行计划（子类必须覆盖） |
| `handle(): void` | 任务逻辑（子类实现） |
| `run(): void` | 运行入口：`handle()` → `markRun()` |
| `due(): bool` | 当前是否到期（相对上次执行时间） |
| `markRun(): void` | 记录本次执行时间 |
| `lastRun(): ?int` | 读取上次执行时间 |

## 子类范例

```php
namespace kernel\Modules\Auth;

use kernel\Foundation\Crontab\Cron;
use kernel\Modules\Auth\Auth;

class ClearExpiredTokensCron extends Cron
{
  protected function plan(): array
  {
    return $this->daily(3);   // 每天 03:00
  }

  public function handle(): void
  {
    Auth::deleteExpiredTokens();
  }
}
```

业务应用可复用模块任务（仅改命名空间即可，无需重写逻辑）：

```php
namespace isdtj\Crons;

class ClearAuthTokensCron extends \kernel\Modules\Auth\ClearExpiredTokensCron {}
```

继承 `Cron` 后需在应用 `Crons/` 目录提供该类（命名空间 `{AppId}\Crons`），由 `schedule:run` 经门面自动扫描登记。

## 相关

- 任务管理器：[Crons 管理器](./crons.md)
- 执行命令：[schedule:run](../../commands/schedule-run-command.md)
- 门面：[Crons 门面](../../facades/crons.md)
