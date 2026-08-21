# DiscuzXExtensionsModel — Discuz!X 扩展模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXExtensionsModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends ExtensionsModel`
- **是否可继承**: 是

Discuz!X 场景下的扩展数据模型，表名固定为 `gstudio_kernel_extensions`，继承 `ExtensionsModel` 的扩展管理能力，用于记录已安装的扩展及状态。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `gstudio_kernel_extensions` | 表名 |

## 构造

```php
function __construct($tableName = null)
```

**逻辑**

1. `$this->query = new DiscuzXQuery($this->tableName)`。
2. `$this->tableName = \DB::table($this->tableName)`。
3. `$this->DB = DiscuzXDB::class`。

## 继承方法

来自 `ExtensionsModel`：扩展的增删改查、启用/禁用等（详见 [ExtensionsModel](../../../model/extensions-model.md)）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXExtensionsModel;

$extensions = new DiscuzXExtensionsModel();
```
