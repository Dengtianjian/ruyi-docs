# Mutator — 数据突变器

Mutator 提供灵活的数据类型转换功能，支持基本类型转换、管道链式处理、时间处理、字符串清洗、数值处理、编码转换、数组操作等 25+ 种类型转换操作，以及复杂数组结构的批量转换。

- **命名空间**: `kernel\Foundation\Data`
- **文件位置**: `kernel/Foundation/Data/Mutator.php`

> **注意**：Mutator 是 `DataConversion` 的升级替代品。`DataConversion` 已废弃，请使用 Mutator。

## 快速开始

```php
use kernel\Foundation\Data\Mutator;

// 单个值转换
(new Mutator)->data('123')->int()->convert();                              // 123
(new Mutator)->data(456)->string()->convert();                             // "456"

// convert() 直接传类型
(new Mutator)->data('2024-01-01')->convert('timestamp');                   // 1704067200
(new Mutator)->data('    hello   ')->convert('trim');                      // "hello"
```

## 构造函数

### `__construct($types = null, $completion = false, $removeNotExistRuleKey = false)`

构建数据突变器实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | `array\|string\|null` | 转换规则，支持字符串类型、管道链式、关联数组映射等 |
| `$completion` | `bool` | 是否补全规则中存在但数据中不存在的键（补 `null`） |
| `$removeNotExistRuleKey` | `bool` | 是否剔除数据中存在但规则中不存在的键 |

```php
// 构造时指定规则
$m = new Mutator("int");
$m->data("123")->convert();  // 123

// 构造后通过 fluent 方法或 convert() 入参指定
$m = new Mutator();
$m->data("123")->int()->convert();  // 123
```

## Fluent 方法

通过链式调用设定目标类型：

| 方法 | 类型 | 说明 |
|------|------|------|
| `string()` | string | 转为字符串 |
| `int()` | integer | 转为整数 |
| `bool()` | boolean | 转为布尔值 |
| `array()` | array | 转为数组 |
| `object()` | object | 转为对象 |
| `double()` | float | 转为浮点数 |
| `timestamp()` | timestamp | 转为 Unix 秒级时间戳 |
| `timestamp_m()` | timestamp_m | 转为 Unix 毫秒级时间戳 |
| `date()` | date | 转为日期字符串（Y-m-d） |
| `datetime()` | datetime | 转为日期时间字符串（Y-m-d H:i:s） |
| `mask()` | mask | 密文遮盖（默认 80%） |
| `trim()` | trim | 去除首尾空白字符 |
| `lower()` | lower | 转为小写 |
| `upper()` | upper | 转为大写 |
| `number()` | number | 提取数字字符 |
| `json()` | json | 数组/对象 → JSON 字符串 |
| `json_decode()` | json_decode | JSON 字符串 → 关联数组 |
| `abs()` | abs | 取绝对值 |
| `strip_tags()` | strip_tags | 去除 HTML/PHP 标签 |
| `implode()` | implode | 数组拼接为字符串 |
| `default()` | default | 空值兜底 |
| `pluck()` | pluck | 提取数组列表中指定键的值 |
| `urlencode()` | urlencode | URL 编码 |
| `urldecode()` | urldecode | URL 解码 |
| `htmlspecialchars()` | htmlspecialchars | HTML 实体转义 |
| `round()` | round | 四舍五入 |
| `number_format()` | number_format | 千分位格式化 |
| `base64()` | base64 | Base64 编码 |
| `base64_decode()` | base64_decode | Base64 解码 |
| `truncate()` | truncate | 字符串截断 |

## 核心方法

### `data($data)`

设置要转换的数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 待转换的数据 |

返回值：`Mutator`

### `convert($types = null)`

执行类型转换。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | `array\|string\|null` | 覆盖构造时或 fluent 方法设定的转换规则 |

返回值：`mixed` — 转换后的数据

```php
// 覆盖已有规则
(new Mutator)->data('123')->string()->convert('int');  // 123（int 覆盖了 string）

// 传参指定类型
(new Mutator)->data('    hello   ')->convert('trim');   // "hello"
```

## 支持的类型一览

### 基本类型

| 类型字符串 | PHP 类型 | 说明 |
|-----------|----------|------|
| `"int"` / `"integer"` | integer | 整数 |
| `"string"` | string | 字符串 |
| `"float"` / `"double"` | float | 浮点数 |
| `"bool"` / `"boolean"` | boolean | 布尔值 |
| `"array"` | array | 数组 |
| `"object"` | object | 对象 |
| `"null"` | null | 空值 |
| `"any"` | 自动识别 | 数值字符串自动转为 int 或 float |

### 时间处理

| 类型字符串 | 说明 | 示例 |
|-----------|------|------|
| `"timestamp"` | 转为 Unix 秒级时间戳 | `'2024-01-01'` → `1704067200` |
| `"timestamp_m"` | 转为 Unix 毫秒级时间戳 | `'2024-01-01'` → `1704067200000` |
| `"date"` | 转为日期字符串（默认 Y-m-d） | `1704067200` → `"2024-01-01"` |
| `"datetime"` | 转为日期时间字符串（默认 Y-m-d H:i:s） | `1704067200` → `"2024-01-01 00:00:00"` |
| `"date:Y年m月d日"` | 自定义日期格式 | `'2024-01-01'` → `"2024年01月01日"` |
| `"datetime:Y-m-d H:i"` | 自定义日期时间格式 | `'2024-01-01'` → `"2024-01-01 00:00"` |

```php
// 时间戳转换
(new Mutator)->data('2024-01-01')->timestamp()->convert();      // 1704067200
(new Mutator)->data('2024-01-01')->timestamp_m()->convert();    // 1704067200000

// 日期转换
(new Mutator)->data(1704067200)->date()->convert();             // "2024-01-01"
(new Mutator)->data('2024-01-01 12:30:00')->date()->convert();  // "2024-01-01"

// 自定义格式
(new Mutator)->data('2024-01-01')->convert('date:Y年m月d日');    // "2024年01月01日"
```

### 字符串清洗

| 类型字符串 | 说明 | 示例 |
|-----------|------|------|
| `"trim"` | 去除首尾空白字符 | `"  hello  "` → `"hello"` |
| `"lower"` | 转为小写 | `"Hello"` → `"hello"` |
| `"upper"` | 转为大写 | `"hello"` → `"HELLO"` |
| `"strip_tags"` | 去除 HTML/PHP 标签 | `"<p>text</p>"` → `"text"` |
| `"strip_tags:a,b"` | 去除标签但保留指定标签 | `"<p><b>hi</b></p>"` → `"<b>hi</b>"` |
| `"htmlspecialchars"` | HTML 实体转义（防 XSS） | `"<script>"` → `"&lt;script&gt;"` |

### 数值处理

| 类型字符串 | 说明 | 示例 |
|-----------|------|------|
| `"number"` | 提取数字字符 | `"¥99.99元"` → `"99.99"` |
| `"abs"` | 取绝对值 | `-123` → `123` |
| `"round"` | 四舍五入（默认 0 位） | `3.14159` → `3` |
| `"round:2"` | 保留指定位小数 | `3.14159` → `3.14` |
| `"number_format"` | 千分位格式化（默认 2 位） | `1234567.89` → `"1,234,567.89"` |
| `"number_format:0"` | 千分位无小数 | `1234567` → `"1,234,567"` |

### JSON & 编码

| 类型字符串 | 说明 | 示例 |
|-----------|------|------|
| `"json"` | 数组/对象 → JSON 字符串 | `['a' => 1]` → `'{"a":1}'` |
| `"json_decode"` | JSON 字符串 → 关联数组 | `'{"a":1}'` → `['a' => 1]` |
| `"urlencode"` | URL 编码 | `"hello world"` → `"hello+world"` |
| `"urldecode"` | URL 解码 | `"hello+world"` → `"hello world"` |
| `"base64"` | Base64 编码 | `"hello"` → `"aGVsbG8="` |
| `"base64_decode"` | Base64 解码 | `"aGVsbG8="` → `"hello"` |

### 数组操作 & 字符串处理

| 类型字符串 | 说明 | 默认值 | 示例 |
|-----------|------|--------|------|
| `"pluck:key"` | 提取数组列表中指定键的值 | — | `[['id'=>1],['id'=>2]` → `[1,2]` |
| `"implode"` | 数组拼接为字符串 | 逗号分隔 | `[1,2,3]` → `"1,2,3"` |
| `"implode:\|"` | 指定分隔符拼接 | — | `[1,2,3]` → `"1\|2\|3"` |
| `"implode: "` | 空格分隔拼接 | — | `['a','b']` → `"a b"` |
| `"mask"` | 密文遮盖 | 80% | `"13288364266"` → `"1*********6"` |
| `"mask:4"` | 指定遮盖位数 | — | `"13288364266"` → `"132****4266"` |
| `"truncate:10"` | 截断到指定字符数 | 后缀 `"..."` | `"hello world"` → `"hello w..."` |
| `"truncate:10:→"` | 截断+自定义后缀 | — | `"hello world"` → `"hello w→"` |
| `"default:匿名"` | 空值/null 时用默认值 | — | `null` → `"匿名"` |

## 管道链式转换

使用 `|` 分隔多步类型，数据将按序串行处理：

```php
// 字符串管道
(new Mutator)->data('13288364266')->convert('string|mask:3');     // "132****4266"
(new Mutator)->data('123.99')->convert('float|int|string');        // "123"

// 数组管道（与字符串等价）
(new Mutator)->data('123.99')->convert(['float', 'int', 'string']); // "123"
```

管道中每一步的输出作为下一步的输入，类型语法与单步完全一致。

## 数组映射

### 基本映射

```php
$data = ['name' => 'admin', 'age' => '18', 'active' => '1'];

(new Mutator([
    'name' => 'string',
    'age' => 'int',
    'active' => 'bool',
]))->data($data)->convert();
// => ['name' => 'admin', 'age' => 18, 'active' => true]
```

### 点号路径

支持通过点号路径对深层嵌套数据进行转换：

```php
$data = ['user' => ['profile' => ['id' => '9910', 'name' => 'Tom']]];

(new Mutator([
    'user.profile.id' => 'int',
    'user.profile.name' => 'trim',
]))->data($data)->convert();
// => ['user' => ['profile' => ['id' => 9910, 'name' => 'Tom']]]
```

### 通配符路径

使用 `*` 对索引数组的每个元素执行相同转换：

```php
$data = ['items' => [
    ['price' => '9.99', 'qty' => '2'],
    ['price' => '12.50', 'qty' => '1'],
]];

(new Mutator([
    'items.*.price' => 'double',
    'items.*.qty' => 'int',
]))->data($data)->convert();
// => ['items' => [['price' => 9.99, 'qty' => 2], ['price' => 12.50, 'qty' => 1]]]
```

### 展开标记 `"..."`

`"..."` 保留所有原始字段，仅对显式定义的字段做转换：

```php
$data = ['id' => 1, 'name' => 'Tom', 'age' => '25', 'extra' => 'keep'];

// 保留所有字段，但对 age 做 int 转换
(new Mutator([
    '...',
    'age' => 'int',
]))->data($data)->convert();
// => ['id' => 1, 'name' => 'Tom', 'age' => 25, 'extra' => 'keep']
```

排除特定字段：

```php
// 保留所有字段，但排除 password 和 secret
(new Mutator([
    '...|password,secret',
    'name' => 'string',
]))->data(['name' => 'Tom', 'password' => 'xxx', 'secret' => 'yyy'])
  ->convert();
// => ['name' => 'Tom']
```

### 数值键（原样透传）

数值键表示保留该字段但不做类型转换：

```php
(new Mutator([
    'username',
    'profile',
]))->data(['username' => 'admin', 'profile' => '...', 'password' => 'xxx'])
  ->convert();
// => ['username' => 'admin', 'profile' => '...']
// password 被自动剔除（removeNotExistRuleKey 生效时）
```

### 子规则（嵌套数组）

```php
$data = ['author' => ['id' => '5', 'name' => ' Tom ']];

(new Mutator([
    'author' => [
        'id' => 'int',
        'name' => 'trim',
    ]
]))->data($data)->convert();
// => ['author' => ['id' => 5, 'name' => 'Tom']]
```

## 分隔符语法

按分隔符拆分字符串后逐元素转换：

```php
// "元素类型/分隔符"
(new Mutator)->data('1,2,3')->convert('int/,');    // [1, 2, 3]
(new Mutator)->data('a|b|c')->convert('string/|');  // ['a', 'b', 'c']

// 分隔符缺省时默认使用逗号
(new Mutator)->data('1,2,3')->convert('int/');      // [1, 2, 3]
```

## array\<type\> 语法

对索引数组逐元素指定类型：

```php
(new Mutator)->data(['1', '2', '3'])->convert('array<int>');    // [1, 2, 3]
(new Mutator)->data(['1.5', '2.7'])->convert('array<float>');    // [1.5, 2.7]
```

## Mutator 实例管道

将 Mutator 实例作为子规则的值，实现对子数据的管道处理：

```php
$data = [
    'name' => ' admin ',
    'phone' => '13288364266',
];

(new Mutator([
    'name' => (new Mutator)->trim()->string(),
    'phone' => (new Mutator)->string()->mask(),
]))->data($data)->convert();
// => ['name' => 'admin', 'phone' => '1*********6']
```

索引数组自动遍历：

```php
$data = ['prices' => ['9.99', '12.50', '5.00']];

(new Mutator([
    'prices' => (new Mutator)->double(),
]))->data($data)->convert();
// => ['prices' => [9.99, 12.50, 5.0]]
```

## Callable 自定义转换

```php
(new Mutator([
    'name' => 'string',
    'avatar' => function ($value, $allData = null) {
        return $value ?: 'https://default.com/avatar.png';
    },
]))->data(['name' => 'Tom', 'avatar' => ''])->convert();
// => ['name' => 'Tom', 'avatar' => 'https://default.com/avatar.png']
```

## 补全与剔除

```php
$data = ['name' => '张三', 'age' => 25, 'extra' => '多余内容'];

// 剔除规则中没有的键
$result = (new Mutator(
    ['name' => 'string', 'age' => 'int'],
    false,  // 不补全
    true    // 剔除多余键
))->data($data)->convert();
// ['name' => '张三', 'age' => 25]  ← "extra" 被移除

// 补全规则中有但数据中缺失的键
$result = (new Mutator(
    ['name' => 'string', 'gender' => 'string'],
    true    // 补全
))->data(['name' => '张三'])->convert();
// ['name' => '张三', 'gender' => null]
```

## 在控制器中使用

Mutator 与 Controller 深度集成，通过 `$requestBodySerializes`、`$requestQuerySerializes` 和 `$responseSerializes` 属性自动完成类型转换：

```php
class MyController extends Controller
{
    // 请求体自动类型转换
    protected $requestBodySerializes = [
        'username' => 'string',
        'age' => 'int',
        'tags' => 'string/,',
    ];

    public function data()
    {
        $body = $this->requestBody->all();
        // age 已经是 int 类型，tags 已转换为数组
    }
}
```

> 更多细节请参阅 [Controller](./controller.md)。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 集成 | 请求参数自动类型转换 |
| [Serializer](./serializer.md) | 配合 | 序列化时也用 Mutator 做类型转换 |
