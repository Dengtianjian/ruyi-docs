# 门面与模块（创建）

本章演示如何**创建模块**与**创建门面**，以及二者如何组合使用。

## 创建模块

1. 继承 `kernel\Foundation\Module\Module`；
2. 声明 `protected string $name`（或留空，默认取短类名）；
3. 按需重写 `onBoot()` / `onShutdown()` 钩子；
4. 在应用装配阶段 `load` 到模块管理器。

```php
namespace app\Modules;

use kernel\Foundation\Module\Module;

class StatsModule extends Module
{
    protected string $name = "stats";

    protected function onBoot(): void
    {
        // 启动期：注册服务、绑定钩子、预热缓存等
    }

    protected function onShutdown(): void
    {
        // 停止期：释放资源
    }

    public function track(string $event): void
    {
        // 业务方法
    }
}
```

在 `Setup/Bootstrap` 装配阶段装载：

```php
getApp()->modules()->load(new \app\Modules\StatsModule());
```

之后即可使用：

```php
getApp()->modules()->get("stats")->track("page_view");
```

> 模块管理器的 `load()` 默认会立即 `boot()`；若只需登记暂不启动，传 `load($module, false)`。

## 创建门面

继承 `kernel\Foundation\Facade`，按场景二选一：

- **单例门面**：覆写 `protected static function resolve(): object`，返回默认实例。
- **多例门面**：覆写 `protected static function accessor(): ?object`，每次返回当前上下文实例。

并在类顶部用 `@method static` 注释声明可转发的方法，以便 IDE 提示。

### 单例门面示例

```php
namespace kernel\Modules\Cache;

use kernel\Foundation\Facade;

/**
 * @method static mixed get(string $key) 读取缓存
 * @method static void set(string $key, $value) 写入缓存
 */
class Cache extends Facade
{
    protected static function resolve(): object
    {
        return new CacheModule();
    }
}
```

### 多例门面示例（从模块管理器解析）

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

## 组合：门面 + 模块

最常见的模式是「**模块承载逻辑，门面提供静态入口**」：

- `SettingModule` 实现设置读写逻辑；`Setting` 门面 `resolve()` 返回 `new SettingModule(...)`，对外暴露 `Setting::item()` 等静态调用。
- `AuthModule` 实现认证逻辑并注册到模块管理器；`Auth` 门面 `accessor()` 从管理器取回该实例，对外暴露 `Auth::user()` 等。

创建自己的功能时，推荐先写模块（业务逻辑 + 生命周期），再用一个门面把它包成静态入口（若需要）。

## 相关

- 概念说明：[门面与模块（概念）](./facade-module-concept)
- 门面基类：[Facade 门面基类](./api/foundation/facade)
- 设置模块 API：[SettingModule](./api/modules/setting-module/setting)
