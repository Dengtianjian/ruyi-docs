# ExtensionListViewController — 扩展列表页

- **文件位置**: `kernel/Controller/Main/Extensions/ExtensionListViewController.php`
- **命名空间**: `kernel\App\Main\Extensions`
- **继承**: `extends Foundation\Controller\AuthController`
- **权限**: `public $Admin = true`（需管理员）

列出当前插件下的扩展，并同步数据库记录（自动补齐未登记扩展）。

## 方法

| 方法 | 说明 |
|------|------|
| `data($request)` | 扫描扩展目录，合并数据库状态，返回扩展列表 |

## 使用

```php
// 路由：GET /extensions
return [
    "extensions"     => $extensions,   // 每个扩展含 id/name/root/enabled/installed/local_version/install_time/...
    "extensionCount" => count($extensions),
];
```

### 逻辑

1. `Extensions::scanDir("source/plugin/" . appId)` 扫描扩展
2. `ExtensionsModel::getByExtensionId()` 取库内记录并合并
3. 未登记扩展自动 `insert` 初始化记录
4. `View::title(DiscuzXLang::value("kernel/extension_list"))`
