---
title: SQLite 操作
---

# SQLite 操作

如意框架对 SQLite 提供了 `SQLite` 连接类和 `SQLiteModel` 模型类的封装，位于 `kernel/Foundation/Database/SQLite/`。

---

## SQLite — 连接类

`SQLite` 继承 PHP 原生 `SQLite3` 类，提供连接管理和查询封装。

### 建立连接

```php
use kernel\Foundation\Database\SQLite\SQLite;

// 打开文件数据库
$db = new SQLite('data/app.db');

// 使用内存数据库
$db = new SQLite(':memory:');

// 只读方式打开
$db = new SQLite('data/app.db', SQLITE3_OPEN_READONLY);

// 带加密密钥（需要 SQLite 加密模块）
$db = new SQLite('data/app.db', SQLITE3_OPEN_READWRITE, 'encryption_key');
```

> 文件路径相对于 `F_APP_ROOT`（应用根目录）。如果文件不存在会抛出异常。

**Flags 选项**：

| 常量 | 说明 |
|------|------|
| `SQLITE3_OPEN_READONLY` | 只读方式打开 |
| `SQLITE3_OPEN_READWRITE` | 读写方式打开（默认） |
| `SQLITE3_OPEN_CREATE` | 数据库不存在则创建 |

### 查询操作

```php
// 查询全部
$rows = $db->fetchAll('SELECT * FROM users WHERE status = 1');

// 查询单行（无结果返回 null）
$user = $db->fetch('SELECT * FROM users WHERE id = 1');

// 查询单行（含 finalize，适合单次查询）
$user = $db->fetchOne('SELECT * FROM users WHERE id = 1');

// 直接执行 SQL
$result = $db->query('INSERT INTO users (name) VALUES ("Alice")');
```

**fetch 模式**（`$mode` 参数）：

| 模式 | 说明 |
|------|------|
| `SQLITE3_ASSOC` | 关联数组（默认） |
| `SQLITE3_NUM` | 索引数组 |
| `SQLITE3_BOTH` | 同时返回索引和关联 |

---

## SQLiteModel — 模型类

`SQLiteModel` 内部持有一个 `SQLite` 实例和一个 `Query` 构建器，提供链式查询 API。

### 定义模型

```php
use kernel\Foundation\Database\SQLite\SQLiteModel;

class ConfigModel extends SQLiteModel
{
    protected $tableName     = 'config';
    protected $tableFileName = 'data/app.db';
}
```

### 链式查询

```php
$config = new ConfigModel();

// 条件查询
$rows = $config->where('key', 'LIKE', 'app.%')
    ->order('id', 'DESC')
    ->limit(10)
    ->getAll();

// 查询单条
$item = $config->where('key', 'app_name')->getOne();

// 字段筛选
$data = $config->field('key', 'value')
    ->where('type', 'string')
    ->getAll();

// 去重
$types = $config->distinct('type')->getAll();

// 分组
$data = $config->field('type', 'COUNT(*) as count')
    ->groupBy('type')
    ->getAll();

// 计数
$count = $config->where('type', 'string')->count();

// 分页
$rows = $config->where('status', 1)
    ->order('id', 'ASC')
    ->page(2, 20)         // 第2页，每页20条
    ->getAll();

// 跳过
$rows = $config->where('status', 1)
    ->skip(10)
    ->limit(10)
    ->getAll();
```

### 调试模式（dryRun）

开启后不执行查询，返回生成的 SQL：

```php
$sql = $config->sql(true)
    ->where('type', 'string')
    ->order('key')
    ->getAll();

echo $sql;
// SELECT * FROM `config` WHERE `type` = 'string' ORDER BY `key` ASC
```

### where 方法说明

```php
// where(field, value)              → field = value
$config->where('status', 1);

// where(field, value, operator)    → field operator value
$config->where('age', '>', 18);

// where(field, value, operator, boolean) → 与上一条的连接方式
$config->where('status', 1)
       ->where('role', 'admin', '=', 'OR');

// whereFilter — 空值自动跳过
$filters = ['status' => 1, 'name' => '', 'type' => 'string'];
$config->whereFilter($filters);  // 跳过空的 name
```

### 直接执行 SQL

```php
// 查询
$rows = $config->fetchAll('SELECT * FROM config');
$item = $config->fetch('SELECT * FROM config WHERE id = 1');
$item = $config->fetchOne('SELECT * FROM config WHERE id = 1');

// 写操作
$config->query("INSERT INTO config (key, value) VALUES ('v1', 'Hello')");
```

### 重置查询条件

```php
$config->where('type', 'string');
$rows1 = $config->getAll();       // type = 'string'

$config->reset();                  // 清空条件
$rows2 = $config->getAll();       // 无条件，查询全部
```

---

## 完整示例

```php
use kernel\Foundation\Database\SQLite\SQLiteModel;

class CacheModel extends SQLiteModel
{
    protected $tableName     = 'cache';
    protected $tableFileName = 'data/cache.db';
}

// 使用
$cache = new CacheModel();

// 存储
$cache->query("
    INSERT OR REPLACE INTO cache (key, value, expired_at)
    VALUES ('key1', 'value1', " . (time() + 3600) . ")
");

// 读取
$item = $cache->where('key', 'key1')
    ->where('expired_at', '>', time())
    ->getOne();

if ($item) {
    echo $item['value'];
}

// 清理过期数据
$cache->query("DELETE FROM cache WHERE expired_at < " . time());

// 统计
$total = $cache->count();
echo "缓存条目: $total";
```
