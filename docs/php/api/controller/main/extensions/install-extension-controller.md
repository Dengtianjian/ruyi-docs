# InstallExtensionController — 安装扩展

- **文件位置**: `kernel/Controller/Main/Extensions/InstallExtensionController.php`
- **命名空间**: `kernel\App\Main\Extensions`
- **继承**: `extends Foundation\Controller\AuthController`
- **权限**: `public $Admin = true`（需管理员）

安装指定扩展：执行安装 SQL 并更新安装状态。

## 参数

| 参数 | 说明 |
|------|------|
| `extension_id` | 扩展 ID |

## 方法

| 方法 | 说明 |
|------|------|
| `data($request)` | 校验→执行安装→更新记录 |

## 逻辑

1. 扩展不存在 → `404`；已安装 → `400`
2. `ExtensionProvisioner->install()->runInstallSql()->cleanInstall()`
3. 更新 `install_time` / `installed=1` / `local_version`

## 错误码

| 错误码 | 说明 |
|--------|------|
| `404001` | 扩展不存在 |
| `400001` | 扩展已安装 |
