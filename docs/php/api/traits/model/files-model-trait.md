# FilesModelTrait — 文件模型 Trait

- **文件位置**: `kernel/Traits/Model/FilesModelTrait.php`
- **命名空间**: `kernel\Traits\Model`
- **类型**: `trait`（被 `FilesModel` 使用）

文件模型的通用操作 Trait，提供登记、查询、列表、删除等文件记录方法。

## 方法

| 方法 | 说明 |
|------|------|
| `add($Key, $SourceFileName, $Name, $Path, $Size, $Extension, $OwnerId = null, $accessControl = 'private', $Remote = false, $BelongsId = null, $BelongsType = null, $Width = 0, $Height = 0, $Platform = "local")` | 登记文件 |
| `save($Data, $FileKey = null, $Id = null)` | 更新文件记录 |
| `updateBelongs($BelongsId, $BelongsType, $FileKey = null, $Id = null)` | 更新归属 |
| `item($FileKey = null, $BelongsId = null, $BelongsType = null, $OwnerId = null, $Id = null, $Platform = null)` | 单条查询 |
| `listTotal()` | 列表总数 |
| `list($Page = 1, $PerPage = 10, $FileKey = null, $BelongsId = null, $BelongsType = null, $OwnerId = null, $Id = null, $Platform = null)` | 分页列表 |
| `remove($directly = false, $FileKey = null, $BelongsId = null, $BelongsType = null, $OwnerId = null, $Id = null, $Platform = null)` | 删除 |
| `existItem($Key = null, $BelongsId = null, $BelongsType = null, $OwnerId = null, $Id = null, $Platform = null)` | 是否存在 |

## 使用

在模型中使用 `use FilesModelTrait;`：

```php
use kernel\Traits\Model\FilesModelTrait;

class FilesModel extends Model
{
    use FilesModelTrait;
}

$model = new FilesModel();
$model->add("file_key", "a.jpg", "a.jpg", "/uploads/a.jpg", 1024, "jpg", 1);
$list = $model->list(1, 10, null, 1, "user");
echo $model->listTotal();
```
