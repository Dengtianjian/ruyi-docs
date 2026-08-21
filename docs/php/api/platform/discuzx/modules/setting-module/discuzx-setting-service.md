# DiscuzXSettingService — Discuz!X 设置服务

- **文件位置**: `kernel/Platform/DiscuzX/Modules/SettingModule/DiscuzXSettingService.php`
- **命名空间**: `kernel\Platform\DiscuzX\Modules\SettingModule`
- **继承**: `extends SettingService`
- **是否可继承**: 是（静态服务类）

Discuz!X 通用设置存储服务，装配 `DiscuzXSettingModuleBase`，注册获取/保存设置项的路由（`GET settings`、`PATCH settings`），并在应用启动时创建设置表。

## 方法

### `bootstrap` — 装配设置服务（static）

```php
static function bootstrap($settingBase = NULL, $RegisterRouter = TRUE)
```

- `$settingBase`（`DiscuzXSettingModuleBase`，可选）：设置模块实例；缺省创建 `new DiscuzXSettingModuleBase(new DiscuzXSettingsModel())`
- `$RegisterRouter`（bool）：是否注册路由，默认 `true`

**逻辑**

1. 设置模块缺省时自动创建（`new DiscuzXSettingsModel()`）。
2. 注册路由：
   - `GET settings` → `DiscuzXGetSettingsController`（注入 `$settingBase`）
   - `PATCH settings` → `DiscuzXSaveSettingsController`（注入 `$settingBase`）
3. 调用 `parent::bootstrap($settingBase)`。

### `bootUp` — 启动创建表（static）

```php
static function bootUp()
```

返回 `(new DiscuzXSettingsModel())->createTable()` 建表结果。

## 使用

在应用 Bootstrap / 生命周期钩子中调用：

```php
use kernel\Platform\DiscuzX\Modules\SettingModule\DiscuzXSettingService;

DiscuzXSettingService::bootstrap(); // 装配设置模块并注册路由

// 启动时建表
DiscuzXSettingService::bootUp();
```
