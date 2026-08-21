# URL — 统一 URL 静态门面

- **文件位置**: `kernel/Foundation/URL.php`
- **命名空间**: `kernel\Foundation`
- **类型**: 纯静态门面

baseUrl 的注入 / 读取工具。**保留 `F_BASE_URL` 全局常量作为向后兼容快照**：业务代码用 `URL::getBaseUrl()` / `URL::url()`，历史插件代码用 `F_BASE_URL` 仍可读。

## 设计要点

1. **静态门面**：与 Result/ErrorCode 同风格，无实例化
2. **优先返回值注入**：先看 `self::$baseUrl`，再 fallback 到 `F_BASE_URL` 常量
3. **保留 `F_BASE_URL` 常量**：`setBaseUrl()` 内部已用 `!defined` 守卫，多次调用不会重复 define
4. **`url()` 智能拼接**：子路径开头 `/` 自动剥除单斜杠；传入绝对 URL 直接短路返回

## 方法速查表

| 方法 | 作用 |
|------|------|
| `getBaseUrl(): string` | 取基础 URL；优先返回值，未设则读 `F_BASE_URL` 常量；都没有返回 "" |
| `setBaseUrl(string $url): void` | 注入基础 URL；同步写入 `F_BASE_URL` 常量 |
| `url(?string $path = ""): string` | 在 baseUrl 上拼子路径；绝对 URL 直接透传 |

## 方法详解

### `getBaseUrl(): string` — 读取基础 URL

```php
use kernel\Foundation\URL;

URL::setBaseUrl("https://example.com");
echo URL::getBaseUrl();  // "https://example.com"
```

**返回值**

- `string` —— 注入值 / `F_BASE_URL` 常量 / `""`（任意都没有）

### `setBaseUrl(string $url): void` — 注入基础 URL

由 `App::defineConstants()` 在启动时调用（基于 `$_SERVER` 推导）或由 `DiscuzXApp` 在 Discuz!X 平台下用 `$_G['siteurl']` 注入。

```php
URL::setBaseUrl("https://example.com");
define("F_BASE_URL", ...);   // ❌ 不需要；setBaseUrl 已经做了 !defined 守卫
```

**注意点**：第二次调 `setBaseUrl()` 时**不会再 define**（已存在常量），但内部的 `$baseUrl` 缓存会**更新到新值**——所以重复调用是"刷新门面"，而常量仍保持首次定义的值。这是有意为之的边界。

### `url(?string $path = ""): string` — 在 baseUrl 上拼子路径

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string\|null` | `""` | 子路径或绝对 URL |

**规则**

| 输入 | 输出 |
|------|------|
| `""` 或 `null` | 仅 baseUrl |
| `"foo"` | `baseUrl/foo` |
| `"/foo"` | `baseUrl/foo`（开头多余斜杠被去除） |
| `"a/b/c"` | `baseUrl/a/b/c` |
| `"https://cdn..."` | 直接返回（绝对 URL 短路） |
| baseUrl 未设 | 返回 `ltrim($path, "/")` |

**示例**

```php
URL::setBaseUrl("https://example.com");

URL::url();                          // "https://example.com"
URL::url("users");                   // "https://example.com/users"
URL::url("/api/v1");                 // "https://example.com/api/v1"
URL::url("https://cdn.com/x.png");  // "https://cdn.com/x.png"（短路）
```

## 全局便捷函数 `url()`

`Common.php` 暴露同名全局 `url()`：

```php
url();          // → URL::url()
url("users");   // → URL::url("users")
```

## 集成位置

- `kernel/Foundation/App.php` —— 启动时从 `$_SERVER` 推导
- `kernel/Platform/DiscuzX/Foundation/DiscuzXApp.php` —— Discuz!X 平台从 `$_G['siteurl']` 推导
- `kernel/Middleware/GlobalAuthMiddleware.php` —— 保留 `F_BASE_URL` 直接读取（向后兼容）
- `kernel/Foundation/FileSystem/Storage/AbstractStorage.php` —— 构造默认值保留 `F_BASE_URL`（向后兼容）
- `kernel/Foundation/Router.php` —— 拼 URL 时保留 `F_BASE_URL`（向后兼容）

> 新代码统一走 `URL::getBaseUrl()` / `URL::url()`；老代码无须改。

## 相关

- 路径系统：[Path · `path()`](./path.md)（项目级路径常量）
- 配置基址：[Config · `mode`](./config.md)
