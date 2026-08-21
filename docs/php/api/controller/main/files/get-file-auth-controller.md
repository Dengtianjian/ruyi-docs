# GetFileAuthController — 获取文件授权

- **文件位置**: `kernel/Controller/Main/Files/GetFileAuthController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends FileBaseController`

获取文件授权信息的示例控制器。**默认不自动注册路由**，请按业务需求覆写并覆盖路由。

## Body 序列化

`$body`：`sourceFileName` / `filePath` / `fileSize`(int) / `width`(int) / `height`(int)

## 方法

| 方法 | 说明 |
|------|------|
| `data()` | 返回文件授权信息占位（fileKey / auth / previewURL / accessControl 等） |

## 说明

框架提供模板，实际业务中覆盖 `data()`：

```php
public function data()
{
    return $this->platform->getFileAuth($fileKey, 1800);
}
```
