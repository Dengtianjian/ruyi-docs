---
title: Query Builder
---

# Query Builder — 链式查询构建器

`Query` 提供流畅的链式 API 构建 SQL 查询，支持 SELECT / INSERT / UPDATE / DELETE 以及子查询、聚合函数、分页等高级特性。

## 入口

```php
use kernel\Foundation\Database\PDO\Query;

// 方式一：静态工厂
Query::table('users')->where('id', 1)->first();

// 方式二：直接 new
(new Query('users'))->where('status', 1)->get();
```

> `Query` 构造时自动从 `Connections::getUseDriver()` 获取当前活跃连接，也可通过 `new Query('users', $customDriver)` 指定驱动。

---

## FROM / 表名

```php
Query::table('users')->get();
Query::table('users', 'u')->get();                              // 别名
Query::table('database.users')->get();                          // 库.表
Query::table()->from('users', 'u')->get();                      // 链式指定
Query::table()->fromSub(function ($q) {                         // 子查询作表
    $q->from('users')->select('id', 'name');
}, 'sub')->get();
```

---

## JOIN 关联

```php
// INNER JOIN（默认）
Query::table('orders', 'o')
    ->join('users AS u', 'o.user_id', '=', 'u.id')
    ->select('o.*', 'u.name as user_name')
    ->get();

// LEFT JOIN
Query::table('users', 'u')
    ->leftJoin('profiles AS p', 'u.id', '=', 'p.user_id')
    ->select('u.*', 'p.bio', 'p.avatar')
    ->get();

// RIGHT JOIN
Query::table('products')
    ->rightJoin('categories', 'products.category_id', '=', 'categories.id')
    ->get();

// 多个 JOIN 叠加
Query::table('orders', 'o')
    ->join('users AS u', 'o.user_id', '=', 'u.id')
    ->leftJoin('payments AS p', 'o.id', '=', 'p.order_id')
    ->select('o.*', 'u.name', 'p.amount')
    ->get();

// join() 通用方法签名
// join($table, $first, $operator, $second, $type = 'INNER')
// $table 支持 "表名 AS 别名" 自动解析
```

> JOIN 对 SELECT/INSERT/UPDATE/DELETE 均可用，但非 SELECT 操作需谨慎使用。

---

## SELECT

```php
Query::table('users')->select('id', 'name', 'email')->get();
Query::table('users')->selectRaw('COUNT(*) as total, status')->groupBy('status')->get();
Query::table('users')->addSelect('avatar')->get();               // 追加字段
Query::table('users')->distinct('status')->get();                 // 去重
Query::table('users')->selectSub(function ($q) {                 // 子查询字段
    $q->from('orders')->selectRaw('COUNT(*)')->whereColumn('orders.user_id', 'users.id');
}, 'order_count')->get();
```

---

## WHERE 条件

### 基础比较

```php
// 两参数（等于）
->where('status', 1)
// 三参数（自定义运算符）
->where('age', '>', 18)
->where('name', '<>', 'admin')
// 安全等于（<=>），与 NULL 比较也返回结果
->where('parent_id', '<=>', null)
```

### 范围条件

```php
->whereBetween('age', 18, 60)
->whereNotBetween('price', 0, 100)
->whereIn('status', [1, 2, 3])
->whereNotIn('role', ['banned', 'deleted'])
->whereNull('deleted_at')
->whereNotNull('email')
```

### 模糊匹配

```php
->whereLike('name', '%John%')
->whereNotLike('title', '%spam%')
```

### 列比较

```php
->whereColumn('updated_at', '>', 'created_at')
```

### 子查询

```php
// EXISTS
->whereExists(function ($q) {
    $q->from('orders')->whereColumn('orders.user_id', 'users.id');
})
// NOT EXISTS
->whereNotExists(function ($q) {
    $q->from('bans')->whereColumn('bans.user_id', 'users.id');
})
```

### 原始条件

```php
->whereRaw('FIND_IN_SET(?, tags)', ['featured'])
```

### 日期/时间条件

无需写函数包裹，自动生成 `DATE(column)` 等 SQL。

```php
->whereDate('created_at', '2025-01-01')
->whereYear('created_at', '>', 2024)
->whereMonth('created_at', 6)
->whereDay('created_at', 15)
->whereTime('login_at', '>', '08:00:00')
->whereHour('login_at', '>=', 9)
->whereMinute('login_at', '<', 30)
->whereSecond('login_at', '=', 0)
```

### OR 条件

所有 `where*` 方法都有对应的 `orWhere*` 版本。

```php
->where('status', 1)
->orWhere('role', 'admin')
->orWhere(function ($q) {          // OR 分组
    $q->where('vip', true)->where('level', '>', 5);
})
```

### 快捷过滤 — whereFilter

根据数组自动添加条件，值为空则跳过。

```php
$filters = ['status' => 1, 'name' => '', 'role' => 'admin'];
// 自动跳过 name（空值），生成 WHERE status = 1 AND role = 'admin'
Query::table('users')->whereFilter($filters)->get();

// 使用 OR 连接
Query::table('users')->whereFilter($filters, 'OR')->get();
```

---

## ORDER BY

```php
->orderBy('id', 'DESC')
->orderBy('created_at')                        // 默认 ASC
->orderByRaw('FIELD(status, 1, 2, 3)')
->orderRandom()                                // RAND()
->orderRandom(12345)                           // RAND(seed)
```

---

## GROUP BY / LIMIT / OFFSET

```php
->groupBy('status')
->groupByRaw('YEAR(created_at)')
->limit(10)
->offset(20)
->take(10)                                     // limit 别名
->skip(20)                                     // offset 别名
->page(2, 15)                                  // 第2页，每页15条 → LIMIT 15 OFFSET 15
```

---

## 参数绑定

Query 内部使用预处理占位符防止注入。可通过 `bind()` / `addBindings()` 手动添加参数：

```php
Query::table('users')
    ->whereIn('status', [1, 2, 3])   // 自动生成 :__in_0 绑定
    ->bind(':custom', $customValue)   // 手动绑定
    ->get();
```

> `whereIn` / `whereNotIn` 自动为数组值生成参数绑定，外部调用时传入的 `params` 与内部绑定合并，内部绑定优先。

---

## 不自动重置 — notReset

连续执行时如果不希望查询状态被清空：

```php
$query = Query::table('users')->where('status', 1);
$total = $query->notReset()->count();           // 保留 where 条件
$users = $query->notReset()->limit(10)->get();  // 继续复用
$query->reset();                                 // 手动重置
```

---

## 终端方法

### 查询终端

```php
// 获取全部
$rows = Query::table('users')->where('status', 1)->get();

// 获取第一条
$row = Query::table('users')->where('id', 1)->first();

// 游标遍历（大数据量，逐行读取）
foreach (Query::table('users')->cursor() as $row) { ... }

// 分块处理
Query::table('users')->chunk(100, function ($rows) {
    foreach ($rows as $row) { ... }
});
Query::table('users')->chunkById(100, function ($rows) { ... }, 'id');

// 流式分块（Generator）
foreach (Query::table('users')->chunkStream(100) as $rows) { ... }
```

### 聚合函数

```php
$count = Query::table('users')->where('status', 1)->count();
$max   = Query::table('orders')->max('amount');
$min   = Query::table('orders')->min('amount');
$avg   = Query::table('orders')->avg('amount');
$sum   = Query::table('orders')->sum('amount');
```

### 存在性判断

```php
$exists    = Query::table('users')->where('email', 'a@b.com')->exists();
$notExists = Query::table('users')->where('email', 'a@b.com')->notExists();
```

### 取值

```php
// 单个值
$email = Query::table('users')->where('id', 1)->value('email');

// 键值对列表（pluck）
$names = Query::table('users')->pluck('name');        // [1 => 'Alice', 2 => 'Bob']
$names = Query::table('users')->pluck('name', 'id');  // ['id' => 'name']
```

### 分页

```php
$paginator = Query::table('users')->where('status', 1)->paginate([
    'page'     => 2,
    'perPage'  => 15,
]);

$paginator->getPage();       // 当前页码
$paginator->getPerPage();    // 每页条数
$paginator->getTotal();      // 总条数
$paginator->getPageSize();   // 当前页数据量
$paginator->getItems();      // 当前页数据
$paginator->toArray();       // 数据数组
```

### 写操作

```php
// 插入（返回 true/false）
Query::table('users')->insert(['name' => 'Alice', 'email' => 'a@b.com']);

// 插入并返回 ID
$id = Query::table('users')->insertGetId(['name' => 'Bob']);

// 批量插入
Query::table('users')->insert([
    ['name' => 'A'], ['name' => 'B'], ['name' => 'C'],
]);

// REPLACE INTO
Query::table('users')->insert(['id' => 1, 'name' => 'New'], true);

// INSERT IGNORE
Query::table('users')->insert(['name' => 'C'], false, true);

// 更新
$affected = Query::table('users')
    ->where('id', 1)
    ->update(['name' => 'Updated']);

// 删除
$affected = Query::table('users')
    ->where('id', 1)
    ->delete();
```

### SQL 调试

```php
// 获取生成的 SQL
$sql = Query::table('users')->where('status', 1)->getSQL();

// 获取参数绑定
$bindings = Query::table('users')->where('status', 1)->getBindings();

// 生成指定类型的 SQL（不执行）
$sql = Query::table('users')->writeSql('select');
$sql = Query::table('users')->writeSql('insert', ['name' => 'Test']);
```

---

## 连接切换

Query 实例构造后，可用 `setDatabaseDriver()` 动态切换到不同数据库：

```php
use kernel\Foundation\Database\PDO\Connections;

$slaveDriver = Connections::getDrivers()['slave'];

Query::table('users')
    ->setDatabaseDriver($slaveDriver)  // 切到从库
    ->where('status', 1)
    ->get();
```

> `getDatabaseDriver()` 返回当前绑定的 `Driver` 实例，可用于执行原生 PDO 操作。

---

## 完整示例

```php
use kernel\Foundation\Database\PDO\Query;

// 复杂查询：订单 + 用户名 + 商品数 + 子查询
$result = Query::table('orders', 'o')
    ->select('o.id', 'o.amount', 'u.name as user_name')
    ->selectSub(function ($q) {
        $q->from('order_items')->selectRaw('COUNT(*)')
          ->whereColumn('order_items.order_id', 'o.id');
    }, 'item_count')
    ->from('users', 'u')
    ->whereColumn('o.user_id', '=', 'u.id')
    ->where('o.status', 'paid')
    ->whereBetween('o.created_at', '2025-01-01', '2025-12-31')
    ->whereExists(function ($q) {
        $q->from('payments')->whereColumn('payments.order_id', 'o.id');
    })
    ->orderBy('o.id', 'DESC')
    ->paginate(['page' => 1, 'perPage' => 20]);
```

> 复杂关联查询推荐使用 [Model 关联查询](/php/database/relation)（`hasOne` / `hasMany` / `belongsTo`）。
