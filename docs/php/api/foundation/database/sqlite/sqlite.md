# SQLite — SQLite 连接

- **文件位置**: `kernel/Foundation/Database/SQLite/SQLite.php`
- **命名空间**: `kernel\Foundation\Database\SQLite`
- **是否可继承**: 是

SQLite 数据库连接封装（基于 `SQLite3`），提供查询与结果读取。

## 构造

```php
new SQLite($tableFileName, $flags = SQLITE3_OPEN_READWRITE, $encryptionKey = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `fetchAll($sql, $mode = SQLITE3_ASSOC)` | 查询多行 |
| `fetch($sql, $mode = SQLITE3_ASSOC)` | 查询单行 |
| `fetchOne($sql, $mode = SQLITE3_ASSOC)` | 查询单行单字段 |

## 使用

```php
use kernel\Foundation\Database\SQLite\SQLite;

$db = new SQLite(Path::storage() . "/data.db");
$rows = $db->fetchAll("SELECT * FROM users");
$one = $db->fetchOne("SELECT name FROM users WHERE id = 1");
```
