# LoginsModel — 登录记录模型

- **文件位置**: `kernel/Model/LoginsModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `logins`

登录凭证（Token）记录模型，供 `GlobalAuthMiddleware` 校验与刷新 Token。

## 字段

`id` / `token` / `expiration` / `userId` / `appId` / `createdAt` / `updatedAt` / `deletedAt`（软删除）

## 方法

| 方法 | 说明 |
|------|------|
| `add($token, $expiration, $userId, $appId = null)` | 新增登录记录 |
| `getByToken($token)` | 按 token 查询（未软删除） |
| `deleteByToken($token)` | 按 token 删除（软删除） |

## 使用

```php
use kernel\Model\LoginsModel;

$model = new LoginsModel();
$model->add("token_abc", 3600, 1);
$auth = $model->getByToken("token_abc");
$model->deleteByToken("token_abc");
```
