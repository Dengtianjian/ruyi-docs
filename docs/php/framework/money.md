# Money — 货币工具类

Money 提供元/分互转、折扣、税费、中文大写等货币相关静态方法，全部无需实例化即可调用。

- **命名空间**: `kernel\Foundation\Data\Money`
- **文件位置**: `kernel/Foundation/Data/Money.php`
- **特点**: 全部为静态方法，计算类方法不四舍五入（截断），PHP 7 兼容
- **单位约定**: 除 `fenToYuan` 入参为分外，其余方法出入口均以**元**为单位

## 转换

### `fenToYuan($fen)`

分转元。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fen` | `int\|float` | 金额（分） |

返回值：`float` — 金额（元）

```php
Money::fenToYuan(123);    // 1.23
Money::fenToYuan(0);      // 0.0
Money::fenToYuan(10050);  // 100.5
```

### `yuanToFen($yuan)`

元转分，不四舍五入。超出 2 位小数的部分直接截断舍弃。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$yuan` | `int\|float` | 金额（元） |

返回值：`int` — 金额（分）

```php
Money::yuanToFen(1.23);    // 123
Money::yuanToFen(1.239);   // 123（截断，非四舍五入）
Money::yuanToFen(0.5);     // 50
Money::yuanToFen(100);     // 10000
```

### `yuan($yuan)`

元转显示字符串。输出带 ¥ 符号、固定 2 位小数的字符串，适合直接渲染到页面。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$yuan` | `int\|float` | 金额（元） |

返回值：`string` — 如 `"¥1.23"`

```php
Money::yuan(1.23);   // "¥1.23"
Money::yuan(0);      // "¥0.00"
Money::yuan(100.5);  // "¥100.50"
```

## 计算

### `discount($yuan, $percent)`

折扣计算。按百分比计算折后金额，截断到分（不四舍五入）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$yuan` | `int\|float` | 原价（元） |
| `$percent` | `int\|float` | 折扣，如 8.5 表示 8.5 折 |

返回值：`float` — 折后价（元）

```php
Money::discount(9.99, 8.5);  // 8.49（9.99 * 8.5 / 10 = 849.15分 → 截断 849分 → 8.49元）
Money::discount(10, 7);      // 7.0
Money::discount(1, 0);       // 0.0
```

### `tax($yuan, $rate)`

税费计算。按税率计算税费，截断到分（不四舍五入）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$yuan` | `int\|float` | 金额（元） |
| `$rate` | `int\|float` | 税率百分比，如 6 表示 6%，13 表示 13% |

返回值：`float` — 税费（元）

```php
Money::tax(100, 6);     // 6.0
Money::tax(9.99, 6);    // 0.59（999 * 6 / 100 = 59.94分 → 截断 59分 → 0.59元）
Money::tax(50, 13);     // 6.5
```

## 格式化

### `toChinese($yuan)`

将元为单位的金额转为财务中文大写，符合发票、合同等正式场景。

**规则：**
- 元后无角分 → 加"整"
- 有角无分 → 末尾不补
- 角为零分非零 → 角位补"零"

| 参数 | 类型 | 说明 |
|------|------|------|
| `$yuan` | `int\|float` | 金额（元） |

返回值：`string` — 中文大写金额

```php
Money::toChinese(0);              // "零元整"
Money::toChinese(1.23);           // "壹元贰角叁分"
Money::toChinese(12);             // "壹拾贰元整"
Money::toChinese(12.03);          // "壹拾贰元零叁分"
Money::toChinese(12.3);           // "壹拾贰元叁角"
Money::toChinese(1012.03);        // "壹仟零壹拾贰元零叁分"
```
