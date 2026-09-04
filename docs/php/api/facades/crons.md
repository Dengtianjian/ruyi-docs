# Crons — 定时任务门面

- **文件位置**: `kernel/Facades/Crons.php`
- **命名空间**: `kernel\Facades`
- **继承**: `kernel\Foundation\Facade`
- **类型**: 单例门面（覆写 `resolve()`，自动判定为单例）
- **底层实例**: `kernel\Foundation\Crontab\Crons` 管理器

定时任务的静态入口。继承 `Facade`，因覆写 `resolve()` 被自动判定为**单例门面**：首次使用时 `resolve()` 自动 `new` 一个 `Crontab\Crons` 管理器，并扫描当前应用的 `Crons/` 目录登记定时器；之后复用同一实例。

## 设计要点

1. **单例自动判定**：仅覆写 `resolve()`，无需手写 `singleton()` 标识。
2. **兜底自动扫描**：`resolve()` 内 `getApp()` 存在时，自动扫描 `Path::root()."/Crons"` 目录、命名空间 `{AppId}\Crons` 登记任务。
3. **静态转发**：所有 `@method` 声明的方法均转发到管理器实例。

## 方法速查表

（以下均转发到 `Crontab\Crons` 管理器实例）

| 方法 | 作用 |
|------|------|
| `register(Cron $cron): static` | 登记一个任务实例，返回自身 |
| `registerClass(string $class): static` | 按类名登记（自动实例化，非 `Cron` 子类跳过） |
| `discover(string $dir, string $ns): static` | 扫描目录下全部 `.php` 类文件并按命名空间登记 |
| `runDue(): int` | 执行所有到期任务，返回执行数量 |
| `run(string $class): bool` | 强制执行指定类名的任务（忽略到期） |
| `all(): Cron[]` | 返回已登记的任务实例列表 |
| `notFound(): string[]` | 返回扫描时未找到的类名 |

## 用法

```php
use kernel\Facades\Crons;

// 直接执行：未显式登记时自动扫描 App/Crons/ 目录
$ran = Crons::runDue();
foreach (Crons::notFound() as $className) {
  // 告警：Cron class not found: $className
}
```

### 手动登记（替代自动扫描）

```php
use kernel\Facades\Crons;

Crons::registerClass(\isdtj\Crons\ClearAuthTokensCron::class);
Crons::runDue();
```

## 相关

- 管理器：[Crons 管理器](./foundation/crontab/crons.md)
- 任务基类：[Cron](./foundation/crontab/cron.md)
- 执行命令：[schedule:run](./commands/schedule-run-command.md)
- 基类：[Facade](./foundation/facade.md)
