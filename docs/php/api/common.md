# Common 全局函数

- **文件位置**: `kernel/Foundation/Common.php`
- **命名空间**: 无（全局函数文件，由 `App::__construct` include；`getApp()` 未实例化前需手动 include）

所有全局函数均用 `if (!function_exists())` 守卫包裹，命名统一 **camelCase**。

> 详细说明见 [Common 全局函数](../framework/common.md)。

## import — 导入 PHP 文件

```php
import($fileName, $args = [], $basePath = null)
```

导入并执行一个 PHP 文件。**仅当返回值为 `\Closure` 时才执行并传参**（非 `is_callable`，避免可调用数组 `['Class','method']` 被误执行）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileName` | `string` | 文件名，无 `.php` 后缀自动补齐 |
| `$args` | `array` | 闭包调用参数 |
| `$basePath` | `string|null` | 基础目录，默认 `Path::root()` |

- 文件不存在返回 `false`
- 非 `.php` 扩展抛 `Exception("导入文件错误", 500, 500)`

```php
$data = import("config/route");                    // 导入并返回 include 结果
$result = import("handlers/register", [$req]);     // 返回值为闭包时执行并传参
```

## getApp — 获取当前应用实例

```php
getApp()
```

返回 `App::getInstance()`。未实例化 App 时返回 `null`。

```php
$app = getApp();
$request = $app->request();
```

## 调试输出

| 函数 | 说明 |
|------|------|
| `debug(...$data)` | 委托 `Output::debug`，**空参不 exit**，有数据 exit |
| `dd(...$data)` | 委托 `Output::debug`（含 exit） |
| `dump(...$data)` | 委托 `Output::format`，不 exit |

```php
debug($user, $request);   // 调试，有数据则终止
dump($config);            // 仅打印，不终止
```

## 数据访问

| 函数 | 说明 |
|------|------|
| `data_get($array, $key, $default = null)` | 委托 `Arr::get`，点号路径取值 |
| `data_has($array, $key)` | 委托 `Arr::has`，点号路径判断存在 |

```php
$name = data_get($user, "profile.name", "未命名");
if (data_has($user, "profile")) { /* ... */ }
```

## config — 读取配置

```php
config($key = null, $default = null)
```

委托 `Config::get` 静态方法，`$key` 支持点号路径。

```php
$mode = config("mode", "production");
$cors = config("cors.origin", "*");
```

## path — 路径快捷函数

```php
path($name = "root")
```

委托 `Path::{$name}()`。**白名单限定**：`projectRoot` / `kernelRoot` / `root` / `data` / `storage` / `kernelDir` / `dir`。未知名称抛 `Exception("未知路径名称「{$name}」", 500, 500)`。

```php
$root = path("root");        // {projectRoot}/{App::id()}
$data = path("data");        // root/Data
$storage = path("storage");  // root/Storage
```

## abort — 抛出异常

```php
abort($message = "Server error", $statusCode = 500, $errorCode = 500, $errorDetails = null)
```

透传 `Exception` 构造，**消息在前**。

```php
abort("无权访问", 403, "403:Forbidden");
```

## env — 读取环境变量

```php
env($key, $default = null)
```

`getenv($key)`，`false` 时回退默认值。

```php
$dbHost = env("DB_HOST", "127.0.0.1");
```

## 时间

| 函数 | 说明 |
|------|------|
| `now($format = "Y-m-d H:i:s")` | 当前时间字符串 |
| `today()` | 当前日期（`Y-m-d`） |

```php
$created = now();      // 2026-08-21 12:00:00
$day = today();        // 2026-08-21
```
