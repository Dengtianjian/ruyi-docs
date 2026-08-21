# UpgradeExtensionController — 升级扩展

- **文件位置**: `kernel/Controller/Main/Extensions/UpgradeExtensionController.php`
- **命名空间**: `kernel\App\Main\Extensions`
- **继承**: `extends Foundation\Controller\AuthController`
- **权限**: `public $Admin = 1`（需管理员）

升级扩展：比较本地版本与最新版本，执行升级 SQL 并更新版本号。

## 参数

| 参数 | 说明 |
|------|------|
| `extension_id` | 扩展 ID |

## 方法

| 方法 | 说明 |
|------|------|
| `data($request)` | 校验版本→执行升级→更新记录 |

## 逻辑

1. 扩展不存在 → `404`；版本未过期 → `400`
2. `ExtensionProvisioner->upgrade()->runUpgradeSql()->cleanUpgrade()`
3. 更新 `upgrade_time` / `local_version`

## 错误码

| 错误码 | 说明 |
|--------|------|
| `404001` | 扩展不存在 |
| `400001` | 无需升级 |
