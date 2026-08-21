# UninstallExtensionController — 卸载扩展

- **文件位置**: `kernel/Controller/Main/Extensions/UninstallExtensionController.php`
- **命名空间**: `kernel\App\Main\Extensions`
- **继承**: `extends Foundation\Controller\AuthController`
- **权限**: `public $Admin = 1`（需管理员）

卸载扩展：执行卸载逻辑，删除数据库记录与扩展目录。

## 参数

| 参数 | 说明 |
|------|------|
| `extension_id` | 扩展 ID |

## 方法

| 方法 | 说明 |
|------|------|
| `data($request)` | 执行卸载→删除记录→删除目录 |

## 逻辑

1. 扩展不存在 → 直接返回（幂等）
2. 若存在 `{path}/Provisioner/Uninstall.php`，实例化 `\{pluginId}\Extensions\{id}\Provisioner\Uninstall` 并调 `handle()`
3. 物理删除数据库记录（`delete(true)`）
4. `FileSystem::deleteDirectory(扩展根目录)`
