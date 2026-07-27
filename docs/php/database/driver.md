---
title: Driver 驱动
---

# Driver — PDO 驱动封装

`Driver` 是 PDO 数据库操作的最底层封装，直接包裹 PHP 原生 `PDO` 实例，
提供连接管理、SQL 执行、预处理、事务等基础能力。

Driver 通常不直接使用，而是通过 `Connections` 注册后由 `DB` 门面、`Query` 构建器、
`Model` 等上层组件间接调用。

> 源码类级注释中的架构图和使用示例参见 [Driver 源码](https://github.com/.../Driver.php)。

## 构造连接

```php
use kernel\Foundation\Database\PDO\Driver;

$driver = new Driver(
    $hostname,   // 主机名
    $username,   // 用户名
    $password,   // 密码
    $database,   // 数据库名
    $port,       // 端口，默认 3306
    $options     // PDO 连接选项，可选
);
```

## 获取底层 PDO 实例

```php
$pdo = $driver->getPDO();

// 直接操作 PDO
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

## SQL 查询

### query() — 通用 SQL 执行

根据 SQL 类型自动选择执行方式：SELECT 类语句通过 `PDO::query()` 返回 `PDOStatement`，
写操作通过 `PDO::exec()` 返回受影响行数，确保跨数据库驱动（MySQL/SQLite 等）行为一致。

```php
// SELECT 查询 → 返回 PDOStatement
$stmt = $driver->query('SELECT * FROM users WHERE status = 1');
while ($row = $stmt->fetch()) { ... }

// 写操作 → 返回受影响行数
$affected = $driver->query("UPDATE users SET status = 0 WHERE id = 1");
echo $affected;  // 1
```

> **内部实现**：非 SELECT 语句（INSERT/UPDATE/DELETE/DDL 等）使用 `PDO::exec()`，
> 比 `query() + rowCount()` 组合在不同数据库驱动下行为更一致。

### exec() — 仅返回受影响行数

比 `query()` 更高效，适合不需要结果集的 DDL/DML 操作。

```php
$affected = $driver->exec('DELETE FROM logs WHERE created_at < "2025-01-01"');
$driver->exec('OPTIMIZE TABLE users');
```

## 预处理语句

### prepare() + bindValues() + execute()

将 SQL 准备、参数绑定、执行分离：

```php
$stmt = $driver->prepare('SELECT * FROM users WHERE status = :status AND vip = :vip');
$driver->bindValues($stmt, [
    'status' => 1,
    'vip'    => true,
]);
$stmt->execute();

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

### execute() — 一步完成

集成 prepare → bind → execute 三步：

```php
// SELECT 返回 PDOStatement
$stmt = $driver->execute('SELECT * FROM users WHERE id = :id', ['id' => 1]);
$row  = $stmt->fetch(PDO::FETCH_ASSOC);

// 写操作返回受影响行数
$affected = $driver->execute('UPDATE users SET name = :name WHERE id = :id', [
    'name' => 'NewName',
    'id'   => 1,
]);
```

## 便捷查询方法

所有便捷方法均支持两种模式：传参数时走预处理路径，不传参数时走直查路径。

### first() — 查询单行

```php
$user = $driver->first('SELECT * FROM users WHERE id = ?', [1]);
$user = $driver->first('SELECT * FROM users WHERE id = 1');  // 无参数，直查
```

### all() — 查询全部

```php
$users = $driver->all('SELECT * FROM users WHERE status = ?', [1]);
```

### value() — 查询单个标量值

```php
$count = $driver->value('SELECT COUNT(*) FROM users');
$name  = $driver->value('SELECT name FROM users WHERE id = ?', [1]);
```

### object() — 查询返回对象

```php
$user = $driver->object('SELECT * FROM users WHERE id = ?', [1], 'stdClass');
echo $user->name;

// 传入自定义类
$user = $driver->object('SELECT * FROM users WHERE id = ?', [1], UserDTO::class);
```

### map() — 通过回调处理结果

```php
$names = $driver->map(
    'SELECT id, name FROM users',
    function ($id, $name) {
        return "$id: $name";
    }
);
// ['1: Alice', '2: Bob', ...]
```

## 事务管理

```php
$driver->beginTransaction();

try {
    $driver->exec("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
    $driver->exec("UPDATE accounts SET balance = balance + 100 WHERE id = 2");
    $driver->commit();
} catch (\Exception $e) {
    $driver->rollBack();
    throw $e;
}

// 检查是否在事务中
if ($driver->inTransaction()) {
    // ...
}
```

## 其他方法

### insertId() — 最后插入的自增 ID

```php
$driver->exec("INSERT INTO users (name) VALUES ('Alice')");
$id = $driver->insertId();  // string
```

### quote() — 安全转义字符串

```php
$safe = $driver->quote("O'Reilly");       // 'O\'Reilly'
$safe = $driver->quote($value, PDO::PARAM_INT);  // 指定类型
```

### error() / errno() — 错误信息

```php
$errorInfo = $driver->error();  // [SQLSTATE码, 驱动错误码, 错误消息]
$errorCode = $driver->errno();  // SQLSTATE 码
```

### getAttribute() / setAttribute() — PDO 属性

```php
$driver->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$mode = $driver->getAttribute(PDO::ATTR_DRIVER_NAME);  // 'mysql'
```

## 参数绑定类型推断

`bindValues()` 会自动根据 PHP 值类型选择对应的 PDO 绑定类型：

| PHP 类型 | PDO 绑定类型 |
|----------|-------------|
| `int` | `PDO::PARAM_INT` |
| `bool` | `PDO::PARAM_BOOL` |
| `null` | `PDO::PARAM_NULL` |
| `string` / 其他 | `PDO::PARAM_STR` |

## 架构关系

```
Connections（管理多个 Driver）
    └── Driver（PDO 封装）
            ├── Query（查询构建器）
            ├── Model（ActiveRecord）
            ├── Table（DDL 操作）
            └── DB（门面，委托到当前 Driver）
```
