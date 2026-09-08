# SettingModule — 设置模块

- **文件位置**: `kernel/Modules/Setting/SettingModule.php`
- **命名空间**: `kernel\Modules\Setting`
- **继承**: `extends Foundation\Module\Module`
- **是否可继承**: 是

设置项模块基类，封装设置项的增删改查（含读取时的反序列化、序列化写入、`updatedAt` 维护）。构造注入 `SettingsModel` 实例。

## 构造

```php
new SettingModule(SettingsModel $SettingsModel)
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
use kernel\Modules\Setting\SettingModule;
use kernel\Modules\Setting\SettingsModel;

$module = new SettingModule(new SettingsModel());
$module->save("site_name", "我的站点");
$name = $module->item("site_name");
```

> 静态调用见 [Setting 门面](./setting)。
