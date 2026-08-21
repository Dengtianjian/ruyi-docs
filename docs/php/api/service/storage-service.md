# StorageService — 存储服务

- **文件位置**: `kernel/Service/StorageService.php`
- **命名空间**: `kernel\Service`
- **继承**: `extends Foundation\Service`
- **是否可继承**: 是

文件存储门面，管理多存储平台（local/oss/cos）的注册、切换、文件路由、文件键生成、归属绑定、访问控制与签名 URL 生成。所有成员与属性均为静态。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$routePrefix` | `string` | `"files"` | protected static | 文件路由前缀 |
| `$usePlatform` | `AbstractStorage` | `null` | protected static | 当前使用的平台实例 |
| `$usePlatformName` | `string` | `null` | protected static | 当前使用的平台名称 |
| `$platformInstances` | `array<string, AbstractStorage>` | `null` | protected static | 平台实例注册表，键为平台名、值为平台实例 |
| `$fileNameMatchPattern` | `string` | `"[\w\/]+?\.\w+"` | protected static | 文件名匹配正则表达式 |

## 方法速查

| 方法 | 说明 |
|------|------|
| `combinedFileKey($filePath, $fileName, $encode)` | 组合文件路径与名称为文件键 |
| `bootstrap($usePlatforms, $routePrefix)` | 初始化平台并注册文件路由 |
| `getPlatform($name)` | 获取平台实例 |
| `getPlatformName()` | 当前平台名称 |
| `setPlatform($name, $platformInstance)` | 注册平台实例 |
| `switchPlatform($name)` | 切换当前平台 |
| `hasPlatform($name)` | 平台是否存在 |
| `switchToLocal()` / `switchToCOS()` / `switchToOSS()` | 快捷切换指定平台 |
| `registerRoute($Method, $Controller, $URI, $WithFileKey)` | 注册文件路由 |
| `setFilesBelongs($FileKeys, $BelongsId, $BelongsType)` | 绑定文件归属 |
| `deleteBelongsFiles($BelongsId, $BelongsType)` | 删除某归属的全部文件 |
| `setFileAccessControl($FileKeys, $AccessControlTag)` | 设置文件访问控制权限 |
| `setFileAccessControlToPrivate($FileKey)` | 设为私有 |
| `setFileAccessControlToAuthenticatedRead($FileKey)` | 设为授权读 |
| `setFileAccessControlToAuthenticatedReadWrite($FileKey)` | 设为授权读写 |
| `setFileAccessControlToPublicReadWrite($FileKey)` | 设为公共读写 |
| `setFileAccessControlToPublicRead($FileKey)` | 设为公共读 |
| `getFileAuth($FileKey, $Expires, $URLParams, $Headers, $HTTPMethod)` | 获取文件访问授权 |
| `getFileSign()` | 获取文件签名（转发） |
| `getFileTransferAuth($FileKey, $Expires, $URLParams, $Headers, $HTTPMethod)` | 获取传输授权 |
| `getFilePreviewURL($FileKey, $URLParams, $Expires, $WithSignature)` | 获取预览 URL |
| `getFileTransferPreviewURL($FileKey, $URLParams, $Expires, $WithSignature)` | 获取传输预览 URL |
| `getFileDownloadURL($FileKey, $URLParams, $Expires, $WithSignature)` | 获取下载 URL |
| `getFileTransferDownloadURL($FileKey, $URLParams, $Expires, $WithSignature)` | 获取传输下载 URL |

## 方法

### `combinedFileKey($filePath, $fileName, $encode = false)` — 组合文件键

> 统一反斜杠为 `/` 后用 `/` 拼接文件路径与名称，去除首部 `/`；可选 `rawurlencode` 编码。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | — | 文件所在路径 |
| `$fileName` | `string` | — | 文件名称 |
| `$encode` | `bool` | `false` | 是否对组合后的文件键进行 URL 编码 |

**返回值**

- `string`：组合后的文件键名。

**示例**

```php
$key = StorageService::combinedFileKey("user/avatar", "avatar.jpg", false);
// user/avatar/avatar.jpg
```

### `bootstrap($usePlatforms = null, $routePrefix = "files")` — 初始化平台并注册文件路由

> 注册平台实例列表，根据当前请求 URI 判断是否为文件请求并切换到对应平台，随后注册 get/delete/post/patch/preview/download 六类文件路由。缺省平台时自动使用 `LocalStorage`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$usePlatforms` | `array<string, AbstractStorage>` | `null` | 平台实例关联数组，键为平台名、值为平台实例；缺省使用 local 本地存储 |
| `$routePrefix` | `string` | `"files"` | 文件路由前缀 |

**返回值**

- `void`：无返回值。

**示例**

```php
StorageService::bootstrap([
    "local" => new LocalStorage("key"),
    "oss"   => new AliyunOSSStorage("key"),
], "files");
```

### `getPlatform($name = null)` — 获取平台实例

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | `null` | 平台名；传入返回对应注册实例，缺省返回当前使用的平台实例 |

**返回值**

- `AbstractStorage`：平台实例。

**示例**

```php
$platform = StorageService::getPlatform("oss");
```

### `getPlatformName()` — 当前平台名称

**参数**

无参数。

**返回值**

- `string`：当前使用的平台名称。

### `setPlatform($name, $platformInstance)` — 注册平台实例

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | — | 平台名 |
| `$platformInstance` | `AbstractStorage` | — | 平台实例 |

**返回值**

- `string`：返回 `StorageService::class`（支持链式）。

### `switchPlatform($name)` — 切换当前平台

> 目标平台不存在时抛出 `Exception`（500）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | — | 要切换到的平台名 |

**返回值**

- `string`：返回 `StorageService::class`（支持链式）。

### `hasPlatform($name)` — 平台是否存在

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | — | 平台名 |

**返回值**

- `bool`：平台已注册返回 `true`。

### `switchToLocal()` / `switchToCOS()` / `switchToOSS()` — 快捷切换

分别切换当前平台为 `local` / `cos` / `oss`，内部均调用 `switchPlatform()`。

**参数**

无参数。

**返回值**

- `string`：返回 `StorageService::class`（支持链式）。

### `registerRoute($Method, $Controller, $URI = null, $WithFileKey = true)` — 注册文件路由

> 以 `common` 类型注册文件访问路由，URI 形如 `{routePrefix}/{fileKey}/{可选URI}`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Method` | `string` | — | HTTP 请求方法（如 `get`、`post`） |
| `$Controller` | `string\|array` | — | 控制器；数组时第一项为控制器实例、第二项为要执行的方法名 |
| `$URI` | `string` | `null` | 附加的 URI 段（如 `preview`、`download`） |
| `$WithFileKey` | `bool` | `true` | 注册的 URI 中是否包含 `{fileKey}` 段 |

**返回值**

- `string`：返回 `StorageService::class`（支持链式）。

### `setFilesBelongs($FileKeys, $BelongsId, $BelongsType)` — 绑定文件归属

> 为当前平台的文件模型批量写入归属信息（`belongsId`、`belongsType`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKeys` | `array\|string` | — | 文件键或文件键数组 |
| `$BelongsId` | `int` | — | 归属对象的 ID |
| `$BelongsType` | `string` | — | 归属对象类型 |

**返回值**

- `int`：受影响记录数。

### `deleteBelongsFiles($BelongsId, $BelongsType)` — 删除某归属的全部文件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$BelongsId` | `int` | — | 归属对象的 ID |
| `$BelongsType` | `string` | — | 归属对象类型 |

**返回值**

- `int`：删除的记录数。

### `setFileAccessControl($FileKeys, $AccessControlTag)` — 设置文件访问控制权限

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKeys` | `array\|string` | — | 文件键或文件键数组 |
| `$AccessControlTag` | `string` | — | 访问控制标签（如 `AbstractStorage::PUBLIC_READ`） |

**返回值**

- `int`：受影响记录数。

### `setFileAccessControlToPrivate($FileKey)` — 设为私有

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |

**返回值**

- `int`：受影响记录数。

### `setFileAccessControlToAuthenticatedRead($FileKey)` — 设为授权读

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |

**返回值**

- `int`：受影响记录数。

### `setFileAccessControlToAuthenticatedReadWrite($FileKey)` — 设为授权读写

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |

**返回值**

- `int`：受影响记录数。

### `setFileAccessControlToPublicReadWrite($FileKey)` — 设为公共读写

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |

**返回值**

- `int`：受影响记录数。

### `setFileAccessControlToPublicRead($FileKey)` — 设为公共读

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |

**返回值**

- `int`：受影响记录数。

### `getFileAuth($FileKey, $Expires = 1800, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 获取文件访问授权

> 转发给当前平台实例的 `getFileAuth()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |
| `$Expires` | `int` | `1800` | 授权有效期（秒） |
| `$URLParams` | `array` | `[]` | 附加的 URL 参数 |
| `$Headers` | `array` | `[]` | 附加的请求头 |
| `$HTTPMethod` | `string` | `"get"` | HTTP 请求方法 |

**返回值**

- 与平台 `getFileAuth()` 返回值一致（授权数据）。

### `getFileSign()` — 获取文件签名

> 以 `call_user_func_array` 把全部实参转发给当前平台实例的 `getFileSign()`。

**参数**

- `...`：透传任意参数给平台 `getFileSign()`。

**返回值**

- 与平台 `getFileSign()` 返回值一致。

### `getFileTransferAuth($FileKey, $Expires = 1800, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 获取传输授权

> 转发给当前平台实例的 `getFileTransferAuth()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |
| `$Expires` | `int` | `1800` | 授权有效期（秒） |
| `$URLParams` | `array` | `[]` | 附加的 URL 参数 |
| `$Headers` | `array` | `[]` | 附加的请求头 |
| `$HTTPMethod` | `string` | `"get"` | HTTP 请求方法 |

**返回值**

- 与平台 `getFileTransferAuth()` 返回值一致。

### `getFilePreviewURL($FileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取预览 URL

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |
| `$URLParams` | `array` | `[]` | 附加的 URL 参数 |
| `$Expires` | `int` | `1800` | URL 有效期（秒） |
| `$WithSignature` | `bool` | `true` | URL 是否携带签名 |

**返回值**

- `string`：预览 URL。

### `getFileTransferPreviewURL($FileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取传输预览 URL

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |
| `$URLParams` | `array` | `[]` | 附加的 URL 参数 |
| `$Expires` | `int` | `1800` | URL 有效期（秒） |
| `$WithSignature` | `bool` | `true` | URL 是否携带签名 |

**返回值**

- `string`：传输预览 URL。

### `getFileDownloadURL($FileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取下载 URL

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |
| `$URLParams` | `array` | `[]` | 附加的 URL 参数 |
| `$Expires` | `int` | `1800` | URL 有效期（秒） |
| `$WithSignature` | `bool` | `true` | URL 是否携带签名 |

**返回值**

- `string`：下载 URL。

### `getFileTransferDownloadURL($FileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取传输下载 URL

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | — | 文件键 |
| `$URLParams` | `array` | `[]` | 附加的 URL 参数 |
| `$Expires` | `int` | `1800` | URL 有效期（秒） |
| `$WithSignature` | `bool` | `true` | URL 是否携带签名 |

**返回值**

- `string`：传输下载 URL。
