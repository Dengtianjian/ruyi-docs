# LanguageService — 语言服务

- **文件位置**: `kernel/Service/LanguageService.php`
- **命名空间**: `kernel\Service`
- **是否可继承**: 是

语言代码与名称的映射服务，内置 28 种语言，可动态增改。所有成员与属性均为静态。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$languages` | `array` | 内置 28 种语言映射 | private static | 语言代码 → 中文名称的关联数组，键为语言代码（如 `zh`、`en`） |

内置语言代码：`zh`、`en`、`yue`、`wyw`、`jp`、`kor`、`fra`、`spa`、`th`、`ara`、`ru`、`pt`、`de`、`it`、`el`、`nl`、`pl`、`bul`、`est`、`dan`、`fin`、`cs`、`rom`、`slo`、`swe`、`hu`、`cht`、`vie`。

## 方法速查

| 方法 | 说明 |
|------|------|
| `getAll()` | 返回全部语言映射 |
| `getOne($langEng)` | 按语言代码取语言名称 |
| `add($langEng, $langName)` | 新增或覆盖一种语言 |

## 方法

### `getAll()` — 返回全部语言映射

**参数**

无参数。

**返回值**

- `array`：全部语言代码 → 名称的关联数组。

**示例**

```php
$all = LanguageService::getAll();
// ['zh' => '中文', 'en' => '英语', 'jp' => '日语', ...]
```

### `getOne($langEng)` — 按语言代码取语言名称

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$langEng` | `string` | — | 语言代码（如 `jp`），需存在于 `$languages` 中，否则返回 null |

**返回值**

- `string`：对应的语言中文名称。

**示例**

```php
$name = LanguageService::getOne("jp");   // 日语
```

### `add($langEng, $langName)` — 新增或覆盖一种语言

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$langEng` | `string` | — | 语言代码，已存在则覆盖其名称 |
| `$langName` | `string` | — | 语言中文名称 |

**返回值**

- `void`：无返回值。

**示例**

```php
LanguageService::add("eo", "世界语");
```
