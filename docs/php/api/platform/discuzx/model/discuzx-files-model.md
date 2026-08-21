# DiscuzXFilesModel — Discuz!X 文件模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXFilesModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends DiscuzXModel` → `extends Model`
- **实现 Trait**: `FilesModelTrait`
- **是否可继承**: 是

Discuz!X 场景的文件数据模型，使用应用 ID 命名数据表（`{App::id()}_files`），并通过 `FilesModelTrait` 提供文件 CRUD 与远程附件支持。适用于 DiscuzX 插件本地/远程附件管理。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| 由 Trait 提供 | `$remote` | bool | `false` | 是否远程附件 |
| 由 Trait 提供 | `$FileHelper` | FileHelper | `null` | 文件助手实例 |
| 由 Trait 提供 | `$previewURL` / `$downloadURL` | string | `null` | 预览/下载地址 |

继承 `DiscuzXModel` 的 `$tableName`、`$primaryKey`、`$tableStructureSQL`、`$dryRun`、`$DB`、`$query`。

## 构造

```php
public function __construct($tableName = null)
```

- `$tableName`（string，可选）：表名；缺省为 `{App::id()}_files`

构造时生成 `{App::id()}_files` 数据表的建表 SQL（`pre_` 前缀，含 `id`/`key`/`platform`/`remote`/`belongsId`/`belongsType`/`ownerId`/`sourceFileName`/`name`/`size`/`path`/`width`/`height`/`extension`/`accessControl`/`createdAt`/`updatedAt` 字段，`key` 唯一索引）。

## 继承方法（来自 DiscuzXModel / FilesModelTrait）

- 来自 `DiscuzXModel`：`createTable()`、`insert()`、`insertId()`、`update()`、`batchUpdate()`、`delete()`、`getAll()`、`getOne()`、`count()`、`genId()`、`exist()`、`increment()`、`decrement()`
- 来自 `FilesModelTrait`：文件保存/读取相关方法（`saveFile` 等）

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXFilesModel;

$files = new DiscuzXFilesModel();
$files->createTable();

$info = $files->saveFile($_FILES['file'], "path/to");
```
