# Mongo — MongoDB 门面

- **文件位置**: `kernel/Foundation/Database/MongoDB/Mongo.php`
- **命名空间**: `kernel\Foundation\Database\MongoDB`
- **类型**: 全静态门面

MongoDB 操作门面，注册驱动并提供静态 CRUD 入口。

## 静态方法

| 方法 | 说明 |
|------|------|
| `Mongo::driver(Driver $driver)` | 注册驱动 |
| `Mongo::id(string $id = ""): ObjectId` | 字符串转 ObjectId |
| `Mongo::realId(string $id = ""): string` | ObjectId 还原字符串 |
| `Mongo::find($setName, $filter = [], $options = [])` | 查询集合 |
| `Mongo::findOne($setName, $filter = [], $options = [])` | 查询单条 |
| `Mongo::insert($setName, $doc, $options = [])` | 插入 |
| `Mongo::update($setName, $query = [], $updateData, $options = [])` | 更新 |
| `Mongo::delete($setName, $query = [], $options = [])` | 删除 |
| `Mongo::command($commands): Command` | 构造命令 |
| `Mongo::execCommand($databaseName, $commands, $options = [])` | 执行命令 |
| `Mongo::optimParams($params): array` | 优化查询参数 |

## 使用

```php
use kernel\Foundation\Database\MongoDB\Mongo;
use kernel\Foundation\Database\MongoDB\Driver;

Mongo::driver(new Driver("localhost", 27017, "user", "pass", "mydb"));

$doc = Mongo::findOne("users", ["_id" => Mongo::id("abc123")]);
$insertId = Mongo::insert("logs", ["msg" => "hello"]);
```
