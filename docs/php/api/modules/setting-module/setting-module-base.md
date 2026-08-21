# SettingModuleBase — 设置模块基类

- **文件位置**: `kernel/Modules/SettingModule/SettingModuleBase.php`
- **命名空间**: `kernel\Modules\SettingModule`
- **是否可继承**: 是

设置项模块基类，封装设置项的增删改查。构造注入 `SettingsModel` 实例。

## 构造

```php
new SettingModuleBase(SettingsModel $SettingsModel)
```

## 方法

| 方法 | 说明 |
|------|------|
| `items(...$names)` | 获取多个设置项（返回 `["name" => value]`） |
| `item($name)` | 获取单个设置项值 |
| `exist($name)` | 设置项是否存在 |
| `add($name, $value = null, $serialization = true)` | 添加设置项 |
| `save($name, $value, $serialization = true)` | 保存单个设置项 |
| `saveItems($settings)` | 批量保存设置项（`["name" => value]`） |

## 使用

```php
use kernel\Modules\SettingModule\SettingModuleBase;
use kernel\Modules\SettingModule\SettingsModel;

$module = new SettingModuleBase(new SettingsModel());
$module->save("site_name", "我的站点");
$name = $module->item("site_name");
```
