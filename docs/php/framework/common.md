# Common — 全局函数

`Common.php` 定义了框架提供的**全局便捷函数**，供任意位置直接调用，无需 `use` 或 `import`。文件由 `App` 构造函数在初始化时自动载入。

- **文件位置**: `kernel/Foundation/Common.php`

> **设计约定**：全局函数会污染命名空间，故本文件**只保留高频、语义自明、零成本封装**的函数；每个函数都带 `if (!function_exists(...))` 守卫，避免重复定义冲突。所有命名遵循 camelCase。

## 函数列表

### `getApp()`

返回当前应用实例（`App` 实例化时自动注册为当前实例，后实例化者覆盖前者）。

返回值：`App|null` — 尚未实例化任何 App 时返回 `null`

```php
$app = getApp();
```

等价于 `App::getInstance()`。实例化前需先载入本文件（`App::__construct` 已自动载入）。

### `import($fileName, $args = [], $basePath = null)`

导入（include）一个 PHP 文件并返回其返回值。若文件 `return` 了一个闭包（`\Closure`），则自动以 `$args` 为参数调用它。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileName` | `string` | 文件名，可带或不带 `.php` 扩展名，路径相对 `$basePath` |
| `$args` | `array` | 文件 return 闭包时传给闭包的参数数组 |
| `$basePath` | `string\|null` | 基路径，默认 `Path::root()` |

返回值：`false|mixed` — `false` 表示导入失败（多为文件不存在）；其余为文件 return 的内容

```php
// 导入数据文件（返回数组）
$config = import("config/site");

// 导入工厂文件（返回闭包并自动执行）
$result = import("factories/user", [1, 2]);
```

**注意**：仅当文件 return **真正的闭包**时才执行。可调用数组（如 `['Class','method']`）会被当作数据原样返回，不会误执行。

### `debug(...$data)` / `dd(...$data)`

调试输出并**终止脚本**。二者语义相同，`dd` 是更短的别名。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 调试数据 |

```php
debug($request);   // 输出 <pre>...</pre> 后终止
dd($result);       // 等价写法
```

**空参守卫**：未传任何数据时仅输出提示并返回，**不会** `exit`，避免误调导致脚本意外终止。

### `dump(...$data)`

仅输出数据，**不终止脚本**。相对 `dd()` / `debug()`，适合在循环中调试。

```php
foreach ($items as $item) {
    dump($item);   // 打印后继续执行
}
```

### `data_get($array, $key, $default = null)`

用点号/斜杠路径从数组或对象取值。委托 `Arr::get()`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array\|object` | 数据源 |
| `$key` | `string\|int\|null` | 键路径，如 `"user.profile.name"` 或 `"user/profile/name"` |
| `$default` | `mixed` | 键不存在时的默认值 |

返回值：`mixed`

```php
$name = data_get($data, 'user.profile.name', 'guest');
$name = data_get($data, 'user/profile/name', 'guest'); // 斜杠分隔等价
```

### `data_has($array, $key)`

判断数组/对象是否存在指定键路径。委托 `Arr::has()`。

返回值：`bool`

```php
if (data_has($data, 'user.profile')) {
    // ...
}
```

### `config($key = null, $default = null)`

读取配置。委托 `Config::get()`，支持点号/斜杠路径。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 配置键路径，如 `"database.mysql.host"` |
| `$default` | `mixed` | 默认值 |

返回值：`mixed`

```php
$host = config('database.mysql.host', '127.0.0.1');
$mode = config('mode', 'production');
```

### `path($name = "root")`

获取路径。委托 `Path::{$name}()`，通过**白名单**限定，避免任意方法调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 路径 getter 名：`projectRoot` \| `kernelRoot` \| `root` \| `data` \| `storage` \| `kernelDir` \| `dir` |

返回值：`string|null` — 依赖 `App::id()` 的 getter 在未实例化 App 时返回 `null`；未知名称抛异常

```php
$root    = path();            // 应用根目录（App::id()）
$storage = path('storage');   // 存储目录
$kernel  = path('kernelRoot'); // 内核目录
```

### `abort($message = "Server error", $statusCode = 500, $errorCode = 500, $errorDetails = null)`

抛出框架异常。参数**消息在前**，与 `Exception` 构造一致。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$message` | `string` | 错误信息 |
| `$statusCode` | `int` | HTTP 状态码 |
| `$errorCode` | `int\|string` | 业务错误码 |
| `$errorDetails` | `mixed` | 错误详情 |

返回值：`void` — 始终抛出异常，不会返回

```php
abort('资源不存在', 404, 40401);
```

### `env($key, $default = null)`

读取环境变量。委托 `getenv()`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 环境变量名 |
| `$default` | `mixed` | 未定义时的默认值 |

返回值：`mixed`

```php
$secret = env('APP_SECRET', 'default-secret');
```

### `now($format = "Y-m-d H:i:s")` / `today()`

返回当前日期时间 / 当前日期。

```php
now();               // 2026-08-21 14:30:00
now('Y-m-d');        // 2026-08-21
today();             // 2026-08-21
```

## 使用建议

- 全局函数应在**高频、跨层调用**时使用；低频或单文件内的逻辑应使用对应工具类（`Arr`、`Path`、`Config`、`Output` 等）的静态方法，避免不必要的全局命名污染。
- `debug` / `dd` / `dump` 仅供开发调试，生产环境请移除。
- 新增全局函数时务必带上 `if (!function_exists(...))` 守卫，保持 camelCase。
