# AuthController — 鉴权控制器基类

- **文件位置**: `kernel/Foundation/Controller/AuthController.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `Controller`
- **是否可继承**: 是

带认证能力的控制器基类，继承 `Controller`。`$Admin` / `$Auth` 属性启用认证，由中间件执行 Token 校验及 `verifyAdmin`/`verifyAuth` 分发。子类可覆盖 `verifyAdmin()`/`verifyAuth()` 添加额外校验。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$Admin` | `bool\|int\|string\|array` | `false` | public | 管理员认证状态：由中间件校验 Token 后的最终结果，`true` 表示已通过管理员认证；非 `false` 时控制器视作仅管理员可访问 |
| `$Auth` | `bool\|int\|string\|array` | `false` | public | 普通用户认证状态：中间件 Token 校验结果，`true` 表示已通过认证；非 `false` 时控制器视作需登录 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `verifyAdmin()` | 子类覆盖，添加管理员额外校验 |
| `verifyAuth()` | 子类覆盖，添加普通用户额外校验 |

## 方法

### `verifyAdmin()` — 管理员校验

默认返回成功 `Result(null)`，子类可覆盖添加额外校验（如校验角色、权限等）。

**参数**

- 无。

**返回值**

- `Result`：校验结果。失败时返回 `Result::failed(...)`，中间件将中止后续 `data()` 执行。

**示例**

```php
protected function verifyAdmin(): Result
{
    if (!$this->Admin) {
        return Result::failed("未登录", 401);
    }
    if (!$this->isSuperAdmin($this->Admin)) {
        return Result::failed("无权限", 403);
    }
    return new Result(null);
}
```

### `verifyAuth()` — 普通用户校验

默认返回成功 `Result(null)`，子类可覆盖添加额外校验（如校验用户状态、Token 有效期等）。

**参数**

- 无。

**返回值**

- `Result`：校验结果。

**示例**

```php
protected function verifyAuth(): Result
{
    if (!$this->Auth) {
        return Result::failed("未登录", 401);
    }
    if ($this->Auth["status"] !== "active") {
        return Result::failed("账号已停用", 403);
    }
    return new Result(null);
}
```

## 完整示例

```php
use kernel\Foundation\Controller\AuthController;

class AdminController extends AuthController
{
    protected function data()
    {
        return $this->success("管理员面板");
    }
}
```
