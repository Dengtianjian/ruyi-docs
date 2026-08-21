# GetAttachmentController — 获取附件信息控制器

- **文件位置**: `kernel/Platform/DiscuzX/Controller/Attachment/GetAttachmentController.php`
- **命名空间**: `kernel\Platform\DiscuzX\Controller\Attachment`
- **继承**: `extends DiscuzXController` → `extends AuthController` → `extends Controller`
- **是否可继承**: 是

Discuz!X 附件信息查询控制器，处理 `GET attachment/{attach}` 路由，按 `attachId` 返回附件详情，支持 `w`/`h` 缩略图参数。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$query` | array | `["w"=>"int", "h"=>"int"]` | 查询参数（缩略图宽高） |
| public | `$serializes` | array | 见下 | 响应序列化规则 |

`$serializes`：

```php
[
  "aid" => "int",
  "fileName" => "string",
  "isImage" => "bool",
  "size" => "double",
  "width" => "double",
  "height" => "double",
  "downloadLink" => "string",
  "thumbURL" => "string",
]
```

## 方法

### `data` — 查询附件

```php
public function data($attachId)
```

- `$attachId`（int|string）：路由参数，附件 ID

调用 `DiscuzXAttachmentService::getAttachment($attachId, $this->query->get("w"), $this->query->get("h"))` 返回附件信息 `Result`。

## 使用

```php
// 路由 GET attachment/{attach}
Router::get("attachment/{attach}", GetAttachmentController::class);
```
