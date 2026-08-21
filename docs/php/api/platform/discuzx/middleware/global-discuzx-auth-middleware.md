# GlobalDiscuzXAuthMiddleware — Discuz!X 全局认证中间件

- **文件位置**: `kernel/Platform/DiscuzX/Middleware/GlobalDiscuzXAuthMiddleware.php`
- **命名空间**: `kernel\Platform\DiscuzX\Middleware`
- **继承**: `extends GlobalAuthMiddleware` → `extends MiddlewareBase`
- **是否可继承**: 是

Discuz!X 场景下的全局认证中间件。扩展 `GlobalAuthMiddleware`，将登录模型替换为 `DiscuzXLoginsModel`，并针对 Discuz!X 会员系统（`getglobal("member")`）提供管理员/用户组权限验证，以及登录态注入。

## 构造

```php
public function __construct(Request $request, $controller)
```

- `$request`（Request）：请求对象
- `$controller`：当前控制器

设置 `$this->LoginsModel = DiscuzXLoginsModel::class`。

## 方法

### `verifyViewControllerAdmin` — 验证管理员权限

```php
public function verifyViewControllerAdmin()
```

读取 `getglobal("member")`：

- 控制器 `$Admin` 为 `true`：未登录（`uid===0`）→ 401 `DiscuzXAdminAuth:401001`；`adminid===0` → 401 `DiscuzXAdminAuth:401002`。
- 控制器 `$Admin` 为数组：`adminid` 不在数组内 → 403 `DiscuzXAdminAuth:403001`。
- 控制器 `$Admin` 为数字/字符串：`adminid` 不等 → 403 `DiscuzXAdminAuth:403002`。
- `adminid===1`（创始人）直接通过。

返回 `Result`。

### `verifyViewControllerAuth` — 验证用户组权限

```php
public function verifyViewControllerAuth()
```

读取 `getglobal("member")`：

- 控制器 `$Auth` 为 `true`：未登录 → 401 `DiscuzXAuth:401001`。
- `$Auth` 为数组：`groupid` 不在数组内 → 403 `DiscuzXAuth:403001`。
- `$Auth` 为数字/字符串：`groupid` 不等 → 403 `DiscuzXAuth:403002`。

返回 `Result`。

### `verify` — 按类型验证

```php
public function verify($viewVerifyType)
```

- `$viewVerifyType`（string）：`admin` 走 `verifyViewControllerAdmin`，否则走 `verifyViewControllerAuth`。

### `login` — 注入登录态（private）

```php
private function login()
```

**逻辑**

1. 从 `$GLOBALS['_STORE']['__App.auth']` 读取已认证的 `userId`。
2. 有则 `DiscuzXMember::get($userId)` 获取会员并 `setloginstatus()` 设置 Discuz!X 登录态；无则 `DiscuzXMember::get(0)`。
3. 定义常量 `DISCUZX_MEMBER_ID`（会员 ID）与 `DISCUZX_MEMBER_LOGGED`（登录状态 `true`）。
4. 将 `member` 写入 `$GLOBALS['_STORE']['__App']`。

### `handle` — 中间件处理

```php
public function handle(\Closure $next)
```

**逻辑**

1. 控制器非 `DiscuzXController` 实例：`verifyToken(false)` 校验令牌，成功后 `login()`，返回 `$next()`。
2. 控制器为 `DiscuzXController` 实例：
   - 非同源请求：`verifyToken(false)` 校验令牌。
   - AJAX 且非同源：`login()`；否则用 `getglobal("uid")` 获取会员写入 `member`。
   - 控制器 `$Admin` 存在 → `verify("admin")` + `$controller->verifyAdmin()`。
   - 否则控制器 `$Auth` 存在 → `verify("auth")` + `$controller->verifyAuth()`。
   - 两者都未启用 → `verifyToken(false)`。
   - 校验失败返回错误 `Result`。
3. 通过后返回 `$next()`。

## 使用

```php
// 作为全局中间件注册
$app->set([
  "middleware" => (new Middleware)->set(GlobalDiscuzXAuthMiddleware::class)
]);
```
