# Database 数据库

- **目录位置**: `kernel/Foundation/Database/`
- **命名空间**: `kernel\Foundation\Database`

数据库体系，分 PDO（关系型）、MongoDB、SQLite 三套。PDO 下含 `DB`（静态门面）、`Connections`（连接管理）、`Driver`（底层驱动）、`Query`（查询构造器）、`Model`（模型基类）、`Schema`（表结构）、`Statement`、`Table`、`Paginator`（分页）、`Relation`（关联）。

## DB — 数据库门面（静态）

- **文件位置**: `kernel/Foundation/Database/PDO/DB.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

全静态门面，不可实例化。提供查询构造、原生 SQL、事务、查询日志。

### 查询构造入口

```php
DB::table('users')->where('status', 1)->get();   // 返回 Query
```

### 原生 SQL

| 方法 | 说明 |
|------|------|
| `select($query, $bindings = []): array` | SELECT 多行 |
| `selectOne($query, $bindings = []): array\|null` | SELECT 单行 |
| `scalar($query, $bindings = []): mixed` | 取单个标量 |
| `insert($query, $bindings = []): bool` | 插入 |
| `insertGetId($query, $bindings = []): string\|int` | 插入并取自增 ID |
| `update($query, $bindings = []): int` | 更新，返回影响行数 |
| `delete($query, $bindings = []): int` | 删除 |
| `statement($query, $bindings = []): bool` | 执行语句 |
| `unprepared($query): bool` | 无预处理执行 |
| `raw($value): Statement` | 原始表达式 |

### 底层直查

| 方法 | 说明 |
|------|------|
| `query($sql)` / `exec($sql)` / `prepare($query, $options)` / `execute($query, $params)` | PDO 底层 |
| `quote($string, $type)` | 转义 |
| `insertId()` | 自增 ID |

便捷：`first($sql, $params)` / `all($sql, $params)` / `value($sql, $params, $column)`。

### 错误

`error(): array` / `errno(): string`。

### 事务

```php
DB::transaction(function ($driver) {
    DB::table('users')->insert(['name' => 'Tom']);
    DB::table('logs')->insert(['action' => 'add']);
});   // 死锁自动重试（$attempts = 1）
```

| 方法 | 说明 |
|------|------|
| `begin()` / `commit()` / `rollback()` | 手动事务 |
| `transaction(callable $callback, $attempts = 1)` | 事务闭包，死锁重试 |
| `inTransaction()` | 是否在事务中 |

### 查询日志

`enableQueryLog()` / `disableQueryLog()` / `getQueryLog()` / `flushQueryLog()` / `listen(callable)`（`function($query, $bindings, $time)`）。

## Connections — 连接管理器

- **文件位置**: `kernel/Foundation/Database/PDO/Connections.php`
- **继承**: `AbilityBaseObject`

多数据库连接管理，全静态。

| 方法 | 说明 |
|------|------|
| `addDriver($driver, $name = "default", $isDefault = false)` | 注册驱动 |
| `useDriver($name): bool` | 切换连接，不存在抛 `Error` |
| `getUseDriver(): Driver` | 当前驱动（自动回退默认） |
| `getDrivers(): array` | 所有驱动 |
| `setDefaultDriver($name)` / `getDefaultDriver()` | 默认驱动 |
| `switchToDefaultDriver()` | 切回默认 |

```php
Connections::addDriver(new Driver(...), 'master', true);
Connections::addDriver(new Driver(...), 'slave');
Connections::useDriver('slave');
$users = DB::table('users')->get();
Connections::switchToDefaultDriver();
```

## Driver — PDO 驱动

- **文件位置**: `kernel/Foundation/Database/PDO/Driver.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

底层引擎，封装原生 `PDO` 实例。

### `__construct($hostname = null, $username = null, $password = null, $database = null, $port = 3306, $options = null)`

### 方法

| 方法 | 说明 |
|------|------|
| `setAttribute($attribute, $value): bool` | 设置 PDO 属性 |
| `getPdo(): \PDO` | 返回原生 PDO |
| `connect(...)` | 建立连接 |
| `lastInsertId()` | 自增 ID |
| `begin()` / `commit()` / `rollback()` / `inTransaction()` | 事务 |

## Query — 查询构造器

- **文件位置**: `kernel/Foundation/Database/PDO/Query.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

链式查询构造器，由 `DB::table()` 返回。

```php
$users = DB::table('users')
    ->where('status', 1)
    ->where('age', '>', 18)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

### 常用方法

| 方法 | 说明 |
|------|------|
| `where($column, $operator, $value)` | 条件 |
| `select($columns)` | 指定列 |
| `orderBy($column, $dir)` / `groupBy(...)` / `having(...)` | 排序/分组 |
| `limit($n)` / `offset($n)` | 分页 |
| `join($table, ...)` | 联表 |
| `get(): array` / `first()` / `value()` | 取数据 |
| `insert($data)` / `insertGetId($data)` | 插入 |
| `update($data): int` / `delete(): int` | 更新/删除 |
| `count()` / `sum()` / `avg()` / `min()` / `max()` | 聚合 |
| `toSql()` | 生成 SQL |

## Model — 模型基类

- **文件位置**: `kernel/Foundation/Database/PDO/Model.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

数据库模型基类，配合 `singleton()` 约定使用。

```php
class UserModel extends Model
{
    protected $table = "users";
}

$user = UserModel::singleton()->find(1);
```

### 常用方法

| 方法 | 说明 |
|------|------|
| `find($id)` | 按主键查 |
| `where($column, $operator, $value)` | 条件 |
| `all()` | 全部 |
| `create($data)` / `save($data)` / `delete($id)` | 写操作 |
| `paginate($perPage)` | 分页 |

## Schema — 表结构

- **文件位置**: `kernel/Foundation/Database/PDO/Schema.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

表结构操作（建表/改表/查询表结构）。

```php
DB::schema()->create("users", function ($table) {
    $table->increments("id");
    $table->string("name");
});
```

## Statement — 语句/表达式

- **文件位置**: `kernel/Foundation/Database/PDO/Statement.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

SQL 原始表达式（`DB::raw()` 返回）与预处理语句封装。

## Table — 表定义

- **文件位置**: `kernel/Foundation/Database/PDO/Table.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

建表时的列定义（配合 Schema 使用）。

## Paginator — 分页

- **文件位置**: `kernel/Foundation/Database/PDO/Paginator.php`
- **命名空间**: `kernel\Foundation\Database\PDO`

数据库分页器。

```php
$page = $query->paginate(20);   // 每页 20 条
```

## MongoDB

- **目录**: `kernel/Foundation/Database/MongoDB/`
- **命名空间**: `kernel\Foundation\Database\MongoDB`

| 类 | 文件位置 | 说明 |
|----|----------|------|
| `Mongo` | `Mongo.php` | MongoDB 门面/连接 |
| `Driver` | `Driver.php` | MongoDB 驱动封装 |
| `Collection` | `Collection.php` | 集合操作（对应关系型表） |

```php
$users = Mongo::collection("users")->find(["status" => 1]);
```

## SQLite

- **目录**: `kernel/Foundation/Database/SQLite/`
- **命名空间**: `kernel\Foundation\Database\SQLite`

| 类 | 文件位置 | 说明 |
|----|----------|------|
| `SQLite` | `SQLite.php` | SQLite 连接/操作 |
| `SQLiteModel` | `SQLiteModel.php` | SQLite 模型基类 |

```php
$rows = SQLite::query("SELECT * FROM users WHERE status = 1");
```
