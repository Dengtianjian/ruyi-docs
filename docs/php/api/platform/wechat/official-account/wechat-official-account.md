# WechatOfficialAccount — 微信公众号基类

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/WechatOfficialAccount.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends Wechat`

微信公众号基类，作为公众号各能力类的共同父类，继承 `Wechat` 的请求能力。

## 子类

- `AccountManagement`（参数二维码）
- `Menu`（自定义菜单）
- `ReplyMessage`（被动回复）
- `TemplateMessage`（模板消息）
- `UserManagement`（用户管理）
- `WebApp`（网页授权）

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\Menu;

$menu = new Menu(null, "wx_appid", "wx_secret");
$menu->setMenu($menuData);
```
