# AbstractOSSStroage — 云存储（OSS/COS）抽象基类

- **文件位置**: `kernel/Foundation/FileSystem/Storage/AbstractOSSStroage.php`
- **命名空间**: `kernel\Foundation\FileSystem\Storage`
- **继承**: 继承 `kernel\Foundation\FileSystem\Storage\AbstractStorage`
- **是否可继承**: 是（抽象基类）

基于 `AbstractStorage` 的云存储抽象，提供对象存储（如 OSS / COS）所需的公共配置：密钥、存储桶、地域、SDK 客户端。具体云平台驱动继承本类并实现文件操作与 URL 生成抽象方法。

构造时自动加载对应 SDK 客户端（`loadSDK()`），并透传签名秘钥、路由前缀、基础地址、平台名给父类。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$platform` | `string\|null` | `null` | protected | 平台名称 |
| `$client` | `mixed\|null` | `null` | protected | 对象存储客户端 |
| `$stsClient` | `mixed\|null` | `null` | protected | 临时凭证（STS）客户端 |
| `$SDKClient` | `mixed\|null` | `null` | protected | SDK 客户端 |
| `$bucket` | `string\|null` | `null` | protected | 存储桶名称 |
| `$region` | `string\|null` | `null` | protected | 存储桶所在地区 |
| `$secretId` | `string\|null` | `null` | protected | 密钥 ID |
| `$secretKey` | `string\|null` | `null` | protected | 密钥 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($secretId, $secretKey, $region, $bucket, $SignatureKey, $RoutePrefix, $BaseURL, $Platform)` | 构造：配置云存储并加载 SDK |
| `loadSDK()` | 加载 SDK 客户端（protected，子类实现） |
| `bucket($name)` | 设置或获取存储桶名称 |
| `region($name)` | 设置或获取地域 |

## 方法

### `__construct($secretId, $secretKey, $region, $bucket, $SignatureKey = "ruyi_storage", $RoutePrefix = "files", $BaseURL = F_BASE_URL, $Platform = "local")` — 构造

配置云存储密钥、地域、存储桶，加载 SDK，再交给父类初始化签名与路由配置。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$secretId` | `string` | 无 | 密钥 ID |
| `$secretKey` | `string` | 无 | 密钥 |
| `$region` | `string` | 无 | 存储桶所在地区 |
| `$bucket` | `string` | 无 | 存储桶名称 |
| `$SignatureKey` | `string` | `"ruyi_storage"` | 生成签名用的密钥（框架用于生成链接、上传授权等） |
| `$RoutePrefix` | `string` | `"files"` | 路由前缀 |
| `$BaseURL` | `string` | `F_BASE_URL` | 基础 URL |
| `$Platform` | `string` | `"local"` | 平台名称 |

**返回值**

- 无。

### `loadSDK()` — 加载 SDK 客户端

> protected。子类实现各自云平台的 SDK 初始化，返回 `$this`。默认空实现（返回 `$this`）。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

### `bucket($name = null)` — 设置或获取存储桶名称

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string\|null` | `null` | 传入则设置存储桶并返回 `$this`；不传则返回当前存储桶 |

**返回值**

- `string\|$this`：不传参返回存储桶名称；传参返回 `$this` 支持链式调用。

### `region($name = null)` — 设置或获取地域

设置地域后会重新加载 SDK（`loadSDK()`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string\|null` | `null` | 传入则设置地域并返回 `$this`；不传则返回当前地域 |

**返回值**

- `string\|$this`：不传参返回地域；传参返回 `$this` 支持链式调用。

---

> **继承自 `AbstractStorage`**：`uploadFile` / `saveFile` / `addFile` / `enableAuth` / `enableACL` / `getFilePreviewURL` 等能力可用，见《AbstractStorage》页。
