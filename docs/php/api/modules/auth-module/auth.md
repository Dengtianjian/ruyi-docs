# Auth — 认证门面（Facade，多例）

- **文件位置**: `kernel/Modules/Auth/Auth.php`
- **命名空间**: `kernel\Modules\Auth`
- **继承**: `extends Foundation\Facade`

认证模块的多例门面。所有静态调用经 `__callStatic` 转发到 `AuthModule` 实例；底层实例由 `accessor()` 按当前上下文解析：从应用模块管理器按名 `"auth"` 取出已装载的 `AuthModule`，模块未装载或 App 未实例化时返回 `null`（对应静态调用返回 `null`）。

> 登录态（token / user / logged 等）由 `GlobalAuthMiddleware` 在每个请求解析后写入 `AuthModule` 实例，业务层经本门面读取即可，无需手动持有模块。

## 多例解析

```php
// Facade::accessor() 中按当前请求解析底层实例
protected static function accessor(): ?AuthModule
{
  $app = getApp();
  if ($app === null) {
    return null;
  }
  $module = $app->modules()->get("auth");
  return $module instanceof AuthModule ? $module : null;
}
```

## 转发的方法

| 静态方法 | 说明 |
|----------|------|
| `Auth::logged()` | 当前是否已登录 |
| `Auth::userId()` | 当前登录用户 ID |
| `Auth::user()` | 当前登录用户数据 |
| `Auth::createToken($userId, $expireDays = 30)` | 生成并持久化登录 Token |
| `Auth::generateToken($expireDays = 30)` | 仅生成 Token（不落库） |
| `Auth::deleteToken($token)` | 按 token 值吊销 |
| `Auth::deleteTokensByUser($userId)` | 吊销指定用户全部凭证 |
| `Auth::token()` / `Auth::tokenExpiresAt()` | 读取当前 token / 过期时间 |

## 使用

```php
use kernel\Modules\Auth\Auth;

if (Auth::logged()) {
    $userId = Auth::userId();
    $user   = Auth::user();
}

// 登录成功后签发 token
$tokenData = Auth::createToken($userId, 30);
```

> 底层业务逻辑与 `AuthModule` 完全一致；详见 [AuthModule 认证模块](./auth-module)。
