# DeleteFileController — 删除文件

- **文件位置**: `kernel/Controller/Main/Files/DeleteFileController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

删除存储平台上的文件。

## 方法

| 方法 | 说明 |
|------|------|
| `data($FileKey)` | 删除文件，返回删除结果 |

## 使用

```php
// 路由：DELETE /files/{fileKey}
$result = $this->platform->deleteFile($FileKey);
if ($this->platform->error) return $this->platform->return();
return $result;
```
