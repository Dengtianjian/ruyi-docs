---
title: DB 门面
---

# DB — 数据库操作门面

`DB` 是对外提供的数据库操作门面（Facade），所有静态方法最终委托到 `Connections` 管理的当前活跃 `Driver`。设计风格参考 Laravel DB Facade。

## 两种 API 模式

```
DB::table()  →  Query Builder 链式操作
DB::select() →  原生 SQL + 参数绑定
```

## Query Builder 入口

### table() — 创建 Query 实例

```php
use kernel\Foundation\Database\PDO\DB;

// 基本用法
DB::table('users')->where('status', 1)->get();

// 带别名
DB::table('users', 'u')->select('u.id', 'u.name')->get();

// 指定驱动
DB::table('users', $customDriver)->get();
```

## 原生 SQL 操作

所有原生 SQL 方法均使用 `?` 或 `:name` 占位符做参数绑定，防止 SQL 注入。

### 查询类

```php
// 查询全部
$rows = DB::select('SELECT * FROM users WHERE status = ?', [1]);

// 查询单行（无结果返回 null）
$user = DB::selectOne('SELECT * FROM users WHERE id = ?', [1]);

// 查询标量值
$count = DB::scalar('SELECT COUNT(*) FROM users WHERE status = ?', [1]);
```

### 写入类

```php
// 插入（返回 bool）
DB::insert('INSERT INTO users (name, email) VALUES (?, ?)', ['Tom', 'tom@example.com']);

// 插入并返回自增 ID（失败返回 0）
$id = DB::insertGetId('INSERT INTO users (name) VALUES (?)', ['Tom']);

// 更新（返回受影响行数）
$affected = DB::update('UPDATE users SET status = ? WHERE id = ?', [1, 5]);

// 删除（返回受影响行数）
$affected = DB::delete('DELETE FROM users WHERE id = ?', [5]);
```

### 通用语句

```php
// 执行任意 SQL
DB::statement('DROP TABLE IF EXISTS tmp_logs');

// 返回受影响行数
$affected = DB::affectingStatement('UPDATE users SET login_count = 0');

// 不走预处理的原始 SQL
DB::unprepared('TRUNCATE TABLE logs');
```

## 原始表达式

`DB::raw()` 在 Query Builder 中注入原始 SQL 片段：

```php
DB::table('users')->select(DB::raw('COUNT(*) as total'))->first();
DB::table('orders')->where('amount', '>', DB::raw('100 + 50'))->get();
```

## 连接管理

### connection() — 切换连接

```php
// 切换后，后续链式调用都使用指定连接
DB::connection('slave')->table('users')->get();
DB::connection('slave')->select('SELECT * FROM users WHERE id = ?', [1]);
```

### getPdo() — 获取底层 PDO

```php
$pdo = DB::getPdo();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

## 底层直查

不经过参数绑定判断，直接调用 Driver 的对应方法：

```php
DB::query('SET NAMES utf8mb4');         // Driver::query()
DB::exec('OPTIMIZE TABLE users');       // Driver::exec()
DB::prepare('SELECT * FROM users WHERE id = :id');  // Driver::prepare()
DB::execute('SELECT * FROM users WHERE id = :id', ['id' => 1]);  // Driver::execute()

// 便捷方法（带日志记录）
DB::first('SELECT * FROM users WHERE id = ?', [1]);   // 单行
DB::all('SELECT * FROM users WHERE status = ?', [1]); // 全部
DB::value('SELECT name FROM users WHERE id = ?', [1]); // 标量值

// 其他
DB::quote("O'Reilly");    // 转义字符串
$lastId = DB::insertId(); // 最后自增 ID
```

## 事务

### 闭包事务（推荐）

自动 commit/rollback，支持死锁重试：

```php
DB::transaction(function ($driver) {
    DB::table('users')->insert(['name' => 'Alice']);
    DB::table('logs')->insert(['action' => 'create_user']);
}, 3);  // 最多重试 3 次
```

### 手动事务

```php
DB::begin();
try {
    DB::table('users')->insert(['name' => 'Bob']);
    DB::commit();
} catch (\Exception $e) {
    DB::rollback();
    throw $e;
}
```

### 检查事务状态

```php
if (DB::inTransaction()) {
    // 当前在事务中
}
```

> **死锁重试**：`DB::transaction()` 的闭包捕获异常后，自动检测是否为死锁（含 Deadlock / 1213 / 40001），是则重试。

## 查询日志

### 开启/关闭

```php
DB::enableQueryLog();
// ... 执行数据库操作 ...
DB::disableQueryLog();
```

### 获取日志

```php
$logs = DB::getQueryLog();
// 每项格式：['query' => string, 'bindings' => array, 'time' => float]

foreach ($logs as $log) {
    echo "{$log['query']} | bindings: " . json_encode($log['bindings']);
}
```

### 实时监听

```php
DB::listen(function ($query, $bindings, $time) {
    if ($time > 1.0) {
        Log::warning("慢查询: $query", ['time' => $time]);
    }
});
```

### 清空日志

```php
DB::flushQueryLog();
```

## 错误信息

```php
$errorInfo = DB::error();  // [SQLSTATE, 错误码, 错误消息]
$errorCode = DB::errno();  // SQLSTATE 码
```

## 层次关系

```
应用层
    └── DB::table() / DB::select() / DB::transaction()
            ↓
    Connections::getUseDriver()  ← 获取当前活跃 Driver
            ↓
    Driver::query() / execute() / exec()
            ↓
    PDO → MySQL
```

> `DB` 不持有连接本身，所有操作委托给 `Connections` 管理的当前活跃 `Driver`。
