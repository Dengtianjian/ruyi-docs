# DiscuzXForum — Discuz!X 版块数据模型

- **文件位置**: `kernel/Platform/DiscuzX/DiscuzXForum.php`
- **命名空间**: `kernel\Platform\DiscuzX`
- **继承**: `extends BaseObject`
- **是否可继承**: 是

Discuz!X 版块（Forum）数据模型封装。通过 `BaseObject` 提供单例访问，调用 Discuz!X 全局 `\DB` / `\C::t(...)` 获取版块及版块权限、帖子类型、群组信息等，处理大量 Discuz!X 版块数据的后处理（权限解析、群组升级、字段反序列化等）。

## 方法

### `getForum` — 获取版块数据

```php
public function getForum($ForumId)
```

- `$ForumId`（int|array）：版块 ID 或版块 ID 数组；数组返回数组，单个 ID 返回单条记录

**逻辑**

1. `include_once` Discuz!X 的 `function/forum`、`function/forumlist`、`function/discuzcode`。
2. 联表查询 `forum_forum` + `forum_forumfield`，按 `fid IN(...)` 获取版块。
3. 每个版块处理：
   - 登录用户且有访问掩码时，读取 `forum_access` 的查看/发帖/回复/附件/图片权限。
   - 计算 `ismoderator`（版主/管理员标志）。
   - 群组版块（`status==3`）处理版主列表、群组级别、群组用户权限、发帖策略合并。
   - 反序列化 `threadtypes`（主题分类，含安全过滤）、`threadsorts`（主题排序）、`creditspolicy`、`modrecommend`、`extra`、`formulaperm` 字段。
   - 补充版块图标 `get_forumimg($Forum['icon'])`。

**返回值**

- 单个 ID 返回版块数组（含 `name`、`fid`、`ismoderator`、`allowview` 等字段）；数组 ID 返回按顺序排列的版块数组。

## 使用

```php
use kernel\Platform\DiscuzX\DiscuzXForum;

$forum = DiscuzXForum::singleton();
$forumInfo = $forum->getForum(2);          // 单个版块
$forums = $forum->getForum([2, 3, 5]);     // 多个版块

echo $forumInfo['name'];
if ($forumInfo['ismoderator']) { /* 是版主 */ }
```
