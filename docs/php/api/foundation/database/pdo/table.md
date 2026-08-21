# Table — 表操作

- **文件位置**: `kernel/Foundation/Database/PDO/Table.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **是否可继承**: 是

单表的读写操作封装，返回带基础作用域的查询构建器。

## 使用

```php
use kernel\Foundation\Database\PDO\DB;
use kernel\Foundation\Database\PDO\Table;

$table = new Table("users");
// 或
$table = DB::table("users");

$table->where("age", ">=", 18)->orderBy("id", "DESC")->limit(10)->get();
```

## 方法

| 方法 | 说明 |
|------|------|
| `__construct($tableName)` | 指定表名 |
| `query()` | 获取 Query 构建器 |
| 其余 CRUD | 委托底层 Query（`insert` / `update` / `delete` / `first` / `get` / `count` 等） |
