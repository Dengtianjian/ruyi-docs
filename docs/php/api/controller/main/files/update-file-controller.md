# UpdateFileController — 更新文件

- **文件位置**: `kernel/Controller/Main/Files/UpdateFileController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

更新文件记录的归属与访问控制。

## Body 序列化

`$body`：`belongsId`(string) / `belongsType`(string) / `accessControl`(string)

## 方法

| 方法 | 说明 |
|------|------|
| `data($FileKey)` | 校验写授权后更新文件记录 |

## 使用

```php
// 路由：PUT /files/{fileKey}
if (!$this->platform->verifyOperationAuthorization($fileKey, "write")) {
    return $this->platform->return();
}
return $this->platform->getFilesModel()->save($this->body->some(), $fileKey);
```
