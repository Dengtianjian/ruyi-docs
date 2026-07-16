---
title: Paginator 分页器
---

# Paginator — 分页结果封装

`Paginator` 封装分页查询的结果数据，提供当前页码、总条数、每页条数等元信息的便捷访问。

## 创建分页

通过 `Query::paginate()` 自动返回 `Paginator` 实例：

```php
use kernel\Foundation\Database\PDO\DB;

$paginator = DB::table('users')
    ->where('status', 1)
    ->orderBy('id', 'DESC')
    ->paginate([
        'page'    => 2,    // 当前页码
        'perPage' => 15,   // 每页条数
    ]);
```

## 获取分页数据

```php
// 当前页数据
$items = $paginator->getItems();
foreach ($items as $user) {
    echo $user['name'];
}

// 第一条
$first = $paginator->getFirstItem();

// 最后一条
$last = $paginator->getLastItem();

// 数组格式导出
$data = $paginator->toArray();  // 等同于 getItems()
```

## 获取分页元信息

```php
$paginator->getPage();      // 2   — 当前页码
$paginator->getPerPage();   // 15  — 每页条数
$paginator->getTotal();     // 142 — 总条数
$paginator->getPageSize();  // 15  — 当前页实际数据量
```

## 手动构造

通常由 `Query::paginate()` 自动创建，但在特殊场景下也可以手动构造：

```php
use kernel\Foundation\Database\PDO\Paginator;

$paginator = new Paginator(
    $items,    // 当前页数据
    $page,     // 页码
    $perPage,  // 每页条数
    $total     // 总条数
);
```

## 在 Model 中使用

```php
use kernel\Foundation\Database\PDO\Model;

class UserModel extends Model
{
    protected $casts = [
        'id'     => 'int',
        'status' => 'int',
    ];
}

$paginator = UserModel::where('status', 1)
    ->orderBy('id', 'DESC')
    ->paginate(['page' => 1, 'perPage' => 20]);

echo "共 {$paginator->getTotal()} 条，当前第 {$paginator->getPage()} 页";
foreach ($paginator->getItems() as $user) {
    echo $user->name;  // Model 对象，支持 casts 类型转换
}
```

## 完整分页示例

```php
use kernel\Foundation\Database\PDO\DB;

// 获取分页参数
$page    = $_GET['page'] ?? 1;
$perPage = $_GET['perPage'] ?? 20;

// 执行分页查询
$paginator = DB::table('articles')
    ->where('status', 'published')
    ->where('category_id', $categoryId)
    ->orderBy('created_at', 'DESC')
    ->paginate([
        'page'    => $page,
        'perPage' => $perPage,
    ]);

// 返回分页结果
return [
    'items'     => $paginator->toArray(),
    'page'      => $paginator->getPage(),
    'perPage'   => $paginator->getPerPage(),
    'total'     => $paginator->getTotal(),
    'totalPages' => ceil($paginator->getTotal() / $paginator->getPerPage()),
];
```
