# BaseObject — 基对象

BaseObject 是所有模型和服务的基类，提供单例模式和快速实例化调用。

- **命名空间**: `kernel\Foundation\Object`
- **文件位置**: `kernel/Foundation/Object/BaseObject.php`

## 方法列表

### `singleton(...$args)`

单例调用。同一类名多次调用返回同一个实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$args` | `mixed` | 实例化参数 |

返回值：`static`

```php
// 第一次调用：创建实例
$instance1 = MyService::singleton();

// 第二次调用：返回同一个实例
$instance2 = MyService::singleton();

// $instance1 === $instance2  // true
```

### `call(...$args)`

快速实例化调用。每次调用都创建新实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$args` | `mixed` | 实例化参数 |

返回值：`static`

```php
$instance1 = MyService::call();
$instance2 = MyService::call();

// $instance1 !== $instance2  // true
```

## 使用方式

### 单例模式

```php
class DatabaseService extends BaseObject
{
    private $connection;
    
    public function __construct()
    {
        $this->connection = new PDO(...);
    }
    
    public function query($sql)
    {
        return $this->connection->query($sql);
    }
}

// 整个请求生命周期内共享同一个数据库连接
$db = DatabaseService::singleton();
$db->query("SELECT * FROM users");

// 其他地方获取同一个实例
$db2 = DatabaseService::singleton();
// $db === $db2
```

### 每次新建实例

```php
$validator1 = ValidatorService::call($data1);
$validator2 = ValidatorService::call($data2);
// 两个独立的实例
```

---

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
| `$data` | `array\|object` | 数据源 |

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

魔术 getter，访问不存在的属性时触发。

### `__set($k, $v)`

魔术 setter，实例化后不允许修改属性（会抛异常）。

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
