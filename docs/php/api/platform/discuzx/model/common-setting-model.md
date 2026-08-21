# CommonSettingModel — Discuz!X 公共设置模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/CommonSettingModel.php`
- **命名空间**: `kernel\Model\DiscuzX`
- **继承**: `extends DiscuzXModel` → `extends Model`
- **是否可继承**: 是

Discuz!X 公共设置数据模型，表名固定为 `common_setting`，用于读取 Discuz!X 的全局设置数据。注意其命名空间为 `kernel\Model\DiscuzX`（与多数 DiscuzX 类所在 `kernel\Platform\DiscuzX\Model` 不同）。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `common_setting` | 表名 |

## 构造

```php
function __construct($tableName = null, $prefix = null)
```

继承 `DiscuzXModel` 构造，使用默认表名 `common_setting`。

## 继承方法

来自 `DiscuzXModel`：`getAll()`、`getOne()`、`count()`、`insert()`、`update()`、`delete()`、`createTable()` 等（详见 [DiscuzXModel](foundation/database/discuzx-model.md)）。

## 使用

```php
use kernel\Model\DiscuzX\CommonSettingModel;

$settings = new CommonSettingModel();
$row = $settings->where("skey", "site_name")->getOne();
```
