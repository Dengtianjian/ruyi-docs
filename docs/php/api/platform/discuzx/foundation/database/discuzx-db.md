# DiscuzXDB — Discuz!X 数据库访问类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Database/DiscuzXDB.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Database`
- **继承**: `extends \DB`（Discuz!X 全局数据库类）
- **是否可继承**: 否（静态工具类）

Discuz!X 全局数据库访问类 `\DB` 的增强封装，为框架查询构建器（`DiscuzXQuery`）结果提供便捷查询方法，以及事务控制。

## 方法

### `getOne` — 查询单条记录（static）

```php
public static function getOne($query)
```

- `$query`（DiscuzXQuery）：查询构建器

调用 `$query->limit(1)->get()` 生成 SQL 后执行 `fetch_first`，返回首行数组；无结果返回 `null`。

### `getAll` — 查询全部记录（static）

```php
static function getAll($query = null)
```

- `$query`（DiscuzXQuery）：查询构建器

执行 `$query->get()` 生成的 SQL 后 `fetch_all` 返回全部行；无结果返回 `[]`。

### `count` — 计数（static）

```php
static function count($query)
```

执行 `$query->sql()` 后 `result_first` 返回计数值。

### `exist` — 判断存在（static）

```php
static function exist($query)
```

内部调用 `count()`，返回计数值（非零即存在）。

### `insertId` — 最后插入 ID（static）

```php
static function insertId()
```

委托 `\DB::insert_id()` 返回自增 ID。

### `begin` / `commit` / `rollback` — 事务控制（static）

```php
static function begin()
static function commit()
static function rollback()
```

分别执行 `\DB::query("BEGIN")`、`\DB::query("commit")`、`\DB::query("ROLLBACK")`。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Database\DiscuzXQuery;
use kernel\Platform\DiscuzX\Foundation\Database\DiscuzXDB;

$query = new DiscuzXQuery("gstudio_settings");

$row = DiscuzXDB::getOne($query->where("key", "site_name"));
$rows = DiscuzXDB::getAll($query->where("status", 1)->orderBy("id", "desc"));
$total = DiscuzXDB::count($query->count());

// 事务
DiscuzXDB::begin();
try {
  // ...
  DiscuzXDB::commit();
} catch (\Throwable $e) {
  DiscuzXDB::rollback();
}
```
