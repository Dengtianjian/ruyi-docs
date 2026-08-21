# UploadAttachmentController — 上传附件控制器

- **文件位置**: `kernel/Platform/DiscuzX/Controller/Attachment/UploadAttachmentController.php`
- **命名空间**: `kernel\Platform\DiscuzX\Controller\Attachment`
- **继承**: `extends DiscuzXController` → `extends AuthController` → `extends Controller`
- **是否可继承**: 是

Discuz!X 附件上传控制器，处理 `POST attachment` 路由，调用 `DiscuzXAttachmentService::uploadFile` 将文件上传到 Discuz!X 并返回附件信息。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$Auth` | bool | `false` | 关闭认证（公开上传） |
| public | `$serializes` | array | 见下 | 响应数据序列化类型规则 |

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

### `data` — 处理上传

```php
public function data()
```

**逻辑**

1. 校验 `$_FILES` 中是否存在 `file`；无则返回 `response->error(400, "Attachment:400001", "请上传文件", $_FILES)`。
2. 调用 `DiscuzXAttachmentService::uploadFile($_FILES['file'])`。
3. 成功后组装附件数据：
   - `aid`：附件 ID
   - `fileName`：原始文件名
   - `isImage`：是否图片
   - `size`：文件大小
   - `width` / `height`：图片宽高
   - `downloadLink`：`forum.php?mod=attachment&aid=aidencode(...)&nothumb=yes`
   - `thumbURL`：图片缩略图 URL（`getforumimg(...)`）
4. 通过 `$UploadResult->setData($data)` 写入响应并返回。

## 使用

```php
use kernel\Platform\DiscuzX\Controller\Attachment\UploadAttachmentController;

// 由路由 POST attachment 自动分发
Router::post("attachment", UploadAttachmentController::class);
```
