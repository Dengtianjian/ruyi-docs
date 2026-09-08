# SettingService — 设置服务

- **文件位置**: `kernel/Modules/Setting/SettingService.php`
- **命名空间**: `kernel\Modules\Setting`
- **继承**: `extends Foundation\Service`
- **类型**: 全静态

设置项服务的静态门面，通过 `bootstrap()` 注入 `SettingModule` 后静态调用。

## 方法

| 方法 | 说明 |
|------|------|
| `bootstrap(?SettingModule $SMB = null)` | 注入设置模块实例 |
| `items(...$names)` | 获取多个设置项 |
| `item($name)` | 获取单个设置项 |
| `exist($name)` | 是否存在 |
| `add($name, $value = null, $serialization = true)` | 添加 |
| `save($name, $value, $serialization = true)` | 保存 |
| `saveItems($settings)` | 批量保存 |

## 使用

```php
use kernel\Modules\Setting\SettingService;
use kernel\Modules\Setting\SettingModule;
use kernel\Modules\Setting\SettingsModel;

SettingService::bootstrap(new SettingModule(new SettingsModel()));
SettingService::save("site_name", "我的站点");
$name = SettingService::item("site_name");
```
