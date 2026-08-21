# Driver — PDO 驱动封装

- **文件位置**: `kernel/Foundation/Database/PDO/Driver.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **是否可继承**: 是

PDO 驱动封装，数据库操作的底层引擎。直接包裹 PHP 原生 `PDO` 实例，提供连接建立、SQL 执行、预处理语句、事务管理等基础能力，是 ORM 四层架构的最底层。

通常不直接使用，而是通过 `Connections` 注册后由 `DB` 门面、`Query` 构建器、`Model` 等上层组件间接调用。

## 职责范围

- **连接管理**：构造时建立 PDO 连接，通过 `getPDO()` 暴露原生实例
- **SQL 执行**：`query()` 自动区分 SELECT（返回 `PDOStatement`）和写操作（返回受影响行数），写操作内部使用 `PDO::exec()`
- **预处理**：`prepare()` + `bindValues()` + `execute()` 完整参数绑定流程，`bindValues()` 自动根据 PHP 值类型推断 PDO 参数类型
- **便捷查询**：`first()` / `all()` / `value()` / `object()` / `map()` 统一支持传参预处理和直查两种模式
- **事务**：`beginTransaction()` / `commit()` / `rollBack()` / `inTransaction()`

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$PDOInstance` | `\PDO` | — | private | PDO 连接实例 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($hostname, $username, $password, $database, $port, $options)` | 创建 PDO 连接 |
| `setAttribute($attribute, $value)` | 设置 PDO 连接属性 |
| `getAttribute($attribute)` | 获取 PDO 连接属性 |
| `error()` | 获取最近一次操作错误信息 |
| `errno()` | 获取最近一次操作 SQLSTATE 错误码 |
| `insertId()` | 获取最后插入的自增 ID |
| `getPDO()` | 获取底层 PDO 实例 |
| `quote($string, $type)` | 转义字符串 |
| `isSelectStatement($sql)` | 判断 SQL 是否为查询类语句（private） |
| `query($querySQL)` | 执行 SQL 查询 |
| `exec($statement)` | 执行 SQL 并返回受影响行数 |
| `beginTransaction()` | 开始事务 |
| `commit()` | 提交事务 |
| `inTransaction()` | 是否在事务中 |
| `rollBack()` | 回滚事务 |
| `prepare($query, $options)` | 预处理 SQL |
| `getParamType($value)` | 获取参数对应 PDO 类型常量（private） |
| `bindValues($statement, $params)` | 绑定参数数组到预处理语句 |
| `execute($query, $params)` | 执行预处理 SQL |
| `first($querySQL, $params, $mode, ...)` | 查询单行数据 |
| `all($querySQL, $params, $mode)` | 查询全部数据 |
| `value($querySQL, $params, $column)` | 查询单个列的值 |
| `object($querySQL, $params, $class, $constructorArgs)` | 查询并返回对象 |
| `map($querySQL, $callback, $params)` | 通过回调函数处理查询结果 |

## 方法

### `__construct($hostname, $username, $password, $database, $port, $options)` — 创建 PDO 连接

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$hostname` | `string` | `null` | 主机名 |
| `$username` | `string` | `null` | 用户名 |
| `$password` | `string` | `null` | 密码 |
| `$database` | `string` | `null` | 数据库名 |
| `$port` | `int` | `3306` | 端口 |
| `$options` | `array\|null` | `null` | PDO 连接选项 |

**异常**

- `Error`：连接失败时抛出，错误码 `PDO:500000:{PDO错误码}`，错误详情为堆栈。

**返回值**

- 无。

### `setAttribute($attribute, $value)` — 设置 PDO 连接属性

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$attribute` | `int` | 无 | 属性常量，如 `PDO::ATTR_ERRMODE` |
| `$value` | `mixed` | 无 | 属性值 |

**返回值**

- `bool`。

### `getAttribute($attribute)` — 获取 PDO 连接属性

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$attribute` | `int` | 无 | 属性常量 |

**返回值**

- `mixed`：属性值。

### `error()` — 获取最近一次操作错误信息

**参数**

- 无。

**返回值**

- `array`：`errorInfo()` 结果。

### `errno()` — 获取最近一次操作 SQLSTATE 错误码

**参数**

- 无。

**返回值**

- `string`：SQLSTATE 错误码。

### `insertId()` — 获取最后插入的自增 ID

**参数**

- 无。

**返回值**

- `string`：自增 ID。

### `getPDO()` — 获取底层 PDO 实例

**参数**

- 无。

**返回值**

- `\PDO`。

### `quote($string, $type)` — 转义字符串用于安全的 SQL 拼接

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$string` | `string` | 无 | 待转义字符串 |
| `$type` | `int` | `PDO::PARAM_STR` | 参数类型 |

**返回值**

- `string\|false`：转义后的字符串。

### `isSelectStatement($sql)` — 判断 SQL 是否为查询类语句

> private。判断首个单词是否为 `SELECT`/`SHOW`/`DESCRIBE`/`EXPLAIN`/`DESC`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sql` | `string` | 无 | SQL 语句 |

**返回值**

- `bool`。

### `query($querySQL)` — 执行 SQL 查询

查询类语句返回 `PDOStatement`，写操作返回受影响行数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$querySQL` | `string` | 无 | SQL 语句 |

**异常**

- `Error`：执行失败时抛出，错误码 `DatabaseError:500:{SQLSTATE}`。

**返回值**

- `\PDOStatement\|int`。

### `exec($statement)` — 执行 SQL 语句并返回受影响行数

适用于不需要结果集的 DDL/DML 操作，比 `query()` 更高效。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statement` | `string` | 无 | SQL 语句 |

**异常**

- `Error`：执行失败时抛出，错误码 `DatabaseError:500:{SQLSTATE}`。

**返回值**

- `int`：受影响行数。

### `beginTransaction()` — 开始事务

**参数**

- 无。

**异常**

- `Error`：失败时抛出，错误码 `BeginTransactionError:500:{SQLSTATE}`。

**返回值**

- `true`。

### `commit()` — 提交事务

**参数**

- 无。

**异常**

- `Error`：失败时抛出，错误码 `CommitTransactionError:500:{SQLSTATE}`。

**返回值**

- `true`。

### `inTransaction()` — 检查当前是否处于事务中

**参数**

- 无。

**返回值**

- `bool`。

### `rollBack()` — 回滚事务

**参数**

- 无。

**异常**

- `Error`：失败时抛出，错误码 `RollbackTransactionError:500:{SQLSTATE}`。

**返回值**

- `true`。

### `prepare($query, $options)` — 预处理 SQL 语句

支持命名（`:name`）和问号（`?`）占位符，同一语句不能混用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句模板 |
| `$options` | `array` | `[]` | PDOStatement 属性设置 |

**异常**

- `Error`：预处理失败时抛出，错误码 `PrepareError:500:{SQLSTATE}`。

**返回值**

- `\PDOStatement`。

### `getParamType($value)` — 获取参数对应的 PDO 类型常量

> private。`int`→`PARAM_INT`，`bool`→`PARAM_BOOL`，`null`→`PARAM_NULL`，其余→`PARAM_STR`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `mixed` | 无 | 参数值 |

**返回值**

- `int`：`PDO::PARAM_*` 常量。

### `bindValues($statement, $params)` — 绑定参数数组到预处理语句

支持命名（`:name`）和问号（`?`）两种占位符，自动根据值类型选择合适的 PDO 绑定类型。索引数组的键从 1 开始对应问号占位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statement` | `\PDOStatement` | 无 | 预处理语句对象 |
| `$params` | `array` | 无 | 参数数组，命名参数用关联数组、问号占位用索引数组 |

**返回值**

- 无。

### `execute($query, $params)` — 执行预处理 SQL

完成 `prepare → bind → execute` 流程。SELECT 返回 `PDOStatement`，写操作返回受影响行数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$query` | `string` | 无 | SQL 语句模板 |
| `$params` | `array` | `[]` | 绑定参数 |

**异常**

- `Error`：执行失败时抛出，错误码 `DatabaseError:500:{SQLSTATE}`。

**返回值**

- `\PDOStatement\|int`。

### `first($querySQL, $params, $mode, $cursorOrientation, $cursorOffset)` — 查询单行数据

传入 `$params` 时走预处理路径，否则走直查路径。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$querySQL` | `string` | 无 | SQL 语句或模板 |
| `$params` | `array` | `[]` | 参数绑定数组，为空时直查 |
| `$mode` | `int` | `PDO::FETCH_ASSOC` | 获取模式 |
| `$cursorOrientation` | `int` | `PDO::FETCH_ORI_NEXT` | 游标方向 |
| `$cursorOffset` | `int` | `0` | 游标偏移 |

**返回值**

- `array\|false`。

### `all($querySQL, $params, $mode)` — 查询全部数据

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$querySQL` | `string` | 无 | SQL 语句或模板 |
| `$params` | `array` | `[]` | 参数绑定数组，为空时直查 |
| `$mode` | `int` | `PDO::FETCH_ASSOC` | 获取模式 |

**返回值**

- `array`。

### `value($querySQL, $params, $column)` — 查询单个列的值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$querySQL` | `string` | 无 | SQL 语句或模板 |
| `$params` | `array` | `[]` | 参数绑定数组，为空时直查 |
| `$column` | `int` | `0` | 列索引 |

**返回值**

- `mixed`。

### `object($querySQL, $params, $class, $constructorArgs)` — 查询并返回对象

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$querySQL` | `string` | 无 | SQL 语句或模板 |
| `$params` | `array` | `[]` | 参数绑定数组，为空时直查 |
| `$class` | `string` | `"stdClass"` | 对象类名 |
| `$constructorArgs` | `array` | `[]` | 构造函数参数 |

**返回值**

- `object\|false`。

### `map($querySQL, $callback, $params)` — 通过回调函数处理查询结果

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$querySQL` | `string` | 无 | SQL 语句或模板 |
| `$callback` | `callable` | 无 | 回调函数，接收每行数据 |
| `$params` | `array` | `[]` | 参数绑定数组，为空时直查 |

**返回值**

- `array`。

## 完整示例

```php
use kernel\Foundation\Database\PDO\Driver;

$driver = new Driver('127.0.0.1', 'root', 'pass', 'my_db', 3306);
$rows   = $driver->all('SELECT * FROM users WHERE status = ?', [1]);
$count  = $driver->value('SELECT COUNT(*) FROM users');
$id     = $driver->execute('INSERT INTO users (name) VALUES (?)', ['Tom']);
```
