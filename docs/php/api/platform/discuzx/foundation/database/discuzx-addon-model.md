# DiscuzXAddonModel — Discuz!X 应用数据模型基类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Database/DiscuzXAddonModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Database`
- **继承**: `extends DiscuzXModel` → `extends Model`
- **是否可继承**: 是（应用内数据模型基类）

Discuz!X 应用（插件）数据模型的便捷基类。继承 `DiscuzXModel`，构造时**默认表前缀固定为 `gstudio`**（Discuz!X 插件数据表规范前缀），用于应用私有数据表。

## 构造

```php
function __construct($tableName = null, $prefix = null)
```

- `$tableName`（string，可选）：表名；缺省使用子类 `$this->tableName` 属性
- `$prefix`（string，可选）：表前缀；不传或为空则固定为 `gstudio`

最终表名为 `{prefix}_{tableName}`（前缀存在时），如 `gstudio_settings`。

## 继承方法

继承自 `DiscuzXModel` 的全部方法，包括 `insert()`、`insertId()`、`update()`、`delete()`、`getAll()`、`getOne()`、`count()`、`exist()`、`genId()`、`increment()`、`decrement()`、`createTable()` 等（详见 [DiscuzXModel](discuzx-model.md)）。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Database\DiscuzXAddonModel;

class SettingsModel extends DiscuzXAddonModel
{
  protected $tableName = "settings";
  protected $primaryKey = "key";
}

$model = new SettingsModel(); // 表名 gstudio_settings
$row = $model->where("key", "site_name")->getOne();
```
