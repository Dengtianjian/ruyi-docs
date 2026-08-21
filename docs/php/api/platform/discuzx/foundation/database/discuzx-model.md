# DiscuzXModel — Discuz!X 数据模型基类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Database/DiscuzXModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Database`
- **继承**: `extends Model`（`kernel\Foundation\Database\PDO\Model`）
- **是否可继承**: 是（DiscuzX 数据模型基类）

基于内核 PDO `Model` 扩展的 Discuz!X 数据模型基类。将数据库访问委托给 Discuz!X 全局 `\DB`（`fetch_first`/`fetch_all`/`query`/`insert_id`/`result_first` 等），并内置时间戳字段自动填充、软删除、建表、批量操作等能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$dryRun` | bool | `false` | 为 `true` 时各方法返回 SQL 而非执行 |

继承自 `Model`：`$tableName`、`$primaryKey`、`$tableStructureSQL`、`$DB`、`$query` 等。时间戳相关静态属性见 [Model](../../../foundation/database/pdo/model.md)。

## 构造

```php
function __construct($tableName = null, $prefix = null)
```

- `$tableName`（string，可选）：表名；缺省使用子类 `$this->tableName`
- `$prefix`（string，可选）：表前缀；提供则表名为 `{prefix}_{tableName}`

构造时创建 `DiscuzXQuery($tableName)` 作为查询构建器，并将 `$this->DB` 设为 `\DB::class`。

## 方法

### `createTable` — 建表

```php
function createTable()
```

`$tableStructureSQL` 为空返回 `true`；否则引入 `function/plugin` 库后调用 Discuz!X `runquery($this->tableStructureSQL)` 建表。

### `insert` — 插入

```php
function insert($data, $isReplaceInto = false, $isIgnore = false)
```

- `$data`（array）：数据，二维数组表示批量插入
- `$isReplaceInto`（bool）：是否 `REPLACE INTO`
- `$isIgnore`（bool）：是否 `INSERT IGNORE`

自动填充时间戳字段后执行 `\DB::query`。`$dryRun` 时返回 SQL。

### `insertId` — 插入 ID

```php
function insertId()
```

委托 `\DB::insert_id()`。

### `update` — 更新

```php
function update($data)
```

自动填充更新时间戳后 `\DB::query` 执行 `DiscuzXQuery::update`。`$dryRun` 时返回 SQL。

### `batchUpdate` — 批量更新

```php
function batchUpdate($fieldNames, $values)
```

通过 `DiscuzXQuery::batchUpdate` 生成 SQL，`$dryRun` 返回 SQL，否则 `DiscuzXDB::batchUpdate($query)`。

### `delete` — 删除（软删除）

```php
function delete($directly = false)
```

- `$directly`（bool）：`true` 物理删除；`false` 软删除

软删除时填充 `$UpdatedAt` 与 `$DeletedAt` 时间戳后执行 UPDATE。

### `getAll` — 查询全部

```php
function getAll()
```

`DiscuzXDB::fetch_all` 返回所有匹配行；`$dryRun` 返回 SQL。

### `getOne` — 查询单条

```php
function getOne()
```

`limit(1)->get()` 后 `fetch_first`；无结果返回 `null`。

### `count` — 计数

```php
function count($field = "*")
```

`(int)\DB::result_first` 返回行数。

### `genId` — 生成 ID

```php
function genId($prefix = "", $suffix = "")
```

基于毫秒时间戳 + `md5(prefix.time().Str::random(8).suffix)` 前 `24-时间戳长度` 位拼接，返回 24 位字符串 ID。

### `exist` — 判断存在

```php
function exist()
```

`boolval(result_first(count()))` 返回布尔值。

### `increment` / `decrement` — 增减

```php
function increment($field, $value = 1)
function decrement($field, $value = 1)
```

生成自增/自减 SQL 后 `\DB::query`，返回受影响数。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Database\DiscuzXModel;

class LogModel extends DiscuzXModel
{
  protected $tableName = "log";
  protected $tableStructureSQL = "...CREATE TABLE...";
}

$model = new LogModel();
$id = $model->insert(["content" => "hello"]);
$row = $model->where("id", $id)->getOne();
$model->where("id", $id)->increment("views");

// dryRun 查看 SQL
$model->dryRun = true;
$sql = $model->getOne();
```
