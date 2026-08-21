# GetFileController — 获取文件信息

- **文件位置**: `kernel/Controller/Main/Files/GetFileController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

获取文件详情与各访问 URL。

## 方法

| 方法 | 说明 |
|------|------|
| `data($FileKey)` | 返回文件信息（key/name/extension/size/width/height/url/previewURL/downloadURL 等） |

## 序列化字段

`$serializes`：`key` / `name` / `extension` / `size`(int) / `width` / `height` / `url` / `previewURL` / `downloadURL` / `transferPreviewURL` / `transferDownloadURL`

## 使用

```php
// 路由：GET /files/{fileKey}
$info = $this->platform->getFile($fileKey);
return $info->toArray();
```
