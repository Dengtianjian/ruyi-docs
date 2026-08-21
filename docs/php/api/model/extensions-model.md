# ExtensionsModel — 扩展模型

- **文件位置**: `kernel/Model/ExtensionsModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `extensions`

扩展安装记录模型，管理扩展的安装状态、版本与启停。

## 字段

`id` / `install_time` / `upgrade_time` / `local_version` / `plugin_id` / `extension_id`（唯一）/ `enabled` / `installed` / `path` / `parent_id` / `created_time` / `name`

## 方法

| 方法 | 说明 |
|------|------|
| `getByExtensionId($extensionId)` | 按扩展 ID 查询所有记录 |

## 使用

```php
use kernel\Model\ExtensionsModel;

$model = new ExtensionsModel();
$rows = $model->getByExtensionId("myExt");
```
