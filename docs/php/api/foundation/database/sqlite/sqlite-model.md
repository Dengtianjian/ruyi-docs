# SQLiteModel — SQLite 模型

- **文件位置**: `kernel/Foundation/Database/SQLite/SQLiteModel.php`
- **命名空间**: `kernel\Foundation\Database\SQLite`
- **继承**: `extends Model`（基础）并集成 SQLite
- **是否可继承**: 是

面向 SQLite 的模型基类，提供链式查询构建与 SQL 执行。**非静态、实例 API**（`new` 实例化）。

## 属性配置

```php
class ConfigModel extends SQLiteModel
{
    protected $tableName     = "configs";
    protected $tableFileName = "config.db";   // SQLite 文件
}
```

## 构造

```php
new SQLiteModel($flags = SQLITE3_OPEN_READWRITE, $encryptionKey = null)
```

## 链式查询

```php
$model = new ConfigModel();
$items = $model->where("key", "site_name")
               ->field("key", "value")
               ->order("id", "DESC")
               ->page(1, 10)
               ->getAll();
```

| 方法 | 说明 |
|------|------|
| `order($field, $by = "ASC")` | 排序 |
| `field(...$fieldNames)` | 字段选择 |
| `distinct($fieldName)` | 去重 |
| `groupBy($fieldName)` | 分组 |
| `limit($startOrNumber, $number = null)` | 条数 |
| `page($pages, $perPage = 10)` | 分页 |
| `cancelPage()` | 取消分页 |
| `skip($number)` | 偏移 |
| `where($fieldNameOrFieldValue, $value = null, $glue = "=", $operator = "AND")` | 条件 |
| `whereFilter(...)` | 过滤条件 |
| `sql($yes = true)` | 是否输出 SQL（dry run） |
| `getAll()` / `getOne()` / `count($field = "*")` | 执行读取 |
| `reset($flag = true)` | 重置 |

## SQL 执行

| 方法 | 说明 |
|------|------|
| `fetchAll($sql, $mode = SQLITE3_ASSOC)` | 查询多行 |
| `fetch($sql, $mode = SQLITE3_ASSOC)` | 查询单行 |
| `fetchOne($sql, $mode = SQLITE3_ASSOC)` | 查询单值 |
| `query($sql)` | 执行语句 |
