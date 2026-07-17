# AuthController — 认证控制器

AuthController 继承自 Controller，增加了用户认证和权限校验功能。需要登录或管理员权限的控制器应继承此类。

- **命名空间**: `kernel\Foundation\Controller`
- **文件位置**: `kernel/Foundation/Controller/AuthController.php`
- **继承**: `Controller`

## 认证体系

AuthController 采用**双层认证**架构：

| 层级 | 组件 | 职责 |
|------|------|------|
| Middleware 层 | `GlobalAuthMiddleware` | Token 校验 + 平台相关权限校验，是主防线 |
| Controller 层 | `beforeValidate()` | 安全兜底，确保 CronApp 等非 Middleware 场景也执行认证 |

两层均通过 `$Admin` / `$Auth` 属性决定是否启用认证。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$Admin` | `bool\|int\|string\|array` | `false` | 是否校验管理员权限。设为 truthy 值时启用 |
| `$Auth` | `bool\|int\|string\|array` | `false` | 是否校验用户登录状态。设为 truthy 值时启用 |

### 属性值含义

| 值类型 | 示例 | 说明 |
|--------|------|------|
| `true` | `public $Admin = true;` | 启用校验，由 Middleware 执行平台相关校验 |
| `int` / `string` | `public $Admin = 1;` | 启用校验，仅允许对应 adminid / groupid 访问（DiscuzX 特有） |
| `array` | `public $Admin = [1, 2];` | 启用校验，仅允许列表中 adminid / groupid 访问（DiscuzX 特有） |
| `false` | 默认值 | 不启用认证 |

> **注意**：`$Admin` 和 `$Auth` 必须声明为 `public`，因为 Middleware 需要从外部读取这些属性。在 AuthController 子类中请使用 `public` 而非 `protected`。

## 方法列表

### `verifyAdmin(): ReturnResult`

验证管理员权限。由 Middleware 在 Token 校验通过后调用，也在 `beforeValidate()` 中兜底调用。

基类返回 `ReturnResult(null)`（无错误，即默认通过）。子类可覆盖此方法以添加额外的业务权限校验。

```php
// 基类默认实现（无额外校验，直接通过）
function verifyAdmin(): ReturnResult
{
    return new ReturnResult(null);
}

// 子类覆写示例
function verifyAdmin(): ReturnResult
{
    $userId = Store::getApp("userId");
    $user = (new UsersModel())->where("id", $userId)->getOne();
    if ($user && $user['role'] === 'admin') {
        return new ReturnResult(null);
    }
    return new ReturnResult(null, 403, 'ADMIN_REQUIRED', '需要管理员权限');
}
```

### `verifyAuth(): ReturnResult`

验证用户登录状态。与 `verifyAdmin()` 对称，用于非管理员级别的登录校验。

```php
// 子类覆写示例
function verifyAuth(): ReturnResult
{
    $logged = Store::getApp("logged");
    if ($logged) {
        return new ReturnResult(null);
    }
    return new ReturnResult(null, 401, 'LOGIN_REQUIRED', '请登录后重试');
}
```

### `beforeValidate()`（覆盖自 Controller）

认证校验钩子，在 `Controller::before()` 的标准输入校验之前执行。作为 Middleware 认证的兜底，确保 CronApp 等非 Middleware 场景也执行认证。

```php
protected function beforeValidate(): void
{
    if ($this->Admin) {
        $result = $this->verifyAdmin();
        if ($result->error) {
            $this->response = $result;
            return;
        }
    }
    if ($this->Auth) {
        $result = $this->verifyAuth();
        if ($result->error) {
            $this->response = $result;
        }
    }
}
```

> 校验失败时通过设置 `$this->response` 阻断后续逻辑，`before()` 检测到错误后会跳过 handle 方法直接进入 `after()`。

## 使用方式

### 需要登录的控制器

```php
class UpdateUserController extends AuthController
{
    // 设置需要登录校验（Middleware 要求 Bearer Token）
    public $Auth = true;

    public function data()
    {
        $userId = Store::getApp("userId");
        // 只有登录用户才能执行到这里
    }
}
```

### 需要管理员权限的控制器

```php
class SystemInstallController extends AuthController
{
    // 设置需要管理员校验
    public $Admin = true;

    // 可选：覆盖 verifyAdmin 添加自定义权限逻辑
    function verifyAdmin(): ReturnResult
    {
        $userId = Store::getApp("userId");
        $user = (new UsersModel())->where("id", $userId)->getOne();
        if ($user && $user['isAdmin']) {
            return new ReturnResult(null);
        }
        return new ReturnResult(null, 403, 'ADMIN_ONLY', '仅管理员可操作');
    }

    public function data()
    {
        // 只有管理员才能执行到这里
    }
}
```

### 不需要认证的控制器

```php
class ListLinksController extends AuthController
{
    // 不设置 $Auth 或 $Admin，默认不校验
    // 但仍可以从 Store 获取登录信息

    public function data()
    {
        $auth = Store::getApp("auth");
        if (!$auth) {
            // 未登录用户只能看公开内容
        }
    }
}
```

## 认证流程

```
请求进入
  │
  ▼
GlobalAuthMiddleware::handle()
  │
  ├─ $controller->Admin is truthy?
  │   ├─ 是 → verifyToken(严格模式) → verifyAdmin()
  │   │         ├─ 失败 → 返回 401/403 错误
  │   │         └─ 通过 → 进入控制器
  │   │
  ├─ $controller->Auth is truthy?
  │   ├─ 是 → verifyToken(严格模式) → verifyAuth()
  │   │         ├─ 失败 → 返回 401 错误
  │   │         └─ 通过 → 进入控制器
  │   │
  └─ 都不需要认证 → verifyToken(宽松模式，不强制)
      └─ 进入控制器

  ▼  控制器执行阶段（兜底）
Controller::before()
  └─ AuthController::beforeValidate()
       ├─ $Admin  → verifyAdmin() → 失败则阻断
       └─ $Auth   → verifyAuth()  → 失败则阻断
  │
  ▼
data() / 自定义 handle 方法
  │
  ▼
after() → transform() → serialization()
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 父类 | 基础控制器功能（beforeValidate 生命周期集成） |
| [Middleware](./middleware.md) | 配合 | 中间件读取认证属性，执行 Token 和权限校验 |
| [ReturnResult](./return-result.md) | 返回值 | verifyAdmin / verifyAuth 返回 ReturnResult |
| [Store](./store.md) | 数据存储 | 登录信息存储在 Store 中 |
