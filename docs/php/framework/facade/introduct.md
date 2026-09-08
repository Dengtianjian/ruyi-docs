# Facade 门面（框架介绍）

门面（Facade）为框架中的底层实例提供**静态入口**：用 `Xxx::method()` 调用，框架会把调用透明转发到背后的实例，业务代码无需手动 `new` 或持有引用。门面常用于把「共享能力」（如设置、认证、定时任务）封装成简洁的静态 API。

## 门面基类机制

所有门面继承 `kernel\Foundation\Facade`，核心逻辑如下：

- **静态转发**：`__callStatic($method, $args)` 取出底层实例后执行 `$instance->$method(...$args)`。
- **实例为 null 时返回 null**：若底层实例无法解析（如 `Auth` 在 App 未启动时），对应静态调用返回 `null`，由子类决定是否在 `accessor()` 内抛出更明确的异常。
- **单例 / 多例自动判定**（无需子类手写标识）：
  - 子类**覆写 `resolve()`** → 判定为**单例**；`accessor()` 首次调用 `resolve()` 创建并缓存到 `$registry`（按门面类名隔离），后续复用同一实例。
  - 子类**覆写 `accessor()`** → 判定为**多例**；每次转发都调用 `accessor()` 返回当前上下文实例。

> `singleton()` 通过反射判断 `resolve()` 是否由子类声明：若声明类不是 `Facade` 自身即为单例。多数情况下只需覆写 `resolve()` 或 `accessor()` 之一，无需关心 `singleton()`。

```php
abstract class Facade
{
  protected static array $registry = [];   // 单例实例缓存，key 为 static::class

  protected static function accessor(): ?object;  // 单例：缓存 resolve() 结果
  protected static function resolve(): object;     // 单例工厂（需子类覆写）
  public static function __callStatic($method, $args);  // 转发
}
```

## 两种门面模式

### 单例门面（覆写 resolve()）

适合「全应用共享一个实例」的能力（如 `Setting`、`Crons`）。

```php
namespace kernel\Modules\Setting;

use kernel\Foundation\Facade;

/**
 * @method static mixed item(string $name) 读取设置项
 * @method static void save(string $name, $value) 保存设置项
 */
class Setting extends Facade
{
  protected static function resolve(): object
  {
    return new SettingModule(new SettingsModel());
  }
}
```

### 多例门面（覆写 accessor()）

适合「实例随上下文变化」的能力（如 `Auth`，每个请求解析出不同的模块实例）。

```php
namespace kernel\Modules\Auth;

use kernel\Foundation\Facade;

class Auth extends Facade
{
  protected static function accessor(): ?AuthModule
  {
    $app = getApp();
    if ($app === null) {
      return null;
    }
    $module = $app->modules()->get("auth");
    return $module instanceof AuthModule ? $module : null;
  }
}
```

## @method static 注释

类顶部的 `@method static ...` 仅用于 **IDE 自动补全与静态分析**，框架运行时不依赖它。建议为对外暴露的每个方法补一行声明：

```php
/**
 * @method static bool logged() 是否已登录
 * @method static mixed user() 当前登录用户
 */
```

## 创建门面

完整步骤与「门面 + 模块」组合模式见 [门面与模块（创建）](/php/framework/facade-module-create)。

## 现有门面

| 门面 | 类型 | 底层实例 | 文档 |
|------|------|----------|------|
| `Setting` | 单例 | `SettingModule` | [SettingModule](/php/api/modules/setting-module/setting) |
| `Auth` | 多例 | `AuthModule` | [Auth 门面](/php/api/modules/auth-module/auth) |
| `Crons` | 单例 | `Crontab\Crons` | [Crons 门面](/php/api/facades/crons) · [实战](/php/framework/facade/items/crons) |

## 相关

- 概念：[门面与模块（概念）](/php/framework/facade-module-concept)
- 创建：[门面与模块（创建）](/php/framework/facade-module-create)
- 基类 API：[Facade 门面基类](/php/api/foundation/facade)
