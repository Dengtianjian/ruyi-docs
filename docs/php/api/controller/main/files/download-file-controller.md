# DownloadFileController — 下载文件

- **文件位置**: `kernel/Controller/Main/Files/DownloadFileController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

下载文件：远程文件重定向到签名 URL，本地文件走下载响应。

## 方法

| 方法 | 说明 |
|------|------|
| `data($FileKey)` | 返回下载响应或 302 重定向 |

## 逻辑

- 远程文件（`$File->remote`）：获取下载 URL 后 `302` 重定向
- 本地文件：`Path::join(Path::storage(), $File->filePath)` 后返回 `$this->response->download()`
- 文件不存在返回 `404`

## 使用

```php
// 路由：GET /files/{fileKey}/download
$file = $this->platform->getFile($fileKey);
return $this->response->download(Path::storage() . "/" . $file->filePath);
```
