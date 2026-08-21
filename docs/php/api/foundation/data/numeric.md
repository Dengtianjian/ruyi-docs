# Numeric — 数值工具

- **文件位置**: `kernel/Foundation/Data/Numeric.php`
- **命名空间**: `kernel\Foundation\Data`
- **类型**: 纯静态工具类

数值处理静态工具类：转换、范围判断/钳制、精度、格式化、百分比、字节可读化。全部通过 `Numeric::方法名(...)` 调用。

## 方法速查表

| 类别 | 方法 |
|------|------|
| 转换 | `val` |
| 范围 | `isBetween`、`clamp` |
| 精度 | `roundTo`、`fixedDecimals`、`padDecimals` |
| 格式化 | `format`、`percentage` |
| 单位换算 | `bytesToHuman` |

## 方法

### `val($Target)` — 转为数值

将传入值转为数值类型。若为整数字符串或整数则返回 `int`，否则返回 `float`；`null` 转为 `0`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Target` | `mixed` | 无 | 待转换的值（数字字符串、int、float 等） |

**返回值**

- `int|float`：数值类型。

**示例**

```php
Numeric::val("3.14");   // 3.14 (float)
Numeric::val("42");     // 42 (int)
Numeric::val(null);     // 0
```

### `isBetween($value, $min, $max)` — 是否在范围内

判断 `$value` 是否在闭区间 `[$min, $max]` 内（含边界）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 待判断的值 |
| `$min` | `int\|float` | 无 | 区间下界（含） |
| `$max` | `int\|float` | 无 | 区间上界（含） |

**返回值**

- `bool`：在区间内返回 `true`。

**示例**

```php
Numeric::isBetween(50, 0, 100);   // true
Numeric::isBetween(150, 0, 100);  // false
```

### `clamp($value, $min, $max)` — 钳制到范围

将 `$value` 钳制到 `[$min, $max]` 区间：小于 `$min` 返回 `$min`，大于 `$max` 返回 `$max`，否则返回原值。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 待钳制值 |
| `$min` | `int\|float` | 无 | 下界 |
| `$max` | `int\|float` | 无 | 上界 |

**返回值**

- `int|float`：钳制后的值。

**示例**

```php
Numeric::clamp(150, 0, 100);   // 100
Numeric::clamp(-10, 0, 100);   // 0
Numeric::clamp(50, 0, 100);    // 50
```

### `roundTo($value, $decimals = 0)` — 四舍五入

将数值四舍五入到指定小数位数。`$decimals=0` 时返回 `int`，否则返回 `float`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 待处理值 |
| `$decimals` | `int` | `0` | 保留的小数位数 |

**返回值**

- `int|float`：四舍五入后的值。

**示例**

```php
Numeric::roundTo(3.14159, 2);   // 3.14
Numeric::roundTo(2.5);          // 3
```

### `format($value, $decimals = 2, $decPoint = '.', $thousandsSep = ',')` — 千分位格式化

使用 `number_format` 格式化数值：千分位分组、指定小数位、可自定义小数点与千分位分隔符。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 待格式化值 |
| `$decimals` | `int` | `2` | 保留的小数位数 |
| `$decPoint` | `string` | `'.'` | 小数点符号 |
| `$thousandsSep` | `string` | `','` | 千分位分隔符 |

**返回值**

- `string`：格式化后的数字字符串。

**示例**

```php
Numeric::format(12345.678, 2);          // "12,345.68"
Numeric::format(12345.678, 2, ".", ""); // "12345.68"
```

### `percentage($value, $total, $decimals = 2)` — 百分比

计算 `$value` 占 `$total` 的百分比，四舍五入到指定小数位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 分子 |
| `$total` | `int\|float` | 无 | 分母 |
| `$decimals` | `int` | `2` | 保留的小数位数 |

**返回值**

- `float`：百分比数值（如 `12.5` 表示 12.5%）。

**示例**

```php
Numeric::percentage(25, 200);   // 12.5
```

### `fixedDecimals($value, $decimals = 2)` — 固定小数位

将数值四舍五入并保证输出固定小数位数（不足补零）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 待处理值 |
| `$decimals` | `int` | `2` | 固定的小数位数 |

**返回值**

- `string`：固定小数位数的字符串。

**示例**

```php
Numeric::fixedDecimals(3.5, 2);    // "3.50"
Numeric::fixedDecimals(3.14159, 2); // "3.14"
```

### `padDecimals($value, $decimals = 2)` — 小数补零

对数值的小数部分补零对齐到指定位数（不做四舍五入，仅补齐）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|float` | 无 | 待处理值 |
| `$decimals` | `int` | `2` | 目标小数位数 |

**返回值**

- `string`：补齐后的字符串。

**示例**

```php
Numeric::padDecimals(3.5, 2);   // "3.50"
```

### `bytesToHuman($bytes, $decimals = 2)` — 字节可读化

将字节数转换为人类可读的大小（B/KB/MB/GB/TB/PB），自动选择合适单位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$bytes` | `int\|float` | 无 | 字节数 |
| `$decimals` | `int` | `2` | 保留的小数位数 |

**返回值**

- `string`：如 `"1.00 MB"` 的可读大小。

**示例**

```php
Numeric::bytesToHuman(1048576);   // "1.00 MB"
Numeric::bytesToHuman(1536);      // "1.50 KB"
```
