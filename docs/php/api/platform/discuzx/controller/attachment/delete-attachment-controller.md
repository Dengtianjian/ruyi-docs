# DeleteAttachmentController — 删除附件控制器

- **文件位置**: `kernel/Platform/DiscuzX/Controller/Attachment/DeleteAttachmentController.php`
- **命名空间**: `kernel\Platform\DiscuzX\Controller\Attachment`
- **继承**: `extends DiscuzXController` → `extends AuthController` → `extends Controller`
- **是否可继承**: 是

Discuz!X 附件删除控制器，处理 `DELETE attachment/{attach}` 路由，按 `attachId` 删除附件。

## 方法

### `data` — 删除附件

```php
public function data($aid)
```

- `$aid`（int|string）：路由参数，附件 ID

调用 `DiscuzXAttachmentService::deleteAttachment($aid)`，返回删除结果（`true`）。

## 使用

```php
// 路由 DELETE attachment/{attach}
Router::delete("attachment/{attach}", DeleteAttachmentController::class);
```
