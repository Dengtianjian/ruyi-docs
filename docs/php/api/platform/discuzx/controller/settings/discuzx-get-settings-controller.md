# DiscuzXGetSettingsController — 获取设置项控制器

- **文件位置**: `kernel/Platform/DiscuzX/Controller/Settings/DiscuzXGetSettingsController.php`
- **命名空间**: `kernel\Platform\DiscuzX\Controller\Settings`
- **继承**: `extends DiscuzXController` → `extends AuthController` → `extends Controller`
- **是否可继承**: 是

Discuz!X 设置项查询控制器，处理 `GET settings` 路由。根据 `name` 参数（可多个）经设置模块过滤后返回设置项，支持按用户组/管理组进行访问控制。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$query` | array | `["name" => "string/"]` | 查询参数（`name` 可为数组） |
| protected | `$setting` | `DiscuzXSettingModuleBase` | `null` | 设置模块实例 |

## 构造

```php
public function __construct($R, $setting)
```

- `$R`：请求对象（父类构造参数）
- `$setting`（`DiscuzXSettingModuleBase`）：设置模块实例

保存 `$this->setting` 后调用 `parent::__construct($R)`。

## 方法

### `data` — 查询设置项

```php
public function data()
```

**逻辑**

1. 无 `name` 参数返回 `[]`。
2. 将 `name` 转为数组。
3. 调用 `$this->setting->filterName(...$names)` 过滤（按用户组/管理组权限）。
4. 调用 `$this->setting->items(...)` 返回键值对。

## 使用

```php
// 路由 GET settings?name=appName&name=appId
Router::get("settings", DiscuzXGetSettingsController::class, [], [$settingBase]);
```
