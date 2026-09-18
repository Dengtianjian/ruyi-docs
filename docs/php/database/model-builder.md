---
title: ModelBuilder 查询构建器
---

# ModelBuilder — Model 的查询层

`ModelBuilder` 承担 `Model` 的全部查询职责，是 `Model::scopedBuilder()` 的返回值。
对应 Laravel 的 `Illuminate\Database\Eloquent\Builder`。

## 为什么需要这一层

早期实现中，`Model::__call()` 把方法直接转发给 Model 持有的**同一个** `Query` 实例，
而 `Query` 只在写操作后 reset，导致查询状态跨调用累积：

```php
$model->where('key', $k)->exists();   // 条件留在 Query 上
$model->where('key', $k)->delete();   // 变成 WHERE key = ? AND key = ?
```

两次条件相同时结果「碰巧正确」，一旦不同就是**静默的错误数据操作**。

## 生命周期 = 一次查询链

```php
$builder = UserModel::scopedBuilder();   // 全新 Builder + 全新 Query
$builder->where('status', 1)        // 返回 $builder
        ->orderBy('id')             // 返回 $builder
        ->get();                    // 执行，Builder 使命结束
```

- 每次从 Model 发起查询都新建 Builder，**链与链之间零共享**
- 链式方法返回 Builder 自身，后续调用不再经过 `Model::__call`
- 链结束后 Builder 被丢弃，下次查询又是干净的

```php
UserModel::where('status', 1)->count();   // 带条件
UserModel::count();                        // 全表，不受上一行影响
```

## 职责划分

| 类 | 职责 |
|----|------|
| `Model` | Active Record：属性读写、save / delete / restore、关联定义、类型转换 |
| `ModelBuilder` | 查询：where / orderBy / get / first、结果 hydrate、eager loading |

## 创建入口

| 方法 | 返回 | 说明 |
|------|------|------|
| `Model::scopedBuilder()` | `ModelBuilder` | 含全局作用域（软删除过滤） |
| `Model::builder()` | `ModelBuilder` | 不含软删除作用域，供内部写操作使用 |
| `Model::query()` | `Query` | 全新的裸 Query，无作用域 |
| `Model::scopedQuery()` | `Query` | 全新的 Query，已应用作用域 |

`Model` 上所有未定义方法都会自动转到 **`scopedBuilder()`**（带作用域），所以日常无需手动调用：

```php
UserModel::where('status', 1)->get();
// 等价于
UserModel::scopedBuilder()->where('status', 1)->get();
```

## 软删除作用域

作用域在**首个执行方法调用前**才应用，因此 `withTrashed()` / `onlyTrashed()`
在链的任意位置声明都有效：

```php
UserModel::where('status', 1)->withTrashed()->get();   // ✅
UserModel::withTrashed()->where('status', 1)->get();   // ✅
```

| 方法 | 生成的条件 |
|------|-----------|
| 默认 / `withoutTrashed()` | `WHERE deleted_at IS NULL` |
| `withTrashed()` | 不加条件 |
| `onlyTrashed()` | `WHERE deleted_at IS NOT NULL` |

## 条件链式（when / unless）

可选条件可用 `when()` / `unless()` 优雅表达，无需为分支单独声明 `$builder` 变量：

```php
$users = UserModel::orderBy('id')
  ->when($onlyActive, fn($q) => $q->where('active', 1))
  ->unless($onlyTrashed, fn($q) => $q->withoutTrashed())
  ->get();
```

- `when($condition, $callback, ?$default)`：条件为真时执行 `$callback($builder, $condition)`；为假且提供了 `$default` 时执行 `$default`。
- `unless($condition, ...)`：等价于 `when(!$condition, ...)`。
- 回调始终接收当前 Builder 作为第一个参数，返回 `$this` 维持链式。
- 条件为假且不传 `$default` 时整段跳过，等价于「不追加该条件」。

> 行为与 Laravel 的 `when()` / `unless()` 一致，可替代「存变量 + 条件 `->where()`」的写法。

## 预加载

```php
UserModel::with('profile', 'posts')->get();          // 结果是 UserModel[]
$builder = UserModel::scopedBuilder()->with('posts');
```

声明 `with()` 后，结果行会被转为 Model 实例并批量预加载关联（消除 N+1）。
**未**声明 `with()` 时，`get()` / `first()` 返回 Query 原始的关联数组。

## 常用方法

查询方法（转发自 `Query`，返回 `$this` 以支持链式）：

`where` 及全部变体、`select`、`orderBy`、`groupBy`、`join`、`limit`、`offset`、`page` 等。

终止方法（执行 SQL 并返回结果）：

`get()`、`first()`、`value()`、`pluck()`、`paginate()`、`count()`、`exists()`、
`max()` / `min()` / `avg()` / `sum()`、`insert()`、`update()`、`delete()`。

### 方法别名

`all()` 是 `get()` 的别名，两者语义完全一致（`all()` 更贴近 SQL 习惯）：

```php
UserModel::all()  ===  UserModel::get()
UserModel::where('status', 1)->all();
```

别名在 `ModelBuilder` 层解析，**不在底层 `Query` 里重复定义方法**，
因此 `Query::table('users')->all()` 不存在，请使用 `get()`。

`ModelBuilder` 自身提供：

| 方法 | 说明 |
|------|------|
| `with(...$relations)` | 声明预加载的关联 |
| `withTrashed()` / `onlyTrashed()` / `withoutTrashed()` | 软删除作用域 |
| `when($condition, $callback, ?$default)` | 条件为真时执行回调（Laravel 风格可选条件） |
| `unless($condition, $callback, ?$default)` | 条件为假时执行回调（when 的反向） |
| `forceDelete($params)` | 绕过软删除，按当前条件真删 |
| `getQuery()` | 获取内部 `Query`（未应用作用域） |
| `toQuery()` | 应用作用域后返回 `Query`（供 Relation 使用） |
| `getModel()` | 获取原型 Model 实例 |
| `getEagerLoads()` | 获取当前声明的预加载关系 |

## 注意事项

**1. 链式之后不能调用 Model 的实例方法**

```php
UserModel::where('status', 1)->forceDelete();   // ✅ Builder 提供
UserModel::where('status', 1)->save();          // ❌ save() 属于 Model 实例
```

**2. 中断再发起会开启新链**

```php
$model->where('a', 1);   // 条件被丢弃
$model->get();           // 查全表，不含 a = 1
```

**3. 终结方法返回的是结果，不是 Builder**

```php
UserModel::where('id', 1)->update(['name' => 'Ann']);   // 返回 int，不能继续链式
```

## 与 Query Builder 的关系

直接使用 `Query`（如 `Query::table('users')`）时，实例不会被自动重建，
连续查询仍可能残留状态。需要复用时请手动 `reset()`，或优先使用 Model / ModelBuilder。

参见 [Query Builder](/php/database/query)、[Model 模型](/php/database/model)。
