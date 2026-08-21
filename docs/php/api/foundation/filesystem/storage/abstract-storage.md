# AbstractStorage — 存储驱动抽象基类

- **文件位置**: `kernel/Foundation/FileSystem/Storage/AbstractStorage.php`
- **命名空间**: `kernel\Foundation\FileSystem\Storage`
- **继承**: 继承 `kernel\Foundation\Object\AbilityBaseObject`
- **是否可继承**: 是（抽象基类）

统一的**文件存储抽象**，封装文件上传、保存、读取、授权签名、预览/下载 URL 生成等能力，并定义一套访问控制（ACL）与签名授权机制。具体存储平台（本地 `LocalStorage`、云存储等）继承本类并实现若干抽象方法。

**ACL 访问控制常量**：控制文件的匿名/认证用户读写权限，与云平台语义一致。

**签名授权**：文件相关操作可启用签名验证（`signature` 实例，`StorageSignature`），保证只有持有有效签名才能访问/操作文件。签名包含算法、有效期、签名串、参与签名的 URL 参数与请求头等。

**路由约定**：预览/下载 URL 遵循 `{baseURL}/{routePrefix}/{fileKey}/preview|download`。

## 常量

| 常量 | 值 | 说明 |
|------|------|------|
| `PRIVATE` | `"private"` | 私有：仅创建者与管理员具备全部权限，其他人无权限 |
| `PUBLIC_READ` | `"public-read"` | 公有读：匿名用户可读，创建者/管理员全部权限 |
| `PUBLIC_READ_WRITE` | `"public-read-write"` | 公有读写：创建者/管理员/匿名用户全部权限（不建议） |
| `AUTHENTICATED_READ` | `"authenticated-read"` | 认证读：认证用户可读，创建者/管理员全部权限 |
| `AUTHENTICATED_READ_WRITE` | `"authenticated-read-write"` | 认证读写：创建者/管理员/认证用户全部权限（不建议） |

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$signature` | `StorageSignature\|null` | `null` | protected | 文件存储签名实例 |
| `$routePrefix` | `string` | `"files"` | protected | 路由 URI 前缀，用于生成预览/下载地址 |
| `$baseURL` | `string\|null` | `null` | protected | 基础地址，生成浏览/下载地址时的基础 URL |
| `$platform` | `string` | `null` | protected | 当前平台名称（如 `local`/`cos`） |
| `$filesModel` | `FilesModel\|null` | `null` | protected | 文件模型，启用后文件信息入库 |
| `$authorizationEnabled` | `bool` | `false` | protected | 是否启用文件授权（签名）验证 |
| `$ACLEnabled` | `bool` | `false` | protected | 是否启用 ACL 访问控制 |
| `$ACL_currentAuthId` | `mixed\|callable\|null` | `null` | protected | 当前认证用户 ID（可为返回 ID 的可调用对象） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($SignatureKey, $RoutePrefix, $BaseURL, $Platform)` | 构造：初始化签名实例与配置 |
| `enableFilesModel($model)` | 启用文件模型（文件信息入库） |
| `getFilesModel()` | 获取文件模型 |
| `enableAuth()` | 启用文件授权（签名）验证 |
| `disableAuth()` | 关闭文件授权验证 |
| `enableACL($AuthId)` | 启用 ACL 访问控制 |
| `disableAC()` | 关闭 ACL 与授权验证 |
| `getACAuthId()` | 获取当前认证用户 ID |
| `verifyOperationAuthorization($fileKey, $operation)` | 验证文件操作授权 |
| `accessAuthozationVerification($fileKey, $authTag, $OwnerId, $action)` | ACL 授权校验 |
| `getFileAuth($fileKey, $Expires, $URLParams, $Headers, $HTTPMethod)` | 获取文件授权信息（抽象） |
| `getFileSign($fileKey, $Expires, $URLParams, $Headers, $HTTPMethod)` | 获取文件签名（抽象） |
| `getFileTransferAuth(...)` | 生成文件传输授权（签名） |
| `verifyAuth($FileKey, $RawURLParams, $RawHeaders, $HTTPMethod)` | 验证签名授权 |
| `verifyRequestAuth($FileKey)` | 基于当前请求校验签名授权 |
| `uploadFile($File, $fileKey)` | 上传文件 |
| `saveFile($file, $fileKey, $ownerId, $belongsId, $belongsType, $AC)` | 保存文件并入库 |
| `addFile(...)` | 添加文件记录到模型 |
| `deleteFile($fileKey)` | 删除文件（抽象） |
| `fileExist($fileKey)` | 文件是否存在（抽象） |
| `getFile($fileKey)` | 获取文件信息（抽象） |
| `getFilePreviewURL($fileKey, ...)` | 获取文件预览 URL（抽象） |
| `getFileDownloadURL($fileKey, ...)` | 获取文件下载 URL（抽象） |
| `getFileTransferPreviewURL(...)` | 生成带签名的预览 URL |
| `getFileTransferDownloadURL(...)` | 生成带签名的下载 URL |
| `convertURLParams($URLParams, $targetPlatform)` | 转换 URL 参数为指定平台格式 |

## 方法

### `__construct($SignatureKey, $RoutePrefix = "files", $BaseURL = F_BASE_URL, $Platform = "local")` — 构造

创建 `StorageSignature` 签名实例并配置路由前缀、基础地址、平台名。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$SignatureKey` | `string` | 无 | 签名秘钥 |
| `$RoutePrefix` | `string` | `"files"` | 路由前缀 |
| `$BaseURL` | `string` | `F_BASE_URL` | 基础地址 |
| `$Platform` | `string` | `"local"` | 平台名称 |

**返回值**

- 无。

### `enableFilesModel($model = null)` — 启用文件模型

传入模型实例或使用默认 `FilesModel`，此后文件信息会写入数据库。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$model` | `FilesModel\|null` | `null` | 文件模型实例；为空使用默认 `FilesModel` |

**返回值**

- `$this`：支持链式调用。

### `getFilesModel()` — 获取文件模型

**参数**

- 无。

**返回值**

- `FilesModel\|null`：文件模型实例。

### `enableAuth()` — 启用文件授权验证

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

### `disableAuth()` — 关闭文件授权验证

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

### `enableACL($AuthId = null)` — 启用 ACL 访问控制

同时启用授权验证。传入的 `$AuthId` 可用作当前认证用户 ID（静态值或可调用）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$AuthId` | `mixed\|null` | `null` | 当前认证用户 ID，或返回 ID 的可调用对象 |

**返回值**

- `$this`：支持链式调用。

### `disableAC()` — 关闭 ACL 与授权验证

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

### `getACAuthId()` — 获取当前认证用户 ID

`$ACL_currentAuthId` 为可调用时调用之，否则原样返回。

**参数**

- 无。

**返回值**

- `mixed`：当前认证用户 ID。

### `verifyOperationAuthorization($fileKey, $operation = "read")` — 验证文件操作授权

基于 ACL 或请求签名验证当前用户是否有权对文件执行指定操作。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |
| `$operation` | `string` | `"read"` | 操作类型：`read`（读）/ `write`（写） |

**返回值**

- `bool`：通过返回 `true`；否则记录错误并返回 `false`（经 `break()`）。

### `accessAuthozationVerification($fileKey, $authTag, $OwnerId, $action = "read")` — ACL 授权校验

根据文件的 ACL 标签判定当前认证用户与匿名用户的访问/操作权限。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |
| `$authTag` | `string` | 无 | 授权值（`PRIVATE`/`PUBLIC_READ` 等常量） |
| `$OwnerId` | `string` | 无 | 文件拥有者 ID |
| `$action` | `string` | `"read"` | 操作：`read`/`write` |

**返回值**

- `bool`：`TRUE` 通过，`FALSE` 拒绝。

### `getFileAuth($fileKey = null, $Expires = 1800, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 获取文件授权信息

> 抽象方法，子类实现。默认实现委托给 `getFileTransferAuth()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string\|null` | `null` | 文件键 |
| `$Expires` | `int` | `1800` | 有效期（秒） |
| `$URLParams` | `array` | `[]` | URL 参数 |
| `$Headers` | `array` | `[]` | 请求头 |
| `$HTTPMethod` | `string` | `"get"` | HTTP 方法 |

**返回值**

- `mixed`：授权信息。

### `getFileSign($fileKey = null, $Expires = 1800, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 获取文件签名

> 抽象方法，子类实现。默认实现委托给 `getFileTransferAuth()`。

**参数**：同 `getFileAuth()`。

**返回值**

- `mixed`：签名信息。

### `getFileTransferAuth($FileKey, $Expires = 600, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 生成文件传输授权（签名）

通过 `StorageSignature::createAuthorization()` 生成带签名授权的凭证。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | 无 | 文件键（不可为空） |
| `$Expires` | `int` | `600` | 有效期（秒） |
| `$URLParams` | `array` | `[]` | URL 参数 |
| `$Headers` | `array` | `[]` | 请求头 |
| `$HTTPMethod` | `string` | `"get"` | HTTP 方法 |

**返回值**

- `array`：签名参数（`sign-algorithm`/`sign-time`/`key-time`/`header-list`/`signature`/`url-param-list` 等）。

**异常**

- `\kernel\Foundation\Exception\Error`：文件键为空时抛出。

### `verifyAuth($FileKey, $RawURLParams, $RawHeaders = [], $HTTPMethod = "get")` — 验证签名授权

校验签名参数完整性、算法、时间有效性、URL 参数与请求头签名一致性。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | 无 | 文件键 |
| `$RawURLParams` | `array` | 无 | 请求参数（需含签名相关键） |
| `$RawHeaders` | `array` | `[]` | 请求头 |
| `$HTTPMethod` | `string` | `"get"` | HTTP 方法 |

**返回值**

- `bool`：验证通过返回 `true`；否则记录错误返回 `false`（经 `break()`）。

### `verifyRequestAuth($FileKey)` — 基于当前请求校验签名授权

从 `getApp()->request()` 取查询参数与请求头，调用 `verifyAuth()`。未启用授权时直接返回 `true`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | 无 | 文件键 |

**返回值**

- `bool`：通过返回 `true`，否则 `false`。

### `uploadFile($File, $fileKey = null)` — 上传文件

校验授权与 ACL 后，通过 `FileSystem::upload` 落盘，返回文件信息。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$File` | `array\|string` | 无 | `$_FILES` 项或本地文件路径 |
| `$fileKey` | `string\|null` | `null` | 文件键 |

**返回值**

- `StorageFileInfoData\|false`：文件信息对象；失败经 `break()` 返回 `false`。

### `saveFile($file, $fileKey = null, $ownerId = null, $belongsId = null, $belongsType = null, $AC = self::AUTHENTICATED_READ)` — 保存文件并入库

上传文件并写入文件模型记录。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$file` | `array\|string` | 无 | 文件数据 |
| `$fileKey` | `string\|null` | `null` | 文件键 |
| `$ownerId` | `string\|null` | `null` | 拥有者 ID |
| `$belongsId` | `string\|null` | `null` | 关联数据 ID |
| `$belongsType` | `string\|null` | `null` | 关联数据类型 |
| `$AC` | `string` | `AUTHENTICATED_READ` | 访问控制标签 |

**返回值**

- `StorageFileInfoData\|false`：文件信息对象；失败经 `break()` 返回 `false`。

### `addFile(...)` — 添加文件记录

在文件模型新增/覆盖文件记录。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | 无 | 文件键 |
| `$SourceFileName` | `string\|null` | `null` | 原文件名 |
| `$SaveFileName` | `string\|null` | `null` | 现文件名 |
| `$FilePath` | `string\|null` | `null` | 保存路径 |
| `$FileSize` | `int` | `0` | 文件大小 |
| `$Extension` | `string\|null` | `null` | 扩展名 |
| `$OwnerId` | `string\|null` | `null` | 拥有者 ID |
| `$ACL` | `string` | `AUTHENTICATED_READ` | 访问控制 |
| `$Remote` | `bool` | `false` | 是否远程存储 |
| `$BelongsId` | `string\|null` | `null` | 关联数据 ID |
| `$BelongsType` | `string\|null` | `null` | 关联数据类型 |
| `$Width` | `int\|null` | `null` | 媒体宽度 |
| `$Height` | `int\|null` | `null` | 媒体高度 |

**返回值**

- `int|false`：写入结果；未启用文件模型返回 `false`。

### `deleteFile($fileKey)` — 删除文件

> 抽象方法，子类实现。

### `fileExist($fileKey)` — 文件是否存在

> 抽象方法，子类实现。

### `getFile($fileKey)` — 获取文件信息

> 抽象方法，子类实现。

### `getFilePreviewURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取文件预览 URL

> 抽象方法，子类实现。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileKey` | `string` | 无 | 文件键 |
| `$URLParams` | `array` | `[]` | 附加 URL 参数 |
| `$Expires` | `int` | `1800` | 签名有效期（秒） |
| `$WithSignature` | `bool` | `true` | 是否附带签名 |

**返回值**

- `string`：预览 URL。

### `getFileDownloadURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 获取文件下载 URL

> 抽象方法，子类实现。参数同预览 URL。

### `getFileTransferPreviewURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 生成带签名预览 URL

构造 `{baseURL}/{routePrefix}/{fileKey}/preview`，可选附带签名参数（会剔除已存在的 `auth` 参数）。

**参数**：同 `getFilePreviewURL`。

**返回值**

- `string`：预览 URL。

### `getFileTransferDownloadURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)` — 生成带签名下载 URL

构造 `{baseURL}/{routePrefix}/{fileKey}/download`。

**参数**：同 `getFileDownloadURL`。

**返回值**

- `string`：下载 URL。

### `convertURLParams($URLParams, $targetPlatform)` — 转换 URL 参数为平台格式

将统一文件处理参数转换为特定平台参数。例如腾讯云 COS：`r`（缩放）→ `imageMogr2/thumbnail/!40p`、`q`（质量）→ `quality`、`ext`（格式）→ `format`、`rotate`（旋转）→ `rotate`。其他平台原样返回。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$URLParams` | `array` | 无 | URL 参数 |
| `$targetPlatform` | `string` | 无 | 目标平台（如 `cos`） |

**返回值**

- `array`：转换后的 URL 参数。

---

> **继承自 `AbilityBaseObject`**：`break()` / `return()` / `isError()` / `getError()` 等错误机制可用，见《Object/AbilityBaseObject》页。
