# FilesModel — 文件模型

- **文件位置**: `kernel/Model/FilesModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **使用**: `FilesModelTrait`
- **表名**: `files`

文件登记模型，配合 `StorageService` 记录文件元数据。

## 字段

`id` / `key`（唯一）/ `remote` / `platform` / `belongsId` / `belongsType` / `ownerId` / `sourceFileName` / `name` / `size` / `path` / `width` / `height` / `extension` / `accessControl` / `createdAt` / `updatedAt`

## 使用

```php
use kernel\Model\FilesModel;

$model = new FilesModel();
$model->where("belongsType", "user")->delete(true);
```
