# 门面与模块（概念）

门面（Facade）与模块（Module）是框架封装与暴露业务能力的两种核心机制，二者经常配合使用：**门面是模块的静态快捷入口，模块是门面背后的真实实例**。

## 门面（Facade）

门面为底层实例提供**静态入口**：直接用 `Xxx::method()` 调用，框架会把调用透明转发到背后的实例，无需手动 `new` 或持有引用。

- **自动判定单例 / 多例**（子类无需手写标识）：
  - 覆写 `resolve()` → **单例门面**：首次访问创建实例并缓存，全应用共享同一实例（如 `Setting`、`Crons`）。
  - 覆写 `accessor()` → **多例门面**：每次转发都按当前上下文返回实例（如 `Auth`，按当前请求解析模块实例）。
- 若底层实例无法解析（如 `Auth` 在 App 未实例化时），静态调用返回 `null`。
- 类顶部的 `@method static ...` 注释声明可转发的方法，用于 IDE 自动补全。

**适用场景**：希望用 `Xxx::method()` 的简洁静态语法访问某个共享能力，而不关心实例从何而来。

**现有门面**：

| 门面 | 类型 | 底层实例 | 用途 |
|------|------|----------|------|
| `Setting` | 单例 | `SettingModule` | 站点设置读写 |
| `Auth` | 多例 | `AuthModule` | 认证态读取 |
| `Crons` | 单例 | `Crontab\Crons` | 定时任务 |
| `Route` / `DB` | 静态风格类（非继承 `Facade`） | — | 路由 / 数据库，按各自文档静态调用 |

## 模块（Module）

模块是框架级的**功能单元**，拥有唯一名称与生命周期，适合封装跨请求复用的业务能力（如认证、设置等）。

- **生命周期**：构造时可指定名称（默认取短类名）；`boot()` / `shutdown()` 均仅执行一次，分别触发 `onBoot()` / `onShutdown()` 钩子。
- **模块管理器**：由 `App` 持有（`kernel\Foundation\Module\Modules`），负责装载与检索：

```php
$modules = getApp()->modules();

$modules->load(new \kernel\Modules\Auth\AuthModule()); // register + 默认立即 boot
$auth = $modules->get("auth");    // AuthModule | null
$modules->has("auth");
$modules->all();                  // ["auth" => AuthModule, ...]
$modules->boot("auth");
$modules->shutdown("auth");
$modules->bootAll();
```

`get($name)` 不存在时返回 `null`，不抛异常。

**适用场景**：需要带启动 / 停止钩子、跨请求复用、或由应用统一装配 / 启停的业务能力。

**现有模块**：

| 模块 | 名称 | 用途 |
|------|------|------|
| `SettingModule` | `SettingModule` | 站点设置读写（经 `Setting` 门面访问） |
| `AuthModule` | `auth` | 登录 Token 生成 / 落库 / 清理（经 `Auth` 门面访问） |
| `DiscuzXSettingModuleBase` | — | 继承 `SettingModule` 的平台专属扩展 |

## 二者关系

```
业务代码 ── Setting::item("x") ──► Facade.__callStatic ──► SettingModule 实例
业务代码 ── Auth::user()        ──► Facade.__callStatic ──► AuthModule 实例（来自模块管理器）
```

并非所有模块都有门面；直接通过 `getApp()->modules()->get($name)` 也能拿到模块实例并调用其方法。门面只是为「常用、共享」的模块提供的一层静态语法糖。

## 相关

- 如何创建：[门面与模块（创建）](./facade-module-create)
- 门面基类：[Facade 门面基类](./api/foundation/facade)
- 设置模块 API：[SettingModule](./api/modules/setting-module/setting)
