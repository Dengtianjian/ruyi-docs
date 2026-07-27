---
title: Connections 连接管理器
---

# Connections — 多数据库连接管理器

`Connections` 是数据库连接的管理中心，支持注册多个 `Driver` 实例，并在运行时动态切换当前使用的数据库连接。所有静态方法，全局共享连接池。

## 核心概念

```
┌─────────────┐
│ Connections │  ← 管理所有连接
├─────────────┤
│ drivers:    │
│  default → Driver A (主库)
│  slave   → Driver B (只读从库)
│  log     → Driver C (日志库)
├─────────────┤
│ useDriver → Driver A  ← 当前活跃连接
└─────────────┘
```

## 注册连接

### addDriver() — 添加驱动

```php
use kernel\Foundation\Database\PDO\Connections;
use kernel\Foundation\Database\PDO\Driver;

$masterDriver = new Driver('192.168.1.1', 'root', 'pass', 'my_db', 3306);

// 注册为默认连接
Connections::addDriver($masterDriver, "default", true);

// 注册非默认连接
$slaveDriver = new Driver('192.168.1.2', 'readonly', 'pass', 'my_db', 3306);
Connections::addDriver($slaveDriver, "slave");

$logDriver = new Driver('192.168.1.3', 'root', 'pass', 'log_db', 3306);
Connections::addDriver($logDriver, "log");
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `$driver` | `Driver` | 数据库驱动实例 |
| `$name` | `string` | 连接名称，用于后续切换，默认 `"default"` |
| `$isDefault` | `bool` | 是否设为默认连接，默认 `false` |

## 切换连接

### useDriver() — 切换到指定连接

```php
// 切换到从库
Connections::useDriver('slave');

// 后续所有 DB::xxx() 调用都将使用 slave 连接
DB::table('users')->get();  // 从 slave 读取
DB::select('SELECT * FROM orders');  // 从 slave 读取
```

> **注意**：`useDriver()` 切换的是全局活跃连接，会影响后续所有的 `DB` 门面和 `Query` 操作。

### switchToDefaultDriver() — 切回默认连接

```php
Connections::useDriver('slave');
// ... 从库操作 ...
Connections::switchToDefaultDriver();
// 后续操作恢复使用默认连接
```

**回退逻辑**（按优先级）：
1. 如果有 `$defaultDriver`，使用它
2. 如果存在名为 `"default"` 的驱动，使用它
3. 否则使用第一个注册的驱动

## 获取连接

### getUseDriver() — 获取当前活跃连接

```php
$driver = Connections::getUseDriver();
$pdo = $driver->getPDO();
```

如果没有活跃连接（`$useDriver` 为 `null`），会自动调用 `switchToDefaultDriver()`。

### getDefaultDriver() — 获取默认连接

```php
$defaultDriver = Connections::getDefaultDriver();
```

### getDrivers() — 获取所有已注册连接

```php
$allDrivers = Connections::getDrivers();
// ['default' => Driver, 'slave' => Driver, 'log' => Driver]
```

### setDefaultDriver() — 修改默认连接

```php
// 将 slave 设为新的默认连接
Connections::setDefaultDriver('slave');
```

---

## DB 门面中的连接切换

`DB::connection()` 是对 `Connections::useDriver()` 的便捷封装，切换全局活跃连接后
后续所有 DB/Query/Model 操作均使用新连接：

```php
use kernel\Foundation\Database\PDO\DB;

// 切到从库后，后续所有操作均走从库
DB::connection('slave');
$users = DB::table('users')->get();
$count = DB::scalar('SELECT COUNT(*) FROM users');

// 以下两种写法等价
DB::connection('slave');
DB::table('users')->get();

Connections::useDriver('slave');
DB::table('users')->get();
```

---

## 典型场景

### 主从分离（读写分离）— DB 方式

```php
// <app-id>/index.php 初始化
Connections::addDriver($masterDriver, "master", true);  // 默认：主库
Connections::addDriver($slaveDriver, "slave");           // 从库

// 业务代码中
// 写操作 — 走主库（默认连接）
DB::table('users')->insert(['name' => 'Alice']);

// 读操作 — 切到从库后执行
DB::connection('slave');
$users = DB::table('users')->get();
$count = DB::scalar('SELECT COUNT(*) FROM users');
```

### 跨库查询

```php
// 初始化
Connections::addDriver($dbADriver, "db_a", true);
Connections::addDriver($dbBDriver, "db_b");

// 从 db_a 查用户，从 db_b 查订单
DB::connection('db_a');
$user   = DB::table('users')->where('id', 1)->first();
DB::connection('db_b');
$orders = DB::table('orders')->where('user_id', 1)->get();
```

### 在 Service 层封装切换逻辑

```php
class UserService
{
    public function getActiveUsers()
    {
        // 查询走从库
        DB::connection('slave');
        return DB::table('users')
            ->where('status', 1)
            ->get();
    }

    public function createUser($data)
    {
        // 写入切回主库
        Connections::switchToDefaultDriver();
        return DB::table('users')->insertGetId($data);
    }
}
```

---

### 在 Model 中切换连接

Model 构造时自动从 `Connections::getUseDriver()` 获取当前连接，因此可以通过全局切换来改变 Model 使用的数据库：

```php
// 初始化
Connections::addDriver($masterDriver, 'master', true);
Connections::addDriver($slaveDriver, 'slave');

// --- ActiveRecord 操作 ---
// 读取走从库
Connections::useDriver('slave');
$user = UserModel::find(1);

Connections::switchToDefaultDriver();

// 写入走主库
$user->name = 'Updated';
$user->save();

// --- 链式查询 ---
// 静态调用前切换
Connections::useDriver('slave');
$users = UserModel::where('status', 1)->get();
Connections::switchToDefaultDriver();
```

也可以使用 `setDatabaseDriver()` 在实例级别切换（通过 Model 的 `__call` 代理）：

```php
$slaveDriver = Connections::getDrivers()['slave'];
$model = new UserModel();
$model->setDatabaseDriver($slaveDriver);
$users = $model->where('status', 1)->get();  // 走 slave，不影响其他实例
```

> 更多 Model 连接切换的用法，参见 [Model 模型文档](./model#数据库连接切换)。

## 异常处理

当切换到一个不存在的连接名称时，会抛出 `RuyiException`：

```php
try {
    Connections::useDriver('non_existent');
} catch (RuyiException $e) {
    // 错误码: databaseStaticDriverNotExist:500
}
```

同理，设置不存在的默认连接也会抛出异常（错误码：`setDefaultDatabaseDriverError:500`）。

---

## 架构关系

```
App::run()
    └── 初始化阶段注册 Driver
            ↓
    Connections::addDriver(driver, name)
            ↓
    DB::connection(name) → Connections::useDriver(name)
            ↓
    DB::table() / Query / Model → Connections::getUseDriver()
            ↓
    Driver → PDO → MySQL
```
