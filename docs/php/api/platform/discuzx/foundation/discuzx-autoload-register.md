# DiscuzXAutoloadRegister — Discuz!X 自动加载注册器

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXAutoloadRegister.php`
- **命名空间**: 无（配置文件，返回闭包）
- **是否可继承**: 否（返回闭包的函数式配置）

Discuz!X 平台的可配置自动加载注册器。该文件**不是类定义**，而是 `return` 一个闭包，调用该闭包可注册一个支持跳过类和 SDK 类重定向的自动加载函数。

## 返回的闭包

```php
return function ($SkipClassName = [], $SDKClassName = []) { ... }
```

- `$SkipClassName`（array）：需要跳过的类名片段列表，命中则跳过加载
- `$SDKClassName`（array）：需要重定向到 SDK 目录的类名片段列表

调用后注册自动加载函数（`spl_autoload_register(..., true, true)`）。

**自动加载函数逻辑**

1. 类名 `\` → `/`。
2. 含 `kernel` 且不含 `gstudio_kernel` → 替换为 `gstudio_kernel`。
3. 遍历 `$SDKClassName`，命中则将路径前缀改为 `{App::id()}/SDK/` 并标记 `$SDKLoaded`。
4. 未标记 SDK 时，遍历 `$SkipClassName`，命中则直接 `return`。
5. 拼接 `DISCUZ_ROOT . "/source/plugin/{$className}.php"`，存在则 `include_once`，否则开发模式 `debug` 输出。

## 使用

```php
// 引入并调用，跳过某些类、重定向 SDK 类
$register = require "kernel/Platform/DiscuzX/Foundation/DiscuzXAutoloadRegister.php";
$register(
  ["kernel\\Foundation\\HTTP\\Request"],
  ["Alipay", "QCloud"]
);
```
