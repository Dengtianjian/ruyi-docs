# DataObject — 数据对象

DataObject 是数据容器：**实例化时一次性赋值，之后只读**。用于封装结构化数据。继承自 `stdClass`。

- **命名空间**: `kernel\Foundation\Object`
- **文件位置**: `kernel/Foundation/Object/DataObject.php`
- **继承**: `stdClass`
- **子类**: `StorageFileInfoData`（文件信息对象）

## 设计约定

- 子类通过声明 `protected` 属性来定义数据结构，构造时从传入数组 / 对象中按属性名取对应键填充。
- **缺键保留默认值**：传入数据缺少某个属性键时，**保留属性的声明默认值**，不会被覆盖成 `null`，也不会触发 `Undefined array key` 告警。
- **实例化后只读**：`__set` 拦截写入，对未声明属性的赋值会抛异常；读取不存在的属性返回 `null`（`__get` 防御，无告警）。

## 方法列表

### `__construct($data)`

构建数据对象。从数组或对象中读取属性，缺失键保留属性默认值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `array\|object` | 数据源。对象有 `toArray()` 则用之，否则 `(array)` 转换 |

```php
class UserData extends DataObject
{
    protected $id = null;
    protected $username = null;
    protected $nickname = null;
    protected $age = 0;        // 默认值
}

$user = new UserData(["id" => 1, "username" => "admin", "nickname" => "管理员"]);
echo $user->username;  // "admin"
echo $user->age;       // 0（缺键保留默认值，而非 null）
```

### `toArray()`

将对象属性转换为数组。

返回值：`array`

```php
$array = $user->toArray();
// ["id" => 1, "username" => "admin", "nickname" => "管理员", "age" => 0]
```

### `get($key, $default = null)`

安全读取属性，键不存在时返回默认值（不触发告警）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 属性名 |
| `$default` | `mixed` | 键不存在时的返回值，默认 `null` |

返回值：`mixed`

```php
$age = $user->get('age', 18);
$email = $user->get('email', '未填写');
```

### `has($key)`

判断是否存在指定属性键。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 属性名 |

返回值：`bool`

```php
if ($user->has('nickname')) {
    echo $user->nickname;
}
```

### `keys()`

返回全部属性名列表。

返回值：`string[]`

```php
$fields = $user->keys();
// ["id", "username", "nickname", "age"]
```

### `toJson($flags = JSON_UNESCAPED_UNICODE)`

序列化为 JSON 字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$flags` | `int` | `json_encode` 标志位，默认不转义 Unicode |

返回值：`string`

| 异常 | 说明 |
|------|------|
| `\RuntimeException` | 序列化失败时抛出 |

```php
$json = $user->toJson();                                  // 默认不转义中文
$pretty = $user->toJson(JSON_PRETTY_PRINT);               // 美化输出
```

### `__get($name)`

魔术 getter。访问不存在的属性返回 `null`，不触发 `Undefined property` 告警。

### `__set($k, $v)`

魔术 setter。实例化后不允许写入**未声明的属性**，会抛 `kernel\Foundation\Exception\Error`。构造期对已声明属性的赋值不受影响。

### `__toString()`

转换为 JSON 字符串（内部复用 `toJson`，序列化失败时返回 `"{}"`）。

```php
echo $user;  // {"id":1,"username":"admin","nickname":"管理员","age":0}
```

## 使用方式

```php
// 定义数据对象
class LinkData extends DataObject
{
    protected $id = null;
    protected $name = null;
    protected $url = null;
    protected $categoryId = null;
    protected $sort = 0;
}

// 从数据库结果创建（缺键保留默认值）
$row = $db->query("SELECT * FROM links WHERE id = 1")->fetch();
$link = new LinkData($row);

echo $link->name;      // 链接名称
echo $link->url;       // 链接 URL
echo $link;            // JSON 字符串
echo $link->toJson();  // 同上，可传标志位

// 安全取值
$sort = $link->get('sort', 100);

// 转为数组
$array = $link->toArray();

// 判断字段是否存在
if ($link->has('url')) { /* ... */ }
```

## 继承约定

若子类需要重写构造逻辑（例如补算字段），务必在赋值前准备好完整数据，再调用 `parent::__construct($data)`：

```php
class FileInfoData extends DataObject
{
    protected $path = null;
    protected $name = null;
    protected $filePath = null;

    public function __construct($data)
    {
        // 仅当 path、name 都提供且未显式指定 filePath 时才自动拼接
        if (
            !(isset($data['filePath']) && $data['filePath'])
            && isset($data['path'], $data['name'])
        ) {
            $data['filePath'] = $data['path'] . '/' . $data['name'];
        }
        parent::__construct($data);
    }
}
```
