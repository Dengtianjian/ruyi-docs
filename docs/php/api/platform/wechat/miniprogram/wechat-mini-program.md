# WechatMiniProgram — 微信小程序基类

- **文件位置**: `kernel/Platform/Wechat/Miniprogram/WechatMiniProgram.php`
- **命名空间**: `kernel\Platform\Wechat\Miniprogram`
- **继承**: `extends Wechat`
- **是否可继承**: 是（作为小程序能力类的共同父类）

微信小程序基类，本身为空实现，仅继承 `Wechat` 的 CURL 请求、AccessToken 管理及 GET/POST 发送能力。作为 `SecretCheck`、`User` 等小程序能力类的共同父类。

## 子类

- `SecretCheck`（内容安全检测）
- `User`（登录 / 绑定 / 注册）

## 属性

不定义自有属性，全部继承自 `Wechat`：`$AppId`、`$AppSecret`、`$AccessToken`、`$ApiUrl`、`$CURL`。

## 方法

不定义自有方法，继承 `Wechat` 的方法：`setAccessToken()`、`get()`、`post()`、`getJSONData()`。

## 使用

```php
use kernel\Platform\Wechat\Miniprogram\SecretCheck;

$secretCheck = new SecretCheck(null, "wx_appid", "wx_secret");
$result = $secretCheck->msgSecCheck("测试内容", "o_openid");
```
