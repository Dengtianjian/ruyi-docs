# DiscuzXLang — Discuz!X 语言包管理

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXLang.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: 无（静态工具类）
- **是否可继承**: 否

Discuz!X 语言包加载与查询工具，支持加载语言文件、增量添加/修改语言项，以及用 `/` 分隔的多级键取值与拼接。

## 属性

| 可见性 | 名称 | 说明 |
|--------|------|------|
| private static | `$langs` | 语言项数组 |

## 方法

### `load` — 加载语言包（static）

```php
public static function load($filePath)
```

- `$filePath`（string）：语言文件绝对路径

文件存在则 `include_once`（期望文件内调用 `DiscuzXLang::add(...)` 注册语言项）；不存在则抛 `Exception("编码文件不存在", 500, "DiscuzXLang:500001", $filePath)`。加载后把全部语言项写入 `$GLOBALS['_STORE']['__App']['langs']`。

### `add` — 添加语言项（static）

```php
public static function add($langs, $key = null)
```

- `$langs`（array|string）：语言项；数组则整体 `array_merge`，字符串则作为单个值
- `$key`（string）：当 `$langs` 为字符串时的键名

### `change` — 修改语言项（static）

```php
public static function change($key, $value)
```

- `$key`（string）：语言项键
- `$value`：新值

### `value` — 取值（static）

```php
public static function value($keys)
```

支持多参数。每个参数可为字符串键（含 `/` 分隔的多级键）或数组键。单参数返回对应值，多参数返回值数组。

### `connect` — 拼接语言项（static）

```php
public static function connect()
```

支持多参数，将多个语言项的值依次 `implode("")` 拼接成一个字符串。适合拼装模板片段。

### `all` — 获取全部语言项（static）

```php
public static function all()
```

返回整个语言项数组。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXLang;

DiscuzXLang::load(Path::root() . "/Langs/zh-CN.php");

// 取值（多级键）
$title = DiscuzXLang::value("app/title");
// 拼接
$footer = DiscuzXLang::connect("app/copyright", "app/version");
// 修改
DiscuzXLang::change("app/title", "新标题");
// 全部
$langs = DiscuzXLang::all();
```
