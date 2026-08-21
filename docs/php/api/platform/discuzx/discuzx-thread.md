# DiscuzXThread — Discuz!X 主题数据模型

- **文件位置**: `kernel/Platform/DiscuzX/DiscuzXThread.php`
- **命名空间**: `kernel\Platform\DiscuzX`
- **继承**: `extends BaseObject`
- **是否可继承**: 是

Discuz!X 主题（Thread）数据模型封装，通过 `BaseObject` 提供单例访问。用于修改主题浏览量、获取主题（帖子）附件。

## 方法

### `changeThreadViews` — 修改主题浏览量

```php
function changeThreadViews($threadId, $newViews)
```

- `$threadId`（int）：主题 ID
- `$newViews`（int）：新的浏览量

调用 Discuz!X `\C::t('forum_thread')->increase($threadId, ['views' => $newViews], true)`，返回 Discuz!X 数据层执行结果。

### `getThreadAttachments` — 获取主题附件

```php
function getThreadAttachments($ThreadId, $onlyImage = false)
```

- `$ThreadId`（int|array）：主题 ID 或主题 ID 数组
- `$onlyImage`（bool）：只获取图片附件，默认 `false`

**逻辑**

1. 用 `DiscuzXModel("forum_post")` 查询 `tid` 且 `first=1`（主题帖）的 `pid`/`tid`。
2. 调用 `DiscuzXPost::singleton()->getThreadPostAttachments($pids, $onlyImage)` 批量获取帖子附件。
3. 将帖子 `pid` 映射回所属主题 `tid`，按 `tid` 分组返回。

**返回值**

- 以 `tid => [附件数组]` 形式的关联数组。

## 使用

```php
use kernel\Platform\DiscuzX\DiscuzXThread;

$thread = DiscuzXThread::singleton();
$thread->changeThreadViews(100, 5);

$attachments = $thread->getThreadAttachments([100, 101], true);
```
