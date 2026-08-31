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
| `exec($sql)` | 执行 SQL（写操作），返回受影响行数 |
| `execQuery($sql)` | 执行 SQL（查询），返回 `PDOStatement` |
| `select($sql, $bindings)` | 执行 SELECT，返回全部结果 |
| `selectOne($sql, $bindings)` | 执行 SELECT，返回第一条 |
| `scalar($sql, $bindings)` | 执行 SELECT，返回单个标量值 |
| `tableExists()` | 判断表是否存在 |
| `getCreateSQL()` | 获取建表语句 |
| `getColumns()` | 获取表字段信息 |
| `optimize()` | 优化表（如 `OPTIMIZE TABLE`） |
| `truncate()` | 清空表数据 |
| 其余 CRUD | 委托底层 Query（`insert` / `update` / `delete` / `first` / `get` / `count` 等），均返回带基础作用域的 Query 构建器 |
