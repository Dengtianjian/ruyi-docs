---
title: Statement SQL 生成器
---

# Statement — SQL 语句生成器

`Statement` 是底层 SQL 生成引擎，负责将结构化的查询条件转换为 SQL 字符串。
`Query` 构建器内部大量使用 `Statement` 的静态方法来生成 SELECT、WHERE、ORDER BY、
INSERT、UPDATE 等 SQL 片段。

`Statement` 的所有方法均为纯静态、无状态、无副作用 — 输入结构化数组，输出 SQL 字符串。

> 大部分情况下，你不需要直接使用 `Statement`，而是通过 `Query` 构建器间接调用。
> 但在需要自定义 SQL 生成逻辑或 `DB::raw()` 表达式时，`Statement` 是核心组件。

## 条件类型速查

`Statement::where()` 支持以下条件类型，各类型由 `Query::addWhere()` 自动选择：

| 类型 | 说明 | 示例 SQL 片段 |
|------|------|-------------|
| `comparsion` | 比较运算 | `` `status` = 1 `` |
| `columnComparsion` | 列对列比较 | `` `updated_at` > `created_at` `` |
| `nullValue` | NULL 判断 | `` `deleted_at` IS NULL `` |
| `rangeTesting` | 范围测试 | `` `age` BETWEEN 18 AND 60 `` |
| `patternMatching` | 模式匹配 | `` `name` LIKE '%John%' `` |
| `func` | 函数条件 | `DATE(created_at) = '2025-01-01'`、`EXISTS(...)` |
| `raw` | 原始 SQL | `FIND_IN_SET(?, tags)` |
| `sub` | 子查询 | `(SELECT COUNT(*) FROM ...)` |
| `boolean` | 纯连接符 | 仅 AND / OR，不产生条件 SQL |

## 基础概念

`Statement` 实例可以承载一个 SQL 片段，并可嵌入到 `Query` 构建器的链式调用中：

```php
use kernel\Foundation\Database\PDO\Statement;

$raw = new Statement('COUNT(*) as total');
// $raw->getSQL() → 'COUNT(*) as total'
```

## DB::raw() 表达式

`DB::raw()` 本质上是创建 `Statement` 实例的快捷方式：

```php
use kernel\Foundation\Database\PDO\DB;

// 以下等价
DB::raw('NOW()');
new Statement('NOW()');

// 在 Query Builder 中使用
DB::table('users')->select(DB::raw('COUNT(*) as total'))->first();
DB::table('orders')->where('created_at', '>', DB::raw('NOW() - INTERVAL 7 DAY'))->get();
```

## format() — 数据格式化

将 PHP 值转换为适合嵌入 SQL 的字符串表示：

```php
Statement::format(123);            // 123（不处理）
Statement::format('admin');        // `admin`（默认 `` 包围）
Statement::format('admin', "'");   // 'admin'（单引号包围）
Statement::format(true);           // 1（bool→int）
Statement::format(false);          // 0
Statement::format(null);           // NULL

// 数组格式化
Statement::format([1, 2, 3], "'", "json");  // '[1,2,3]'（JSON 编码）
Statement::format([1, 2, 3], "'", "serialize");  // 序列化

// Query 实例会被转为子查询
$subQuery = DB::table('orders')->select('id');
Statement::format($subQuery);  // (SELECT `id` FROM `orders`)

// Statement 实例直接取 SQL
Statement::format(new Statement('NOW()'));  // NOW()
```

**参数说明**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `$target` | - | 要格式化的值 |
| `$stringQuote` | `` ` `` | 字符串包围符号，`false` 不包围 |
| `$arrayFormatMethod` | `"json"` | 数组格式化方式：`json` 或 `serialize` |

## batchFormat() — 批量格式化

遍历数组，逐元素调用 `format()`：

```php
$formatted = Statement::batchFormat(['id', 'name', 'email']);
// ['`id`', '`name`', '`email`']

$formatted = Statement::batchFormat([1, 'admin', 'a@b.com'], "'");
// [1, "'admin'", "'a@b.com'"]
```

## from() — FROM 子句生成

```php
// 表名
Statement::from('users', 'u');   // `users` AS `u`

// 库.表
Statement::from('db1.users', '');  // `db1`.`users`

// 子查询
Statement::from(function ($q) {
    $q->from('users')->select('id', 'name');
}, 'sub');  // (SELECT `id`,`name` FROM `users`) AS `sub`
```

## selectField() — SELECT 字段生成

```php
$sql = Statement::selectField([
    ['type' => 'name', 'value' => 'id'],
    ['type' => 'raw',  'value' => 'COUNT(*) as total'],
    ['type' => 'sub',  'value' => $subQuery, 'asName' => 'cnt'],
], $distinct = false);
// 字段名自动 `` 包围，raw 不处理，sub 包装为子查询
```

## where() — WHERE 条件生成

`Statement::where()` 接收结构化条件数组，支持多种条件类型：

### 比较运算（comparsion）

```php
// column = value
['type' => 'comparsion', 'column' => 'status', 'operator' => '=', 'value' => 1]
// → `status` = 1

// column IN (子查询)
['type' => 'comparsion', 'column' => 'user_id', 'operator' => 'IN', 'value' => function($q) { ... }]
// → `user_id` IN (SELECT ...)
```

### 列比较（columnComparsion）

```php
['type' => 'columnComparsion', 'column' => 'updated_at', 'operator' => '>', 'value' => 'created_at']
// → `updated_at` > `created_at`
```

### NULL 值（nullValue）

```php
['type' => 'nullValue', 'column' => 'deleted_at', 'operator' => 'IS NULL']
// → `deleted_at` IS NULL

['type' => 'nullValue', 'column' => 'email', 'operator' => '<=>']
// ≤> 遇到 NULL 自动转 IS NULL
```

### 范围测试（rangeTesting）

```php
// BETWEEN
['type' => 'rangeTesting', 'column' => 'age', 'operator' => 'BETWEEN', 'value' => [18, 60]]
// → `age` BETWEEN 18 AND 60

// IN
['type' => 'rangeTesting', 'column' => 'status', 'operator' => 'IN', 'value' => [1, 2, 3]]
// → `status` IN (1,2,3)
```

### 模式匹配（patternMatching）

```php
['type' => 'patternMatching', 'column' => 'name', 'operator' => 'LIKE', 'value' => '%John%']
// → `name` LIKE '%John%'
```

### 函数条件（func）

```php
// 日期函数
['type' => 'func', 'funcName' => 'DATE', 'column' => 'DATE(`created_at`)', 'operator' => '=', 'value' => '2025-01-01']

// EXISTS 子查询
['type' => 'func', 'funcName' => 'EXISTS', 'value' => function($q) { ... }]
// → EXISTS(SELECT ...)
```

### 原始 SQL（raw）

```php
['type' => 'raw', 'value' => 'FIND_IN_SET(?, tags)', 'boolean' => 'AND']
// → FIND_IN_SET(?, tags)
```

## order() — ORDER BY 生成

```php
// 普通排序
$sql = Statement::order([
    ['type' => 'general', 'field' => 'id', 'by' => 'DESC'],
    ['type' => 'general', 'field' => 'name', 'by' => 'ASC'],
]);
// → ORDER BY `id` DESC, `name` ASC

// 原始排序
$sql = Statement::order([
    ['type' => 'raw', 'field' => 'FIELD(status, 1, 2, 3)'],
]);
// → ORDER BY FIELD(status, 1, 2, 3)

// 随机排序
$sql = Statement::order([
    ['type' => 'random', 'by' => null],    // RAND()
    ['type' => 'random', 'by' => 12345],   // RAND(12345)
]);
```

## pagination() — LIMIT/OFFSET 生成

```php
Statement::pagination(10, null);    // LIMIT 10
Statement::pagination(null, 20);    // OFFSET 20
Statement::pagination(10, 20);      // LIMIT 10 OFFSET 20
```

## insert() — INSERT SQL 生成

```php
// 单行插入
$sql = Statement::insert('users', [
    'name'  => 'Alice',
    'email' => 'alice@example.com',
]);
// → INSERT INTO users (`name`,`email`) VALUES ('Alice','alice@example.com');

// 批量插入
$sql = Statement::insert('users', [
    ['name' => 'Alice'],
    ['name' => 'Bob'],
    ['name' => 'Charlie'],
]);
// → INSERT INTO users (`name`) VALUES ('Alice'),('Bob'),('Charlie');

// REPLACE INTO
$sql = Statement::insert('users', $data, true);

// INSERT IGNORE
$sql = Statement::insert('users', $data, false, true);
```

## update() — UPDATE SQL 生成

```php
$sql = Statement::update('users', [
    'name'   => 'NewName',
    'status' => 1,
], 'WHERE id = 1');
// → UPDATE users SET `name`='NewName',`status`=1 WHERE id = 1

// null 值 → NULL
$sql = Statement::update('users', ['deleted_at' => null], 'WHERE id = 1');
// → UPDATE users SET `deleted_at`=NULL WHERE id = 1
```

## batchUpdate() — 批量更新

通过 REPLACE INTO 实现批量更新，适合多条记录的一次性更新：

```php
$sql = Statement::batchUpdate(
    'users',
    ['id', 'name', 'status'],  // 字段列表
    [
        [1, 'Alice', 1],
        [2, 'Bob',   0],
        [3, 'Carol', 1],
    ],
    ''  // 额外条件
);
// 生成 REPLACE INTO ... 语句
```

## delete() — DELETE SQL 生成

```php
$sql = Statement::delete('users', 'WHERE id = 1');
// → DELETE FROM users WHERE id = 1
```

## groupBy() — GROUP BY 生成

```php
$sql = Statement::groupBy(['status', 'role']);
// → GROUP BY `status`, `role`
```

## increment() / decrement()

```php
Statement::increment('articles', 'view_count', 1);
// → UPDATE `articles` SET `view_count` = view_count+1

Statement::decrement('inventory', 'stock', 5);
// → UPDATE `inventory` SET `stock` = stock-5
```

## 架构关系

```
Query 构建器
    ├── 链式调用 (where/order/select...)
    ├── 内部构建结构化条件数组
    └── 调用 Statement 静态方法
            ├── Statement::selectField()
            ├── Statement::where()
            ├── Statement::order()
            ├── Statement::pagination()
            ├── Statement::insert()
            ├── Statement::update()
            └── Statement::delete()
                    ↓
            生成 SQL 字符串
                    ↓
            Driver::query() / execute()
                    ↓
            PDO → MySQL
```
