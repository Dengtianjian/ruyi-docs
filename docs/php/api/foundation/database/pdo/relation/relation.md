# Relation — 关联基类

- **文件位置**: `kernel/Foundation/Database/PDO/Relation/Relation.php`
- **命名空间**: `kernel\Foundation\Database\PDO\Relation`
- **是否可继承**: 是（BelongsTo / HasMany / HasOne 的基类）

模型关联的抽象基类，定义关联的查询与结果获取。子类：`BelongsTo`（多对一）、`HasMany`（一对多）、`HasOne`（一对一）。

## 说明

- 由 `Model::hasOne()` / `hasMany()` / `belongsTo()` 创建
- 定义关联目标类、外键、本地键
- 供 `Model::with()` / `load()` 预加载使用

## 使用

关联通常在 Model 中声明：

```php
class UserModel extends Model
{
    public function posts()
    {
        return $this->hasMany(PostModel::class, "user_id", "id");
    }
}

$user->load("posts");
foreach ($user->posts as $post) { /* ... */ }
```
