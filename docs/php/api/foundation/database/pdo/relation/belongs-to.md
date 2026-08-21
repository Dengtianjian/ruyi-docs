# BelongsTo — 多对一关联

- **文件位置**: `kernel/Foundation/Database/PDO/Relation/BelongsTo.php`
- **命名空间**: `kernel\Foundation\Database\PDO\Relation`
- **继承**: `extends Relation`
- **是否可继承**: 是

多对一关联（本模型归属一条目标记录），常用于外键指向父记录。

## 使用

```php
class OrderModel extends Model
{
    public function user()
    {
        return $this->belongsTo(UserModel::class, "user_id", "id");
    }
}

$order = OrderModel::with("user")->first();
echo $order->user->name;
```
