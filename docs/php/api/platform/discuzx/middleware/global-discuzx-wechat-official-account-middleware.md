# GlobalDiscuzXWechatOfficialAccountMiddleware — Discuz!X 微信公众号中间件

- **文件位置**: `kernel/Platform/DiscuzX/Middleware/GlobalDiscuzXWechatOfficialAccountMiddleware.php`
- **命名空间**: `kernel\Platform\DiscuzX\Middleware`
- **继承**: `extends GlobalWechatOfficialAccountMiddleware` → `extends MiddlewareBase`
- **是否可继承**: 是

Discuz!X 场景下的微信公众号全局中间件。继承通用 `GlobalWechatOfficialAccountMiddleware`，仅将 AccessToken 存储模型替换为 `DiscuzXAccessTokenModel`，其余行为与通用公众号中间件一致（详见 [GlobalWechatOfficialAccountMiddleware](../../../middleware/global-wechat-official-account-middleware.md)）。

## 构造

```php
public function __construct($request, $controller)
```

- `$request`：请求对象
- `$controller`：控制器

设置 `$this->accessTokenModel = DiscuzXAccessTokenModel::class`。

## 使用

```php
$app->set([
  "middleware" => (new Middleware)->set(GlobalDiscuzXWechatOfficialAccountMiddleware::class)
]);
```
