# Str — 字符串工具类

Str 提供字符串编解码、格式化、截取、大小写转换、随机生成、XML 解析等一系列静态工具方法，全部无需实例化即可调用。

- **命名空间**: `kernel\Foundation\Data\Str`
- **文件位置**: `kernel/Foundation/Data/Str.php`
- **特点**: 全部为静态方法，PHP 7 兼容

## 编解码

### `fromJsEscape($str)`

对前端通过 `escape()` 编码的字符进行解码。

支持以下编码格式：

- `%uXXXX` — JavaScript `escape()` 的 Unicode 编码
- `%XX` — 标准 URL 编码（ASCII 字符）
- `&#xXXXX;` — HTML 十六进制字符实体
- `&#NNN;` — HTML 十进制字符实体

| 参数 | 类型 | 说明 |
|------|------|------|
| `$str` | `string` | 要解码的字符串 |

返回值：`string`

```php
Str::fromJsEscape("%u4E2D%u6587");  // "中文"
Str::fromJsEscape("%20%40");        // " @"
```

### `ucs2ToUtf8($data)`

UCS-2 编码转换为 UTF-8。

优先使用 `mb_convert_encoding`，不可用时 fallback 到 `iconv`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `string` | UCS-2 编码的原始字节 |

返回值：`string|false` — 转换后的 UTF-8 字符串，失败返回 `false`

```php
Str::ucs2ToUtf8(pack("H4", "4E2D"));  // "中"
Str::ucs2ToUtf8(pack("n", 20013));    // "中"（十进制码点）
```

### `fromXml($XMLString)`

XML 字符串转数组，保留 XML 属性（以 `@attr` 键存储）。

递归解析 XML 节点树，自动处理：
- CDATA 内容
- 重复子元素（合并为数组）
- 混合内容节点（文本存储为 `#text` 键）

| 参数 | 类型 | 说明 |
|------|------|------|
| `$XMLString` | `string` | XML 字符串 |

返回值：`array|false` — 解析成功返回数组，失败返回 `false`

```php
$xml = '<user id="1"><name>Alice</name><role>admin</role></user>';
Str::fromXml($xml);
// ['@id' => '1', 'name' => 'Alice', 'role' => 'admin']

// 重复子元素自动合并为数组
$xml = '<list><item>A</item><item>B</item></list>';
Str::fromXml($xml);
// ['item' => ['A', 'B']]
```

## 模板替换

### `replace($string, $params = [])`

使用参数数组替换字符串中的 `{key}` 占位符。支持两种模式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$string` | `string` | 包含 `{key}` 占位符的模板字符串 |
| `$params` | `array` | 关联数组按 key 匹配，索引数组按顺序匹配 |

返回值：`string`

```php
// 关联数组模式（命名参数）
Str::replace("Hello {name}, you are {age}", [
  "name" => "Alice",
  "age"  => 18
]);
// "Hello Alice, you are 18"

// 索引数组模式（向后兼容）
Str::replace("Hello {0}, you are {1}", ["Alice", "18"]);
// "Hello Alice, you are 18"
```

## 随机生成

### `random($stringLength = 5, $chars = null, $secure = false)`

生成随机字符串。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$stringLength` | `int` | `5` | 生成的字符串长度 |
| `$chars` | `string\|null` | `null` | 自定义字符集，`null` 时使用 `[a-zA-Z0-9]` |
| `$secure` | `bool` | `false` | 是否使用密码学安全随机数 |

返回值：`string`

```php
Str::random(8);                        // "aB3xY9kL"
Str::random(6, '0123456789');          // "392817"（纯数字验证码）
Str::random(32, null, true);           // API token（密码学安全）
```

### `randomInt($min = 0, $max = 100)`

生成随机整数。PHP 7.0+ 优先使用 `random_int`，否则 fallback 到 `mt_rand`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$min` | `int` | `0` | 最小值 |
| `$max` | `int` | `100` | 最大值 |

返回值：`int`

```php
Str::randomInt(1, 100);        // 例如 42
Str::randomInt(1000, 9999);    // 例如 3847（4 位验证码）
```

### `serialNo($ExpectLength = 32, $Prefix = null, $Suffix = null, $dateFormat = 'YmdHis')`

生成序列单号。格式：`{前缀}{日期时间}{随机数字填充}{后缀}`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$ExpectLength` | `int` | `32` | 期望的总长度（含前后缀） |
| `$Prefix` | `string\|int\|float\|null` | `null` | 前缀 |
| `$Suffix` | `string\|int\|float\|null` | `null` | 后缀 |
| `$dateFormat` | `string` | `YmdHis` | 日期格式 |

返回值：`string`

```php
Str::serialNo(32);                          // "20240810143022583917402659184732"
Str::serialNo(24, 'ORD');                   // "ORD20240810143022102849"
Str::serialNo(20, null, null, 'Ymd');       // "20240810192847593106"
```

### `uuid()`

生成符合 RFC 4122 标准的 UUID v4（随机生成）。

返回值：`string` — 格式为 `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

```php
Str::uuid();  // "550e8400-e29b-41d4-a716-446655440000"
```

## 判断

### `startsWith($haystack, $needle)`

检查字符串是否以指定子串开头。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$haystack` | `string` | 被检查的字符串 |
| `$needle` | `string` | 要查找的子串 |

返回值：`bool`

```php
Str::startsWith("Hello World", "Hello");  // true
Str::startsWith("/api/user", "/api");     // true
Str::startsWith("Hello", "abc");          // false
```

### `endsWith($haystack, $needle)`

检查字符串是否以指定子串结尾。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$haystack` | `string` | 被检查的字符串 |
| `$needle` | `string` | 要查找的子串 |

返回值：`bool`

```php
Str::endsWith("Hello World", "World");  // true
Str::endsWith("file.txt", ".txt");      // true
Str::endsWith("Hello", "abc");          // false
```

### `contains($haystack, $needle)`

检查字符串是否包含指定子串。为 PHP 7 项目提供 `str_contains` 兼容实现。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$haystack` | `string` | 被检查的字符串 |
| `$needle` | `string` | 要查找的子串 |

返回值：`bool`

```php
Str::contains("Hello World", "lo");        // true
Str::contains("application/json", "json"); // true
Str::contains("Hello", "xyz");             // false
```

## 截取

### `before($subject, $search)`

返回字符串中指定搜索值之前的部分。若搜索值不存在，返回原字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$subject` | `string` | 源字符串 |
| `$search` | `string` | 搜索值 |

返回值：`string`

```php
Str::before("video/mp4", "/");         // "video"
Str::before("hello@example.com", "@"); // "hello"
```

### `after($subject, $search)`

返回字符串中指定搜索值之后的部分。若搜索值不存在，返回原字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$subject` | `string` | 源字符串 |
| `$search` | `string` | 搜索值 |

返回值：`string`

```php
Str::after("video/mp4", "/");          // "mp4"
Str::after("hello@example.com", "@");  // "example.com"
```

### `limit($value, $limit = 100, $end = '...')`

截取字符串到指定长度，超出部分以指定字符结尾。多字节安全。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$value` | `string` | — | 要截取的字符串 |
| `$limit` | `int` | `100` | 最大字符数 |
| `$end` | `string` | `...` | 超出时追加的结尾字符 |

返回值：`string`

```php
Str::limit("Hello World", 5);              // "Hello..."
Str::limit("这是一段很长的中文文本", 5);     // "这是一段很..."
Str::limit("Short", 10);                   // "Short"（未超出不截取）
```

### `mask($value, $character = '*', $start = 3, $length = 4)`

用指定字符掩盖字符串中间部分，适用于手机号、邮箱等敏感数据的脱敏展示。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$value` | `string` | — | 原始字符串 |
| `$character` | `string` | `*` | 掩盖字符 |
| `$start` | `int` | `3` | 从第几位开始掩盖（0-based） |
| `$length` | `int\|null` | `4` | 掩盖长度，`null` 表示从 start 掩盖到末尾 |

返回值：`string`

```php
Str::mask("13812345678");            // "138****5678"（默认前3后4）
Str::mask("13812345678", '*', 3, 4); // "138****5678"
Str::mask("abcdef", '#', 2, null);   // "ab####"（从第3位掩盖到末尾）
```

## 长度

### `length($value)`

获取字符串长度（多字节安全）。优先使用 `mb_strlen` 正确处理中文等多字节字符。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `string` | 要计算长度的字符串 |

返回值：`int` — 字符数（非字节数）

```php
Str::length("Hello");  // 5
Str::length("中文");    // 2（而非 6 字节）
```

## 大小写转换

### `studly($value)`

将字符串转换为 StudlyCase（大驼峰，首字母大写）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `string` | 要转换的字符串 |

返回值：`string`

```php
Str::studly("foo_bar_baz");   // "FooBarBaz"
Str::studly("user-profile");  // "UserProfile"
```

### `camel($value)`

将字符串转换为 camelCase（小驼峰，首字母小写）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `string` | 要转换的字符串 |

返回值：`string`

```php
Str::camel("foo_bar_baz");  // "fooBarBaz"
Str::camel("FooBar");       // "fooBar"
```

### `snake($value, $delimiter = '_')`

将字符串转换为 snake_case（分隔符连接，全小写）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$value` | `string` | — | 要转换的字符串 |
| `$delimiter` | `string` | `_` | 分隔符 |

返回值：`string`

```php
Str::snake("FooBarBaz");      // "foo_bar_baz"
Str::snake("fooBar", '-');    // "foo-bar"
```

## URL/Slug

### `slug($value, $separator = '-')`

生成 URL 友好的 slug。将字符串转换为仅包含小写字母、数字和指定分隔符的格式。

非 ASCII 字符会尝试通过 `transliterator_transliterate` 或 `iconv` 转写为 ASCII。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$value` | `string` | — | 要转换的字符串 |
| `$separator` | `string` | `-` | 分隔符 |

返回值：`string`

```php
Str::slug("Hello World");              // "hello-world"
Str::slug("PHP String Utility Class"); // "php-string-utility-class"
```

## 使用示例

```php
use kernel\Foundation\Data\Str;

// 路径解析
$mimeType = Str::before("video/mp4", "/");    // "video"
$ext      = Str::after("config.dev.php", "."); // "php"

// 前端解码
$content = Str::fromJsEscape($jsEncodedString);

// 生成 ID
$orderId  = Str::serialNo(24, 'ORD');         // "ORD20240810143022102849"
$apiToken = Str::random(32, null, true);       // 密码学安全的随机 token
$fileId   = Str::uuid();                       // "550e8400-e29b-41d4-a716-446655440000"

// 模板
$msg = Str::replace("用户 {user} 在 {time} 登录", [
  "user" => "Alice",
  "time" => date("H:i:s")
]);

// 验证与展示
if (Str::contains($url, "/admin")) {
  // 管理后台逻辑
}
echo Str::mask($phoneNumber);       // 138****5678
echo Str::limit($articleTitle, 20); // 标题过长时自动加...
```
