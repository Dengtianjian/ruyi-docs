# DiscuzXMemberGroup — Discuz!X 用户组服务

- **文件位置**: `kernel/Platform/DiscuzX/Member/DiscuzXMemberGroup.php`
- **命名空间**: `kernel\Platform\DiscuzX\Member`
- **继承**: 无（静态工具类）
- **是否可继承**: 否

Discuz!X 用户组查询服务，基于 `CommonUserGroupModel` 提供用户组列表获取。

## 方法

### `all` — 获取全部用户组（static）

```php
public static function all()
```

创建 `CommonUserGroupModel` 实例并 `getAll()`，返回全部用户组记录数组。

## 使用

```php
use kernel\Platform\DiscuzX\Member\DiscuzXMemberGroup;

$groups = DiscuzXMemberGroup::all();
foreach ($groups as $group) {
  echo $group['grouptitle'];
}
```
