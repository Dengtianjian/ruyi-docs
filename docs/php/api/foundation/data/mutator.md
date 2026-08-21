# Mutator — 数据转换器

- **文件位置**: `kernel/Foundation/Data/Mutator.php`
- **命名空间**: `kernel\Foundation\Data`
- **是否可继承**: 是

数据转换器，通过链式方法声明类型/管道规则，对数据执行类型转换与清洗。支持标量类型、嵌套结构、点号路径、通配符、多步管道。是 `Controller::$requestQuerySerializes` / `$requestBodySerializes` 的底层实现。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$data` | `mixed` | `null` | protected | 待转换的数据（通过 `data()` 绑定） |
| `$rules` | `array` | `[]` | protected | 当前累积的转换规则（按点号路径） |
| `$completion` | `bool` | `false` | protected | 是否自动补全缺失键 |
| `$removeNotExistRuleKey` | `bool` | `false` | protected | 是否移除规则外多余键 |

## 构造

### `__construct($types = null, bool $completion = false, bool $removeNotExistRuleKey = false)` — 构建转换器

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$types` | `array\|string\|null` | `null` | 初始规则数组（键为点号路径，值为规则/类型字符串），或一个规则字符串 |
| `$completion` | `bool` | `false` | 是否自动补全数据中缺失的规则键（为 `true` 时按规则补默认值） |
| `$removeNotExistRuleKey` | `bool` | `false` | 是否移除数据中规则未声明的多余键 |

**返回值**

- 无。

## 使用流程

1. `new Mutator($rules)` 或 `new Mutator()` 后通过链式方法添加规则
2. `->data($data)` 绑定待转换数据
3. `->convert()` 执行转换并返回结果

**示例**

```php
use kernel\Foundation\Data\Mutator;

// 规则数组方式
$mutator = new Mutator(["name" => "string", "age" => "int"]);
$data = $mutator->data(["name" => "张三", "age" => "25"])->convert();

// 链式管道方式
$data = (new Mutator())->data(["name" => "  ZHANG SAN  "])->trim()->lower()->convert();
// "zhang san"
```

## 方法速查表

| 类别 | 方法 |
|------|------|
| 绑定 | `data($data)` |
| 标量类型 | `string()` / `int()` / `double()` / `bool()` |
| 复合类型 | `array()` / `object()` |
| 时间类型 | `timestamp()` / `timestamp_m()` / `date()` / `datetime()` |
| 清洗 | `mask()` / `trim()` / `lower()` / `upper()` / `abs()` |
| 编解码 | `number()` / `json()` / `json_decode()` / `urlencode()` / `urldecode()` |
| 安全 | `strip_tags()` / `htmlspecialchars()` / `base64()` / `base64_decode()` |
| 处理 | `implode()` / `pluck()` / `default()` / `round()` / `number_format()` / `truncate()` |
| 终止 | `convert($types = null)` |

## 方法

### `data($data)` — 绑定数据

绑定待转换的数据。之后可链式追加转换规则。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 待转换数据 |

**返回值**

- `$this`：支持链式调用。

### `string()` / `int()` / `double()` / `bool()` / `array()` / `object()` — 类型转换

追加对应类型转换规则。`int` 走 `(int)` 强转；`double` 走 `(float)`；`bool` 兼容字符串 `"true"`/`"false"`；`array` 将字符串按 `,` 拆；`object` 走 `(object)` 强转。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data(123)->string()->convert();          // "123"
(new Mutator())->data("42")->int()->convert();            // 42
(new Mutator())->data("true")->bool()->convert();         // true
(new Mutator())->data("a,b")->array()->convert();         // ["a", "b"]
(new Mutator())->data(["a" => 1])->object()->convert();  // (object)["a" => 1]
```

### `timestamp()` / `timestamp_m()` / `date()` / `datetime()` — 时间类型

| 方法 | 说明 |
|------|------|
| `timestamp()` | 将日期/时间字符串或值转为秒级时间戳 |
| `timestamp_m()` | 将日期/时间字符串或值转为毫秒级时间戳 |
| `date()` | 将时间戳/时间值转为日期字符串（`Y-m-d`） |
| `datetime()` | 将时间戳/时间值转为日期时间字符串（`Y-m-d H:i:s`） |

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("2026-08-21 10:00:00")->timestamp()->convert();   // 秒级时间戳
(new Mutator())->data("2026-08-21 10:00:00")->timestamp_m()->convert(); // 毫秒级时间戳
(new Mutator())->data(time())->date()->convert();         // "2026-08-21"
(new Mutator())->data(time())->datetime()->convert();     // "2026-08-21 10:30:45"
```

### `mask()` — 打码

对数据打码，隐藏中间部分（如手机号 `138****5678`）。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("13812345678")->mask()->convert();   // "138****5678"
```

### `trim()` / `lower()` / `upper()` — 字符串清洗

| 方法 | 说明 |
|------|------|
| `trim()` | 去除字符串首尾空白 |
| `lower()` | 转小写 |
| `upper()` | 转大写 |

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("  hi  ")->trim()->convert();    // "hi"
(new Mutator())->data("HELLO")->lower()->convert();    // "hello"
(new Mutator())->data("hello")->upper()->convert();    // "HELLO"
```

### `abs()` — 取绝对值

对数值取绝对值。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data(-5)->abs()->convert();   // 5
```

### `number()` — 转数字

将字符串转为数字（去除千分位逗号等）。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("1,234.56")->number()->convert();   // 1234.56
```

### `json()` / `json_decode()` — JSON 编解码

| 方法 | 说明 |
|------|------|
| `json()` | 将数据编码为 JSON 字符串 |
| `json_decode()` | 将 JSON 字符串解码为数组/对象 |

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data(["a" => 1])->json()->convert();          // '{"a":1}'
(new Mutator())->data('{"a":1}')->json_decode()->convert();    // ["a" => 1]
```

### `urlencode()` / `urldecode()` — URL 编解码

| 方法 | 说明 |
|------|------|
| `urlencode()` | 对字符串做 URL 编码 |
| `urldecode()` | 对字符串做 URL 解码 |

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("a b&c")->urlencode()->convert();   // "a+b%26c"
(new Mutator())->data("a+b%26c")->urldecode()->convert(); // "a b&c"
```

### `strip_tags()` / `htmlspecialchars()` — 安全处理

| 方法 | 说明 |
|------|------|
| `strip_tags()` | 去除字符串中的 HTML/PHP 标签 |
| `htmlspecialchars()` | 对字符串做 HTML 实体转义（防 XSS） |

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("<p>hi</p>")->strip_tags()->convert();          // "hi"
(new Mutator())->data("<script>")->htmlspecialchars()->convert();     // "&lt;script&gt;"
```

### `base64()` / `base64_decode()` — Base64 编解码

| 方法 | 说明 |
|------|------|
| `base64()` | 对字符串做 Base64 编码 |
| `base64_decode()` | 对字符串做 Base64 解码 |

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("hello")->base64()->convert();         // "aGVsbG8="
(new Mutator())->data("aGVsbG8=")->base64_decode()->convert(); // "hello"
```

### `implode()` — 数组拼接为字符串

将数组拼接为字符串（用 `,` 分隔符连接各元素）。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data(["a", "b", "c"])->implode()->convert();   // "a,b,c"
```

### `pluck()` — 提取字段

从数组/对象集合中提取指定字段（支持点号路径）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 字段名（点号路径） |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
$users = [["name" => "张三"], ["name" => "李四"]];
(new Mutator())->data($users)->pluck("name")->convert();   // ["张三", "李四"]
```

### `default()` — 默认值

数据为空/缺失时填充默认值。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `mixed` | 无 | 兜底默认值 |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("")->default("未知")->convert();   // "未知"
```

### `round()` — 四舍五入

对数值四舍五入到指定位数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$decimals` | `int` | 无 | 保留的小数位数 |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data(3.14159)->round(2)->convert();   // 3.14
```

### `number_format()` — 数字格式化

对数值做千分位/小数格式化（千分位 + 两位小数）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$decimals` | `int` | 无 | 保留的小数位数 |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data(12345.678)->number_format(2)->convert();   // "12,345.68"
```

### `truncate()` — 截断字符串

按字符数截断字符串（默认按字符数，`mb_substr` 截断）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$length` | `int` | 无 | 截断长度 |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
(new Mutator())->data("abcdefghij")->truncate(5)->convert();   // "abcde"
```

### `convert($types = null)` — 执行转换

执行累积的转换规则并返回结果。可在此传入覆盖规则。链式规则的终点。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$types` | `array\|string\|null` | `null` | 可选的覆盖/补充规则 |

**返回值**

- `mixed`：转换后的数据。

**示例**

```php
$result = (new Mutator())
    ->data(["name" => "  张三  ", "age" => "25"])
    ->string()
    ->trim()
    ->convert();
// ["name" => "张三", "age" => "25"]
```
