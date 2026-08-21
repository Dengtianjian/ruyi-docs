# Driver — MongoDB 驱动

- **文件位置**: `kernel/Foundation/Database/MongoDB/Driver.php`
- **命名空间**: `kernel\Foundation\Database\MongoDB`
- **是否可继承**: 是

MongoDB 连接驱动，封装连接、CRUD 与命令执行。

## 构造

```php
new Driver($host = "localhost", $port = 27017, $username, $password, $databaseName, $options = [])
```

## 方法

| 方法 | 说明 |
|------|------|
| `query($setName, $filter = [], $options = []): array` | 查询集合 |
| `id($id = ""): ObjectId` | 字符串转 ObjectId |
| `insert($setName, $doc, $options = []): int` | 插入（返回 ID） |
| `update($setName, $query = [], $updateData = [], $options = []): WriteResult` | 更新 |
| `delete($setName, $query, $options = []): int` | 删除 |
| `commamd($commands = [], $options = []): Command` | 构造命令 |
| `execCommand($databaseName, Command $command, $options = []): array` | 执行命令 |

## 使用

```php
use kernel\Foundation\Database\MongoDB\Driver;

$driver = new Driver("localhost", 27017, "user", "pass", "mydb");
$users = $driver->query("users", ["age" => ["$gte" => 18]]);
$driver->insert("users", ["name" => "张三"]);
```
