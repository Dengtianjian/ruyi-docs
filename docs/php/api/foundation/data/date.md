# Date — 日期工具

- **文件位置**: `kernel/Foundation/Data/Date.php`
- **命名空间**: `kernel\Foundation\Data`
- **类型**: 纯静态工具类

日期/时间处理静态工具类：毫秒/微秒时间戳、耗时、差异、人类可读时长、解析、格式化。全部通过 `Date::方法名(...)` 调用。

## 方法速查表

| 类别 | 方法 |
|------|------|
| 时间戳 | `microseconds`、`milliseconds`、`secondsToMilliseconds`、`millisecondsToSeconds` |
| 耗时/差异 | `elapsed`、`diff` |
| 人类可读 | `humanize` |
| 解析/格式化 | `parse`、`format` |

## 方法

### `microseconds()` — 当前微秒级时间戳

获取当前时间的微秒级时间戳（浮点数，秒 + 微秒小数部分）。

**参数**

- 无。

**返回值**

- `float`：微秒级时间戳。

**示例**

```php
Date::microseconds();   // 例如 1729212345.678901
```

### `milliseconds()` — 当前毫秒级时间戳

获取当前时间的毫秒级时间戳（整数）。

**参数**

- 无。

**返回值**

- `int`：毫秒级时间戳。

**示例**

```php
Date::milliseconds();   // 例如 1729212345678
```

### `secondsToMilliseconds($seconds)` — 秒转毫秒

将秒数值乘以 1000 转为毫秒。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seconds` | `int\|float` | 无 | 秒数值 |

**返回值**

- `int|float`：毫秒数值。

**示例**

```php
Date::secondsToMilliseconds(2);   // 2000
```

### `millisecondsToSeconds($milliseconds)` — 毫秒转秒

将毫秒数值除以 1000 转为秒。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$milliseconds` | `int\|float` | 无 | 毫秒数值 |

**返回值**

- `int|float`：秒数值。

**示例**

```php
Date::millisecondsToSeconds(2000);   // 2
```

### `elapsed(int $startMs)` — 自开始起的经过时间

计算自 `$startMs` 毫秒时刻起已经过的毫秒数（即「当前毫秒 − 开始毫秒」）。用于测量某段逻辑耗时。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$startMs` | `int` | 无 | 开始时刻的毫秒时间戳 |

**返回值**

- `int`：经过的毫秒数。

**示例**

```php
$start = Date::milliseconds();
// ... 业务逻辑
echo Date::elapsed($start) . "ms";   // 例如 "12ms"
```

### `diff(int $startMs, ?int $endMs = null)` — 时间戳差值

计算 `$endMs` 与 `$startMs` 的差值（毫秒）。`$endMs` 为 `null` 时使用当前毫秒时间戳。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$startMs` | `int` | 无 | 开始毫秒时间戳 |
| `$endMs` | `?int` | `null` | 结束毫秒时间戳，缺省取当前时刻 |

**返回值**

- `int`：两个时间戳的毫秒差值。

**示例**

```php
$diff = Date::diff($start);       // 到当前时刻
$diff = Date::diff($start, $end); // 指定结束时刻
```

### `humanize($ms)` — 毫秒转人类可读时长

将毫秒数转换为人类可读的中文时长（如 `"2天3小时"`、`"5分10秒"`）。自动省略为 0 的层级。大于 1 天用「天」+「小时」，否则用「分」+「秒」。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$ms` | `int\|float` | 无 | 毫秒数 |

**返回值**

- `string`：人类可读时长字符串。

**示例**

```php
Date::humanize(183000000);   // "2天3小时"
Date::humanize(310000);      // "5分10秒"
```

### `parse($str)` — 解析时间字符串

将时间字符串解析为秒级时间戳。使用 `strtotime` 解析，支持常见时间格式。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$str` | `string` | 无 | 时间字符串（如 `"2026-08-21 10:00:00"`） |

**返回值**

- `?int`：秒级时间戳；解析失败返回 `null`。

**示例**

```php
Date::parse("2026-08-21 10:00:00");   // 秒级时间戳
Date::parse("invalid");               // null
```

### `format($timestamp = null, $format = "Y-m-d H:i:s")` — 格式化时间戳

按格式格式化时间戳。`$timestamp` 缺省时使用当前时间。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$timestamp` | `int\|null` | `null` | 秒级时间戳，缺省为当前时刻 |
| `$format` | `string` | `"Y-m-d H:i:s"` | PHP `date()` 格式字符串 |

**返回值**

- `string`：格式化后的日期字符串。

**示例**

```php
Date::format(time(), "Y-m-d");           // "2026-08-21"
Date::format();                          // "2026-08-21 10:30:45"（当前时间）
```
