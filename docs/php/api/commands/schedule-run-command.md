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

扫描当前应用 `Crons/` 目录下的定时任务类（继承 `kernel\Foundation\Cron`），按 `plan()` 定义的计划执行到期的任务。

## 参数

| 参数 | 说明 |
|------|------|
| 位置参数 | 无 |
| 选项参数 | 无 |

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 扫描 Crons/ → 执行到期任务 → 输出结果 |
