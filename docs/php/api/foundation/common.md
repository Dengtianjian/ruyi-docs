# Common — 全局函数

- **文件位置**: `kernel/Foundation/Common.php`
- **命名空间**: 无（全局函数）
- **加载**: `App::__construct` 时 `include`；`getApp()` 定义于此，未实例化 App 前需手动 `include`

全局便捷函数，均带 `if (!function_exists)` 守卫、camelCase 命名。内部 `use` 引入 `App` / `Config` / `Arr` / `Exception` / `FileHelper` / `Path` / `Output`。

## 函数一览

| 函数 | 作用 |
|------|------|
| `import($fileName, $args, $basePath)` | 导入 PHP 文件；仅 `$data instanceof \Closure` 才执行；文件不存在返回 `false`，非 php 扩展抛 Exception；`Serializer::load()` 唯一调用点 |
| `getApp()` | 获取当前 App 实例 |
| `debug(...$data)` / `dd(...$data)` | 委托 `Output::debug`（空参不 `exit`，有数据 `exit`） |
| `dump(...$data)` | `Output::format`，不 `exit` |
| `data_get($array, $key, $default)` | `Arr::get` 点号读取 |
| `data_has($array, $key)` | `Arr::has` 点号判断 |
| `config($key, $default)` | `Config::get` |
| `path($name)` | 白名单路径：`projectRoot`/`kernelRoot`/`root`/`data`/`storage`/`kernelDir`/`dir`，未知抛 Exception |
| `abort($message, $statusCode, $errorCode, $errorDetails)` | 抛出异常（消息在前） |
| `env($key, $default)` | `getenv` 返回 `false` 时回退默认值 |
| `now($format)` | 当前时间格式化 |
| `today()` | 今天日期 |

## 函数

### `import($fileName, $args = [], $basePath = null)` — 导入 PHP 文件

将指定 PHP 文件以 `include` 方式载入并返回其返回值。若该文件 `return` 了一个 `\Closure`，则自动以 `$args` 为参数调用它并返回结果。**仅当返回类型是真正的闭包时才执行**，用 `instanceof \Closure` 而非 `is_callable`，避免可调用数组（如 `['Class','method']`）被误当成函数执行。

路径处理：可带或不带 `.php` 扩展名；带扩展名但非 `php` 时抛 Exception；不带扩展名时自动补 `.php`。`$basePath` 为 `null` 时取 `Path::root()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileName` | `string` | 无 | 文件名称，可带或不带 `.php` 扩展名 |
| `$args` | `array` | `[]` | 当导入文件 `return` 闭包时，传给闭包的参数数组 |
| `$basePath` | `string\|null` | `null` | 基路径 |

**返回值**

- `false`：文件不存在。
- `mixed`：文件 `return` 的内容（若为 `\Closure` 则为闭包执行结果）。

**异常**

- `Exception`：文件扩展名非 `php` 时抛出，错误信息 `"导入文件错误"`，状态码 `500`，错误码 `500`。

**示例**

```php
// 导入配置并返回数组
$config = import("Config/setting");

// 导入文件并执行其返回的闭包，传入参数
$result = import("Handlers/handle", [['key' => 'value']]);
```

### `getApp()` — 获取当前应用实例

实例化 `App`（`new App($id)`）时自动注册为当前实例（后实例化者覆盖前者），本函数返回该当前实例。未实例化任何 App 时返回 `null`。

**参数**

- 无。

**返回值**

- `App|null`：当前应用实例；尚未实例化任何 App 时返回 `null`。

**示例**

```php
$app = getApp();
$router = $app->router;
```

### `debug(...$data)` — 调试输出并终止脚本

委托 `Output::debug()`：空参时仅输出提示不退出，有数据时输出并 `exit`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$data` | `mixed` | 无 | 输出内容，可变参数 |

**返回值**

- 无（内部根据参数决定是否 `exit`）。

### `dd(...$data)` — dump and die

与 `debug()` 同语义，更短的调试别名。空参仅输出提示不退出，有数据输出并 `exit`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$data` | `mixed` | 无 | 输出内容，可变参数 |

**返回值**

- 无（内部根据参数决定是否 `exit`）。

### `dump(...$data)` — 仅输出数据，不终止脚本

相对 `dd()/debug()`，本函数只打印不退出，适合在循环中调试。委托 `Output::format()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$data` | `mixed` | 无 | 输出内容，可变参数 |

**返回值**

- 无。

### `data_get($array, $key, $default = null)` — 点号/斜杠路径取值

委托 `Arr::get()`，支持 `"user.profile.name"` 或 `"user/profile/name"` 路径。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$array` | `array\|object` | 无 | 数据源 |
| `$key` | `string\|int\|null` | 无 | 键路径 |
| `$default` | `mixed` | `null` | 键不存在时的默认值 |

**返回值**

- `mixed`：取值结果，键不存在时返回 `$default`。

### `data_has($array, $key)` — 判断键路径是否存在

委托 `Arr::has()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$array` | `array\|object` | 无 | 数据源 |
| `$key` | `string\|int\|null` | 无 | 键路径 |

**返回值**

- `bool`：存在返回 `true`。

### `config($key = null, $default = null)` — 读取配置

委托 `Config::get()`，支持点号/斜杠路径，如 `"database.mysql.host"`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | `null` | 配置键路径 |
| `$default` | `mixed` | `null` | 默认值 |

**返回值**

- `mixed`：配置值，不存在时返回 `$default`。

**示例**

```php
$mode = config("mode", "production");
$dbHost = config("database.mysql.host");
```

### `path($name = "root")` — 获取路径

委托 `Path::{$name}()`，白名单限定，避免任意方法调用。`$name` 必须是预定义路径名之一，否则抛 Exception。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | `"root"` | 路径 getter 名，可选 `projectRoot`/`kernelRoot`/`root`/`data`/`storage`/`kernelDir`/`dir` |

**返回值**

- `string|null`：路径字符串。

**异常**

- `Exception`：未知路径名时抛出，错误信息 `"未知路径名称「{$name}」"`，状态码 `500`，错误码 `500`。

**示例**

```php
$root = path();                          // 应用根目录
$storage = path("storage");              // Storage 目录
$kernelRoot = path("kernelRoot");        // 内核根目录
```

### `abort($message, $statusCode, $errorCode, $errorDetails)` — 抛出框架异常

透传 `Exception` 构造参数（消息在前）。始终抛出，不会返回。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `"Server error"` | 错误信息 |
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$errorCode` | `int\|string` | `500` | 错误码 |
| `$errorDetails` | `mixed` | `null` | 错误详情 |

**返回值**

- 无（始终抛出异常）。

**异常**

- `Exception`：始终抛出。

**示例**

```php
abort("权限不足", 403, 1003);
abort("参数错误", 400, "400:BadRequest", ['field' => 'email']);
```

### `env($key, $default = null)` — 读取环境变量

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 环境变量名 |
| `$default` | `mixed` | `null` | 未定义时的默认值 |

**返回值**

- `mixed`：环境变量值，未定义时返回 `$default`。

### `now($format = "Y-m-d H:i:s")` — 当前日期时间

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$format` | `string` | `"Y-m-d H:i:s"` | 日期格式 |

**返回值**

- `string`：格式化后的当前时间。

**示例**

```php
$now = now();                  // "2026-08-21 14:30:00"
$now = now("Y-m-d");           // "2026-08-21"
```

### `today()` — 当前日期

**参数**

- 无。

**返回值**

- `string`：当前日期，格式 `Y-m-d`。

**示例**

```php
$date = today();  // "2026-08-21"
```

## 完整示例

```php
$app = getApp();
config("mode", "production");
$data = data_get("user.name", "匿名");
$path = path("storage");
abort("权限不足", 403, 1003);
$now = now("Y-m-d H:i:s");
```
