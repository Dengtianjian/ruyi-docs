---
title: Model 模型
---

# Model — ActiveRecord ORM

`Model` 继承自 `Table`，在 DDL 操作之上提供 ActiveRecord 模式的数据操作，内置类型转换、时间戳自动维护、软删除等功能。

## 定义一个 Model

```php
use kernel\Foundation\Database\PDO\Model;

class UserModel extends Model
{
  protected $casts = [
    'id'         => 'int',
    'name'       => 'string',
    'status'     => 'int',
    'metadata'   => 'array',
    'created_at' => 'timestamp',
    'updated_at' => 'timestamp_ms',
    'deleted_at' => 'timestamp',
  ];
}
```

> **约定**：类名去掉 `Model` 后缀 → 驼峰转下划线 → 自动推断表名。
> `UserModel` → `user`，`UserProfileModel` → `user_profile`。
> 也可在构造时传入表名覆盖：`new UserModel('custom_table')`。

---

## $casts 类型系统

`$casts` 定义字段从数据库读写时的自动类型转换。

### 支持的类型

| 类型 | 写入 DB | 读出 PHP | 默认值 |
|------|---------|----------|--------|
| `int` | `(int)` | `int` | `0` |
| `float` | `(float)` | `float` | `0.0` |
| `bool` | `(bool)` | `bool` | `false` |
| `string` | `(string)` | `string` | `''` |
| `array` | `json_encode` | `array` | `[]` |
| `timestamp` | 格式化字符串 | Unix 秒级时间戳 int | `null` |
| `timestamp_ms` | 含毫秒格式化字符串 | Unix 毫秒级时间戳 int | `null` |
| `date` | `'Y-m-d'` 格式 | 格式化日期字符串 | `null` |

### 数据转换流向

```
PHP 赋值 ──→ castToDb()  ──→  存入 $data（DB 兼容格式）
读取输出  ←── castFromDb() ←──  从 $data 取出
```

- **写入**（`__set` → `castToDb`）：将 PHP 值转为可写入数据库的格式
- **读取**（`__get` → `castFromDb`）：将数据库格式转为 PHP 期望类型

### date 类型与自定义格式

`date` 类型支持通过 `|` 指定自定义输出格式：

```php
protected $casts = [
    'birthday'   => 'date|Y-m-d',       // 输出: 2025-07-16
    'reg_date'   => 'date|Y年m月d日',    // 输出: 2025年07月16日
    'log_date'   => 'date|d/m/Y',       // 输出: 16/07/2025
    'created_at' => 'date',             // 输出: 走 $dateFormat（默认 Y-m-d H:i:s）
];
```

- 写入 DB 时永远是 MySQL DATE 标准格式 `'Y-m-d'`
- 读出时优先用 `|` 后指定的格式，否则用 `$dateFormat`

### 时间戳输入兼容

`timestamp` / `timestamp_ms` / `date` 类型在赋值时支持多种输入格式：

```php
$model->created_at = time();              // Unix 秒级时间戳
$model->created_at = 1782397771000;       // 毫秒级时间戳（>10位自动识别）
$model->created_at = '2025-07-16';       // 日期字符串
$model->created_at = '2025-07-16 10:30:00.123';  // 含亚秒
$model->created_at = new DateTime();     // DateTime 对象
$model->created_at = null;               // null → 不报错
```

---

## 表名与主键

```php
class PostModel extends Model
{
  // 手动指定表名（跳过自动推断）
  public $tableName = 'articles';

  // 手动指定主键（默认 'id'）
  protected $primaryKey = 'post_id';
}
```

### 通过 $schema 自动推断

如果定义了 `$schema`（Schema 数组），构造时会自动：

1. 从 `$schema` 推导每个字段的 **PHP 类型** → `$schemaCasts`（写入 DB 的转换依据）
2. 从 `$schema` 检测主键 / 自增列 → 自动设置 `$primaryKey`
3. 检查 `$schemaCasts` / `$casts` 中是否存在时间戳 / 软删除字段 → 自动开关对应功能

---

## Active Record

### find — 按主键查询

```php
$user = UserModel::find(1);

// 直接访问属性（自动走 castFromDb 转换）
echo $user->id;          // int
echo $user->name;       // string
echo $user->created_at; // Unix 时间戳 int

// 配合 with() 预加载关联
$user = UserModel::with('profile')->find(1);
echo $user->profile->bio;  // 已预加载，不会额外查库
```

> `find()` 通过 `__call` 代理执行，与 `first()` 同机制。`with()` 创建的实例状态（`$eagerLoads`）得以保留，预加载生效。

### save — 插入/更新

`save()` 根据主键值自动判断 **INSERT** 还是 **UPDATE**：

```php
// INSERT（主键为默认值 0）
$user = new UserModel();
$user->name   = 'Alice';
$user->email  = 'alice@example.com';
$user->save();                // INSERT，$user->id 自动回填

// UPDATE（主键非默认值）
$user = UserModel::find(1);
$user->name = 'Bob';
$user->save();                // UPDATE ... WHERE id = 1
```

### delete — 删除

```php
// Active Record 删除
$user = UserModel::find(1);
$user->delete();

// Query 链式删除
UserModel::where('status', 0)->delete();
```

### forceDelete — 真删除

绕过软删除直接执行 `DELETE`：

```php
$user->forceDelete();
```

### toArray / toJson — 数据导出

```php
$user = UserModel::find(1);
$data = $user->toArray();   // casts 字段自动转 PHP 输出格式
$json = $user->toJson();    // JSON 字符串
```

---

## 时间戳自动维护

`save()` 时会自动注入 `created_at`（INSERT 时）和 `updated_at`（INSERT/UPDATE 时）。

```php
protected $timestamps = true;    // 默认开启
protected $createTime = 'created_at';
protected $updateTime = 'updated_at';
protected $dateFormat = 'Y-m-d H:i:s';  // timestamp 类型默认输出格式
```

> **精度由 casts 决定**：`timestamp` → 秒级，`timestamp_ms` → 毫秒级。

关闭时间戳：

```php
class LogModel extends Model
{
  protected $timestamps = false;
}
```

如果 `$casts` 或 `$schemaCasts` 中没有对应的 `created_at` / `updated_at` 字段，构造时会**自动关闭** `$timestamps`。

---

## 软删除

`delete()` 不真删，写入 `deleted_at`；查询时默认过滤已删除行。

```php
protected $softDelete = true;     // 默认开启
protected $deleteTime = 'deleted_at';
```

### 相关方法

```php
// 删除（软删）
$user->delete();                    // SET deleted_at = 当前时间

// 恢复
$user->restore();                   // SET deleted_at = NULL

// 判断
$user->isTrashed();                 // 已软删返回 true

// 查询范围
UserModel::withTrashed()->get();    // 包含已删
UserModel::onlyTrashed()->get();    // 仅查已删
```

> `withTrashed()` 和 `onlyTrashed()` 会**重置当前的查询条件**。

---

## Query 方法代理

Model 内部持有 `Query` 实例，所有未定义的方法通过 `__call` / `__callStatic` 自动转发。

```php
// 链式方法
UserModel::where('status', 1)
  ->orderBy('id', 'DESC')
  ->limit(10)
  ->get();

// 聚合
UserModel::where('status', 1)->count();

// 写操作
UserModel::insert(['name' => 'Test']);
UserModel::where('status', 0)->update(['status' => 1]);
```

---

## 关联查询

通过 `hasOne` / `hasMany` / `belongsTo` 在 Model 内定义关系，支持懒加载和 Eager Loading。

### 定义关系

```php
class User extends Model {
    public function profile() {
        return $this->hasOne(Profile::class);
    }
    public function posts() {
        return $this->hasMany(Post::class);
    }
}

class Post extends Model {
    public function author() {
        return $this->belongsTo(User::class);
    }
}
```

### 懒加载

```php
$user = User::where('id', 1)->first();
echo $user->profile->bio;           // hasOne → 单个 Model
foreach ($user->posts as $post) {}  // hasMany → Model 数组
echo $post->author->name;           // belongsTo → 单个 Model
```

### Eager Loading（预加载）

```php
// 预加载单个关联
$users = User::with('profile')->where('status', 1)->get();

// 预加载多个关联
$posts = Post::with('comments', 'author')->limit(10)->get();

// 按主键查询 + 预加载
$user = User::with('profile')->find(1);

// 配合 where + first
$user = User::with('profile')->where('id', 1)->first();
```

### 关联查询约束

```php
$activePosts = $user->posts()->where('status', 1)->get();
$count = $user->posts()->where('status', 1)->count();
```

### 手动加载

```php
$user = User::where('id', 1)->first();
$user->load('profile', 'posts');
```

### 外键约定

| 关系 | foreignKey（默认值） | localKey（默认值） |
|------|--------------------|-------------------|
| hasOne / hasMany | `{当前表名}_{当前主键}` | 关联 Model 的 `primaryKey` |
| belongsTo | `{关联表名}_{关联主键}` | 关联 Model 的 `primaryKey` |

> 详细用法参见 [关联查询完整文档](/php/database/relation)。

---

## Schema 自动推导类型

如果 Model 定义了 `$schema`，`schemaCasts` 会自动生成，影响写入 DB 时的类型转换：

```php
class UserModel extends Model
{
  public $schema = [
    new Schema('id')->bigint()->unsigned()->autoIncrement()->comment('主键'),
    new Schema('name')->varchar(100)->nullable(false)->comment('用户名'),
    new Schema('status')->tinyint()->default(1)->comment('状态'),
  ];

  protected $casts = [
    'name' => 'string',   // 输出时转为 string
    // status 未在 casts 中，但 schemaCasts 自动推导为 'int'
  ];
}
```

写入 DB 时类型优先级：`$schemaCasts`（自动推导，决定写入格式）> `$casts`（手动声明，只影响输出格式）。

---

## 数据库连接切换

Model 默认使用全局活跃连接（`Connections::getUseDriver()`），但支持通过多种方式切换到不同的数据库。

### 连接解析机制

Model 在构造时创建 `Query` 实例，`Query` 自动从 `Connections::getUseDriver()` 获取当前全局活跃的 `Driver`。关键链路：

```
Model.__construct() → new Query($tableName) → Connections::getUseDriver() → Driver → PDO
```

> **注意**：连接在 Model 实例化时绑定到内部的 `Query` 对象，后续切换全局连接不会影响已创建的 Model 实例。

### 方式一：全局切换（推荐用于静态链式查询）

先通过 `DB::connection()` 或 `Connections::useDriver()` 切换全局连接，再操作 Model：

```php
use kernel\Foundation\Database\PDO\DB;
use kernel\Foundation\Database\PDO\Connections;

// 初始化时注册多个连接
Connections::addDriver($masterDriver, 'master', true);
Connections::addDriver($slaveDriver, 'slave');

// --- 静态链式查询：切换后自动走新连接 ---

// 走 master（默认）写数据
PostModel::insert(['title' => 'Hello']);

// 切换到 slave 读数据
DB::connection('slave');
$posts = DB::table('posts')->where('status', 1)->get();

// 或者用 Connections 直接切换
Connections::useDriver('slave');
$posts = PostModel::where('status', 1)->get();            // 走 slave
$post  = PostModel::find(1);                               // 走 slave

// 切回默认连接
Connections::switchToDefaultDriver();
```

> `DB::connection('slave')` 等价于 `Connections::useDriver('slave')`。全局切换会影响后续所有新建的 Model/Query 实例。

### 方式二：实例级切换（通过 setDatabaseDriver 代理）

Model 通过 `__call` 将所有未定义方法代理给内部 `Query`，因此 `setDatabaseDriver()` 可以直接在 Model 实例上调用：

```php
use kernel\Foundation\Database\PDO\Connections;

// 获取目标连接的 Driver 实例
$slaveDriver = Connections::getDrivers()['slave'];

// 实例级切换：仅影响当前 Model 实例的 Query 对象
$post = PostModel::find(1);                     // 走默认连接（master）
$post->setDatabaseDriver($slaveDriver);
$post->related = $post->getRelatedData();        // 这之后的 query 走 slave
```

```php
// 也可以在链式调用中切换
Connections::addDriver($logDriver, 'log_db');
$logDriver = Connections::getDrivers()['log_db'];

$model = new PostModel();
$model->setDatabaseDriver($logDriver)
      ->where('type', 'audit')
      ->get();  // 从 log_db 查询
```

### 方式三：构造前切换（ActiveRecord 场景）

对于 `find()` / `save()` / `delete()` 这类 ActiveRecord 操作，在实例化前切换连接：

```php
// 从 slave 读
Connections::useDriver('slave');
$user = UserModel::find(1);

// 写回 master
Connections::useDriver('master');
$user->name = 'New Name';
$user->save();       // UPDATE 走 master

Connections::switchToDefaultDriver();
```

### 主从分离完整示例

```php
// <app-id>/index.php 初始化
Connections::addDriver($masterDriver, 'master', true);  // 默认：主库
Connections::addDriver($slaveDriver, 'slave');           // 从库

// --- 业务代码 ---
class PostService
{
    public function getPostDetail($id)
    {
        // 读操作 — 走从库
        Connections::useDriver('slave');
        $post = PostModel::find($id);

        // 切回默认
        Connections::switchToDefaultDriver();
        return $post;
    }

    public function createPost($data)
    {
        // 写操作 — 走主库（默认连接）
        $post = new PostModel();
        $post->title = $data['title'];
        $post->content = $data['content'];
        $post->save();
        return $post->id;
    }

    public function getPostsByUser($userId)
    {
        // 链式查询切从库
        Connections::useDriver('slave');
        $posts = PostModel::where('user_id', $userId)
                         ->orderBy('id', 'DESC')
                         ->get();
        Connections::switchToDefaultDriver();
        return $posts;
    }
}
```

### 跨库 Model 查询

Model 本身不绑定特定连接，可以在不同数据库之间复用：

```php
// 两个不同数据库的同名表
Connections::addDriver($dbADriver, 'db_a');
Connections::addDriver($dbBDriver, 'db_b');

// 从 db_a 查
Connections::useDriver('db_a');
$usersA = UserModel::where('status', 1)->get();

// 从 db_b 查
Connections::useDriver('db_b');
$usersB = UserModel::where('status', 1)->get();
```

### 注意事项

- **全局切换是持久性的**：`Connections::useDriver()` 会修改全局静态状态，后续所有数据库操作都受影响。务必在用完后切回默认连接。
- **实例切换只影响当前实例**：`setDatabaseDriver()` 只修改当前 Model 内部的 Query 驱动，不影响其他实例。
- **`__callStatic` 每次创建新实例**：`UserModel::where(...)` 会触发 `new static()`，连接在构造时从全局获取。所以静态调用前切换全局连接是有效的。
- **并发/协程场景**：由于连接状态是全局静态的，在 Swoole 等长驻进程环境中需注意全局切换可能影响其他请求。建议尽量使用 `setDatabaseDriver()` 进行实例级切换，或使用 `DB::connection()` 的链式调用隔离。

## 完整示例

```php
use kernel\Foundation\Database\PDO\Model;

class PostModel extends Model
{
  protected $casts = [
    'id'         => 'int',
    'title'      => 'string',
    'content'    => 'string',
    'user_id'    => 'int',
    'tag_id'     => 'int',
    'created_at' => 'timestamp',
    'updated_at' => 'timestamp_ms',
    'deleted_at' => 'timestamp',
  ];
}

// 创建
$post = new PostModel();
$post->title   = 'Hello World';
$post->content = 'My first post';
$post->user_id = 1;
$post->save();
echo $post->id;  // 自增 ID

// 读取
$post = PostModel::find(1);
echo $post->title;         // string
echo $post->created_at;    // Unix 秒级时间戳 int

// 更新
$post->title = 'Updated Title';
$post->save();

// 链式查询
$posts = PostModel::where('user_id', 1)
  ->whereNotNull('content')
  ->orderBy('id', 'DESC')
  ->paginate(['page' => 1, 'perPage' => 10]);

// 软删除
$post->delete();
$trashed = PostModel::onlyTrashed()->get();   // 查已删
$post->restore();                             // 恢复

// 导出
$data = $post->toArray();
// ['id' => 1, 'title' => 'Updated Title', 'created_at' => 1782397771, ...]
```
