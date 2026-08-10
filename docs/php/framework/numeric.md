# Numeric — 数值工具类

Numeric 提供数值转换、范围判断/钳制、四舍五入、格式化、百分比、字节可读化等一系列静态工具方法，全部无需实例化即可调用。

- **命名空间**: `kernel\Foundation\Data\Numeric`
- **文件位置**: `kernel/Foundation/Data/Numeric.php`
- **特点**: 全部为静态方法，PHP 7 兼容

## 转换

### `val($Target)`

将目标变量转为数值（int 或 float）。

转换规则：
- `null` → `0`
- 数值字符串 `"123"` → `123`（int）
- 数值字符串 `"3.14"` → `3.14`（float）
- 已有 int/float → 原样返回
- 非数值标量 → 通过 `intval`/`floatval` 兜底

| 参数 | 类型 | 说明 |
|------|------|------|
| `$Target` | `mixed` | 要转换的目标变量 |

返回值：`int|float`

```php
Numeric::val(null);     // 0
Numeric::val("123");    // 123
Numeric::val("3.14");   // 3.14
Numeric::val(5);        // 5
Numeric::val(2.5);      // 2.5
```

## 范围判断

### `isBetween($value, $min, $max)`

判断值是否位于指定范围 `[min, max]`（闭区间，边界值通过）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `int\|float` | 待判断的值 |
| `$min` | `int\|float` | 最小值 |
| `$max` | `int\|float` | 最大值 |

返回值：`bool`

```php
Numeric::isBetween(5, 1, 10);   // true
Numeric::isBetween(10, 1, 10);  // true（边界值通过）
Numeric::isBetween(0, 1, 10);   // false
```

### `clamp($value, $min, $max)`

将值钳制在 `[min, max]` 区间内。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `int\|float` | 原始值 |
| `$min` | `int\|float` | 最小值 |
| `$max` | `int\|float` | 最大值 |

返回值：`int|float` — 钳制后的值

```php
Numeric::clamp(5, 1, 10);   // 5（不变）
Numeric::clamp(0, 1, 10);   // 1（提升到下限）
Numeric::clamp(15, 1, 10);  // 10（压到上限）
```

## 精度

### `roundTo($value, $decimals = 0)`

四舍五入到指定小数位。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `float` | 要舍入的值 |
| `$decimals` | `int` | 小数位数，默认 0 |

返回值：`float`

```php
Numeric::roundTo(3.14159, 2);  // 3.14
Numeric::roundTo(3.14159);     // 3.0
Numeric::roundTo(3.5);         // 4.0
```

## 格式化

### `format($value, $decimals = 2, $decPoint = '.', $thousandsSep = ',')`

格式化数值（千分位分隔 + 指定小数位）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `float` | 数值 |
| `$decimals` | `int` | 小数位数，默认 2 |
| `$decPoint` | `string` | 小数点字符，默认 '.' |
| `$thousandsSep` | `string` | 千分位分隔符，默认 ',' |

返回值：`string`

```php
Numeric::format(1234567.89);          // "1,234,567.89"
Numeric::format(1234567, 0);          // "1,234,567"
Numeric::format(1234.5, 2, '.', '');  // "1234.50"
```

### `percentage($value, $total, $decimals = 2)`

计算百分比。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `int\|float` | 分子 |
| `$total` | `int\|float` | 分母 |
| `$decimals` | `int` | 小数位数，默认 2 |

返回值：`float` — 百分比数值，例如 `28.57`（表示 `28.57%`）

```php
Numeric::percentage(2, 7);    // 28.57
Numeric::percentage(1, 3, 0); // 33.0
Numeric::percentage(0, 0);    // 0.0（分母为 0 安全返回 0）
```

### `fixedDecimals($value, $decimals = 2)`

截断到指定小数位，不四舍五入，返回**数值**（float）。

直接舍弃超出的位数，不做进位处理。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `float` | 原始数值 |
| `$decimals` | `int` | 保留的小数位数，默认 2 |

返回值：`int|float` — 整数时返回 int，有小数部分时返回 float

```php
Numeric::fixedDecimals(3.14159, 2);  // 3.14（float）
Numeric::fixedDecimals(3.14999, 2);  // 3.14（float，截断非四舍五入）
Numeric::fixedDecimals(5);           // 5（int）
```

### `padDecimals($value, $decimals = 2)`

与 `fixedDecimals` 相同的截断逻辑，但不足补零，返回**字符串**。

适用于价格展示等需要固定位数的字符串场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `float` | 原始数值 |
| `$decimals` | `int` | 小数位数，默认 2 |

返回值：`string`

```php
Numeric::padDecimals(5);         // "5.00"
Numeric::padDecimals(3.1);       // "3.10"
Numeric::padDecimals(3.14159);   // "3.14"（截断，非四舍五入）
Numeric::padDecimals(3.14999);   // "3.14"（截断，非四舍五入）
Numeric::padDecimals(9.9, 3);    // "9.900"
```

### `bytesToHuman($bytes, $decimals = 2)`

将字节数转换为人类可读格式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$bytes` | `int\|float` | 字节数 |
| `$decimals` | `int` | 小数位数，默认 2 |

返回值：`string`

```php
Numeric::bytesToHuman(1024);        // "1.00 KB"
Numeric::bytesToHuman(1572864);     // "1.50 MB"
Numeric::bytesToHuman(1073741824);  // "1.00 GB"
Numeric::bytesToHuman(0);           // "0 B"
```
