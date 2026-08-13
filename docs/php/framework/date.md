# Date — 时间工具类

Date 提供高精度时间戳获取（微秒/毫秒）、时间戳单位转换、时间差与耗时计算、字符串时间解析与格式化等一系列静态工具方法，全部无需实例化即可调用。

- **命名空间**: `kernel\Foundation\Data\Date`
- **文件位置**: `kernel/Foundation/Data/Date.php`
- **特点**: 全部为静态方法，`microseconds()` / `milliseconds()` 基于 `microtime()` 实现

> 说明：该类原位于 `kernel/Foundation/Date.php`，已迁移至 `kernel/Foundation/Data/` 目录，命名空间相应变为 `kernel\Foundation\Data\Date`。

## 时间戳获取

### `microseconds()`

获取当前时间戳（秒，微秒精度）。

返回值：`float`，如 `1786635816.234411`

```php
Date::microseconds();   // 1786635816.234411
```

### `milliseconds()`

获取当前时间戳（毫秒，整数）。

返回值：`int`，如 `1786635816234`

```php
Date::milliseconds();   // 1786635816234
```

## 单位转换

### `secondsToMilliseconds($seconds)`

秒级时间戳转毫秒级。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$seconds` | `int\|float` | 秒级时间戳 |

返回值：`int` 毫秒级时间戳（四舍五入）

```php
Date::secondsToMilliseconds(1786635816.234);  // 1786635816234
Date::secondsToMilliseconds(1786635816);      // 1786635816000
```

### `millisecondsToSeconds($milliseconds)`

毫秒级时间戳转秒级。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$milliseconds` | `int\|float` | 毫秒级时间戳 |

返回值：`float` 秒级时间戳（毫秒精度）

```php
Date::millisecondsToSeconds(1786635816234);   // 1786635816.234
```

## 时间差与耗时

### `elapsed(int $startMs)`

获取自某个时间点（毫秒）以来的耗时，常用于记录执行耗时。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$startMs` | `int` | 起点毫秒时间戳（通常由 `Date::milliseconds()` 记录） |

返回值：`int` 距当前的毫秒差

```php
$start = Date::milliseconds();
// ... 执行耗时逻辑 ...
Date::elapsed($start);   // 42
```

### `diff(int $startMs, ?int $endMs = null)`

计算两个毫秒时间戳之间的差值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$startMs` | `int` | 起点毫秒时间戳 |
| `$endMs` | `int\|null` | 终点毫秒时间戳，默认当前毫秒时间戳 |

返回值：`int` 毫秒差（负数表示 `$endMs` 早于 `$startMs`）

```php
Date::diff(1786635816000, 1786635816123);  // 123
```

### `humanize($ms)`

将毫秒耗时格式化为人类可读字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$ms` | `int\|float` | 毫秒数 |

返回值：`string` 可读耗时

```php
Date::humanize(832);     // "832ms"
Date::humanize(1300);    // "1.3s"
Date::humanize(125000);  // "2m 5s"
Date::humanize(5400000); // "1h 30m"
Date::humanize(90000000); // "1d 1h"
```

## 解析与格式化

### `parse($str)`

将字符串时间解析为秒级时间戳。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$str` | `string` | 可被 `strtotime` 解析的时间字符串，如 `"2026-08-13 10:00:00"` |

返回值：`int|null` 秒级时间戳；解析失败返回 `null`

```php
Date::parse("2026-08-13 10:00:00");  // 1786615200
Date::parse("invalid");              // null
```

### `format($timestamp = null, $format = "Y-m-d H:i:s")`

格式化时间戳为时间字符串，自动识别秒级与毫秒级时间戳（毫秒级约 1e12、秒级约 1e9，阈值 1e11）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$timestamp` | `int\|float\|null` | 时间戳（秒级或毫秒级），默认当前时间 |
| `$format` | `string` | `date()` 格式化字符串 |

返回值：`string` 格式化后的时间字符串

```php
Date::format(1786635816);                 // "2026-08-13 10:00:00"
Date::format(1786635816234, "Y/m/d H:i"); // "2026/08/13 10:00"
Date::format(null, "Y年m月d日");           // "2026年08月13日"
```

## 应用示例：记录执行耗时

```php
use kernel\Foundation\Data\Date;

$start = Date::milliseconds();
// ... 业务逻辑 ...
$console->info("executed in " . Date::humanize(Date::elapsed($start)));
```
