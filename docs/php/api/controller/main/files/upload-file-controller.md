# UploadFileController — 上传文件

- **文件位置**: `kernel/Controller/Main/Files/UploadFileController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

上传文件到当前存储平台。

## 方法

| 方法 | 说明 |
|------|------|
| `data($FileKey = null)` | 取 `$_FILES[0]` 上传，返回文件信息 |

## 使用

```php
// 路由：POST /files/{fileKey}
$fileInfo = $this->platform->uploadFile($Files[0], $FileKey);
return $fileInfo->toArray();
```

返回序列化字段同 `GetFileController`（key/name/extension/size/url/previewURL/downloadURL 等）。未上传文件返回 `400` 错误。
