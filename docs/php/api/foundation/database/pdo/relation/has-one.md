# HasOne — 一对一关联

- **文件位置**: `kernel/Foundation/Database/PDO/Relation/HasOne.php`
- **命名空间**: `kernel\Foundation\Database\PDO\Relation`
- **继承**: `extends Relation`
- **是否可继承**: 是

一对一关联（本模型关联一条目标记录）。

## 使用

```php
class UserModel extends Model
{
    public function profile()
    {
        return $this->hasOne(ProfileModel::class, "user_id", "id");
    }
}

$user = UserModel::with("profile")->first();
echo $user->profile->avatar;
```
