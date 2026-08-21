# LocalStorage — 本地存储驱动

- **文件位置**: `kernel/Foundation/FileSystem/Storage/LocalStorage.php`
- **命名空间**: `kernel\Foundation\FileSystem\Storage`
- **继承**: 继承 `kernel\Foundation\FileSystem\Storage\AbstractStorage`
- **是否可继承**: 是

基于本地文件系统的存储驱动，是 `AbstractStorage` 的默认实现。文件落盘到应用存储目录（`Path::storage()`），预览/下载 URL 走本地路由。继承自 `AbstractStorage` 的上传、保存、签名授权、URL 生成等能力全部可用。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （继承自 `AbstractStorage`） | — | — | — | `$signature` / `$routePrefix` / `$baseURL` / `$platform` / `$filesModel` / `$authorizationEnabled` / `$ACLEnabled` / `$ACL_currentAuthId` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `deleteFile($fileKey)` | 删除本地文件 |
| `fileExist($fileKey)` | 文件是否存在于本地 |
| `getFile($fileKey)` | 获取文件信息 |
| `getFileAuth($fileKey, $Expires, $URLParams, $Headers, $HTTPMethod)` | 获取文件授权信息 |
| `getFileSign($fileKey, $Expires, $URLParams, $Headers, $HTTPMethod)` | 获取文件签名 |
| `getFilePreviewURL($fileKey, ...)` | 获取预览 URL |
| `getFileDownloadURL($fileKey, ...)` | 获取下载 URL |

## 方法

### `deleteFile($fileKey)` — 删除本地文件

获取文件信息，存在则从本地存储目录删除；启用文件模型时同步移除数据库记录。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |

**返回值**

- `bool`：文件不存在返回 `true`（视为已删除）；删除成功返回 `true`，失败返回 `false`。

### `fileExist($fileKey)` — 文件是否存在于本地

基于 `getFile()` 的文件信息判断本地文件是否存在。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |

**返回值**

- `bool`：存在返回 `true`，否则 `false`。

### `getFile($fileKey)` — 获取文件信息

校验授权/ACL 后读取文件信息，组装为 `StorageFileInfoData`（含 URL、预览/下载地址、转移预览/下载地址）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |

**返回值**

- `StorageFileInfoData\|false`：文件信息对象；无权限/文件不存在经 `break()` 返回 `false`。

### `getFileAuth($fileKey = null, $Expires = 1800, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 获取文件授权信息

委托 `getFileTransferAuth()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string\|null` | `null` | 文件键 |
| `$Expires` | `int` | `1800` | 有效期（秒） |
| `$URLParams` | `array` | `[]` | URL 参数 |
| `$Headers` | `array` | `[]` | 请求头 |
| `$HTTPMethod` | `string` | `"get"` | HTTP 方法 |

**返回值**

- `array`：签名授权参数。

### `getFileSign($fileKey = null, $Expires = 1800, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 获取文件签名

委托 `getFileTransferAuth()`。参数同 `getFileAuth()`。

### `getFilePreviewURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取预览 URL

委托 `getFileTransferPreviewURL()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |
| `$URLParams` | `array` | `[]` | 附加 URL 参数 |
| `$Expires` | `int` | `1800` | 签名有效期（秒） |
| `$WithSignature` | `bool` | `true` | 是否附带签名 |

**返回值**

- `string`：预览 URL。

### `getFileDownloadURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取下载 URL

委托 `getFileTransferDownloadURL()`。参数同 `getFilePreviewURL`。
