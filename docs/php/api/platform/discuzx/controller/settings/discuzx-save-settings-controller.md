# DiscuzXSaveSettingsController — 保存设置项控制器

- **文件位置**: `kernel/Platform/DiscuzX/Controller/Settings/DiscuzXSaveSettingsController.php`
- **命名空间**: `kernel\Platform\DiscuzX\Controller\Settings`
- **继承**: `extends DiscuzXController` → `extends AuthController` → `extends Controller`
- **是否可继承**: 是

Discuz!X 设置项保存控制器，处理 `PATCH settings` 路由。要求管理员权限（`$Admin = true`），将请求体键值对批量写入设置项。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$Admin` | bool | `true` | 需要管理员权限 |
| protected | `$setting` | `DiscuzXSettingModuleBase` | `null` | 设置模块实例 |

## 构造

```php
public function __construct($R, $setting)
```

- `$R`：请求对象（父类构造参数）
- `$setting`（`DiscuzXSettingModuleBase`）：设置模块实例

## 方法

### `data` — 保存设置项

```php
public function data()
```

**逻辑**

1. `$this->request->body->some()` 获取请求体全部键值对。
2. 调用 `$this->setting->saveItems($settings)` 批量保存。
3. 返回保存结果。

## 使用

```php
// 路由 PATCH settings，请求体为 { "appName": "value", ... }
Router::patch("settings", DiscuzXSaveSettingsController::class, [], [$settingBase]);
```
