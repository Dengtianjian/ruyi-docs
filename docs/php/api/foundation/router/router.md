# Router — 薄实例

- **文件位置**: `kernel/Foundation/Router/Router.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 是

由 App 实例化并持有，负责加载路由文件和匹配。

## 构造

```php
public function __construct()
```

构造时自动加载路由文件：
1. `kernel/Routes/` 下所有 PHP 文件
2. `{App}/Routes/` 下所有 PHP 文件

## 方法

### `route()` — 获取匹配的路由

```php
public function route(): ?array
```

由 `App::run()` 调用，委托 `Routes::match()`。

**行为**

- URI 非根时 `trim("/")` 尾斜杠容忍
- 域名经 `URL::normalizeDomain()` 归一化（小写、去端口、去 IPv6 括号）
- 未匹配返回 `null`

### `routes()` — 获取全部路由

```php
public function routes(): array
```

委托 `Routes::tables()` 导出完整路由定义表（`domain => method => uri => 路由定义`）。
