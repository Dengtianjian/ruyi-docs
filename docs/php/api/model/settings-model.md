# SettingsModel — 设置模型

- **文件位置**: `kernel/Model/SettingsModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `settings`（可自定义）
- **关闭**: `$CreatedAt = null` / `$DeletedAt = null`

键值对设置模型，值序列化存储，可批量读写。

## 构造

```php
new SettingsModel($tableName = null);   // 可指定自定义表名
```

## 方法

| 方法 | 说明 |
|------|------|
| `item($name)` | 获取单个设置（自动 unserialize） |
| `items(...$names)` | 批量获取设置，返回 `["name" => value]` |

## 使用

```php
use kernel\Model\SettingsModel;

$model = new SettingsModel();
$siteName = $model->item("site_name");
$all = $model->items("site_name", "site_url");
```
