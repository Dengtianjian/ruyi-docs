---
title: 关联查询
---

# 关联查询（Relation）

关联查询通过 `hasOne` / `hasMany` / `belongsTo` 在 Model 层定义表间关系，支持懒加载和 Eager Loading，告别手写 JOIN SQL。

## 快速开始

```php
use kernel\Foundation\Database\PDO\Model;

class User extends Model {
    public $tableName = 'users';

    public function profile() {
        return $this->hasOne(Profile::class);
    }

    public function posts() {
        return $this->hasMany(Post::class);
    }
}

class Post extends Model {
    public $tableName = 'posts';

    public function author() {
        return $this->belongsTo(User::class);
    }
}

class Profile extends Model {
    public $tableName = 'profiles';
}
```

## 关系类型

### hasOne — 一对一

当前 Model 拥有一条关联记录，JOIN 方向：**当前表.主键 = 关联表.外键**。

```php
class User extends Model {
    public function profile() {
        return $this->hasOne(Profile::class);
        // 等价于 return $this->hasOne(Profile::class, 'user_id', 'id');
    }
}

// 懒加载
$user = User::where('id', 1)->first();
echo $user->profile->bio;  // 首次访问时自动查询，结果缓存
```

### hasMany — 一对多

当前 Model 拥有多条关联记录，JOIN 方向：**当前表.主键 = 关联表.外键**。

```php
class Post extends Model {
    public function comments() {
        return $this->hasMany(Comment::class);
    }
}

$post = Post::where('id', 1)->first();
foreach ($post->comments as $comment) {
    echo $comment->content;
}
```

### belongsTo — 反向一对多

当前 Model 属于一条父记录，JOIN 方向：**关联表.主键 = 当前表.外键**。

注意：`belongsTo` 的外键约定与 `hasOne`/`hasMany` 相反：
- `foreignKey`：当前表的外键字段
- `localKey`：关联表的主键字段

```php
class Comment extends Model {
    public function post() {
        return $this->belongsTo(Post::class);
        // 等价于 return $this->belongsTo(Post::class, 'post_id', 'id');
    }
}

$comment = Comment::where('id', 1)->first();
echo $comment->post->title;
```

## 外键 & 主键约定

| 关系 | foreignKey（默认值） | localKey（默认值） |
|------|-------------------|-------------------|
| hasOne / hasMany | `{当前表名}_{当前主键}` | 关联 Model 的 `primaryKey` |
| belongsTo | `{关联表名}_{关联主键}` | 关联 Model 的 `primaryKey` |

示例：`User hasMany Post` → foreignKey 默认为 `user_id`，localKey 默认为 `id`。

> 表名会自动去除配置前缀。例如 `ruyi_users` → 推断外键为 `user_id`。

## 懒加载

通过 `$model->relationName` 访问关联属性时自动触发查询，结果缓存在实例中：

```php
$user = User::where('id', 1)->first();
$profile = $user->profile;     // 执行一次查询
$profile = $user->profile;     // 命中缓存，不查库
```

## Eager Loading（预加载）

通过 `with()` 预加载关联，批量 IN 查询消除 N+1 问题：

```php
// 预加载单个关联
$users = User::with('profile')->where('status', 1)->get();

// 预加载多个关联
$posts = Post::with('comments', 'author')->limit(10)->get();

// 与 where 配合使用
$users = User::with('profile')->where('status', 1)->first();
```

`with()` 也可直接在 `find()` 前使用，预加载关联数据：

```php
$user = User::with('profile')->find(1);   // 支持预加载
```

> `find()` 通过 `__call` 代理执行，与 `first()` 同机制，`$this->eagerLoads` 得以保留。

### 手动加载 — load()

对已有 Model 实例按需加载关联：

```php
$user = User::where('id', 1)->first();
$user->load('profile', 'posts');  // 按需加载这两个关联
```

## 关联查询约束

关系方法返回 Relation 对象，支持完整 Query 链式调用：

```php
// 条件过滤
$activePosts = $user->posts()->where('status', 1)->get();

// 排序
$recentPosts = $user->posts()->orderBy('created_at', 'DESC')->limit(5)->get();

// 聚合
$postCount = $user->posts()->where('status', 1)->count();

// 选择特定字段
$titles = $user->posts()->select('id', 'title')->get();
```

## 使用场景

| 场景 | 推荐方式 |
|------|---------|
| 单个关联查询 | 懒加载 `$model->relation` |
| 列表页（N 条记录，每条需要关联） | Eager Loading `with('relation')->get()` |
| 关联需要额外条件 | 链式调用 `$model->relation()->where(...)->get()` |
| 动态附加关联 | `load('relation')` |

## 原生 JOIN

如需复杂 JOIN（多表、非外键关联、子查询 JOIN 等），可使用 Query 的 JOIN 方法：

```php
// Query 层面直接 JOIN
Query::table('orders', 'o')
    ->join('users AS u', 'o.user_id', '=', 'u.id')
    ->leftJoin('profiles AS p', 'u.id', '=', 'p.user_id')
    ->select('o.*', 'u.name', 'p.bio')
    ->get();
```

参见 [Query Builder — JOIN 关联](/php/database/query#join-关联)。
