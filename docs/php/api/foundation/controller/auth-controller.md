# AuthController — 鉴权控制器基类

- **文件位置**: `kernel/Foundation/Controller/AuthController.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `Controller`
- **是否可继承**: 是

带认证能力的控制器基类，继承 `Controller`。`$admin` / `$auth` 属性为认证开关，设为非 `false` 即启用对应认证；由中间件读取开关执行 Token 校验，并将校验结果分发到 `verifyAdmin()`/`verifyAuth()` 钩子。子类可覆盖 `verifyAdmin()`/`verifyAuth()` 添加额外校验。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$admin` | `bool\|int\|string\|array` | `false` | public | 管理员认证开关：非 `false` 时启用管理员（Admin）认证，由中间件读取并触发 `verifyAdmin()` 分发 |
| `$auth` | `bool\|int\|string\|array` | `false` | public | 普通用户认证开关：非 `false` 时启用用户（Auth）认证，由中间件读取并触发 `verifyAuth()` 分发 |

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
    if (!$this->admin) {
        return Result::failed("未登录", 401);
    }
    if (!$this->isSuperAdmin($this->admin)) {
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
    if (!$this->auth) {
        return Result::failed("未登录", 401);
    }
    if ($this->auth["status"] !== "active") {
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
