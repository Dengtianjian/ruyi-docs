# DiscuzXAttachmentKeysModel — Discuz!X 附件密钥模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXAttachmentKeysModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends AttachmentKeysModel`
- **是否可继承**: 是

Discuz!X 场景下的附件密钥数据模型，使用应用 ID 命名数据表（`{App::id()}_attachment_keys`），继承 `AttachmentKeysModel` 的密钥管理能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| static | `$UpdatedAt` | bool | `false` | 关闭更新时自动填充 |
| static | `$DeletedAt` | bool | `false` | 关闭软删除时间自动填充 |

## 构造

```php
function __construct()
```

**逻辑**

1. 表名 `{App::id()}_attachment_keys`。
2. `$this->query = new DiscuzXQuery($tableName)`。
3. `$this->tableName = \DB::table($tableName)`。
4. `$this->DB = DiscuzXDB::class`。

## 继承方法

来自 `AttachmentKeysModel`：密钥的创建、校验、删除等（详见 [AttachmentKeysModel](../../../model/attachment-keys-model.md)）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXAttachmentKeysModel;

$keys = new DiscuzXAttachmentKeysModel();
```
