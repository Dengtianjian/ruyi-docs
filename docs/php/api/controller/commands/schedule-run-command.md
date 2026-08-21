# ScheduleRunCommand — 定时任务执行命令

- **文件位置**: `kernel/Controller/Commands/ScheduleRunCommand.php`
- **命名空间**: `kernel\Controller\Commands`
- **命令名**: `schedule:run`

扫描当前应用 `Crons/` 目录下的定时任务类（继承 `kernel\Foundation\Cron`），按 `due()` 判断执行到期的 `handle()`。

## 用法

```bash
php kernel/console schedule:run
```

## 说明

- 扫描 `{root}/Crons/*Cron.php`，命名空间 `{AppId}\Crons`
- 对每个 `new $className()`：
  - `$cron->due()` 为真 → `$cron->handle()`
- 无 `Crons/` 目录或无可执行任务时友好提示，退出码 `0`

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 扫描并执行到期的定时任务 |
