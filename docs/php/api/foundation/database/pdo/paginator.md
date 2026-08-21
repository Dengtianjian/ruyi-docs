# Paginator — 分页器

- **文件位置**: `kernel/Foundation/Database/PDO/Paginator.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **是否可继承**: 是

分页结果对象，封装当前页数据与分页元信息。

## 构造

```php
new Paginator($pageItems, $page, $perPage, $total)
```

## 方法

| 方法 | 说明 |
|------|------|
| `getPage()` | 当前页 |
| `getPerPage()` | 每页条数 |
| `getTotal()` | 总数 |
| `getPageSize()` | 页大小（总页数） |
| `getItems()` | 当前页数据 |
| `setItems(array $items)` | 设置数据 |
| `getFirstItem()` / `getLastItem()` | 首个/末个数据 |
| `toArray()` | 转数组 |

## 使用

```php
$paginator = $query->paginate(["page" => 1, "perPage" => 20]);
echo $paginator->getTotal();
echo $paginator->getPageSize();
$items = $paginator->getItems();
```
