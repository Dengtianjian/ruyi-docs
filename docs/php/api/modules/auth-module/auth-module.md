# AuthModule — 认证模块

- **文件位置**: `kernel/Modules/Auth/AuthModule.php`
- **命名空间**: `kernel\Modules\Auth`
- **继承**: `extends Foundation\Module\Module`
- **模块名**: `auth`（固定，`protected string $name = "auth"`）
- **是否可继承**: 是

认证模块，负责登录凭证（token）的生成、落库与清理，并通过全局中间件 `GlobalAuthMiddleware` 在每个请求里校验 `Authorization` 头中的 token，解析出当前登录用户状态。解析出的状态（token / user / logged 等）由中间件写入本模块实例，业务层可经门面 `Auth` 读取。

## 生命周期（onBoot）

模块装载（boot）时执行一次：

- 注册全局认证中间件 `GlobalAuthMiddleware`；
- 初始化登录凭证模型 `LoginsModel`；
- 清理已过期凭证（`deleteExpiredTokens()`），避免 `logins` 表无限增长。

## 由中间件写入的状态（读取即可）

以下状态由 `GlobalAuthMiddleware` 在每个请求解析后写入；未登录时为对应默认值（`null` / `false`）。业务层通常经门面 `Auth` 读取（如 `Auth::logged()`、`Auth::user()`）。

| 状态 | 类型 | 说明 |
|------|------|------|
| `token` | `string\|null` | 当前请求的 token 值 |
| `tokenExpiresAt` | `int\|null` | token 的绝对过期时间戳 |
| `user` | `mixed` | 当前登录用户数据（未登录为 `null`） |
| `userId` | `string\|int\|null` | 当前登录用户 ID（未登录为 `null`） |
| `logged` | `bool` | 是否已登录 |

## 方法

### Token 相关

| 方法 | 说明 |
|------|------|
| `generateToken($expireDays = 30)` | 生成 token（**不落库**），返回 `["value","salt","expiresAt","expireDays"]` |
| `createToken($userId, $expireDays = 30)` | 生成并持久化登录 Token 到 `logins` 表，返回同上凭证数据 |
| `deleteToken($token)` | 按 token 值软删除登录凭证 |
| `deleteExpiredTokens()` | 物理删除已过期凭证（含已软删除的） |
| `deleteTokensByUser($userId)` | 吊销指定用户全部凭证（软删除，常用于改密码后全平台下线） |

`generateToken` / `createToken` 返回结构：

```php
[
  "value"      => "十六进制随机串(64位)",
  "salt"       => "十六进制随机串(32位)",
  "expiresAt"  => 169...,            // 绝对时间戳
  "expireDays" => 30
]
```

> 采用 `random_bytes` 密码学安全随机；原 `password_hash` 方案每次输出不同且无对应验证，已弃用。

### 登录态读写（读写一体）

传入参数则写入并返回自身（`$this`），无参调用返回当前值。

| 方法 | 说明 |
|------|------|
| `token($val = null)` | 读取 / 设置当前 token |
| `tokenExpiresAt($val = null)` | 读取 / 设置 token 绝对过期时间戳 |
| `logged($val = null)` | 读取 / 设置登录状态 |
| `user($val = null)` | 读取 / 设置当前登录用户数据 |
| `userId($val = null)` | 读取 / 设置当前登录用户 ID |

### 模型与生命周期

| 方法 | 说明 |
|------|------|
| `model($val = null)` | 获取或替换登录凭证模型 `LoginsModel`（延迟初始化；CLI 等未走 `onBoot` 的场景也能直接使用） |
| `name()` | 模块名 `auth` |
| `booted()` | 是否已启动 |
| `boot()` / `shutdown()` | 启动 / 停止（各仅一次，来自 Module 基类） |

## 使用

```php
use kernel\Modules\Auth\AuthModule;

// 经模块管理器获取已装载实例
$auth = getApp()->modules()->get("auth");   // AuthModule | null

// 登录成功后签发 token
$tokenData = $auth->createToken($userId, 30);

// 改密码后吊销该用户全部凭证
$auth->deleteTokensByUser($userId);
```

更常见的写法是通过**门面** `Auth` 直接读取登录态（无需先取模块）：

```php
use kernel\Modules\Auth\Auth;

if (Auth::logged()) {
    $uid  = Auth::userId();
    $user = Auth::user();
}
```

> 门面说明见 [Auth 门面](./auth)。
