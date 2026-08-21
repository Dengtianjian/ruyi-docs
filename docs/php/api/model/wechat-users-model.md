# WechatUsersModel — 微信用户模型

- **文件位置**: `kernel/Model/WechatUsersModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `wechat_users`

微信用户绑定模型，管理 openId / unionId / phone 与会员的关联。

## 字段

`id` / `memberId` / `openId` / `unionId` / `phone` / `createdAt` / `updatedAt` / `deletedAt`（软删除）

## 方法

| 方法 | 说明 |
|------|------|
| `bound($memberId, $openId)` | 是否已绑定 |
| `bind($memberId, $openId, $unionId = null, $phone = null)` | 绑定会员 |
| `register($openId, $unionId = null, $phone = null)` | 注册微信用户 |
| `removeByMemberId($memberId, $directly = false)` | 按会员解绑 |
| `removeByOpenId($openId)` / `removeByUnionId` / `removeByPhone` | 按标识解绑 |
| `updatePhone($memberId, $phone)` | 更新手机号 |

## 使用

```php
use kernel\Model\WechatUsersModel;

$model = new WechatUsersModel();
$model->bind(1, "o_xxx", "u_yyy", "13800000000");
$bound = $model->bound(1, "o_xxx");
```
