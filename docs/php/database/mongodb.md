---
title: MongoDB 操作
---

# MongoDB 操作

如意框架对 MongoDB 提供了 `Driver`、`Mongo` 门面和 `Collection` 基类三层封装，位于 `kernel/Foundation/Database/MongoDB/`。

## 架构概览

```
Collection（基类，继承使用）
    └── Mongo（静态门面，全局操作）
            └── Driver（MongoDB PHP 驱动封装）
                    └── MongoDB\Driver\Manager（原生驱动）
```

---

## Driver — MongoDB 驱动封装

`Driver` 封装 MongoDB 原生 PHP 驱动（`ext-mongodb`），管理连接并提供 CRUD 操作。

### 建立连接

```php
use kernel\Foundation\Database\MongoDB\Driver;

$driver = new Driver(
    'localhost',      // 主机
    27017,            // 端口
    'username',       // 用户名（可选）
    'password',       // 密码（可选）
    'my_database',    // 数据库名
    []                // 连接选项
);
```

连接字符串格式：`mongodb://[user:password@]host:port/database?options`

### CRUD 操作

```php
// 查询
$rows = $driver->query('users', ['status' => 'active'], [
    'sort'  => ['created_at' => -1],
    'limit' => 10,
]);

// 插入（返回插入数量）
$count = $driver->insert('users', [
    'name'   => 'Alice',
    'email'  => 'alice@example.com',
    'status' => 'active',
]);

// 更新
$result = $driver->update('users',
    ['_id' => $id],                                    // 查询条件
    ['$set' => ['status' => 'inactive']],              // 更新操作
    ['multi' => true]                                  // 选项
);

// 删除（返回删除数量）
$count = $driver->delete('users', ['status' => 'archived']);
```

### ObjectId 处理

```php
// 创建 ObjectId（空字符串 = 新生成）
$oid = $driver->id('');           // new ObjectId()
$oid = $driver->id('507f1f...');  // 从字符串还原

// 查询时 _id 自动转为字符串
$rows = $driver->query('users', []);
// $row->_id 是字符串，非 ObjectId
```

### 执行命令

```php
// 创建命令对象
$command = $driver->commamd([
    'aggregate' => 'users',
    'pipeline'  => [
        ['$match' => ['status' => 'active']],
        ['$group' => ['_id' => '$role', 'count' => ['$sum' => 1]]],
    ],
    'cursor'    => new stdClass,
]);

// 执行命令
$result = $driver->execCommand('my_database', $command);
```

---

## Mongo — 静态门面

`Mongo` 是对 `Driver` 的静态封装，需要先注入 `Driver` 实例。

### 初始化

```php
use kernel\Foundation\Database\MongoDB\Mongo;
use kernel\Foundation\Database\MongoDB\Driver;

$driver = new Driver('localhost', 27017, '', '', 'my_database');
Mongo::driver($driver);
```

### CRUD 操作

```php
// 查询多条
$users = Mongo::find('users', ['status' => 'active'], [
    'sort'  => ['created_at' => -1],
    'limit' => 20,
]);

// 查询单条
$user = Mongo::findOne('users', ['email' => 'alice@example.com']);

// 插入
Mongo::insert('users', ['name' => 'Bob', 'email' => 'bob@example.com']);

// 更新
Mongo::update('users',
    ['_id' => $oid],
    ['$set' => ['name' => 'Updated']]
);

// 删除
Mongo::delete('users', ['_id' => $oid]);
```

### ObjectId 工具方法

```php
// 创建 ObjectId 对象
$oid = Mongo::id('');              // 新生成
$oid = Mongo::id('507f1f77...');   // 从字符串还原

// 获取字符串形式的 ObjectId
$strId = Mongo::realId('507f1f77...');  // '507f1f77...'
```

### 参数优化

`Mongo::optimParams()` 自动将数组中的 `_id` 字符串转为 `ObjectId`：

```php
$params = ['_id' => '507f1f77bcf86cd799439011'];
$params = Mongo::optimParams($params);
// $params['_id'] 现在是 ObjectId 对象
```

### 聚合命令

```php
$result = Mongo::execCommand('my_database', [
    'aggregate' => 'orders',
    'pipeline'  => [
        ['$match' => ['status' => 'paid']],
        ['$group' => ['_id' => null, 'total' => ['$sum' => '$amount']]],
    ],
    'cursor'    => new stdClass,
]);
```

---

## Collection — 集合基类

继承 `Collection` 可以封装对特定 MongoDB 集合的操作：

### 定义集合类

```php
use kernel\Foundation\Database\MongoDB\Collection;

class UsersCollection extends Collection
{
    public string $collectionName = 'users';
}
```

### 使用

```php
$users = UsersCollection::instance();

// 查询
$activeUsers = $users->find(['status' => 'active'], ['limit' => 10]);
$user = $users->findOne(['email' => 'alice@example.com']);

// 关联数组模式
$userArray = $users->findOne(['email' => 'alice@example.com'], [], true);

// 插入
$count = $users->insert([
    'name'   => 'Alice',
    'email'  => 'alice@example.com',
    'status' => 'active',
]);

// 更新
$users->update(
    ['_id' => $oid],
    ['$set' => ['status' => 'inactive']]
);

// 删除
$users->delete(['status' => 'archived']);

// 存在判断
if ($users->exist(['email' => 'alice@example.com'])) {
    // 已存在
}

// 获取 ObjectId
$oid = $users->id('');
$str = $users->realId('507f1f77...');
```

### 单例模式

`Collection::instance()` 返回单例，多次调用复用同一实例：

```php
$users1 = UsersCollection::instance();
$users2 = UsersCollection::instance();
// $users1 === $users2
```

---

## 完整示例

```php
use kernel\Foundation\Database\MongoDB\Mongo;
use kernel\Foundation\Database\MongoDB\Driver;
use kernel\Foundation\Database\MongoDB\Collection;

// 1. 初始化连接
$driver = new Driver('localhost', 27017, 'admin', 'pass', 'app_db');
Mongo::driver($driver);

// 2. 定义集合
class LogsCollection extends Collection
{
    public string $collectionName = 'logs';
}

// 3. 业务使用
$logs = LogsCollection::instance();

// 记录日志
$logs->insert([
    'user_id' => 1,
    'action'  => 'login',
    'ip'      => '192.168.1.1',
    'time'    => new \MongoDB\BSON\UTCDateTime(),
]);

// 查询某用户的最近日志
$recentLogs = $logs->find(
    ['user_id' => 1],
    ['sort' => ['time' => -1], 'limit' => 20]
);

// 检查是否存在
if ($logs->exist(['user_id' => 1, 'action' => 'login'])) {
    // ...
}
```
