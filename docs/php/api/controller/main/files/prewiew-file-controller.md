# PrewiewFileController — 预览文件

- **文件位置**: `kernel/Controller/Main/Files/PrewiewFileController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

预览文件：远程走平台预览 URL 重定向，本地走文件响应（缓存 12 小时）。

## 方法

| 方法 | 说明 |
|------|------|
| `data($fileKey = null)` | 返回文件预览响应或 302 重定向 |

## 逻辑

- 远程文件：校验平台已实例化后获取预览 URL 重定向
- 本地文件：`$this->response->file($FilePath, $fileName, null, "max-age=43200")`
- 文件不存在返回 `404`

## 使用

```php
// 路由：GET /files/{fileKey}/preview
return $this->response->file($filePath, $fileName, null, "max-age=43200");
```
