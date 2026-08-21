# DiscuzXQCloudCOSStorage — Discuz!X 腾讯云 COS 文件存储驱动

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Storage/QCloud/DiscuzXQCloudCOSStorage.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Storage\QCloud`
- **继承**: `extends QCloudCOSStorage` → `extends AbstractOSSStroage` → `extends AbstractStorage` → `extends AbilityBaseObject`
- **是否可继承**: 是

Discuz!X 场景下的腾讯云 COS 文件存储驱动。继承通用 `QCloudCOSStorage`，使用 `DiscuzXQCloudCOS`（不依赖 COS SDK，改走 HTTP 请求）与 `DiscuzXQCloudSTS` 作为底层客户端，并改造签名访问 URL 为 Discuz!X `plugin.php` 入口形式。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$pluginId` | string | `null` | 插件 ID |
| protected | `$SDKClient` | `DiscuzXQCloudCOS` | `null` | COS 请求客户端 |

## 构造

```php
public function __construct(
  $secretId, $secretKey, $region, $bucket,
  $SignatureKey = "ruyi_storage",
  $RoutePrefix = "files",
  $BaseURL = F_BASE_URL,
  $PluginId = null
)
```

- `$secretId` / `$secretKey`：腾讯云密钥
- `$region`（string）：存储桶地域
- `$bucket`（string）：存储桶
- `$SignatureKey`（string）：签名密钥，默认 `ruyi_storage`
- `$RoutePrefix`（string）：路由前缀，默认 `files`
- `$BaseURL`（string）：基础 URL，默认 `F_BASE_URL`
- `$PluginId`（string，可选）：插件 ID；缺省 `App::id()`

## 方法

### `loadSDK` — 初始化客户端（protected）

```php
protected function loadSDK()
```

创建 `DiscuzXQCloudSTS`（STS 客户端）与 `DiscuzXQCloudCOS`（COS 请求客户端），返回 `$this`。

### `getFilePreviewURL` — 预览 URL

```php
public function getFilePreviewURL($fileKey, $URLParams = [], $Expires = 1800)
```

移除 `id`/`uri` 参数后，通过 `getObjectAuthUrl` 生成 COS 签名预览 URL。

### `getFileDownloadURL` — 下载 URL

```php
public function getFileDownloadURL($fileKey, $URLParams = [], $Expires = 1800)
```

同 `getFilePreviewURL`，生成下载签名 URL。

### `getFileTransferPreviewURL` / `getFileTransferDownloadURL` — 插件入口 URL

```php
public function getFileTransferPreviewURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)
public function getFileTransferDownloadURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)
```

构建 `{baseURL}/plugin.php?uri={routePrefix}/{fileKey}/{preview|download}&id={pluginId}` 形式的 Discuz!X 插件入口 URL，可选附带签名。

### `verifyAuth` — 校验签名授权

```php
public function verifyAuth($FileKey, $RawURLParams, $RawHeaders = [], $HTTPMethod = "get")
```

与 `DiscuzXLocalStorage::verifyAuth` 逻辑一致（见 [DiscuzXLocalStorage](discuzx-local-storage.md)），校验 COS 签名参数与有效期，通过 `$this->signature->verifyAuthorization` 校验。

### `fileExist` — 判断文件是否存在

```php
public function fileExist($fileKey)
```

委托 `$this->SDKClient->doesObjectExist($fileKey)`（注意：注释掉的 `verifyOperationAuthorization` 调用已注释，不校验写权限）。

### `deleteFile` — 删除文件

```php
public function deleteFile($fileKey)
```

`verifyOperationAuthorization($fileKey, "write")` 校验后，`$this->SDKClient->deleteObject($fileKey)` 删除；失败 `forwardBreak()`。若启用文件模型则 `remove(true, $fileKey)`。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Storage\QCloud\DiscuzXQCloudCOSStorage;

$storage = new DiscuzXQCloudCOSStorage(
  "SecretId", "SecretKey", "ap-guangzhou", "test-125000000",
  "ruyi_storage", "files", F_BASE_URL, "your_plugin_id"
);

$info = $storage->uploadFile($_FILES['file'], "images/a.png");
$previewUrl = $storage->getFilePreviewURL("images/a.png");
$pluginUrl = $storage->getFileTransferPreviewURL("images/a.png");
```
