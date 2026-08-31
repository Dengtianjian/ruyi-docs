# DB — 数据库操作门面

- **文件位置**: `kernel/Foundation/Database/PDO/DB.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **类型**: 纯静态类
- **是否可继承**: 是

数据库操作门面，参考 Laravel DB 风格。提供两套 API：

1. **Query Builder**：`DB::table('users')->where('id', 1)->first()`
2. **原生 SQL（带参数绑定）**：`DB::select('SELECT * FROM users WHERE id = ?', [1])`

同时提供连接管理、事务、查询日志与查询监听能力。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `connection($name)` | 切换或获取数据库连接 |
| `getPdo()` | 获取当前连接底层 PDO 实例 |
| `table($tableName, $databaseDriver)` | 创建 Query 实例 |
| `select($query, $bindings)` | 执行 SELECT 返回全部结果 |
| `selectOne($query, $bindings)` | 执行 SELECT 返回第一条 |
| `scalar($query, $bindings)` | 执行 SELECT 返回单个标量值 |
| `insert($query, $bindings)` | 执行 INSERT |
| `insertGetId($query, $bindings)` | 执行 INSERT 并返回自增 ID |
| `update($query, $bindings)` | 执行 UPDATE 返回受影响行数 |
| `delete($query, $bindings)` | 执行 DELETE 返回受影响行数 |
| `statement($query, $bindings)` | 执行任意 SQL（不返回结果集） |
| `affectingStatement($query, $bindings)` | 执行任意 SQL 返回受影响行数 |
| `unprepared($query)` | 执行原始 SQL（不预处理） |
| `raw($value)` | 创建原始 SQL 表达式 |
| `query($sql)` | 执行 SQL，SELECT 返回 PDOStatement |
| `exec($sql)` | 执行 SQL 返回受影响行数 |
| `prepare($query, $options)` | 预处理 SQL |
| `execute($query, $params)` | 预处理+绑定+执行 |
| `quote($string, $type)` | 转义字符串 |
| `insertId()` | 最后插入的自增 ID |
| `error()` | 最近一次操作错误信息 |
| `errno()` | 最近一次操作 SQLSTATE 错误码 |
| `begin()` | 开始事务 |
| `commit()` | 提交事务 |
| `rollback()` | 回滚事务 |
| `transaction($callback, $attempts)` | 事务闭包执行（支持重试） |
| `inTransaction()` | 是否在事务中 |
| `enableQueryLog()` | 开启查询日志 |
| `disableQueryLog()` | 关闭查询日志 |
| `getQueryLog()` | 获取查询日志 |
| `flushQueryLog()` | 清空查询日志 |
| `listen($callback)` | 注册查询监听器 |

## 方法

### `connection($name = null)` — 切换或获取数据库连接

切换当前使用的数据库驱动。不传 `$name` 时无操作，返回当前驱动需用 `getPdo()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string\|null` | `null` | 连接名称；为 `null` 时使用默认连接 |

**返回值**

- 无。

### `getPdo()` — 获取当前连接底层 PDO 实例

**参数**

- 无。

**返回值**

- `\PDO`：当前驱动封装的 PDO 实例。

### `table($tableName = null, $databaseDriver = null)` — 创建 Query 实例

Query Builder 入口。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$tableName` | `string\|null` | `null` | 表名 |
| `$databaseDriver` | `Driver\|null` | `null` | 指定驱动，默认使用当前连接 |

**返回值**

- `Query`：Query 构建器实例。

**示例**

```php
$users = DB::table('users')->where('status', 1)->get();
```

### `select($query, $bindings = [])` — 执行 SELECT 查询并返回全部结果

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句，支持 `?` 或 `:name` 占位符 |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `array`：全部结果行。

**示例**

```php
$rows = DB::select('SELECT * FROM users WHERE status = ?', [1]);
```

### `selectOne($query, $bindings = [])` — 执行 SELECT 查询并返回第一条记录

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句 |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `array\|null`：第一条记录；无结果时返回 `null`。

### `scalar($query, $bindings = [])` — 执行 SELECT 查询并返回单个标量值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句 |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `mixed`：第一行第一列的值。

**示例**

```php
$count = DB::scalar('SELECT COUNT(*) FROM users WHERE status = ?', [1]);
```

### `insert($query, $bindings = [])` — 执行 INSERT 语句

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | INSERT SQL |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `bool`：执行成功返回 `true`。

### `insertGetId($query, $bindings = [])` — 执行 INSERT 并返回自增 ID

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | INSERT SQL |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `string\|int`：自增 ID；失败时返回 `0`。

**示例**

```php
$id = DB::insertGetId('INSERT INTO users (name) VALUES (?)', ['Tom']);
```

### `update($query, $bindings = [])` — 执行 UPDATE 语句

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | UPDATE SQL |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `int`：受影响行数。

### `delete($query, $bindings = [])` — 执行 DELETE 语句

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | DELETE SQL |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `int`：受影响行数。

### `statement($query, $bindings = [])` — 执行任意 SQL 语句

不返回结果集。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句 |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `bool`：执行成功返回 `true`。

### `affectingStatement($query, $bindings = [])` — 执行任意 SQL 语句并返回受影响行数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句 |
| `$bindings` | `array` | `[]` | 参数绑定 |

**返回值**

- `int`：受影响行数。

### `unprepared($query)` — 执行原始 SQL

不经过预处理绑定。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | 原始 SQL |

**返回值**

- `bool`：执行成功返回 `true`。

### `raw($value)` — 创建原始 SQL 表达式

用于 Query Builder 中的片段注入。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string` | 无 | 原始 SQL 片段 |

**返回值**

- `Statement`：原始表达式实例。

**示例**

```php
DB::table('users')->field(DB::raw('COUNT(*) as total'))->first();
```

### `query($sql)` — 执行 SQL 查询

SELECT 返回 `PDOStatement`，写操作返回受影响行数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sql` | `string` | 无 | SQL 语句 |

**返回值**

- `\PDOStatement\|int`。

### `exec($sql)` — 执行 SQL 并返回受影响行数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sql` | `string` | 无 | SQL 语句 |

**返回值**

- `int`：受影响行数。

### `prepare($query, $options = [])` — 预处理 SQL 语句

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 模板 |
| `$options` | `array` | `[]` | PDOStatement 选项 |

**返回值**

- `\PDOStatement`。

### `execute($query, $params = [])` — 预处理+绑定+执行

SELECT 返回 `PDOStatement`，其余返回受影响行数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 模板 |
| `$params` | `array` | `[]` | 绑定参数 |

**返回值**

- `\PDOStatement\|int`。

### `quote($string, $type = \PDO::PARAM_STR)` — 转义字符串

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$string` | `string` | 无 | 待转义字符串 |
| `$type` | `int` | `\PDO::PARAM_STR` | 参数类型（`PDO::PARAM_*`） |

**返回值**

- `string\|false`：转义后的字符串。

### `insertId()` — 最后插入的自增 ID

**参数**

- 无。

**返回值**

- `string`：自增 ID。

### `error()` — 最近一次操作错误信息

**参数**

- 无。

**返回值**

- `array`：错误信息。

### `errno()` — 最近一次操作 SQLSTATE 错误码

**参数**

- 无。

**返回值**

- `string`：SQLSTATE 错误码。

### `begin()` — 开始事务

**参数**

- 无。

**返回值**

- `bool`。

### `commit()` — 提交事务

**参数**

- 无。

**返回值**

- `bool`。

### `rollback()` — 回滚事务

**参数**

- 无。

**返回值**

- `bool`。

### `transaction(callable $callback, $attempts = 1)` — 事务闭包执行

事务内执行回调并提交；异常时回滚，遇死锁可重试。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable` | 无 | 事务闭包，接收 `Driver` 实例 |
| `$attempts` | `int` | `1` | 死锁重试次数 |

**返回值**

- `mixed`：回调返回值。

**异常**

- `\Exception`：非死锁异常直接抛出。

**示例**

```php
DB::transaction(function ($driver) {
    DB::table('users')->insert([...]);
    DB::table('logs')->insert([...]);
});
```

### `inTransaction()` — 是否在事务中

**参数**

- 无。

**返回值**

- `bool`：在事务中返回 `true`。

### `enableQueryLog()` — 开启查询日志

**参数**

- 无。

**返回值**

- 无。

### `disableQueryLog()` — 关闭查询日志

**参数**

- 无。

**返回值**

- 无。

### `getQueryLog()` — 获取查询日志

**参数**

- 无。

**返回值**

- `array`：日志数组，每项为 `['query' => string, 'bindings' => array, 'time' => float]`。

### `flushQueryLog()` — 清空查询日志

**参数**

- 无。

**返回值**

- 无。

### `listen(callable $callback)` — 注册查询监听器

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable` | 无 | 监听函数，签名 `function($query, $bindings, $time)` |

**返回值**

- 无。

**示例**

```php
DB::listen(function ($query, $bindings, $time) {
    Log::info($query, ['bindings' => $bindings, 'time' => $time]);
});
```
