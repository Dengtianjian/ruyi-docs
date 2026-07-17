---
title: Table
---

# Table — DDL 与表管理

`Table` 提供数据库表的 DDL 操作（建表/删表/重命名等）和表结构信息查询。它是 `Model` 的基类，`Model` 在其上扩展了 ActiveRecord 能力。

## 基础信息查询

```php
use kernel\Foundation\Database\PDO\Table;

$table = new Table('users');

// 表是否存在
if ($table->exists()) { ... }

// 获取建表 DDL
$ddl = $table->getCreateSQL();

// 获取字段信息
$columns = $table->getColumns();
// [
//   ['Field' => 'id', 'Type' => 'bigint(20) unsigned', 'Null' => 'NO', ...],
//   ...
// ]

// 获取索引
$indexes = $table->getIndexes();

// 获取表状态（引擎、行数、数据大小、自增值、创建时间）
$status = $table->getStatus();

// 优化表（整理碎片）
$table->optimize();
```

---

## DDL 操作

### create — 建表

根据 `$schema` 属性中的 Schema 定义生成 CREATE TABLE SQL 并执行：

```php
class UsersTable extends Table
{
    public $schema = [
        new Schema('id')->bigint()->unsigned()->autoIncrement()->comment('主键'),
        new Schema('name')->varchar(100)->nullable(false)->comment('用户名'),
    ];
}

(new UsersTable())->create();
```

> 所有表默认使用 **InnoDB** 引擎和 **utf8mb4** 字符集。建表语句自动添加 `IF NOT EXISTS`。

### drop — 删除表

```php
$table->drop();  // DROP TABLE IF EXISTS `prefix_users`
```

### truncate — 清空表

保留表结构，重置自增：

```php
$table->truncate();  // TRUNCATE TABLE `prefix_users`
```

### rename — 重命名

```php
$table->rename('new_users');  // RENAME TABLE `prefix_users` TO `prefix_new_users`
```

> 新表名不需要含前缀，`rename()` 内部会自动添加。

### copy — 复制表

```php
// 仅复制表结构
$table->copy('users_backup');

// 复制结构 + 数据
$table->copy('users_backup', true);
```

---

## 获取表名

```php
$table->tableName();  // 返回含前缀的完整表名，如 'ruyi_users'
```

---

## 表前缀

表名自动添加配置中 `database.mysql.prefix` 的前缀：

```php
// 配置：Config::get('database/mysql/prefix') = 'ruyi'
// new Table('users') → 实际操作表 ruyi_users
```

### 前缀占位替换

如果前缀是数组拼接的，或需要动态替换前缀中的占位符：

```php
class UserTable extends Table
{
    protected $prefixReplaces = [
        '{tenant}' => $tenantId,  // 前缀中的 {tenant} 被替换
    ];
}
```

替换逻辑在 `prefix()` 方法中执行，前缀拼接前先对占位符做 `str_replace`。

---

## Schema 类型自动推导 — getPhpSchema

`Table::getPhpSchema()` 将 `$schema` 中的 Schema 对象转换为字段名 → PHP 类型映射：

```php
$table = new UsersTable();
$map = $table->getPhpSchema();
// ['id' => 'int', 'name' => 'string', 'status' => 'int', ...]
```

这个映射供 `Model` 构造时自动生成 `$schemaCasts`，决定字段写入 DB 时的类型转换逻辑。具体映射规则参见 [Schema 文档](./schema#getphptype--字段类型--php-类型映射)。

---

## 作为 Model 基类

`Model` 继承自 `Table`，继承了 DDL 和表信息查询能力，同时扩展了 ActiveRecord + 类型转换 + 软删除等特性：

```
Table (DDL + 信息查询)
  └── Model (ActiveRecord + casts + 软删除)
```

因此，一个 `Model` 子类可以直接调用 `create()`、`drop()`、`getColumns()` 等 Table 方法。
