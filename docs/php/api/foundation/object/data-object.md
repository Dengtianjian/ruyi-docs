# DataObject — 数据对象基类

- **文件位置**: `kernel/Foundation/Object/DataObject.php`
- **命名空间**: `kernel\Foundation\Object`
- **继承**: 继承 `stdClass`
- **是否可继承**: 是

一种「实例化时一次性赋值、之后只读」的数据容器。子类通过声明 **protected 属性**定义数据结构，构造时从传入数组/对象中取对应键填充；**缺失的键保留属性默认值**，不覆盖。

典型子类：`kernel\Foundation\FileSystem\Storage\StorageFileInfoData`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （本类无自身属性） | — | — | — | 属性由各子类声明；构造时填充 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($data)` | 一次性赋值（缺键保留默认值） |
| `__get($name)` | 魔术读取：不存在属性返回 `null` |
| `__set($k, $v)` | 魔术写入：写入未声明属性抛异常 |
| `properties()` | 获取全部属性名（含继承，排除静态）（protected） |
| `toArray()` | 输出为关联数组 |
| `has($key)` | 是否包含指定属性 |
| `get($key, $default)` | 安全读取属性（带默认值） |
| `keys()` | 返回全部属性名 |
| `toJson($flags)` | 序列化为 JSON 字符串 |
| `__toString()` | 转字符串时输出 JSON |

## 方法

### `__construct($data)` — 一次性赋值

从传入数组/对象中取对应键填充已声明属性；缺失键保留属性默认值。传入对象时若其有 `toArray()` 则转数组，否则 `(array)` 强转。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array\|object` | 无 | 初始数据 |

**返回值**

- 无。

**示例**

```php
class FileInfo extends DataObject
{
    protected $name = "";
    protected $size = 0;
}

$info = new FileInfo(["name" => "a.txt"]);
$info->size;   // 0（缺键保留默认值）
```

### `__get($name)` — 魔术读取

访问不存在的属性返回 `null` 而非触发 Undefined property 告警。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 属性名 |

**返回值**

- `mixed`：属性值；不存在返回 `null`。

### `__set($k, $v)` — 魔术写入

实例化后写入**未声明的动态属性**会抛异常，保证"实例化后只读"。构造期对已声明属性的赋值不会进入此方法。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$k` | `string` | 无 | 属性名 |
| `$v` | `mixed` | 无 | 属性值 |

**返回值**

- 无。

**异常**

- `\kernel\Foundation\Exception\Error`：写入未声明属性时抛出。

### `properties()` — 获取全部属性名

> protected。用反射获取全部实例属性（含父类继承的），排除静态属性，去重后返回。

**参数**

- 无。

**返回值**

- `string[]`：属性名列表。

### `toArray()` — 输出为关联数组

**参数**

- 无。

**返回值**

- `array`：属性名 → 属性值的关联数组。

### `has($key)` — 是否包含指定属性

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 属性名 |

**返回值**

- `bool`：属性已声明且存在返回 `true`。

### `get($key, $default = null)` — 安全读取属性

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 属性名 |
| `$default` | `mixed` | `null` | 属性不存在时的返回值 |

**返回值**

- `mixed`：属性值；不存在返回 `$default`。

### `keys()` — 返回全部属性名

**参数**

- 无。

**返回值**

- `string[]`：属性名列表（同 `properties()`）。

### `toJson($flags = JSON_UNESCAPED_UNICODE)` — 序列化为 JSON 字符串

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flags` | `int` | `JSON_UNESCAPED_UNICODE` | `json_encode` 标志位（默认不转义中文） |

**返回值**

- `string`：JSON 字符串。

**异常**

- `\RuntimeException`：序列化失败时抛出。

### `__toString()` — 转字符串时输出 JSON

调用 `toJson(JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)`；序列化失败时返回 `"{}"`。

**参数**

- 无。

**返回值**

- `string`：JSON 字符串。
