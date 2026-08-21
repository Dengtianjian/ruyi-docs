# CommonUserGroupModel — Discuz!X 用户组模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/CommonUserGroupModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends DiscuzXModel` → `extends Model`
- **是否可继承**: 是

Discuz!X 用户组数据模型，表名固定为 `common_usergroup`，用于查询 Discuz!X 的用户组信息。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `common_usergroup` | 表名 |

## 继承方法

来自 `DiscuzXModel`：`getAll()`、`getOne()`、`count()`、`insert()`、`update()`、`delete()` 等（详见 [DiscuzXModel](foundation/database/discuzx-model.md)）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\CommonUserGroupModel;

$userGroups = new CommonUserGroupModel();
$group = $userGroups->where("groupid", 1)->getOne();
```
