# Arr — 数组工具

- **文件位置**: `kernel/Foundation/Data/Arr.php`
- **命名空间**: `kernel\Foundation\Data`
- **类型**: 纯静态工具类

数组处理静态工具类。全部方法通过 `Arr::方法名(...)` 调用，无需实例化。支持点号路径读取（`get`/`has`）与通配符匹配，适合嵌套数组场景。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `isAssoc` | 判断是否为关联数组 |
| `indexToAssoc` | 索引数组按指定键转为关联数组 |
| `tree` | 构建树形结构 |
| `merge` | 合并多个数组（支持多维递归） |
| `stringToMultiLevelArray` | 分隔字符串转多级嵌套数组 |
| `partial` | 从数组中取指定键的子集 |
| `group` | 按指定键的值分组 |
| `toXML` | 数组转 XML |
| `filterNullUnique` | 过滤 null 并去重 |
| `has` | 判断数组是否含指定键（支持点号/通配符） |
| `get` | 按点号/通配符路径读取值 |

## 方法

### `isAssoc($array)` — 判断是否为关联数组

空数组、键全部为连续整数（从 0 起）的数组视为索引数组返回 `false`；只要存在非整数键即视为关联数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$array` | `array` | 无 | 待判断的数组 |

**返回值**

- `bool`：是关联数组返回 `true`，否则 `false`。

**示例**

```php
Arr::isAssoc([1, 2, 3]);               // false（索引数组）
Arr::isAssoc(["a" => 1]);              // true
Arr::isAssoc([]);                      // false（空数组）
```

### `indexToAssoc($array, $key)` — 索引数组转关联数组

将索引数组按其中每个元素的 `$key` 字段值作为新数组的键，重组为关联数组。`$key` 不存在时该条被跳过；重复值会互相覆盖。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$array` | `array` | 无 | 索引数组，每个元素通常为关联数组 |
| `$key` | `string` | 无 | 用作新数组键的字段名 |

**返回值**

- `array`：以 `$key` 字段值为键的关联数组。

**示例**

```php
$list = [
    ["id" => 1, "name" => "张三"],
    ["id" => 2, "name" => "李四"],
];
$map = Arr::indexToAssoc($list, "id");
// [1 => ["id" => 1, "name" => "张三"], 2 => ["id" => 2, "name" => "李四"]]
```

### `tree($arr, $dataPrimaryKey, $relatedParentKey, $childArrayKeys = "childs")` — 构建树形结构

将扁平的列表（每条记录含自身主键与父级键）构建为多级树形结构。父级键为 `0` 或空（找不到父级）的记录作为顶层节点。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$arr` | `array` | 无 | 扁平记录列表 |
| `$dataPrimaryKey` | `string` | 无 | 每条记录的自身主键字段名（如 `"id"`） |
| `$relatedParentKey` | `string` | 无 | 父级主键字段名（如 `"parentId"`） |
| `$childArrayKeys` | `string` | `"childs"` | 子节点存放的字段名 |

**返回值**

- `array`：树形嵌套结构，根为顶层节点数组。

**示例**

```php
$categories = [
    ["id" => 1, "parentId" => 0, "name" => "分类A"],
    ["id" => 2, "parentId" => 1, "name" => "分类A-1"],
    ["id" => 3, "parentId" => 1, "name" => "分类A-2"],
];
$tree = Arr::tree($categories, "id", "parentId");
// [
//   ["id" => 1, "parentId" => 0, "name" => "分类A",
//      "childs" => [
//        ["id" => 2, "parentId" => 1, "name" => "分类A-1"],
//        ["id" => 3, "parentId" => 1, "name" => "分类A-2"],
//      ]],
// ]
```

### `merge(...$arrs)` — 合并多个数组

支持任意数量参数；对多维/嵌套数组采用递归合并（同名键的值若为数组则深度合并），标量同名键由后传入者覆盖。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$arrs` | `array` | 无 | 变长参数，至少传入一个数组 |

**返回值**

- `array`：合并后的数组。

**示例**

```php
$a = ["name" => "张三", "opt" => ["color" => "red"]];
$b = ["age" => 20, "opt" => ["size" => 10]];
$r = Arr::merge($a, $b);
// ["name" => "张三", "age" => 20, "opt" => ["color" => "red", "size" => 10]]
```

### `stringToMultiLevelArray($string, $separator = "/")` — 字符串转多级嵌套数组

按分隔符把字符串拆成多级嵌套数组。例如 `"a/b/c"` 转成 `["a" => ["b" => "c"]]`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$string` | `string` | 无 | 待拆分的字符串 |
| `$separator` | `string` | `"/"` | 分隔符 |

**返回值**

- `array`：多级嵌套数组。

**示例**

```php
Arr::stringToMultiLevelArray("a/b/c");
// ["a" => ["b" => "c"]]
Arr::stringToMultiLevelArray("x/y", ".");
// ["x" => "y"]
```

### `partial($target, $keys)` — 取子集

从数组 `$target` 中提取 `$keys` 指定的键，返回新数组。`$keys` 未命中的键被忽略。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$target` | `array` | 无 | 源数组 |
| `$keys` | `array` | 无 | 需要提取的键名数组 |

**返回值**

- `array`：仅含 `$keys` 指定键的子集。

**示例**

```php
$user = ["id" => 1, "name" => "张三", "password" => "xxx"];
Arr::partial($user, ["id", "name"]);
// ["id" => 1, "name" => "张三"]
```

### `group($target, $byKey)` — 按键分组

按数组中每个元素的 `$byKey` 字段值进行分组，结果键为分组值、值为对应记录数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$target` | `array` | 无 | 待分组记录列表 |
| `$byKey` | `string` | 无 | 用于分组的字段名 |

**返回值**

- `array`：分组后的关联数组。

**示例**

```php
$users = [
    ["name" => "张三", "dept" => "技术"],
    ["name" => "李四", "dept" => "市场"],
    ["name" => "王五", "dept" => "技术"],
];
Arr::group($users, "dept");
// [
//   "技术" => [["name" => "张三", "dept" => "技术"], ["name" => "王五", "dept" => "技术"]],
//   "市场" => [["name" => "李四", "dept" => "市场"]],
// ]
```

### `toXML($target, $root = true, $rootName = "xml")` — 数组转 XML

将数组转换为 XML 字符串。支持嵌套数组；数字下标转成 `<item>` 节点。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$target` | `array` | 无 | 待转换的数组 |
| `$root` | `bool` | `true` | 是否生成根节点包裹 |
| `$rootName` | `string` | `"xml"` | 根节点名称 |

**返回值**

- `string`：XML 字符串。

**示例**

```php
$data = ["name" => "张三", "items" => ["a", "b"]];
$xml = Arr::toXML($data);
// <xml><name>张三</name><items><item>a</item><item>b</item></items></xml>
```

### `filterNullUnique($Target)` — 过滤 null 与去重

移除数组中的 `null` 值，并对剩余元素去重。键保持原样（不去除缺口）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Target` | `array` | 无 | 待处理数组 |

**返回值**

- `array`：已去除 null 并去重后的数组。

**示例**

```php
Arr::filterNullUnique([1, null, 2, 1, 3]);
// [0 => 1, 2 => 2, 4 => 3]（键保持原样）
```

### `has($array, $key)` — 是否含指定键

判断数组中是否存在 `$key` 指定的键。支持点号路径（`"profile.name"`）与通配符 `*`（如 `"users.*.name"`）。逐层检查嵌套数组是否存在该路径。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$array` | `array\|object` | 无 | 待检查数组 |
| `$key` | `string\|int` | 无 | 键名或点号/通配符路径 |

**返回值**

- `bool`：键/路径存在返回 `true`。

**示例**

```php
$user = ["profile" => ["name" => "张三"]];
Arr::has($user, "profile.name");   // true
Arr::has($user, "profile.age");    // false

$list = [["name" => "a"], ["name" => "b"]];
Arr::has($list, "*.name");         // true（通配符匹配每个元素）
```

### `get($array, $key, $default = null)` — 点号/通配符读取值

按点号路径从数组读取值，路径不存在时返回 `$default`。支持通配符 `*`，每一段路径内通配符会遍历所有匹配分支。`$array` 为 `null` 时直接返回 `$default`（不抛 warning）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$array` | `array\|object` | 无 | 源数组 |
| `$key` | `string\|int\|null` | 无 | 键名或点号/通配符路径 |
| `$default` | `mixed` | `null` | 路径不存在时返回的默认值 |

**返回值**

- `mixed`：路径对应的值，或 `$default`。

**示例**

```php
$user = ["profile" => ["name" => "张三"]];
Arr::get($user, "profile.name", "匿名");   // "张三"
Arr::get($user, "profile.age", 18);        // 18

$list = [["name" => "a"], ["name" => "b"]];
Arr::get($list, "*.name");                 // ["a", "b"]
```

## 私有辅助方法

| 方法 | 说明 |
|------|------|
| `wildcardGet($array, $key, $default)` | 支持通配符的点号路径读取（`get()` 内部调用） |
| `wildcardWalk($array, $segments, $default)` | 逐段遍历通配符路径（递归） |
