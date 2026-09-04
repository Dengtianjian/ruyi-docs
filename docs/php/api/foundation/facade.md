# Facade — 门面基类

- **文件位置**: `kernel/Foundation/Facade.php`
- **命名空间**: `kernel\Foundation`
- **类型**: 抽象基类（`abstract class Facade`）
- **是否可继承**: 是（所有门面均继承此类）

门面提供**静态转发**能力：门面上的静态方法调用会被透明转发到「底层实例」的对应方法，调用方无需手动持有实例。框架内置单例/多例自动判定，子类按需在 `resolve()`（单例）或 `accessor()`（多例）二选一实现即可。

## 设计要点

1. **静态转发**：未定义的静态方法经 `__callStatic` 委托给 `accessor()` 返回的底层实例。
2. **单例/多例自动判定（无需手写标识）**：
   - 子类**覆写 `resolve()`** → 判定为**单例门面**：首次解析调用 `resolve()` 创建实例，缓存到 `static::$registry`，之后复用同一实例。
   - 子类**覆写 `accessor()`** → 判定为**多例门面**：每次转发都走子类 `accessor()` 返回实例（如按请求重新解析的模块门面 `Auth`）。
   - 两者皆无 → `singleton()` 返回 `false`，基类 `accessor()` 返回 `null`，静态调用返回 `null`。
3. **注册表按类名隔离**：`protected static array $registry`，键为 `static::class`，不同门面互不影响。
4. **实例无法解析时返回 `null`**：`accessor()` 返回 `null` 时对应静态调用返回 `null`，由子类自行决定是否在 `accessor()` 内抛更明确的异常。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `singleton(): bool` | 自动判定是否为单例门面（检测 `resolve()` 是否由子类声明） |
| `accessor(): ?object` | 获取底层实例；单例时经 `resolve()` 创建并缓存，多例时由子类覆写 |
| `resolve(): object` | 兜底实例工厂（仅单例门面覆写） |
| `__callStatic($method, $arguments): mixed` | 静态转发到实例方法 |

## 方法详解

### `singleton(): bool` — 是否为单例

通过反射检测 `resolve()` 是否由子类（而非基类）声明来自动判定，**子类无需手动覆写**。

```php
Crons::singleton();   // true  （覆写 resolve()）
Auth::singleton();    // false （覆写 accessor()）
```

### `accessor(): ?object` — 解析底层实例

- **单例门面**（`singleton()` 为 `true`）：首次调用 `resolve()` 创建实例并写入 `static::$registry[static::class]`，后续复用。
- **多例门面**：由子类覆写本方法直接返回实例，基类实现不会被使用。
- 非单例且未覆写时返回 `null`。

### `resolve(): object` — 兜底实例工厂

基类实现直接抛 `\BadMethodCallException`。**仅单例门面需要覆写**，返回该门面的默认实例（如自动扫描目录登记后的管理器）。

### `__callStatic($method, $arguments): mixed` — 静态转发

```php
$instance = static::accessor();
if ($instance === null) {
  return null;
}
return $instance->$method(...$arguments);
```

所有未定义的静态调用（如 `Crons::runDue()`、注释中声明的 `@method`）均经此转发到底层实例。

## 子类范式

### 单例门面（覆写 `resolve()`）

```php
namespace kernel\Facades;

use kernel\Foundation\Facade;
use kernel\Foundation\Crontab\Crons as CronsManager;
use kernel\Foundation\FileSystem\Path;

class Crons extends Facade
{
  protected static function resolve(): object
  {
    $manager = new CronsManager();
    $app = \getApp();
    if ($app) {
      $manager->discover(Path::root() . "/Crons", $app->id() . "\\Crons");
    }
    return $manager;
  }
}
```

### 多例门面（覆写 `accessor()`）

```php
namespace kernel\Modules\Auth;

use kernel\Foundation\Facade;

class Auth extends Facade
{
  protected static function accessor(): ?AuthModule
  {
    return App::authModule();   // 每次按当前请求返回对应实例
  }
}
```

## 相关

- 定时任务门面：[Crons 门面](../../facades/crons.md)
- 定时任务管理器：[Crons 管理器](./crontab/crons.md)
- 定时任务基类：[Cron](./crontab/cron.md)
