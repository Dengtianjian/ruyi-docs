# ControllerResponse — 控制器响应封装

- **文件位置**: `kernel/Foundation/Controller/ControllerResponse.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `Response`
- **是否可继承**: 是

控制器响应的统一封装，继承自 `Response`。在响应基类能力之外，提供文件、下载、分页、视图等便捷响应工厂方法，便于业务控制器按需返回特定类型响应。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `file($filePath, $downloadFileName, $imageQuality, $cacheControl, $httpExpires)` | 文件类型响应（预览） |
| `download($filePath, $downloadFileName, $rateLimit)` | 下载文件响应 |
| `list($total, $data)` | 分页列表响应 |
| `view($viewFile, $viewData, $viewFileBaseDir, $templateId, $viewFileDir)` | 视图响应 |

## 方法

### `file($filePath, $downloadFileName = null, $imageQuality = null, $cacheControl = "no-cache", $httpExpires = null)` — 文件类型响应

返回 `ResponseFile`，支持在线预览图片等文件（详见 [response-file.md](../http/response/response-file.md)）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件绝对路径 |
| `$downloadFileName` | `string\|null` | `null` | 下载时保存的文件名，为 `null` 时保留原名 |
| `$imageQuality` | `int\|null` | `null` | 图片质量（图片类型文件有效，影响输出图片质量） |
| `$cacheControl` | `string` | `"no-cache"` | HTTP `Cache-Control` 头值 |
| `$httpExpires` | `string\|null` | `null` | HTTP 资源过期时间，秒级时间戳 |

**返回值**

- `ResponseFile`：文件响应实例。

**示例**

```php
return $this->response->file(APP_PATH . "/public/image.png");
```

### `download($filePath, $downloadFileName = null, $rateLimit = false)` — 下载文件响应

返回 `ResponseDownload`，强制下载（详见 [response-download.md](../http/response/response-download.md)）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 下载的文件绝对路径 |
| `$downloadFileName` | `string\|null` | `null` | 下载到客户端时保存的文件名，为 `null` 时保留原名 |
| `$rateLimit` | `bool\|int` | `false` | 下载速率限制，单位 KB/秒（千字节）；非 `false` 即开启限速 |

**返回值**

- `ResponseDownload`：下载响应实例。

**示例**

```php
return $this->response->download(APP_PATH . "/public/file.zip", "report.zip", 1024);
```

### `list($total, $data = null)` — 分页列表响应

返回 `ResponsePagination`，供模型分页结果输出（详见 [response-pagination.md](../http/response/response-pagination.md)）。`$total` 与 `$data` 一起构成分页结果。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$total` | `int` | 无 | 数据总量 |
| `$data` | `mixed` | `null` | 当前页数据 |

**返回值**

- `ResponsePagination`：分页响应实例。

**示例**

```php
// Model 层返回：new ResponsePagination(getApp()->request(), $total, $data)
// Controller 层使用：
return $this->response->list($total, $data);
```

### `view($viewFile, $viewData = [], $viewFileBaseDir = "Views", $templateId = "page", $viewFileDir = null)` — 视图响应

返回 `ResponseView`，渲染指定视图文件（详见 [response-view.md](../http/response/response-view.md)）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$viewFile` | `string` | 无 | 渲染的视图文件（相对于 `$viewFileBaseDir` 目录） |
| `$viewData` | `array` | `[]` | 渲染数据 |
| `$viewFileBaseDir` | `string` | `"Views"` | 视图文件所在目录（相对于根目录） |
| `$templateId` | `string` | `"page"` | 模板 ID，用于缓存模板 |
| `$viewFileDir` | `string\|null` | `null` | 视图文件根目录，默认基于 `Path::root()`；可指定渲染其它项目视图文件 |

**返回值**

- `ResponseView`：视图响应实例。

**示例**

```php
return $this->response->view("user/profile", ["user" => $user]);
```

## 完整示例

```php
use kernel\Foundation\Controller\Controller;
use kernel\Foundation\Validation\Rule;

class UserController extends Controller
{
    protected function data()
    {
        $file = $this->params("file");
        $user = getUser($this->body("id"));

        if ($file === "avatar") {
            return $this->response->file($user["avatar_path"]);
        }
        if ($file === "data.json") {
            return $this->response->download("/tmp/data.json", "export.json");
        }
        return $this->response->list($total, $users);
    }
}
```
