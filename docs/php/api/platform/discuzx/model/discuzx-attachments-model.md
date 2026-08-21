# DiscuzXAttachmentsModel — Discuz!X 附件模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXAttachmentsModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends AttachmentsModel`
- **是否可继承**: 是

Discuz!X 场景下的附件数据模型，使用应用 ID 命名数据表（`{App::id()}_attachments`），并扩展了按 `attachId`/`belongsId` 等条件的查询、批量归属、批量更新所属关系等能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$appId` | string | `null` | 应用 ID（构造时设置） |

## 构造

```php
function __construct()
```

**逻辑**

1. `parent::__construct()`。
2. `$this->appId = App::id()`，表名 `{$this->appId}_attachments`。
3. 生成建表 SQL（`id`/`attachId`/`remote`/`belongsId`/`belongsType`/`userId`/`sourceFileName`/`fileName`/`fileSize`/`filePath`/`width`/`height`/`extension`/`createdAt`/`updatedAt` 字段，`userId` 索引）。
4. `$this->query = new DiscuzXQuery($tableName)`、`$this->tableName = \DB::table($tableName)`、`$this->DB = DiscuzXDB::class`。

## 方法

### `list` — 条件查询列表

```php
public function list($id = null, $attachId = null, $remote = null, $belongsId = null, $belongsType = null, $userId = null, $extension = null)
```

按给定条件过滤后 `getAll()` 返回附件列表。各参数非 `null` 时才作为查询条件。

### `listBelongsSameIdType` — 查询相同归属的附件

```php
public function listBelongsSameIdType($belongsId = null, $belongsType = null)
```

按 `belongsId` + `belongsType` 过滤，返回同一归属的所有附件。

### `item` — 查询单条附件

```php
public function item($id = null, $attachId = null, $remote = null, $belongsId = null, $belongsType = null, $userId = null, $extension = null)
```

同 `list()` 条件过滤，`limit(1)->getOne()` 返回单条。

### `batchAddBelongingSameIdType` — 批量添加归属

```php
public function batchAddBelongingSameIdType($list, $belongsId, $belongsType)
```

- `$list`（array）：附件项数组
- `$belongsId` / `$belongsType`：归属 ID / 归属类型

为每个附件项生成 `attachId`（`md5(filePath.fileName:belongsId.belongsType:userId:uniqid)`），批量插入，返回插入数。

### `bactchUpdateBelongsIdType` — 批量更新归属（注意拼写）

```php
function bactchUpdateBelongsIdType($attachIds, $belongsId, $belongsType, $withKey = false)
```

- `$attachIds`（array）：附件 ID 数组
- `$belongsId` / `$belongsType`：新的归属
- `$withKey`（bool）：是否需要密钥才可访问

批量更新 `belongsId`/`belongsType`/`key`。方法名拼写为 `bactch`（源码如此）。

### `updateBelongsIdType` — 更新单条归属

```php
function updateBelongsIdType($attachId, $belongsId, $belongsType, $withKey = false)
```

按单个 `attachId` 更新归属与 `key`。

### `deleteBelongsSameIdType` — 删除相同归属附件

```php
function deleteBelongsSameIdType($belongsId, $belongsType)
```

按 `belongsId` + `belongsType` 物理删除（`delete(true)`）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXAttachmentsModel;

$attachments = new DiscuzXAttachmentsModel();

$list = $attachments->list(null, null, null, 1001, "thread");
$attachments->updateBelongsIdType("abc123", 1002, "post", true);
$attachments->deleteBelongsSameIdType(1001, "thread");
```
