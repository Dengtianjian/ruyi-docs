# DiscuzXAttachmentService — Discuz!X 附件服务

- **文件位置**: `kernel/Platform/DiscuzX/Service/DiscuzXAttachmentService.php`
- **命名空间**: `kernel\Platform\DiscuzX\Service`
- **继承**: `extends Service` → `extends AbilityBaseObject` → `extends BaseObject`
- **是否可继承**: 是（静态功能类）

Discuz!X 附件处理服务，提供文件保存、上传、查询、删除，以及附件相关路由注册等能力。使用 Discuz!X 的 `forum_upload`、`updateattach`、`forum_attachment` 等数据层与函数，并适配框架 `Result`/`FileSystem`/`Router`。

## 方法

### `saveFile` — 保存文件（static）

```php
public static function saveFile($files, $saveDir = "")
```

- `$files`（array）：上传的文件或文件列表
- `$saveDir`（string）：保存目录，基于 `data/plugindata/{插件ID}/attachments` 下

若配置了 `attachmentPath` 则保存到该路径；否则保存到 `data/plugindata/{App::id()}/attachments/{saveDir}`（自动创建目录）。返回 `new Result(FileSystem::upload(...))`。

### `uploadFile` — 上传文件到 Discuz!X（static）

```php
public static function uploadFile($file)
```

- `$file`（array）：上传的文件

**逻辑**

1. 设置 `$_GET['uid']` 与 `$_GET['hash']`（基于 `authkey`）。
2. 将文件置入 `$_FILES['Filedata']`。
3. `new forum_upload(true)` 执行上传；`statusid` 非 0 时返回错误 `Result`（400）。
4. 计算附件分表 `tableId`，调用 `updateattach()` 更新附件记录。
5. 返回含附件信息的 `Result`。

### `getAttachment` — 获取附件信息（static）

```php
public static function getAttachment($AttachmentId, $thumbWidth = null, $thumbHeight = null)
```

- `$AttachmentId`（int）：附件 ID
- `$thumbWidth` / `$thumbHeight`（int，可选）：缩略图宽高

**逻辑**

1. 查询 `forum_attachment` 索引表，不存在返回 `Result(404, 404001, "附件不存在")`。
2. 按 `tableid` 查询对应分表 `forum_attachment_{tableId}`，不存在同上。
3. 生成 `downloadLink`（`forum.php?mod=attachment&aid=aidencode(...)&nothumb=yes`）。
4. 图片附件生成 `thumbURL`（`getforumimg(...)`）。
5. 返回裁剪后的附件信息数组（`aid`/`fileName`/`isImage`/`size`/`width`/`height`/`downloadLink`/`thumbURL`）包裹在 `Result` 中。

### `deleteAttachment` — 删除附件（static）

```php
public static function deleteAttachment($aids)
```

- `$aids`（int|array）：附件 ID 或 ID 列表

1. `\C::t('forum_attachment')->delete_by_id("aid", $aids)` 删除索引表记录。
2. `\C::t('forum_attachment_exif')->delete($aids)` 删除 EXIF 记录。
3. 按附件 ID 末位计算分表，`\C::t('forum_attachment_n')->delete_attachment($tableId, $aids)` 删除分表记录。
4. 返回 `true`。

### `registerRoute` — 注册附件路由（static）

```php
public static function registerRoute()
```

注册路由：
- `POST attachment` → `UploadAttachmentController`
- `GET/DELETE attachment/{attach}` → `GetAttachmentController` / `DeleteAttachmentController`

## 使用

```php
use kernel\Platform\DiscuzX\Service\DiscuzXAttachmentService;

// 保存文件
$result = DiscuzXAttachmentService::saveFile($_FILES['file'], "topic");

// 上传到 Discuz!X
$result = DiscuzXAttachmentService::uploadFile($_FILES['file']);

// 获取附件
$info = DiscuzXAttachmentService::getAttachment(1001, 200, 200);

// 删除
DiscuzXAttachmentService::deleteAttachment(1001);

// 注册路由
DiscuzXAttachmentService::registerRoute();
```
