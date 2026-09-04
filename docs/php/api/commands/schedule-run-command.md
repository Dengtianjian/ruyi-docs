# ScheduleRunCommand — 定时任务执行命令

- **文件位置**: `kernel/Commands/ScheduleRunCommand.php`
- **命名空间**: `kernel\Commands`
- **命令名**: `schedule:run`

执行定时任务的命令。

## 用法

```bash
php kernel/console schedule:run
```

## 行为

直接经 `Crons` 门面（`kernel\Facades\Crons`）执行：

- 业务应用若已通过门面登记任务（如 `Crons::registerClass(...)`），则复用同一单例实例；
- 否则门面 `resolve()` 自动 `new` 一个 `Crontab\Crons` 管理器，并扫描当前应用 `Crons/` 目录（命名空间 `{AppId}\Crons`）登记所有继承 `kernel\Foundation\Crontab\Cron` 的任务类。

随后对 `due()` 为 `true` 的任务调用 `run()`，按 `plan()` 定义的计划执行到期任务，并对扫描时未找到的类名输出告警。

## 参数

| 参数 | 说明 |
|------|------|
| 位置参数 | 无 |
| 选项参数 | 无 |

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 经门面执行到期任务 → 输出告警/结果 |
