# SettingsModel — 设置模型

- **文件位置**: `kernel/Modules/SettingModule/SettingsModel.php`
- **命名空间**: `kernel\Modules\SettingModule`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `settings`
- **关闭**: `$CreatedAt = null` / `$DeletedAt = null`

设置项模型，值序列化存储。构造时内置建表 SQL（`tableStructureSQL`），主键为 `name`。

## 构造

```php
new SettingsModel($tableName = null);   // 可指定自定义表名
```

## 方法

| 方法 | 说明 |
|------|------|
| `item($name)` | 获取单个设置（自动 unserialize，含布尔假值守卫） |
| `items(...$names)` | 批量获取，返回 `["name" => value]` |
| `existItem($name)` | 是否存在 |
| `add($name, $value = null, $serialization = true)` | 添加 |
| `save($name, $value, $serialization = true)` | 保存（更新 `updatedAt`） |
| `saveItems($settings)` | 批量保存 |

## 使用

```php
use kernel\Modules\SettingModule\SettingsModel;

$model = new SettingsModel();
$model->add("site_name", "我的站点");
$name = $model->item("site_name");
$all = $model->items("site_name", "site_url");
```
