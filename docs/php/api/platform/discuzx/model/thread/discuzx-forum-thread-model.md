# DiscuzXForumThreadModel — Discuz!X 论坛主题模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/Thread/DiscuzXForumThreadModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model\Thread`
- **继承**: `extends DiscuzXModel` → `extends Model`
- **是否可继承**: 是

Discuz!X 论坛主题数据模型，表名固定为 `forum_thread`，提供按主题 ID、标题关键词、作者筛选主题并分页返回的能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `forum_thread` | 表名 |

## 方法

### `items` — 分页查询主题列表

```php
public function items($tids = null, $subjectKeywords = null, $authorIds = null, $page = 1, $perPage = 10)
```

- `$tids`（int|array）：主题 ID 或 ID 数组
- `$subjectKeywords`（string）：标题关键词（`LIKE` 模糊匹配）
- `$authorIds`（int|array）：作者用户 ID
- `$page`（int）：页码，默认 1
- `$perPage`（int）：每页数量，默认 10

**逻辑**

1. 依次按 `tid`、`subject LIKE %keyword%`、`authorid` 添加条件。
2. `count()` 统计总数。
3. `page($page, $perPage)` 分页并 `getAll()`。
4. 返回 `ResponsePagination` 对象（含分页元数据与列表数据）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\Thread\DiscuzXForumThreadModel;

$threads = new DiscuzXForumThreadModel();
$page = $threads->items(null, "教程", null, 1, 10);

echo $page->total();
foreach ($page->list() as $thread) {
  echo $thread['subject'];
}
```
