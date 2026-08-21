# HasMany — 一对多关联

- **文件位置**: `kernel/Foundation/Database/PDO/Relation/HasMany.php`
- **命名空间**: `kernel\Foundation\Database\PDO\Relation`
- **继承**: `extends Relation`
- **是否可继承**: 是

一对多关联（本模型关联多条目标记录）。

## 使用

```php
class UserModel extends Model
{
    public function orders()
    {
        return $this->hasMany(OrderModel::class, "user_id", "id");
    }
}

$user = UserModel::with("orders")->first();
foreach ($user->orders as $order) { /* ... */ }
```
