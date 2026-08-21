# FileBaseController — 文件控制器基类

- **文件位置**: `kernel/Controller/Main/Files/FileBaseController.php`
- **命名空间**: `kernel\Controller\Main\Files`
- **继承**: `extends Foundation\Controller\AuthController`

文件相关控制器的基类，初始化存储平台驱动。

## 构造行为

- 支持 `__storage_platform` 查询参数切换存储平台
- `$this->platform = StorageService::getPlatform()` 注入当前存储驱动

## 属性

| 属性 | 说明 |
|------|------|
| `$platform` | 存储驱动（`LocalStorage` / `AbstractStorage` / `AliyunOSSStorage`） |

## 使用

子类在 `data()` 中通过 `$this->platform` 操作存储：

```php
class MyFileController extends FileBaseController
{
    public function data($fileKey)
    {
        $file = $this->platform->getFile($fileKey);
        if ($this->platform->error) return $this->platform->return();
        return $file->toArray();
    }
}
```
