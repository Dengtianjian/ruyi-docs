# Str — 字符串工具

- **文件位置**: `kernel/Foundation/Data/Str.php`
- **命名空间**: `kernel\Foundation\Data`
- **类型**: 纯静态工具类

字符串处理静态工具类：编解码、模板替换、随机生成、判断、截取、大小写转换、URL/Slug。全部通过 `Str::方法名(...)` 调用。

## 方法速查表

| 类别 | 方法 |
|------|------|
| 编解码 | `fromJsEscape`、`ucs2ToUtf8`、`fromXml` |
| 模板 | `replace` |
| 随机 | `random`、`randomInt`、`serialNo`、`uuid` |
| 判断 | `startsWith`、`endsWith`、`contains` |
| 截取/分割 | `before`、`after`、`limit`、`mask`、`length` |
| 转换 | `studly`、`camel`、`snake`、`slug` |

## 方法

### `fromJsEscape($str)` — 解码前端 `escape()` 编码

解码浏览器 `escape()`/`unescape()` 产生的编码。兼容 `%uXXXX`（UTF-16 编码）、`%XX`（单字节）、以及 HTML 实体（如 `&#20013;`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$str` | `string` | 无 | 前端传来的已编码字符串 |

**返回值**

- `string`：解码后的原始字符串。

**示例**

```php
Str::fromJsEscape("%u4E2D%u6587");   // "中文"
Str::fromJsEscape("%E4%B8%AD");      // "中"（UTF-8 十六进制）
Str::fromJsEscape("&#20013;&#25991;"); // "中文"
```

### `ucs2ToUtf8($data)` — UCS-2 转 UTF-8

把 UCS-2（UTF-16 宽字符）编码的字符串转换为 UTF-8。常用于处理 `\uXXXX` 形式的 Unicode 数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `string` | 无 | UCS-2 编码字符串 |

**返回值**

- `string`：转换后的 UTF-8 字符串。

**示例**

```php
Str::ucs2ToUtf8("\x4E\x2D\x65\x87");   // "中文"
```

### `fromXml($XMLString)` — 解析 XML 为数组

将 XML 字符串解析为数组结构。调用 PHP 内置 `simplexml_load_string`，将 `SimpleXMLElement` 递归转为数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$XMLString` | `string` | 无 | XML 字符串 |

**返回值**

- `array|false`：解析成功返回数组，解析失败返回 `false`。

**示例**

```php
$xml = "<root><name>张三</name><age>20</age></root>";
$arr = Str::fromXml($xml);
// ["name" => "张三", "age" => "20"]
```

### `replace($string, $params = [])` — 模板占位符替换

将字符串中的模板占位符替换为实际值。支持 `{key}` 与 `:key` 两种占位符形式，未匹配的占位符保持原样。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$string` | `string` | 无 | 含占位符的模板字符串 |
| `$params` | `array` | `[]` | 键 → 值的映射数组 |

**返回值**

- `string`：替换后的字符串。

**示例**

```php
Str::replace("您好，{name}，欢迎 {site}", ["name" => "张三", "site" => "本站"]);
// "您好，张三，欢迎 本站"
Str::replace("编号 :id", ["id" => 100]);
// "编号 100"
```

### `random($stringLength = 5, $chars = null, $secure = false)` — 生成随机字符串

从指定字符集（或默认字符集 `a-z0-9`）中随机取出指定数量的字符组成字符串。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$stringLength` | `int` | `5` | 生成的字符串长度 |
| `$chars` | `string\|null` | `null` | 候选字符集；为 `null` 时使用默认 `a-z0-9` |
| `$secure` | `bool` | `false` | 是否使用安全随机（`random_int`），为 `true` 时使用更安全的随机源 |

**返回值**

- `string`：随机字符串。

**示例**

```php
Str::random();                    // 例如 "a3x7k"
Str::random(16, "abcdef", true);  // 16 位，来自 "abcdef"，安全随机
```

### `randomInt($min = 0, $max = 100)` — 生成随机整数

在 `[$min, $max]` 闭区间内生成随机整数。使用 `random_int` 安全随机。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$min` | `int` | `0` | 区间下界（含） |
| `$max` | `int` | `100` | 区间上界（含） |

**返回值**

- `int`：随机整数。

**示例**

```php
Str::randomInt(10, 20);   // 10 到 20 之间的随机整数
```

### `serialNo($ExpectLength = 32, $Prefix = null, $Suffix = null, $dateFormat = 'YmdHis')` — 生成序列号

生成带时间前缀的序列号。由时间戳格式化 + 随机字符组成，可指定期望总长度、前缀、后缀与时间格式。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$ExpectLength` | `int` | `32` | 序列号期望总长度（时间前缀 + 随机字符） |
| `$Prefix` | `string\|null` | `null` | 可选前缀，拼在开头 |
| `$Suffix` | `string\|null` | `null` | 可选后缀，拼在结尾 |
| `$dateFormat` | `string` | `'YmdHis'` | 时间戳格式化格式（PHP `date()` 格式） |

**返回值**

- `string`：生成的序列号。

**示例**

```php
Str::serialNo();                       // 例如 "20260821103045aB3xK9zQ7vF1mT2w"
Str::serialNo(20, "SN-", "-X");        // 带前缀后缀
```

### `uuid()` — 生成 UUID

生成符合 RFC 4122 的 UUID v4（随机版本）。

**参数**

- 无。

**返回值**

- `string`：形如 `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` 的 UUID。

**示例**

```php
Str::uuid();
// 例如 "8f14e45f-ceea-4a38-9b1a-9d2f3c4a5b6c"
```

### `startsWith($haystack, $needle)` — 是否以指定串开头

判断字符串 `$haystack` 是否以 `$needle` 开头。`$needle` 为空字符串时返回 `true`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$haystack` | `string` | 无 | 被检查字符串 |
| `$needle` | `string` | 无 | 需要匹配的前缀 |

**返回值**

- `bool`：以 `$needle` 开头返回 `true`。

**示例**

```php
Str::startsWith("hello world", "hello");   // true
Str::startsWith("hello world", "world");   // false
```

### `endsWith($haystack, $needle)` — 是否以指定串结尾

判断字符串 `$haystack` 是否以 `$needle` 结尾。`$needle` 为空字符串时返回 `true`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$haystack` | `string` | 无 | 被检查字符串 |
| `$needle` | `string` | 无 | 需要匹配的后缀 |

**返回值**

- `bool`：以 `$needle` 结尾返回 `true`。

**示例**

```php
Str::endsWith("hello world", "world");   // true
Str::endsWith("hello world", "hello");   // false
```

### `contains($haystack, $needle)` — 是否包含指定串

判断字符串 `$haystack` 是否包含 `$needle`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$haystack` | `string` | 无 | 被检查字符串 |
| `$needle` | `string` | 无 | 需要查找的子串 |

**返回值**

- `bool`：包含返回 `true`。

**示例**

```php
Str::contains("hello world", "lo wo");   // true
Str::contains("hello world", "xyz");     // false
```

### `before($subject, $search)` — 取分隔符之前部分

返回 `$search` 第一次出现位置之前的部分。若 `$search` 未找到，返回完整字符串。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$subject` | `string` | 无 | 源字符串 |
| `$search` | `string` | 无 | 分隔符 |

**返回值**

- `string`：分隔符之前的部分。

**示例**

```php
Str::before("hello@world", "@");   // "hello"
Str::before("hello", "@");         // "hello"
```

### `after($subject, $search)` — 取分隔符之后部分

返回 `$search` 第一次出现位置之后的部分。若 `$search` 未找到，返回空字符串。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$subject` | `string` | 无 | 源字符串 |
| `$search` | `string` | 无 | 分隔符 |

**返回值**

- `string`：分隔符之后的部分。

**示例**

```php
Str::after("hello@world", "@");   // "world"
Str::after("hello", "@");         // ""
```

### `limit($value, $limit = 100, $end = '...')` — 按字符数截断

若字符串长度超过 `$limit`，截取前 `$limit` 个字符并追加 `$end`；否则原样返回。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |
| `$limit` | `int` | `100` | 最大保留字符数 |
| `$end` | `string` | `'...'` | 截断后追加的省略标记 |

**返回值**

- `string`：截断后的字符串。

**示例**

```php
Str::limit("这是一个很长的字符串内容", 6, "...");
// "这是一个很长..."
Str::limit("short", 100);   // "short"
```

### `mask($value, $character = '*', $start = 3, $length = 4)` — 字符串打码

将字符串从 `$start`（从 0 起）位置开始，连续 `$length` 个字符替换为 `$character`。常用于隐藏手机号、身份证中间位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |
| `$character` | `string` | `'*'` | 打码字符 |
| `$start` | `int` | `3` | 起始替换位置（从 0 起） |
| `$length` | `int` | `4` | 连续替换的字符数 |

**返回值**

- `string`：打码后的字符串。

**示例**

```php
Str::mask("13812345678", "*", 3, 4);   // "138****5678"
```

### `length($value)` — 获取字符串长度

获取字符串的字符数（UTF-8 感知，中文按字符计数）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |

**返回值**

- `int`：字符串字符长度。

**示例**

```php
Str::length("hello");   // 5
Str::length("中文");    // 2
```

### `studly($value)` — 转大驼峰

将字符串转换为大驼峰（StudlyCase），单词首字母大写并去掉分隔符，如 `user_id` → `UserId`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |

**返回值**

- `string`：大驼峰形式。

**示例**

```php
Str::studly("user_id");   // "UserId"
Str::studly("foo-bar");   // "FooBar"
```

### `camel($value)` — 转小驼峰

将字符串转换为小驼峰（camelCase），首单词小写、后续单词首字母大写，如 `user_id` → `userId`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |

**返回值**

- `string`：小驼峰形式。

**示例**

```php
Str::camel("user_id");   // "userId"
```

### `snake($value, $delimiter = '_')` — 转蛇形

将字符串转换为蛇形（snake_case），各单词间以 `$delimiter` 分隔，如 `UserId` → `user_id`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |
| `$delimiter` | `string` | `'_'` | 分隔符，可自定义为 `-` 等 |

**返回值**

- `string`：蛇形形式。

**示例**

```php
Str::snake("UserId");              // "user_id"
Str::snake("UserId", "-");         // "user-id"
```

### `slug($value, $separator = '-')` — 生成 URL Slug

将字符串转换为 URL 友好的 slug：转为小写、去除非字母数字字符、单词间以 `$separator` 连接。适用于生成文章别名、URL 路径。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 源字符串 |
| `$separator` | `string` | `'-'` | 单词分隔符 |

**返回值**

- `string`：slug 字符串。

**示例**

```php
Str::slug("Hello World!");        // "hello-world"
Str::slug("Laravel Framework", "_");  // "laravel_framework"
```

## 私有辅助方法

| 方法 | 说明 |
|------|------|
| `_simpleXmlToArray($xml)` | 将 `SimpleXMLElement` 递归转为数组（`fromXml()` 内部调用） |
