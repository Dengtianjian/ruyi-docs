# Schema — 表结构

- **文件位置**: `kernel/Foundation/Database/PDO/Schema.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **是否可继承**: 是

表结构定义与迁移，用于创建/修改表、字段与索引。

## 使用

```php
use kernel\Foundation\Database\PDO\Schema;

Schema::create("users", function ($table) {
    $table->id();
    $table->string("name", 50);
    $table->integer("age")->default(0);
    $table->timestamps();
});
```

## 方法

| 方法 | 说明 |
|------|------|
| `Schema::create($table, \Closure $callback)` | 建表 |
| `Schema::table($table, \Closure $callback)` | 改表 |
| `Schema::drop($table)` | 删表 |
| `Schema::hasTable($table)` | 是否存在表 |
| `Schema::hasColumn($table, $column)` | 是否存在列 |

## 列构建器

`$table` 提供列类型方法：

| 方法 | 说明 |
|------|------|
| `id()` | 自增主键 |
| `string($name, $length = 255)` | 字符串 |
| `integer($name)` / `bigInteger` / `tinyInteger` | 整型 |
| `float($name)` / `double` / `decimal` | 浮点 |
| `boolean($name)` | 布尔 |
| `text($name)` / `longText` / `mediumText` | 文本 |
| `date($name)` / `dateTime` / `timestamp` | 时间 |
| `timestamps()` | created_at + updated_at |
| `softDeletes()` | deleted_at |
| `->nullable()` / `->default($v)` / `->unsigned()` / `->index()` / `->unique()` | 约束 |
