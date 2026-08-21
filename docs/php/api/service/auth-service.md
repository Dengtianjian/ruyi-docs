# AuthService — 认证服务

- **文件位置**: `kernel/Service/AuthService.php`
- **命名空间**: `kernel\Service`
- **继承**: `extends Foundation\Service`
- **是否可继承**: 是

Token 生成服务。基于用户 ID 与盐值生成带过期时间的认证 Token，Token 使用 `password_hash` 加盐哈希，无法反解。

## 属性

无属性。

## 方法速查

| 方法 | 说明 |
|------|------|
| `generateToken($userId, $tokenSalt = [], $expiration = 30)` | 生成 Token 数组 |

## 方法

### `generateToken($userId, $tokenSalt = [], $expiration = 30)` — 生成 Token

> 以 `time()` 拼接用户 ID 与盐值，`password_hash`（`PASSWORD_DEFAULT`）加盐后计算过期时间戳。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$userId` | `int` | — | 用户 ID，作为盐的一部分参与哈希 |
| `$tokenSalt` | `array` | `[]` | 额外的盐值数组，逐项拼接进哈希串，增强随机性 |
| `$expiration` | `int` | `30` | 有效期（天），内部换算为秒（`86400 * $expiration`） |

**返回值**

- `array`：关联数组，键含义如下：

| 键 | 类型 | 说明 |
|----|------|------|
| `value` | `string` | Token 哈希值 |
| `token` | `string` | 与 `value` 相同 |
| `expirationDate` | `int` | 过期时间戳（当前时间 + 有效期秒数） |
| `expiration` | `int` | 有效期（天，原始入参） |

**示例**

```php
use kernel\Service\AuthService;

$token = AuthService::generateToken(1, ["extra-salt"], 30);
// ['value' => '$2y$...', 'token' => '$2y$...', 'expirationDate' => 1765..., 'expiration' => 30]
```
