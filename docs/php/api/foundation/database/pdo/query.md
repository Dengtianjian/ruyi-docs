# Query — 数据库查询构建器

- **文件位置**: `kernel/Foundation/Database/PDO/Query.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **继承自**: `AbilityBaseObject`
- **是否可继承**: 是

提供流畅的链式 API 构建 SQL 查询，支持 SELECT / INSERT / UPDATE / DELETE，以及子查询、联结（JOIN）、聚合函数、分页等高级特性。是 ORM 层的查询构建核心。

## 使用方式

```php
// 通过 table() 静态入口创建实例并链式调用
Query::table('users')->where('status', 'active')->get();

// 或直接 new
(new Query('users'))->where('id', 1)->first();
```

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$executeType` | `string` | `""` | private | 当前 SQL 操作类型，可选 `select`/`insert`/`replace`/`update`/`delete`，决定生成 SQL 的类型 |
| `$options` | `array` | `[]` | private | 查询选项数组，存储构建 SQL 所需的全部参数（from/select/conditions/orders/pagination/joins/groupBy/having/data 等） |
| `$filterNullConditions` | `array` | `[]` | private | 可空过滤条件集合，`filterNullWhere()` 添加，生成 WHERE 前自动过滤空值 |
| `$sql` | `string` | `""` | protected | 当前构建的 SQL 语句 |
| `$executeReset` | `bool` | `true` | protected | 执行后是否自动重置查询参数；写操作执行后清空 conditions/orders/select 等构建选项，保留 from 与 databaseDriver |
| `$databaseDriver` | `Driver` | `null` | protected | 数据库驱动实例 |
| `$clause` | `bool` | `false` | protected | 是否子查询子句模式（不拼接执行关键字） |
| `$bindings` | `array` | `[]` | protected | 参数绑定数组，键为占位符名、值为绑定值 |
| `$bindingCounter` | `int` | `0` | private | 自增绑定计数器，用于生成唯一占位符名 |

## 方法速查表

| 类别 | 方法 |
|------|------|
| 基础 | `__construct`、`setDatabaseDriver`、`getDatabaseDriver`、`getTableName`、`table`、`fill`、`reset`、`bind`、`addBindings`、`getBindings`、`raw`、`getSQL` |
| 数据源 | `from`、`fromSub` |
| 联结 | `join`、`leftJoin`、`rightJoin`、`innerJoin` |
| 字段 | `select`、`selectRaw`、`selectSub`、`addSelect`、`distinct` |
| 排序分组 | `orderBy`、`orderByRaw`、`orderRandom`、`groupBy`、`groupByRaw` |
| 分页 | `limit`、`take`、`offset`、`skip`、`page`、`paginate` |
| 条件 | `where`、`whereRaw`、`whereBetween`、`whereNotBetween`、`whereIn`、`whereNotIn`、`whereNull`、`whereNotNull`、`whereLike`、`whereNotLike`、`whereColumn`、`whereDate/Year/Month/Day/Time/Hour/Minute/Second`、`whereExists`、`whereNotExists`、`orWhere`、`orWhereRaw`、`orWhereBetween`、`orWhereNotBetween`、`orWhereIn`、`orWhereNotIn`、`orWhereNull`、`orWhereNotNull`、`orWhereLike`、`orWhereNotLike`、`orWhereColumn`、`orWhereDate/Year/Month/Day/Time/Hour/Minute/Second`、`orWhereExists`、`orWhereNotExists`、`whereFilter` |
| 查询结果 | `first`、`value`、`get`、`pluck`、`cursor`、`chunk`、`chunkById`、`chunkStream` |
| 聚合 | `count`、`max`、`min`、`avg`、`sum`、`exists`、`notExists` |
| 写操作 | `writeSql`、`insert`、`insertGetId`、`update`、`delete` |

## 方法

### `__construct($tableName, $databaseDriver)` — 构造查询构建器

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$tableName` | `string\|null` | `null` | 表名（也可通过 `from()` 链式设置） |
| `$databaseDriver` | `Driver\|null` | `null` | 数据库驱动，默认使用当前连接 |

**返回值**

- 无。

### `setDatabaseDriver($driver)` — 设置执行 SQL 时使用的数据库驱动

用于动态切换连接（多数据库、读写分离）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$driver` | `Driver` | 无 | 数据库驱动实例 |

**返回值**

- `$this`。

### `getDatabaseDriver()` — 获取当前使用的数据库驱动

**参数**

- 无。

**返回值**

- `Driver`。

### `getTableName()` — 获取当前查询绑定的表名

**参数**

- 无。

**返回值**

- `string\|null`。

### `table($tableName, $databaseDriver)` — 静态工厂

创建 `Query` 实例并指定表名，`new Query($tableName)` 的快捷方式。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$tableName` | `string\|null` | `null` | 表名 |
| `$databaseDriver` | `Driver\|null` | `null` | 数据库驱动 |

**返回值**

- `Query`。

### `fill($executeType, $options)` — 填充执行类型与选项

用于子查询或 Model 层注入预构建的查询状态，不经过完整链式调用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$executeType` | `string` | 无 | 执行类型（select/insert/update/delete） |
| `$options` | `array` | 无 | 选项数组（from、select、conditions 等） |

**返回值**

- `$this`。

### `reset()` — 重置查询参数

将所有构建选项恢复为初始状态，但保留 `from`（表名）与 `databaseDriver`。写操作（INSERT/UPDATE/DELETE）执行后会自动调用，下一次链式调用从干净状态开始。

**参数**

- 无。

**返回值**

- `$this`。

### `bind($key, $value)` — 添加单个绑定参数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|int` | 无 | 占位符名称（`:name`）或位置索引 |
| `$value` | `mixed` | 无 | 绑定的值 |

**返回值**

- `$this`。

### `addBindings(array $bindings)` — 批量添加绑定参数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$bindings` | `array` | 无 | 绑定参数数组 |

**返回值**

- `$this`。

### `getBindings()` — 获取所有累积的绑定参数

**参数**

- 无。

**返回值**

- `array`。

### `raw($sql)` — 创建原始 SQL 表达式包装器

将字符串标记为原始 SQL，插入查询时不会被转义或加引号。适用于 SQL 函数调用、表达式等场景。

> **警告**：raw 值未经任何过滤，务必确保 SQL 来自可信来源，避免 SQL 注入。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sql` | `string` | 无 | 原始 SQL 表达式 |

**返回值**

- `Statement`。

**示例**

```php
$query->from('users')->insert(['created_at' => $query->raw('NOW()')]);
```

### `getSQL()` — 获取当前查询对应的 SQL 语句（调试用）

返回的 SQL 含占位符，不替换实际值。

**参数**

- 无。

**返回值**

- `string`。

### `from($tableName, $ASName)` — 设置查询的主表

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$tableName` | `string` | 无 | 表名 |
| `$ASName` | `string\|null` | `null` | 表别名（可选） |

**返回值**

- `$this`。

### `fromSub($callableOrQuery, $ASName)` — 设置子查询作为数据源

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callableOrQuery` | `callable\|Query` | 无 | 子查询或闭包 |
| `$ASName` | `string\|null` | `null` | 子查询别名 |

**返回值**

- `$this`。

### `join($table, $first, $operator, $second, $type)` — 添加 JOIN 子句

支持 `表名 AS 别名` 格式自动解析，多次调用可叠加多个 JOIN。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$table` | `string` | 无 | 关联表名 |
| `$first` | `string` | 无 | ON 条件左侧列名（如 `users.id`） |
| `$operator` | `string` | 无 | 比较运算符（如 `=`） |
| `$second` | `string` | 无 | ON 条件右侧列名 |
| `$type` | `string` | `'INNER'` | JOIN 类型：`INNER`/`LEFT`/`RIGHT` |

**返回值**

- `$this`。

### `leftJoin($table, $first, $operator, $second)` — 添加 LEFT JOIN

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$table` | `string` | 无 | 关联表名 |
| `$first` | `string` | 无 | ON 条件左侧 |
| `$operator` | `string` | 无 | 比较运算符 |
| `$second` | `string` | 无 | ON 条件右侧 |

**返回值**

- `$this`。

### `rightJoin($table, $first, $operator, $second)` — 添加 RIGHT JOIN

参数同 `leftJoin`。

### `innerJoin($table, $first, $operator, $second)` — 添加 INNER JOIN

参数同 `leftJoin`。

### `select(...$column)` — 设置查询字段

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$column` | `mixed` | 无 | 字段名列表，如 `'id'`、`'name'`、`'*'` |

**返回值**

- `$this`。

### `selectRaw($columnSQL)` — 设置原始 SQL 查询字段

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$columnSQL` | `string` | 无 | 原始 SQL 字段表达式，如 `COUNT(*) as total` |

**返回值**

- `$this`。

### `selectSub($callbackOrQuery, $asName)` — 设置子查询作为查询字段

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callbackOrQuery` | `callable\|Query` | 无 | 子查询或闭包 |
| `$asName` | `string` | 无 | 字段别名 |

**返回值**

- `$this`。

### `addSelect(...$column)` — 添加查询字段

自动识别字段类型（普通字段、原始 SQL、带别名字段、`Statement` 实例）。含 `AS` 或逗号的字符串按 raw 处理。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$column` | `mixed` | 无 | 字段名或表达式 |

**返回值**

- `$this`。

### `distinct(...$column)` — 设置去重查询

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$column` | `mixed` | 无 | 去重字段列表（可选） |

**返回值**

- `$this`。

### `orderBy($column, $by)` — 设置排序条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 排序字段 |
| `$by` | `string` | `"ASC"` | 排序方向，`ASC` 或 `DESC` |

**返回值**

- `$this`。

### `orderByRaw($rawSQL)` — 设置原始 SQL 排序条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rawSQL` | `string` | 无 | 原始 SQL 排序表达式，如 `RAND()`、`FIELD(...)` |

**返回值**

- `$this`。

### `orderRandom($seed)` — 设置随机排序

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seed` | `mixed` | `null` | 随机种子（可选，保证可重复性） |

**返回值**

- `$this`。

### `groupBy(...$column)` — 设置分组条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `...$column` | `mixed` | 无 | 分组字段列表 |

**返回值**

- `$this`。

### `groupByRaw($rawSQL)` — 原始 SQL GROUP BY 子句

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rawSQL` | `string` | 无 | 原始 SQL 分组表达式 |

**返回值**

- `$this`。

### `limit($value)` — 设置查询结果数量限制

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|Statement` | 无 | 最多返回的记录数量 |

**返回值**

- `$this`。

### `take($value)` — LIMIT 的别名

参数同 `limit`。

### `offset($value)` — 设置查询结果的偏移量

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `int\|Statement` | 无 | 跳过的记录数量 |

**返回值**

- `$this`。

### `skip($value)` — OFFSET 的别名

参数同 `offset`。

### `page($page, $perPage)` — 基于页码的便捷分页

等价于 `limit($perPage)` + `offset(($page-1) * $perPage)`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$page` | `int` | 无 | 页码，从 1 开始（小于 1 视为第 1 页） |
| `$perPage` | `int` | `10` | 每页记录数 |

**返回值**

- `$this`。

### `paginate($params)` — 分页查询（含总数统计）

克隆当前查询实例执行 COUNT 统计总数，再执行当前查询获取当前页数据。需配合 `limit()/offset()` 或 `page()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数，传递给 `count()` 和 `get()` |

**返回值**

- `Paginator`：分页结果对象，含 items、page、perPage、total 等。

**示例**

```php
$paginator = $query->from('users')->page(1, 20)->paginate();
foreach ($paginator->getItems() as $user) { /* ... */ }
echo "共 {$paginator->getTotal()} 条记录";
```

### `where($column, $valueOrOperator, $value)` — 基础 WHERE 条件

支持多种调用方式：

```php
where('column', 'value')                    // 默认操作符 '='
where('column', 'operator', 'value')        // 指定操作符
where(['col1' => 'val1', 'col2' => 'val2']) // 多条件数组
where(function ($q) { ... })                // 闭包分组（括号包裹）
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `mixed` | 无 | 列名、条件数组或闭包 |
| `$valueOrOperator` | `mixed` | `null` | 值（2 参时）或操作符（3 参时） |
| `$value` | `mixed` | `null` | 值（使用 3 参时） |

**返回值**

- `$this`。

### `whereRaw($sql)` — 原始 SQL WHERE 条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sql` | `string` | 无 | 原始 SQL 表达式 |

**返回值**

- `$this`。

### `whereBetween($column, $min, $max)` — BETWEEN 范围条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 列名 |
| `$min` | `mixed` | 无 | 区间最小值 |
| `$max` | `mixed` | 无 | 区间最大值 |

**返回值**

- `$this`。

### `whereNotBetween($column, $min, $max)` — NOT BETWEEN 范围条件

参数同 `whereBetween`。

### `whereIn($column, $valueOrQuery)` — IN 列表条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 列名 |
| `$valueOrQuery` | `array\|Query` | 无 | IN 的值数组或子查询 |

**返回值**

- `$this`。

### `whereNotIn($column, $valueOrQuery)` — NOT IN 列表条件

参数同 `whereIn`。

### `whereNull($column)` — IS NULL 条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 列名 |

**返回值**

- `$this`。

### `whereNotNull($column)` — IS NOT NULL 条件

参数同 `whereNull`。

### `whereLike($column, $value)` — LIKE 模糊匹配条件

通配符 `%` 和 `_` 需在传入值中自行添加。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 列名 |
| `$value` | `string` | 无 | 匹配模式 |

**返回值**

- `$this`。

### `whereNotLike($column, $value)` — NOT LIKE 不匹配条件

参数同 `whereLike`。

### `whereColumn($column1, $operatorOrColumn2, $column2)` — 列与列比较条件

```php
whereColumn('col1', 'col2')       // col1 = col2
whereColumn('col1', '>', 'col2')  // col1 > col2
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column1` | `string` | 无 | 第一个列名 |
| `$operatorOrColumn2` | `string` | 无 | 操作符（3 参）或第二个列名（2 参） |
| `$column2` | `string\|null` | `null` | 第二个列名（3 参使用） |

**返回值**

- `$this`。

### `whereDate($column, $operatorOrValue, $value)` — 日期条件

对日期部分进行比较，操作符为 `=` 时可省略第二参只传值。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 列名 |
| `$operatorOrValue` | `string` | 无 | 操作符或值 |
| `$value` | `string` | `null` | 值（3 参时） |

**返回值**

- `$this`。

`whereYear`、`whereMonth`、`whereDay`、`whereTime`、`whereHour`、`whereMinute`、`whereSecond` 与 `whereDate` 参数结构相同，分别对年份、月份、天数、时间、小时、分钟、秒部分比较。

### `whereExists($queryOrCallable)` — EXISTS 子查询条件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$queryOrCallable` | `Query\|callable` | 无 | 子查询实例或闭包 |

**返回值**

- `$this`。

### `whereNotExists($queryOrCallable)` — NOT EXISTS 子查询条件

参数同 `whereExists`。

### `orWhere($column, $valueOrOperator, $value)` — OR WHERE 条件

参数与 `where` 相同，使用 OR 连接。闭包内所有条件自动括号包裹。

### `orWhereRaw($sql)` — OR 原始 SQL WHERE 条件

参数同 `whereRaw`。

### `orWhereBetween($column, $min, $max)` — OR BETWEEN 条件

参数同 `whereBetween`。

### `orWhereNotBetween($column, $min, $max)` — OR NOT BETWEEN 条件

参数同 `whereBetween`。

### `orWhereIn($column, $valueOrQuery)` — OR IN 条件

参数同 `whereIn`。

### `orWhereNotIn($column, $valueOrQuery)` — OR NOT IN 条件

参数同 `whereIn`。

### `orWhereNull($column)` — OR IS NULL 条件

参数同 `whereNull`。

### `orWhereNotNull($column)` — OR IS NOT NULL 条件

参数同 `whereNull`。

### `orWhereLike($column, $value)` — OR LIKE 条件

参数同 `whereLike`。

### `orWhereNotLike($column, $value)` — OR NOT LIKE 条件

参数同 `whereLike`。

### `orWhereColumn($column1, $operatorOrColumn2, $column2)` — OR 列与列比较条件

参数同 `whereColumn`。

`orWhereDate`、`orWhereYear`、`orWhereMonth`、`orWhereDay`、`orWhereTime`、`orWhereHour`、`orWhereMinute`、`orWhereSecond` 为 OR 连接的日期/时间条件，参数结构同 `whereDate` 系列。

### `orWhereExists($queryOrCallable)` — OR EXISTS 子查询条件

参数同 `whereExists`。

### `orWhereNotExists($queryOrCallable)` — OR NOT EXISTS 子查询条件

参数同 `whereExists`。

### `whereFilter($data, $operator)` — 从数组批量添加过滤条件

接收关联数组（如 `$_GET`），自动过滤值为 `null`、空字符串的项。适用于前端搜索/筛选参数场景。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array` | 无 | 关联数组，键为字段名、值为条件值 |
| `$operator` | `string` | `"AND"` | 逻辑连接符（AND/OR） |

**返回值**

- `$this`。

**示例**

```php
// $_GET = ['age' => '18', 'name' => '', 'role' => 'admin']
$query->from('users')->whereFilter($_GET)->get();
// → WHERE `age` = '18' AND `role` = 'admin'
```

### `first($params)` — 获取第一条记录

自动添加 `LIMIT 1`（覆盖之前设置的 `limit()`），无结果返回 `false`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `array\|false`。

### `value($column, $params)` — 获取第一条记录的指定列值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 要获取值的列名 |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `mixed\|null`：列值；记录或列不存在时返回 `null`。

### `get($params)` — 获取所有查询结果

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `array`：二维数组，无结果时为空数组。

### `pluck($column, $indexKey, $params)` — 提取指定列的值作为数组

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 要提取值的列名 |
| `$indexKey` | `string\|null` | `null` | 作为数组键名的列名，`null` 时使用数字索引 |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `array`。

### `cursor($params)` — 使用游标（Generator）逐行遍历结果

创建 `PDOStatement` 游标逐行取回数据，降低大结果集内存占用。生成器不支持 rewind，只能遍历一次。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `\Generator`。

### `chunk($size, $callback)` — 分块处理查询结果

将结果集按大小分块，回调返回 `false` 可提前中断。内部使用 `page() + paginate()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$size` | `int` | 无 | 每块的大小（记录数） |
| `$callback` | `callable` | 无 | 回调 `function(array $items, int $page): ?bool`，返回 `false` 中断 |

**返回值**

- `bool`：完成返回 `true`，中断返回 `false`。

### `chunkById($size, $callback, $column)` — 基于 ID 的分块处理（高性能）

使用 `WHERE id > lastId` 替代 OFFSET，避免大偏移量性能下降。自动按指定列升序排序。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$size` | `int` | 无 | 每块的大小 |
| `$callback` | `callable` | 无 | 回调 `function(array $items): ?bool`，返回 `false` 中断 |
| `$column` | `string` | `"id"` | 用于分块的递增列名 |

**返回值**

- `bool`。

### `chunkStream($size, $column)` — 基于 ID 的分块流式处理（生成器）

结合 `chunkById` 高性能与 `cursor` 生成器模式，逐条 yield 记录。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$size` | `int` | 无 | 每块的大小 |
| `$column` | `string` | `"id"` | 用于分块的递增列名 |

**返回值**

- `\Generator`。

### `count($column, $params)` — 统计查询结果数量

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | `"*"` | 统计的列名，`"*"` 表示所有记录；支持 `DISTINCT category` |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `int\|false`：查询失败或无结果返回 `false`。

### `max($column, $params)` — 获取指定列的最大值

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$column` | `string` | 无 | 要计算最大值的列名 |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `mixed\|false`。

### `min($column, $params)` — 获取指定列的最小值

参数同 `max`。

### `avg($column, $params)` — 计算指定列的平均值

参数同 `max`，返回 `float\|false`。

### `sum($column, $params)` — 计算指定列的总和

参数同 `max`，返回 `float\|int\|false`。

### `exists($params)` — 查询是否存在

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `bool`：存在返回 `true`。

### `notExists($params)` — 查询是否不存在

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `bool`：不存在返回 `true`。

### `writeSql($type, $data, $options)` — 设置写操作状态并返回 SQL

不执行，仅供外层获取 SQL 后自行执行。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$type` | `string` | 无 | 操作类型：insert/replace/update/delete |
| `$data` | `mixed` | `null` | 数据（insert/replace/update 需要） |
| `$options` | `array` | `[]` | 额外选项，如 `['insertIsIgnore' => true]` |

**返回值**

- `string`。

### `insert($data, $isReplaceInto, $isIgnore, $returnId, $params)` — 执行插入操作

支持单行和批量插入，自动检测数据格式（关联数组为单行、索引数组为批量）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array` | 无 | 插入数据 |
| `$isReplaceInto` | `bool` | `false` | 是否使用 `REPLACE INTO` |
| `$isIgnore` | `bool` | `false` | 是否使用 `INSERT IGNORE` |
| `$returnId` | `bool` | `false` | 是否返回自增 ID 而非执行结果 |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `int\|bool`：`$returnId` 为 `true` 时返回自增 ID，否则返回执行结果。

### `insertGetId($data, $isReplaceInto, $isIgnore, $params)` — 执行插入并返回自增 ID

`insert()` 的便捷方法。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array` | 无 | 插入数据 |
| `$isReplaceInto` | `bool` | `false` | 是否使用 `REPLACE INTO` |
| `$isIgnore` | `bool` | `false` | 是否使用 `INSERT IGNORE` |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `int\|string`：自增 ID。

### `update($data, $params)` — 执行更新操作

必须结合 `where()` 指定更新范围，否则会更新全表。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `array` | 无 | 要更新的字段和值 |
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `int\|bool`：影响的行数或 `false`。

### `delete($params)` — 执行删除操作

必须结合 `where()` 指定删除范围，否则会删除全表。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | `[]` | 预处理参数 |

**返回值**

- `int\|bool`：影响的行数或 `false`。
