# AttachmentKeysModel — 附件密钥模型

- **文件位置**: `kernel/Model/AttachmentKeysModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `attachment_keys`
- **关闭**: `$UpdatedAt = false` / `$DeletedAt = false`

附件访问密钥模型，管理受控附件的下载/预览授权与过期。

## 方法

| 方法 | 说明 |
|------|------|
| `add($attachId, $key, $userId = null, $download = true, $preview = true, $expirationTime = null)` | 新增访问密钥 |
| `list($id, $attachId, $userId)` | 列表查询（whereFilter） |
| `item($id, $key, $attachId, $userId)` | 单条查询 |
| `deleteExpired()` | 删除已过期密钥 |

## 使用

```php
use kernel\Model\AttachmentKeysModel;

$model = new AttachmentKeysModel();
$model->add(100, "secret-key", 1, true, true, time() + 3600);
$model->deleteExpired();
```
