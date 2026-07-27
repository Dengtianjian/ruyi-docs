---
title: 数据库使用指南
---

# 数据库使用指南

本文档涵盖数据库的连接配置、多数据库管理、CRUD 操作以及各种使用场景，帮助快速上手如意框架的数据库操作。

## 数据库配置

在应用配置文件中配置数据库连接信息。

### 单数据库配置

```php
// Configs/Config.php
return [
    "my-app" => [
        "mode" => "production",
        "database" => [
            "mysql" => [
                "host"     => "localhost",
                "port"     => 3306,
                "name"     => "my_database",
                "username" => "root",
                "password" => "",
                "charset"  => "utf8mb4",
                "prefix"   => "ruyi_",
            ]
        ]
    ]
];
```

### 初始化连接（在入口文件中）

```php
// <app-id>/index.php（在 new App() 之后、run() 之前）
use kernel\Foundation\Database\PDO\Connections;
use kernel\Foundation\Database\PDO\Driver;
use kernel\Foundation\Config;

// 从配置读取
$dbConfig = Config::get('database/mysql');

// 创建 Driver
$driver = new Driver(
    $dbConfig['host'],
    $dbConfig['username'],
    $dbConfig['password'],
    $dbConfig['name'],
    $dbConfig['port']
);

// 注册到 Connections 管理器
Connections::addDriver($driver, "default", true);
```

---

## 多数据库连接

当应用需要连接多个数据库（如主从分离、跨库查询）时，可以通过 `Connections` 管理器注册多个驱动。

### 注册多个连接

```php
use kernel\Foundation\Database\PDO\Connections;
use kernel\Foundation\Database\PDO\Driver;

// 主库（默认连接）
$masterDriver = new Driver('host1', 'root', '', 'main_db', 3306);
Connections::addDriver($masterDriver, "master", true);  // true = 设为默认

// 从库（只读）
$slaveDriver = new Driver('host2', 'root', '', 'main_db', 3306);
Connections::addDriver($slaveDriver, "slave");

// 日志库
$logDriver = new Driver('host3', 'root', '', 'log_db', 3306);
Connections::addDriver($logDriver, "log");
```

### 切换连接

```php
use kernel\Foundation\Database\PDO\DB;
use kernel\Foundation\Database\PDO\Connections;

// 使用从库查询
DB::connection('slave');
$users = DB::table('users')->where('status', 1)->get();

// 写入日志库
DB::connection('log');
DB::table('access_logs')->insert([
    'user_id' => 1,
    'action'  => 'login',
    'ip'      => $_SERVER['REMOTE_ADDR'],
]);

// 切回默认连接（主库）
Connections::switchToDefaultDriver();

// 指定连接 + 原生 SQL
DB::connection('slave');
$user = DB::select('SELECT * FROM users WHERE id = ?', [1]);
```

### 在 Model 中使用不同连接

```php
use kernel\Foundation\Database\PDO\DB;
use kernel\Foundation\Database\PDO\Connections;

class ReadOnlyUserModel extends Model
{
    // 查询前自动切换到从库
    protected static function boot()
    {
        Connections::useDriver('slave');
    }
}

// 或者在运行时临时切换
Connections::useDriver('slave');
$users = UserModel::where('status', 1)->get();
Connections::switchToDefaultDriver();
```

---

## CRUD 操作

### 方式一：DB 门面 + 原生 SQL

适合简单、直接的 SQL 操作：

```php
use kernel\Foundation\Database\PDO\DB;

// 查询
$users  = DB::select('SELECT * FROM users WHERE status = ?', [1]);
$user   = DB::selectOne('SELECT * FROM users WHERE id = ?', [1]);
$count  = DB::scalar('SELECT COUNT(*) FROM users');

// 插入
DB::insert('INSERT INTO users (name, email) VALUES (?, ?)', ['Alice', 'alice@example.com']);
$id = DB::insertGetId('INSERT INTO users (name) VALUES (?)', ['Bob']);

// 更新
DB::update('UPDATE users SET status = ? WHERE id = ?', [1, 5]);

// 删除
DB::delete('DELETE FROM users WHERE id = ?', [5]);

// 任意 SQL
DB::statement('ALTER TABLE users ADD COLUMN vip TINYINT DEFAULT 0');
DB::unprepared('TRUNCATE TABLE tmp_logs');
```

### 方式二：Query Builder 链式查询

适合动态构建复杂查询：

```php
use kernel\Foundation\Database\PDO\DB;

// 基础查询
$activeUsers = DB::table('users')
    ->where('status', 1)
    ->where('vip', true)
    ->orderBy('id', 'DESC')
    ->limit(10)
    ->get();

// 聚合查询
$total = DB::table('orders')->where('status', 'paid')->sum('amount');
$avg   = DB::table('orders')->where('status', 'paid')->avg('amount');

// JOIN 查询
$orders = DB::table('orders', 'o')
    ->select('o.*', 'u.name as user_name')
    ->join('users', 'u', 'o.user_id', '=', 'u.id')
    ->where('o.status', 'paid')
    ->get();

// 子查询
$users = DB::table('users')
    ->whereExists(function ($q) {
        $q->from('orders')
          ->whereColumn('orders.user_id', 'users.id')
          ->where('orders.status', 'paid');
    })
    ->get();

// 分页
$paginator = DB::table('users')
    ->where('status', 1)
    ->paginate(['page' => 2, 'perPage' => 15]);

foreach ($paginator->getItems() as $user) {
    echo $user['name'];
}
echo "总条数: " . $paginator->getTotal();
```

### 方式三：Model Active Record

适合业务实体操作，内置类型转换、时间戳、软删除：

```php
use kernel\Foundation\Database\PDO\Model;

class UserModel extends Model
{
    protected $casts = [
        'id'         => 'int',
        'status'     => 'int',
        'metadata'   => 'array',
        'created_at' => 'timestamp',
        'updated_at' => 'timestamp_ms',
        'deleted_at' => 'timestamp',
    ];
}

// 创建
$user = new UserModel();
$user->name   = 'Alice';
$user->email  = 'alice@example.com';
$user->status = 1;
$user->save();
echo $user->id;  // 自增ID自动回填

// 读取
$user = UserModel::find(1);
echo $user->name;       // string
echo $user->created_at; // Unix时间戳 int

// 更新
$user->status = 0;
$user->save();

// 软删除
$user->delete();                        // SET deleted_at = NOW()
$trashed = UserModel::onlyTrashed()->get();  // 查已删除
$user->restore();                       // 恢复

// 真删除
$user->forceDelete();

// 链式查询（自动代理到 Query Builder）
$vipUsers = UserModel::where('vip', true)
    ->where('status', 1)
    ->orderBy('created_at', 'DESC')
    ->limit(20)
    ->get();
```

### 选择建议

| 场景 | 推荐方式 |
|------|---------|
| 简单查询、快速原型 | DB + 原生 SQL |
| 动态条件、复杂 JOIN | Query Builder |
| 业务实体、类型安全 | Model |
| 跨库操作 | DB::connection() |
| 大数据量批处理 | Query::cursor() / chunk() |

---

## 事务操作

```php
use kernel\Foundation\Database\PDO\DB;

// 闭包事务（推荐，自动 commit/rollback）
DB::transaction(function ($driver) {
    DB::table('users')->insert(['name' => 'Alice']);
    DB::table('accounts')->where('user_id', 1)->update(['balance' => 100]);
}, 3);  // 死锁时最多重试3次

// 手动事务
DB::begin();
try {
    DB::table('orders')->insert(['user_id' => 1, 'amount' => 99.9]);
    DB::table('inventory')->where('id', 5)->decrement('stock', 1);
    DB::commit();
} catch (\Exception $e) {
    DB::rollback();
    throw $e;
}

// 检查事务状态
if (DB::inTransaction()) {
    // 当前在事务中
}
```

> **注意**：`DB::transaction()` 会在捕获到死锁异常时自动重试（检测 Deadlock/1213/40001）。

---

## 查询日志与调试

```php
use kernel\Foundation\Database\PDO\DB;

// 开启日志
DB::enableQueryLog();

DB::table('users')->where('status', 1)->get();
DB::table('orders')->where('user_id', 1)->count();

// 获取所有执行的 SQL
$logs = DB::getQueryLog();
foreach ($logs as $log) {
    echo "SQL: {$log['query']}\n";
    echo "Bindings: " . json_encode($log['bindings']) . "\n";
    echo "Time: {$log['time']}\n";
}

// 实时监听每条 SQL
DB::listen(function ($query, $bindings, $time) {
    Log::info("SQL executed", [
        'query'    => $query,
        'bindings' => $bindings,
        'time_ms'  => ($time) * 1000,
    ]);
});

// 调试：查看 Query Builder 生成的 SQL（不执行）
$sql = DB::table('users')
    ->where('status', 1)
    ->orderBy('id', 'DESC')
    ->getSQL();

echo $sql;  // SELECT * FROM `ruyi_users` WHERE `status` = 1 ORDER BY `id` DESC
```

---

## 表前缀

配置中的 `database.mysql.prefix` 会自动应用到所有表名：

```php
// 配置 prefix = 'ruyi_'
// DB::table('users') 实际操作 ruyi_users
```

`Table` 类支持动态前缀替换：

```php
class TenantTable extends Table
{
    protected $prefixReplaces = [
        '{tenant}' => $tenantId,
    ];
    // 表名中的 {tenant} 会被替换为具体值
}
```

---

## 自增/自减

无需先查询再更新，直接原子操作：

```php
// Query Builder
DB::table('articles')->where('id', 1)->increment('view_count');
DB::table('articles')->where('id', 1)->increment('view_count', 5);   // +5
DB::table('inventory')->where('id', 1)->decrement('stock');
DB::table('inventory')->where('id', 1)->decrement('stock', 3);       // -3
```

---

## 大数据量处理

### 游标遍历（逐行读取，低内存）

```php
foreach (DB::table('users')->cursor() as $user) {
    // 处理每一行，内存友好
}
```

### 分块处理

```php
// 按 offset 分块
DB::table('users')->chunk(100, function ($rows) {
    foreach ($rows as $row) {
        // 每 100 条处理一次
    }
});

// 按 ID 分块（更高效，自动处理删除行）
DB::table('users')->chunkById(100, function ($rows) {
    foreach ($rows as $row) {
        // ...
    }
}, 'id');

// Generator 流式分块
foreach (DB::table('users')->chunkStream(100) as $rows) {
    foreach ($rows as $row) {
        // ...
    }
}
```

---

## 错误处理

```php
use kernel\Foundation\Database\PDO\DB;

try {
    DB::table('users')->insert(['name' => 'Test']);
} catch (\kernel\Foundation\Exception\RuyiException $e) {
    // 框架统一异常
    echo $e->getMessage();

    // 获取底层 PDO 错误信息
    $errorInfo = DB::error();   // [SQLSTATE, 错误码, 错误消息]
    $errorCode = DB::errno();   // SQLSTATE 码
}
```

---

## 最佳实践

1. **参数绑定防注入**：始终使用 `?` 或 `:name` 占位符进行参数绑定，不要拼接用户输入到 SQL
2. **事务保护**：涉及多表写操作的业务逻辑使用 `DB::transaction()` 包裹
3. **读写分离**：查询走从库 `DB::connection('slave')`，写操作走主库（默认连接）
4. **大数据量用游标**：处理大量数据时用 `cursor()` 或 `chunkById()` 而非 `get()`
5. **Model 用于业务实体**：需要类型转换、时间戳、软删除时使用 Model，简单查询用 Query Builder
6. **开启查询日志**：开发环境建议 `DB::enableQueryLog()` + `DB::listen()` 排查 SQL 问题
