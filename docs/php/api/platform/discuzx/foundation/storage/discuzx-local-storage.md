# DiscuzXLocalStorage — Discuz!X 本地文件存储驱动

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Storage/DiscuzXLocalStorage.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Storage`
- **继承**: `extends LocalStorage` → `extends AbstractStorage` → `extends AbilityBaseObject`
- **是否可继承**: 是

适配 Discuz!X 场景的本地文件存储驱动。在 `LocalStorage` 基础上，将签名访问 URL 改造为 Discuz!X `plugin.php` 插件入口形式（携带 `uri` 与 `id` 参数），并提供 Discuz!X 场景下的签名校验。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$pluginId` | string | `null` | 插件 ID（Discuz!X 插件标识） |

其余继承自 `LocalStorage` / `AbstractStorage`（`$signature`、`$signatureKey`、`$routePrefix`、`$baseURL`、`$platform` 等）。

## 构造

```php
public function __construct($SignatureKey, $RoutePrefix = "files", $BaseURL = F_BASE_URL, $Platform = "local", $PluginId = null)
```

- `$SignatureKey`（string）：签名密钥
- `$RoutePrefix`（string）：路由前缀，默认 `files`
- `$BaseURL`（string）：基础 URL，默认 `F_BASE_URL`
- `$Platform`（string）：平台标识，默认 `local`
- `$PluginId`（string，可选）：插件 ID；缺省使用 `App::id()`

## 方法

### `getFileTransferPreviewURL` — 预览 URL（插件入口）

```php
public function getFileTransferPreviewURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)
```

- `$fileKey`（string）：文件键
- `$URLParams`（array）：URL 参数
- `$Expires`（int）：签名有效期（秒），默认 1800
- `$WithSignature`（bool）：是否附带签名，默认 `true`

构建 `{baseURL}/plugin.php?uri={routePrefix}/{fileKey}/preview&id={pluginId}` 形式的预览 URL；`$WithSignature` 时合并 `getFileTransferAuth` 签名参数。

### `getFileTransferDownloadURL` — 下载 URL（插件入口）

```php
public function getFileTransferDownloadURL($fileKey, $URLParams = [], $Expires = 1800, $WithSignature = TRUE)
```

同 `getFileTransferPreviewURL`，但路径后缀为 `/download`。

### `verifyAuth` — 校验签名授权

```php
public function verifyAuth($FileKey, $RawURLParams, $RawHeaders = [], $HTTPMethod = "get")
```

- `$FileKey`（string）：文件键
- `$RawURLParams`（array）：原始 URL 参数
- `$RawHeaders`（array）：原始请求头
- `$HTTPMethod`（string）：请求方法，默认 `get`

**逻辑**

1. 校验必需签名参数（`sign-algorithm`、`sign-time`、`key-time`、`header-list`、`signature`、`url-param-list`），缺失则 `break(400)`。
2. 校验签名算法与 `StorageSignature::getSignAlgorithm()` 一致。
3. 校验 `sign-time`/`key-time` 格式、一致性、有效期（各错误码 `400001`~`400008`）。
4. 校验请求头均在 `header-list` 中（`400009`）。
5. 校验 URL 参数均在 `url-param-list` 中（Discuz!X 的 `id`/`uri` 参数豁免，`400010`）。
6. 调用 `$this->signature->verifyAuthorization(...)` 验证签名，通过返回 `true`，否则 `break(403, "抱歉，您没有操作该文件的权限")`。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Storage\DiscuzXLocalStorage;

$storage = new DiscuzXLocalStorage("my-sign-key", "files", F_BASE_URL, "local", "your_plugin_id");

// 生成插件入口预览/下载 URL
$previewUrl = $storage->getFileTransferPreviewURL("images/a.png");
$downloadUrl = $storage->getFileTransferDownloadURL("images/a.png");

// 校验签名
$ok = $storage->verifyAuth("images/a.png", $rawUrlParams, $headers, "get");
```
