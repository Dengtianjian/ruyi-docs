# UserManagement — 公众号用户管理

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/UserManagement.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends WechatOfficialAccount`

公众号粉丝用户管理（标签/备注/黑名单）。

## 构造

```php
new UserManagement($accessToken = null, $appId = null, $secret = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `getUserInfo($openId, $lang = "zh_CN")` | 获取用户信息 |
| `getUserList($nextOpenId = null)` | 获取用户列表 |
| `createTag($name)` | 创建标签 |
| `batchTagging($tagId, $openIds)` | 批量打标签 |
| `batchUntagging($tagId, $openIds)` | 批量取消标签 |
| `getUserTags($openId)` | 获取用户标签 |
| `setRemark($openId, $remark)` | 设置备注 |

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\UserManagement;

$um = new UserManagement(null, "wx_appid", "wx_secret");
$info = $um->getUserInfo("o_openid");
$list = $um->getUserList();
```
