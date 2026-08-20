# schedule:run — 运行定时任务

`schedule:run` 是内核内置的定时任务调度命令。每次执行时扫描应用 `Crons/` 目录下的任务类，读取类属性 `$schedule` 声明的执行时间，命中当前时刻的任务会被按需执行。

- **命令控制器**: `kernel/Controller/Commands/ScheduleRunCommand.php`（在 `kernel/Routes/index.php` 中经 `Router::command()` 注册）
- **触发方式**: `php {应用}/console schedule:run`

## 为什么用它

内核早期用 `CronApp`（App 子类）作为定时任务外壳，后来演进为 `crons.php` + `Cron::install()` 的注册式调度。目录类任务方式推翻了注册式设计，带来的好处：

- **定时任务不用写在控制器里**：每个任务是一个独立的类，放在 `Crons/` 目录，职责单一、便于复用与测试
- **无需维护注册文件**：新增任务只需新增一个类文件，`schedule:run` 每次自动扫描，按需执行
- **执行时间即类属性**：`$schedule` 属性直接声明该任务何时执行，声明即调度
- 统一使用应用自己的 `console` 入口，无需单独维护 cron 入口脚本
- CLI 生命周期钩子（`bootup` / `shutdown`）对全部命令生效，定时任务同样可用
- 单个任务失败不会中断其他任务，结束时报成功/失败统计，并以退出码反馈（有失败返回 1，便于 crontab 感知）

## 任务类

### 目录与命名空间

任务类放在应用根目录的 `Crons/` 下，每个 PHP 文件定义一个任务类：

| 文件 | 类命名空间 |
|------|-----------|
| `Crons/CleanupTask.php` | `{App::id()}\Crons\CleanupTask` |
| `Crons/System/CleanupTask.php` | `{App::id()}\Crons\System\CleanupTask` |

> 类命名空间必须与文件路径对应（PSR-4），子目录对应追加子命名空间。

### 类结构

每个任务类需要两个要素：**`$schedule` 属性**声明执行时间，**`handle()` 方法**作为任务主体：

```php
namespace App\Crons;

class CleanupTask
{
    /**
     * 执行时间表达式，null/缺省表示每分钟执行
     * @var string|null
     */
    protected $schedule = "h2"; // 每天 2 点执行

    /**
     * 任务主体
     * @param \kernel\Foundation\Console\Console $console
     * @return void
     */
    public function handle($console)
    {
        // 清理过期会话、更新统计等
    }
}
```

- `$schedule` 缺省或为 `null` 时，任务每分钟都会执行
- `handle($console)` 接收控制台实例，可缺省参数（`handle()` 同样兼容）

### 时间表达式

`$schedule` 属性的取值规则与示例：

| 表达式 | 含义 | 示例 |
|--------|------|------|
| （省略/null） | 每分钟执行 | `protected $schedule = null;` |
| `{分}` | 每小时的指定分钟 | `"38"` → 每小时 38 分 |
| `{时}:{分}` | 每天的指定时间 | `"12:00"` → 每天 12:00 |
| `{日} {时}:{分}` | 每月的指定日期时间 | `"24 11:0"` → 每月 24 日 11 点 |
| `{月}-{日} {时}:{分}` | 每年的指定月日 | `"10-24 11:0"` → 每年 10 月 24 日 11 点 |
| `h{时}` | 每天的指定小时 | `"h13"` → 每天 13 点 |
| `d{日}` | 每月的指定日期 | `"d5"` → 每月 5 日 0 点 |
| `m{月}` | 每年的指定月份 | `"m10"` → 每年 10 月 1 日 0 点 |
| `y{年}` | 指定年份的 1 月 1 日 | `"y2027"` → 2027 年 1 月 1 日 0 点 |

> 时间值小于 10 时**不用补零**；只有单个数值且无字母前缀时按"分"解析（如 `"38"`）。纯数字前的字母用于消歧义：`m` 月、`d` 日、`h` 时，不加字母或加 `i` 为分。

## 使用

### 直接运行

```bash
php App/console schedule:run
```

### crontab 配置

crontab 每分钟调度一次，具体任务是否执行由 `$schedule` 匹配决定：

```cron
* * * * * php /path/to/App/console schedule:run >> /var/log/app-cron.log 2>&1
```

### 输出与退出码

```
Running App\Crons\CleanupTask ...
  done
Running App\Crons\ReportTask ...
  done

Finished: 2 succeeded, 0 failed.
```

- `Crons/` 目录不存在或没有任务类时输出警告，退出码 0
- 无任务命中当前时刻时输出 `No tasks scheduled to run at this time.`，退出码 0
- 全部成功退出码 0；有任务失败退出码 1（其他任务仍会继续执行）

## 生命周期钩子

`Console::handle()` 在命令分发前触发 `bootup`、结束后触发 `shutdown`，因此 `schedule:run` 同样能利用应用入口中注册的生命周期钩子：

```php
// 应用 console 入口
$console->onBootUp(function () {
    // 任务执行前的初始化（如数据库连接池预热）
});
$console->onShutdown(function ($exitCode) {
    // 任务执行后的清理
});

$console->run();
```

## 相关导航

- [Console 控制台与命令执行](../console.md) — 命令注册（Routes）、分发与生命周期
