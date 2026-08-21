# DataObject — 数据对象

DataObject 是不可变的数据对象，用于封装结构化数据。实例化后属性只读。

- **命名空间**: `kernel\Foundation\Object`
- **文件位置**: `kernel/Foundation/Object/DataObject.php`
- **继承**: `stdClass`

## 方法列表

### `__construct($data)`

构建数据对象。从数组或对象中读取属性。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `array\|object` | 数据源（对象须有 `toArray()` 方法） |

```php
class UserData extends DataObject
{
    public $id;
    public $username;
    public $nickname;
}

$user = new UserData(["id" => 1, "username" => "admin", "nickname" => "管理员"]);
echo $user->username;  // "admin"
```

### `toArray()`

将对象属性转换为数组。

返回值：`array`

```php
$array = $user->toArray();
// ["id" => 1, "username" => "admin", "nickname" => "管理员"]
```

### `__get($name)`

魔术 getter，访问属性时读取。

### `__set($k, $v)`

魔术 setter，实例化后不允许修改属性（会抛 `kernel\Foundation\Exception\Exception`）。

### `__toString()`

转换为 JSON 字符串。

```php
echo $user;  // {"id":1,"username":"admin","nickname":"管理员"}
```

## 使用方式

```php
// 定义数据对象
class LinkData extends DataObject
{
    public $id;
    public $name;
    public $url;
    public $categoryId;
    public $sort;
}

// 从数据库结果创建
$row = $db->query("SELECT * FROM links WHERE id = 1")->fetch();
$link = new LinkData($row);

echo $link->name;   // 链接名称
echo $link->url;    // 链接 URL
echo $link;         // JSON 字符串

// 转为数组
$array = $link->toArray();
```
