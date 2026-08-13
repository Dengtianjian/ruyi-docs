# Arr — 数组工具类

Arr 提供数组判断、合并、抽取、分组、树形分级、点号语法取值、XML 转换等一系列静态工具方法，全部无需实例化即可调用。

- **命名空间**: `kernel\Foundation\Data\Arr`
- **文件位置**: `kernel/Foundation/Data/Arr.php`
- **特点**: 全部为静态方法

## 判断与转换

### `isAssoc($array)`

判断是否为关联数组（索引数组返回 `false`）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 原数组 |

返回值：`bool`，非数组时返回 `false`

```php
Arr::isAssoc([1, 2, 3]);                          // false
Arr::isAssoc(["name" => "A", "age" => 18]);       // true
```

### `indexToAssoc($array, $key)`

索引数组转关联数组，以数组中每个元素的指定键作为结果键名。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array` | 原数组（二维索引数组） |
| `$key` | `string` | 用作结果键名的字段 |

返回值：`array` 以 `$key` 为键的关联数组

```php
$rows = [
  ["id" => 1, "name" => "A"],
  ["id" => 2, "name" => "B"],
];
Arr::indexToAssoc($rows, "id");
// [1 => ["id" => 1, "name" => "A"], 2 => ["id" => 2, "name" => "B"]]
```

### `stringToMultiLevelArray($string, $separator = "/")`

按分隔符把字符串拆分为多级嵌套数组，最后一级为空的子数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$string` | `string` | 字符串 |
| `$separator` | `string` | 分隔符，默认 `/` |

返回值：`array` 多级嵌套数组

```php
Arr::stringToMultiLevelArray("a/b/c");
// ["a" => ["b" => ["c" => []]]]
```

## 合并与抽取

### `merge(...$arrs)`

合并多个数组，支持多维数组合并（字符串键深度合并，数字键追加）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$arrs` | `array...` | 要合并的数组，可变参数 |

返回值：`array` 合并后的数组

```php
Arr::merge(["a" => ["b" => 1]], ["a" => ["c" => 2]]);
// ["a" => ["b" => 1, "c" => 2]]
```

### `partial($target, $keys)`

从数组中抽取指定字段的值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$target` | `array` | 目标数组 |
| `$keys` | `array` | 要抽取的键名列表 |

返回值：`array` 仅含指定键的结果数组（键不存在则跳过）

```php
Arr::partial(["id" => 1, "name" => "A", "age" => 18], ["id", "age"]);
// ["id" => 1, "age" => 18]
```

### `group($target, $byKey)`

按指定键对二维数组分组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$target` | `array` | 二维数组，每项含有共同的键 |
| `$byKey` | `string` | 分组的依据键名 |

返回值：`array` 分组后的数组（缺失 `$byKey` 的项被忽略）

```php
Arr::group([["t" => 1], ["t" => 2], ["t" => 1]], "t");
// [1 => [["t" => 1], ["t" => 1]], 2 => [["t" => 2]]]
```

### `filterNullUnique($Target)`

过滤空值并移除数组中重复的值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$Target` | `array` | 操作的数组 |

返回值：`array` 过滤去重后的数组

```php
Arr::filterNullUnique(["a", "b", null, "", "a"]);  // ["a", "b"]
```

## 树形结构

### `tree($arr, $dataPrimaryKey, $relatedParentKey, $childArrayKeys = "childs")`

将扁平数组按父子关系分级为树形结构。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$arr` | `array` | 原数组，每项含主键与父键 |
| `$dataPrimaryKey` | `string` | 主键（父子共有的唯一值） |
| `$relatedParentKey` | `string` | 父级关联键 |
| `$childArrayKeys` | `string` | 子级存放的键名，默认 `childs` |

返回值：`array` 分级后的树形数组

```php
$items = [
  ["id" => 1, "parentId" => 0, "name" => "A"],
  ["id" => 2, "parentId" => 1, "name" => "B"],
];
Arr::tree($items, "id", "parentId");
// [
//   ["id" => 1, "parentId" => 0, "name" => "A", "childs" => [
//     ["id" => 2, "parentId" => 1, "name" => "B", "childs" => []],
//   ]],
// ]
```

## 点号语法取值

### `has($array, $key)`

通过点号语法判断多维数组中是否存在指定的键（严格区分「键存在值为 null」和「键不存在」）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array\|ArrayAccess` | 目标数组 |
| `$key` | `string\|null` | 键名，支持点号语法（如 `user.profile.name`） |

返回值：`bool`

```php
$data = ["user" => ["profile" => ["name" => "A"]]];
Arr::has($data, "user.profile.name");  // true
Arr::has($data, "user.profile.age");   // false
```

### `get($array, $key, $default = null)`

通过点号语法获取多维数组的值，支持 `*` 通配符展开。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$array` | `array\|ArrayAccess` | 目标数组 |
| `$key` | `string\|null` | 键名，支持点号语法和 `*` 通配符 |
| `$default` | `mixed` | 键不存在时的默认值 |

返回值：`mixed` 获取到的值；通配符匹配返回平铺的结果数组

```php
Arr::get(["user" => ["profile" => ["name" => "A"]]], "user.profile.name");
// "A"

Arr::get([
  ["id" => 1, "photos" => [["url" => "a.jpg"], ["url" => "b.jpg"]]],
], "photos.*.url");
// ["a.jpg", "b.jpg"]
```

## XML 转换

### `toXML($target, $root = true, $rootName = "xml")`

将数组转换为 XML 字符串。字符串值使用 CDATA 包裹，索引数组按重复标签输出。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$target` | `array` | 目标数组 |
| `$root` | `bool` | 是否输出根标签 |
| `$rootName` | `string` | 根标签名，默认 `xml` |

返回值：`string` XML 字符串

```php
Arr::toXML(["name" => "A", "items" => ["x", "y"]]);
// "<xml><name><![CDATA[A]]></name><items><items>x</items><items>y</items></items></xml>"
```
