# Collection — MongoDB 集合

- **文件位置**: `kernel/Foundation/Database/MongoDB/Collection.php`
- **命名空间**: `kernel\Foundation\Database\MongoDB`
- **是否可继承**: 是

集合级封装，绑定一个集合名的 CRUD 操作，可单例化。

## 获取实例

```php
use kernel\Foundation\Database\MongoDB\Collection;

$collection = Collection::instance();
```

## 方法

| 方法 | 说明 |
|------|------|
| `id($id = ""): ObjectId` | 字符串转 ObjectId |
| `realId($id): string` | 还原字符串 |
| `find($filter = [], $options = [], $associative = false)` | 查询 |
| `findOne($filter = [], $options = [], $associative = false)` | 查询单条 |
| `insert($doc = [], $options = []): int` | 插入 |
| `update($query = [], $updateData, $options = []): WriteResult` | 更新 |
| `delete($query = [], $options = [])` | 删除 |
| `exist($filter): bool` | 是否存在 |
| `command($commands): Command` | 构造命令 |
| `execCommand($commands, $options = [])` | 执行命令 |

## 使用

```php
$collection = Collection::instance();
$collection->insert(["name" => "张三", "age" => 20]);
$doc = $collection->findOne(["name" => "张三"]);
```
