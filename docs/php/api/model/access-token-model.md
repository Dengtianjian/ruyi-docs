# AccessTokenModel — 第三方 AccessToken 模型

- **文件位置**: `kernel/Model/AccessTokenModel.php`
- **命名空间**: `kernel\Model`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `access_token`

管理第三方平台（如微信公众号）的 AccessToken 缓存。

## 字段

`accessToken` / `id` / `platform`（enum：`wechatOfficialAccount` / `dingtalk`）/ `createdAt` / `expiredAt` / `expires` / `appId`

## 方法

| 方法 | 说明 |
|------|------|
| `add($accessToken, $platform, $expiresIn, $appId = null)` | 新增 token（自动提前 5 分钟过期） |
| `getPlatformLast($platform)` | 平台最近一条 token |
| `getPlatformLatest($platform)` | 平台未过期的 token |
| `deleteExpired($platform = null)` | 删除已过期 token |

## 使用

```php
use kernel\Model\AccessTokenModel;

$model = new AccessTokenModel();
$model->add("token_abc", "wechatOfficialAccount", 7200, "wx_appid");
$token = $model->getPlatformLatest("wechatOfficialAccount");
$model->deleteExpired();
```
