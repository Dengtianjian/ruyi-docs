# Model — ORM 模型基类

- **文件位置**: `kernel/Foundation/Database/PDO/Model.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **继承**: `extends Object\AbilityBaseObject`
- **是否可继承**: 是（所有业务模型的基类）

ORM 模型基类，提供表映射、类型转换（casts）、时间戳、软删除、关联、预加载、查询魔法调用。

## 属性配置

```php
class UserModel extends Model
{
    protected $tableName  = "users";
    protected $primaryKey = "id";
    protected $casts      = ["age" => "int", "is_vip" => "bool", "created_at" => "datetime"];
    protected $timestamps = true;      // 自动时间戳
    protected $createTime = "created_at";
    protected $updateTime = "updated_at";
    protected $softDelete = true;      // 软删除
    protected $deleteTime = "deleted_at";
    protected $dateFormat = "Y-m-d H:i:s";
}
```

## 实例化与查询

```php
$user = UserModel::singleton();                 // 单例（核心约定）
$user = UserModel::make();                      // 新实例
$users = UserModel::singleton()->where("age", ">=", 18)->get();
```

| 方法 | 说明 |
|------|------|
| `singleton()` / `make()` | 继承自 BaseObject |
| `scopedBuilder()` | 获取带全局作用域的 ModelBuilder（默认查询入口，`__call` 转发至此） |
| `builder()` | 获取不带作用域的 ModelBuilder |
| `query()` | 获取不带作用域的原始 Query |
| `scopedQuery()` | 获取带全局作用域的原始 Query |
| `getPrimaryKey()` / `getTableBaseName()` / `getCasts()` | 元信息 |

## 魔法静态查询

通过 `__callStatic` / `__call` 魔法调用查询：`UserModel::where("age", 18)->orderBy("id", "DESC")->limit(10)->get()`。

## 保存与删除

| 方法 | 说明 |
|------|------|
| `save()` | 保存（插入或更新），自动时间戳 |
| `delete($params = [])` | 删除（软删除生效时走软删除） |
| `forceDelete($params = [])` | 物理删除 |
| `restore()` | 恢复软删除 |
| `isTrashed()` | 是否已软删除 |
| `withTrashed()` | 包含已删除 |
| `onlyTrashed()` | 仅已删除 |

## 属性访问

`__get` / `__set` 提供属性访问，按 `casts` 做类型转换。

## 关联

| 方法 | 说明 |
|------|------|
| `hasOne($relatedClass, $foreignKey = "", $localKey = "")` | 一对一 |
| `hasMany($relatedClass, $foreignKey = "", $localKey = "")` | 一对多 |
| `belongsTo($relatedClass, $foreignKey = "", $localKey = "")` | 多对一 |

## 预加载

| 方法 | 说明 |
|------|------|
| `with(...$relations)` | 静态预加载 |
| `load(...$relations)` | 实例预加载 |
| `getRelation($relation)` | 读取关联 |

## 输出

| 方法 | 说明 |
|------|------|
| `toArray()` | 转数组 |
| `toJson(int $flags = JSON_UNESCAPED_UNICODE \| JSON_UNESCAPED_SLASHES)` | 转 JSON |

## 示例

```php
class OrderModel extends Model
{
    protected $tableName = "orders";
    protected $casts = ["total" => "float", "status" => "int"];
}

// 查询 + 关联 + 预加载
$orders = OrderModel::with("user")
    ->where("status", 1)
    ->orderBy("id", "DESC")
    ->limit(10)
    ->get();

// 创建
$order = OrderModel::make();
$order->total = 99.9;
$order->save();
```
