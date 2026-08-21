# Menu — 公众号自定义菜单

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/Menu.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends WechatOfficialAccount`

微信公众号自定义菜单管理。

## 构造

```php
new Menu($accessToken = null, $appId = null, $secret = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `setMenu($menuData)` | 创建/更新菜单（`cgi-bin/menu/create`） |
| `getMenu()` | 获取菜单（`cgi-bin/menu/get`） |
| `deleteMenu()` | 删除菜单（`cgi-bin/menu/delete`） |

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\Menu;

$menu = new Menu(null, "wx_appid", "wx_secret");
$menu->setMenu([
    "button" => [
        ["type" => "view", "name" => "首页", "url" => "https://example.com"],
    ],
]);
$current = $menu->getMenu();
```
