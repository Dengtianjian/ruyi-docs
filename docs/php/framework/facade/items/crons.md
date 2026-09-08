# Crons 门面（实战示例）

> 本页是 [Crons 门面 API](/php/api/facades/crons) 的实战补充，演示如何定义任务并通过门面驱动。底层由 `Crontab\Crons` 管理器与 `schedule:run` 命令统一驱动。

## 1. 定义一个任务

继承 `kernel\Foundation\Crontab\Cron`，实现 `plan()`（计划）与 `handle()`（逻辑）：

```php
namespace isdtj\Crons;

use kernel\Foundation\Crontab\Cron;

class ClearAuthTokensCron extends Cron
{
  // 每天凌晨 3 点执行
  protected function plan(): array
  {
    return $this->daily(3);
  }

  public function handle(): void
  {
    // 清理过期凭证等业务逻辑
    getApp()->modules()->get("auth")?->deleteExpiredTokens();
  }
}
```

`plan()` 返回的数组可用基类助手构造：

| 助手 | 计划 |
|------|------|
| `$this->everyMinute()` | 每分钟 |
| `$this->everyFiveMinutes()` | 每 5 分钟 |
| `$this->hourly()` | 每小时整点 |
| `$this->daily($hour = 0, $minute = 0)` | 每天指定时刻 |
| `$this->cron("0 3 * * *")` | 标准 5 段 cron 表达式 |

> 上次执行时间持久化在 Data 目录 `cron/{类名 sha1}.last`，进程重启后仍按周期去重，不会重复执行。

## 2. 登记并运行

`Crons` 是单例门面，首次使用时自动扫描当前应用 `Crons/` 目录（命名空间 `{AppId}\Crons`）登记任务，也可手动登记：

```php
use kernel\Facades\Crons;

// 方式 A：依赖自动扫描（把任务类放进 App/Crons/ 目录即可）
$ran = Crons::runDue();

// 方式 B：手动登记
Crons::registerClass(\isdtj\Crons\ClearAuthTokensCron::class);
Crons::runDue();

// 扫描未找到的类名（用于告警）
foreach (Crons::notFound() as $className) {
  // 告警：Cron class not found: $className
}
```

## 3. 通过命令驱动

`runDue()` 一般在 `schedule:run` 命令中被定时调用（由系统 crontab 每分钟拉起）。手动执行：

```bash
php entry.php schedule:run
```

## 方法速查

| 方法 | 作用 |
|------|------|
| `register(Cron $cron): static` | 登记一个任务实例 |
| `registerClass(string $class): static` | 按类名登记（非 `Cron` 子类自动跳过） |
| `discover(string $dir, string $ns): static` | 扫描目录登记 |
| `runDue(): int` | 执行所有到期任务，返回数量 |
| `run(string $class): bool` | 强制执行指定类名任务 |
| `all(): Cron[]` | 已登记任务列表 |
| `notFound(): string[]` | 扫描时未找到的类名 |

> 完整方法签名见 [Crons 门面 API](/php/api/facades/crons)；管理器见 [Crons 管理器](/php/api/foundation/crontab/crons)，任务基类见 [Cron](/php/api/foundation/crontab/cron)。
