# ResponseFile — 文件预览响应

- **文件位置**: `kernel/Foundation/HTTP/Response/ResponseFile.php`
- **命名空间**: `kernel\Foundation\HTTP\Response`
- **继承**: 继承 `kernel\Foundation\HTTP\Response\ResponseDownload`
- **是否可继承**: 是

以**内联预览**（`Content-Disposition: inline`）形式输出本地文件。图片支持**实时裁剪/缩放/旋转/转格式/质量**（经 query 参数 `w`/`h`/`r`/`q`/`ext` 触发，用 GD 生成缩略图并输出 webp/jpg/png/gif 等），并带 HTTP 缓存控制（ETag / Last-Modified / 304）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$imageQuality` | `int\|null` | `null` | private | 图片输出质量 |
| `$cacheControl` | `string` | `"no-cache"` | private | HTTP 缓存控制属性值 |
| `$httpExpires` | `int\|null` | `null` | private | HTTP 资源过期时间（秒级时间戳） |
| （继承自 `ResponseDownload`） | — | — | — | `$filePath` / `$fileName` / `$fileSize` / `$fileExtension` / `$DownloadRateLimit` / `$request` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(...)` | 构造：设置图片质量与缓存控制 |
| `createThumb(...)` | 用 GD 生成缩略图并输出（private） |
| `setCache($fileTag)` | 设置 HTTP 缓存头（protected） |
| `output()` | 输出预览响应 |

## 方法

### `__construct(Request $R, $filePath, $downloadFileName = null, $imageQuality = null, $cacheControl = "no-cache", $httpExpires = null)` — 构造

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |
| `$filePath` | `string` | 无 | 文件的绝对路径 |
| `$downloadFileName` | `string\|null` | `null` | 输出文件名（含扩展名）；为空用源文件名 |
| `$imageQuality` | `int\|null` | `null` | 图片输出质量 |
| `$cacheControl` | `string` | `"no-cache"` | HTTP 缓存控制属性值 |
| `$httpExpires` | `int\|null` | `null` | HTTP 资源过期时间（秒级时间戳） |

**返回值**

- 无。

### `createThumb($filePath, $fileName, $targetWdith, $targetHeight, $targetRatio, $NewExtension = null)` — 生成缩略图

> private。按源图类型创建画布，计算目标宽高（`$targetRatio` 缩放比例优先，否则按 `$targetWdith`/`$targetHeight` 等比例推导），`imagecopyresampled` 缩放后按目标扩展名输出（webp/jpg/png/gif/bmp），支持质量参数 `q`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 源图片绝对路径 |
| `$fileName` | `string` | 无 | 输出文件名 |
| `$targetWdith` | `int\|bool` | 无 | 目标宽度；`false` 表示由高度推导 |
| `$targetHeight` | `int\|bool` | 无 | 目标高度；`false` 表示由宽度推导 |
| `$targetRatio` | `float\|bool` | 无 | 缩放比例；`false` 表示按宽高 |
| `$NewExtension` | `string\|null` | `null` | 目标输出格式（如 `"jpg"`）；为空按源图决定 |

**返回值**

- 无（`void`）。

### `setCache($fileTag)` — 设置 HTTP 缓存头

> protected。将文件标识 MD5 为 ETag；若请求头 `If-None-Match` 匹配则输出 `304 Not Modified` 并 `exit`。否则输出 `Last-Modified` / `etag` / `cache-control` / 可选 `expires`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileTag` | `string` | 无 | 缓存标识（参与 ETag 计算） |

**返回值**

- 无（命中 304 时 `exit`）。

### `output()` — 输出预览响应

输出 `Accept-Ranges` / `Content-Length` / `Content-Disposition: inline` / `Content-type`（按文件 MIME）。图片且 query 含 `w`/`h`/`r`/`q`/`ext` 时：按参数裁剪缩放输出，`ext` 可转格式；否则直接输出原始内容。

**参数**

- 无。

**返回值**

- 无（`void`）。
