# DiscuzXPost — Discuz!X 帖子附件数据模型

- **文件位置**: `kernel/Platform/DiscuzX/DiscuzXPost.php`
- **命名空间**: `kernel\Platform\DiscuzX`
- **继承**: `extends BaseObject`
- **是否可继承**: 是

Discuz!X 帖子（Post）数据模型封装，通过 `BaseObject` 提供单例访问。核心功能是跨表（`forum_attachment` 索引表 + `forum_attachment_{tableid}` 分表）聚合获取主题/帖子附件，并处理付费附件与下载链接。

## 方法

### `getThreadPostAttachments` — 获取主题帖子附件

```php
function getThreadPostAttachments($postId, $onlyImage = false)
```

- `$postId`（int|array）：帖子 ID 或帖子 ID 数组
- `$onlyImage`（bool）：只获取图片附件，默认 `false`

**返回值**

- 以 `pid => [aid => 附件数据]` 形式的多维关联数组。

**逻辑摘要**

1. 用 `DiscuzXModel("forum_attachment")` 按 `pid` 查询附件索引表。
2. 按 `tableid` 分组，得到各附件分表 ID（`tableid=127` 对应 `unused` 分表）。
3. 依次查询分表 `forum_attachment_{tableid}` 获取附件明细；`$onlyImage=true` 时过滤 `isimage IN (1, -1)`。
4. 按 `pid` 二次分组，为每个附件补充：
   - `downloads`：下载次数（来自索引表）
   - `price`：付费价格（超过 `maxchargespan` 小时自动免费并更新分表）
   - `payed`：当前用户是否已付费（`1`/`0`，本人附件或已下载则 `1`）
   - `url`：附件下载 URL（`{attachurl}/forum/{attachment}`，远程附件用 FTP attachurl）
5. 若存在付费附件，查询 `common_credit_log`（操作 `BAC`）将已付费附件 `payed` 置为 `true`。

## 使用

```php
use kernel\Platform\DiscuzX\DiscuzXPost;

$post = DiscuzXPost::singleton();
$attachments = $post->getThreadPostAttachments([1001, 1002], true);

foreach ($attachments as $pid => $items) {
  foreach ($items as $aid => $attach) {
    echo $attach['url'], $attach['price'] ? "[付费]" : "";
  }
}
```
