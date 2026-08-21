# OpenCloseExtensionController — 开关扩展

- **文件位置**: `kernel/Controller/Main/Extensions/OpenCloseExtensionController.php`
- **命名空间**: `kernel\App\Main\Extensions`
- **继承**: `extends Foundation\Controller\AuthController`
- **权限**: `public $Admin = 1`（需管理员）

启用或停用扩展。

## 参数

| 参数 | 说明 |
|------|------|
| `extension_id` | 扩展 ID |
| `enabled` | `1` 启用 / `0` 停用 |

## 方法

| 方法 | 说明 |
|------|------|
| `data($request)` | 校验 `Main.php` 存在→更新 `enabled` |

## 逻辑

- 扩展不存在 → `404`；目录或 `Main.php` 缺失 → `500`
- 已启用再启用 / 已停用再停用 → `400`
- 更新 `enabled` 字段

## 错误码

| 错误码 | 说明 |
|--------|------|
| `404001` | 扩展不存在 |
| `500001` | 扩展文件损坏 |
| `400001` | 扩展已开启/已关闭 |
