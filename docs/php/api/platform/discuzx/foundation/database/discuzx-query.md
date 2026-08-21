# DiscuzXQuery — Discuz!X 查询构建器

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Database/DiscuzXQuery.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Database`
- **继承**: `extends Query`（`kernel\Foundation\Database\PDO\Query`）
- **是否可继承**: 是

基于内核 PDO `Query` 扩展的 Discuz!X 查询构建器。构造时通过 `\DB::table()` 处理表名（含 Discuz!X 表前缀），其余查询能力继承自 `Query`。

## 构造

```php
function __construct($tableName)
```

- `$tableName`（string）：表名

将 `$this->tableName = \DB::table($tableName)`，自动应用 Discuz!X 数据表前缀。

## 静态方法

### `ins` — 便捷创建实例（static）

```php
static function ins($tableName)
```

- `$tableName`（string）：表名

返回 `new Query(\DB::table($tableName))`（注意返回的是内核 `Query` 而非本类）。

## 继承方法

继承自内核 `Query` 的链式查询方法，包括：

- **筛选**：`where()`、`orWhere()`、`whereIn()`、`whereNotIn()`、`whereNull()`、`whereNotNull()`、`whereBetween()` 等
- **排序**：`orderBy()`、`orderByDesc()`
- **限制**：`limit()`、`offset()`、`page()`、`paginate()`
- **聚合**：`count()`、`sum()`、`avg()`、`max()`、`min()`
- **执行**：`get()`、`first()`、`insert()`、`update()`、`delete()`、`increment()`、`decrement()`
- **输出**：`sql()`、`toSql()`

详见 [Query](../../../foundation/database/pdo/query.md)。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Database\DiscuzXQuery;
use kernel\Platform\DiscuzX\Foundation\Database\DiscuzXDB;

$query = new DiscuzXQuery("gstudio_log");
$rows = DiscuzXDB::getAll(
  $query->where("status", 1)->orderBy("id", "desc")->limit(10)
);

// 静态便捷创建
$q = DiscuzXQuery::ins("forum_thread")->where("tid", 100);
```
