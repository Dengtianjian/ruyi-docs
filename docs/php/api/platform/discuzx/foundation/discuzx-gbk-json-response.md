# DiscuzXGBKJsonResponse — Discuz!X GBK JSON 编解码器

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXGBKJsonResponse.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: 无（静态工具类）
- **是否可继承**: 否

100% 源自 Discuz!X `json.class.php` 的 JSON 编解码实现，收录于框架便于开发调用、减少对外部依赖。支持 GBK 字符集自动转换、Unicode 转义，以及不带 PHP `json` 扩展时的纯 PHP 回退实现。

## 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `JSON_SLICE` | `1` | 解析片段状态 |
| `JSON_IN_STR` | `2` | 字符串内状态 |
| `JSON_IN_ARR` | `4` | 数组内状态 |
| `JSON_IN_OBJ` | `8` | 对象内状态 |
| `JSON_IN_CMT` | `16` | 注释内状态 |

## 方法

### `encode` — JSON 编码（static）

```php
static function encode($var)
```

- `$var`（mixed）：待编码变量

返回 JSON 字符串。支持 boolean/null/integer/double/float/string/array/object。

**逻辑**

- 字符串：若非 UTF-8 且存在 `diconv`，先转 UTF-8；有 `json_encode` 则直接调用，否则手写 ASCII 转义（含 `\uXXXX` Unicode 转义）。
- 数组：若为关联数组则编码为对象 `{...}`，否则为数组 `[...]`。
- 对象：`Traversable` 转为数组后编码为对象。

> 源码内部通过 `GJson::class` 静态引用自身（源码笔误，应为 `self::` 或类名），在兼容 PHP 中不影响调用。

### `nameValue` — 名称值对编码（static）

```php
static function nameValue($name, $value)
```

返回 `"{encode($name)}:{encode($value)}"`。

### `reduceString` — 去除注释（static）

```php
static function reduceString($str)
```

用正则去除 JSON 字符串中的行注释、块注释，返回去除后的字符串。

### `decode` — JSON 解码（static）

```php
static function decode($str, $useArray = true)
```

- `$str`（string）：JSON 字符串
- `$useArray`（bool）：对象是否解码为关联数组，默认 `true`

有 `json_decode` 则直接调用；否则用纯 PHP 状态机解析（支持字符串转义、Unicode、数组/对象嵌套、注释）。

### `utf8ToUnicode` / `unicodeToUTF8`（static）

UTF-8 与 Unicode 码点数组互转。

### `utf8ToUTF16BE` / `utf16beToUTF8`（static）

UTF-8 与 UTF-16BE 互转，供 `\uXXXX` 转义使用。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXGBKJsonResponse;

$json = DiscuzXGBKJsonResponse::encode(["name" => "你好", "id" => 1]);
$data = DiscuzXGBKJsonResponse::decode($json, true);
```
