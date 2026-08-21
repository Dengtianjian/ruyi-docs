# AttachmentsModel — 附件模型

- **文件位置**: `kernel/Model/AttachmentsModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `attachments`
- **关闭**: `$DeletedAt = false`

附件模型，记录本地/远程附件的完整元数据。

## 字段

`id` / `attachId` / `remote` / `belongsId` / `belongsType` / `userId` / `sourceFileName` / `fileName` / `fileSize` / `filePath` / `width` / `height` / `key` / `extension` / `createdAt` / `updatedAt`

## 方法

| 方法 | 说明 |
|------|------|
| `add($attachId, $userId, $sourceFileName, $fileName, $fileSize, $filePath, $width, $height, $extension, $belongsId = null, $belongsType = null, $remote = false, $withKey = false)` | 新增附件 |
| `item($id, $attachId, $belongsId, $belongsType, $userId, $extension)` | 单条查询 |
| `list(...)` | 列表查询 |
| `deleteItem(...)` | 物理删除单条 |

## 使用

```php
use kernel\Model\AttachmentsModel;

$model = new AttachmentsModel();
$model->add("att_1", 1, "a.jpg", "a_1.jpg", 1024, "/uploads/a.jpg", 100, 100, "jpg");
```
