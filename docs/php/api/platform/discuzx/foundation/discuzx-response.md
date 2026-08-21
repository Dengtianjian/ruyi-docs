# DiscuzXResponse — Discuz!X 响应类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXResponse.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: `extends Response`
- **是否可继承**: 是

Discuz!X 场景的响应基类。当前为空扩展类，直接继承内核 `Response` 的全部能力，作为 DiscuzX 应用响应对象的命名空间标识，便于后续定制 DiscuzX 特有响应行为。

## 继承方法

继承自 `kernel\Foundation\HTTP\Response`，包括：

- `success($data = null, $message = "success")`：成功响应
- `error($statusCode = 500, $errorCode = 500, $message = "error", $errorDetails = null, $data = null)`：错误响应
- `json()` / `view()` / `file()` / `download()`：响应类型切换
- `output()`：输出响应
- `getBody()`、`getStatusCode()`、`getCode()`、`getMessage()` 等

详见 [Response](../../foundation/http/response.md)。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXResponse;

$response = new DiscuzXResponse();
$response->success(["foo" => "bar"], "操作成功")->output();
```
