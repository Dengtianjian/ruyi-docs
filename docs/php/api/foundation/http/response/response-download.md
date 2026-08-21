# ResponseDownload — 文件下载响应

- **文件位置**: `kernel/Foundation/HTTP/Response/ResponseDownload.php`
- **命名空间**: `kernel\Foundation\HTTP\Response`
- **继承**: 继承 `kernel\Foundation\HTTP\Response`
- **是否可继承**: 是

将本地文件以**附件下载**形式输出的响应。构造后由框架 `output()` 输出 HTTP 头（`Content-Disposition: attachment`）与文件内容。支持 **Range 断点续传**与**下载速率限制**。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$filePath` | `string\|null` | `null` | protected | 下载的文件绝对路径 |
| `$fileName` | `string\|null` | `null` | protected | 下载后保存到客户端的文件名（含扩展名） |
| `$fileSize` | `int\|null` | `null` | protected | 文件大小（字节） |
| `$fileExtension` | `string\|null` | `null` | protected | 文件扩展名 |
| `$DownloadRateLimit` | `bool\|int` | `false` | protected | 下载速率限制（千字节/秒）；`false` 不限制 |
| `$request` | `Request\|null` | `null` | protected | 请求对象 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R, $filePath, $downloadFileName, $rateLimit)` | 构造：解析文件信息 |
| `printContent($readFile)` | 输出文件内容（protected） |
| `output()` | 输出下载响应（HTTP 头 + 内容） |

## 方法

### `__construct(Request $R, $filePath, $downloadFileName = null, $rateLimit = false)` — 构造

解析文件路径信息，设置下载文件名（未指定时用源文件 `basename`）、扩展名、大小与速率限制。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |
| `$filePath` | `string` | 无 | 下载的文件绝对路径 |
| `$downloadFileName` | `string\|null` | `null` | 下载后保存到客户端设备的文件名（含扩展名）；为空用源文件名 |
| `$rateLimit` | `bool\|int` | `false` | 下载速率限制（千字节/秒）；`false` 不限制 |

**返回值**

- 无。

### `printContent($readFile = false)` — 输出文件内容

> protected。开启速率限制时用 `fread` 分块输出并 `sleep(1)` 限速；否则按 `$readFile` 决定用 `readfile` 或 `file_get_contents` + `echo`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$readFile` | `bool` | `false` | 未限速时 `true` 用 `readfile`，`false` 用 `file_get_contents` + `echo` |

**返回值**

- 无（`void`）。

### `output()` — 输出下载响应

输出 `Accept-Ranges` / `Content-Length` / `Content-type`（`application/x-扩展名`）/ `Content-Disposition: attachment` 头。支持 `Range` 断点续传（返回 `206 Partial Content`）；文件不存在输出空内容。

**参数**

- 无。

**返回值**

- 无（`void`）。
