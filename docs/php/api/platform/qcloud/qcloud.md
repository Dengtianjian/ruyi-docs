# QCloud — 腾讯云 OpenAPI 请求基类

- **文件位置**: `kernel/Platform/QCloud/QCloud.php`
- **命名空间**: `kernel\Platform\QCloud`
- **继承**: `extends AbilityBaseObject`
- **是否可继承**: 是（腾讯云各服务子类的基类）

腾讯云 OpenAPI 请求基类，支持使用永久密钥或 STS 临时密钥，按 TC3-HMAC-SHA256 签名算法自动生成授权信息并通过 CURL 发送 GET / POST 请求。适用于以 `Action + Version` 形式调用的腾讯云服务。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$SecretId` | string | `null` | 永久 SecretId |
| protected | `$TmpSecretId` | string | `null` | 临时 SecretId（存在则优先使用） |
| protected | `$SecretKey` | string | `null` | 永久 SecretKey |
| protected | `$TmpSecretKey` | string | `null` | 临时 SecretKey（存在则优先使用） |
| protected | `$SecurityToken` | string | `null` | 安全令牌（使用临时密钥时必填） |
| protected | `$Host` | string | `tencentcloudapi.com` | 请求主机 |
| protected | `$ALgorithm` | string | `TC3-HMAC-SHA256` | 签名算法 |
| private | `$Service` | string | `null` | 操作的服务名称 |
| protected | `$Curl` | `Curl` | `null` | CURL 实例 |

## 构造

```php
__construct($SecretId, $SecretKey, $Service = null, $Host = null, $SecurityToken = null, $TmpSecretId = null, $TmpSecretKey = null)
```

- `$SecretId`（string）：永久 SecretId
- `$SecretKey`（string）：永久 SecretKey
- `$Service`（string，可选）：服务名称，如 `cos`、`faceid`；传入后 host 自动变为 `{Service}.tencentcloudapi.com`
- `$Host`（string，可选）：自定义请求主机
- `$SecurityToken`（string，可选）：安全令牌
- `$TmpSecretId` / `$TmpSecretKey`（string，可选）：临时密钥

## 方法

### `tmpSecretId` — 设置临时 SecretId

```php
tmpSecretId($tmpSecretId = null)
```

传入 `null` 则使用永久 SecretId。返回 `$this`。

### `tmpSecretKey` — 设置临时 SecretKey

```php
tmpSecretKey($tmpSecretKey = null)
```

传入 `null` 则使用永久 SecretKey。返回 `$this`。

### `securityToken` — 设置安全令牌

```php
securityToken($securityToken = null)
```

传入 `null` 则不使用安全令牌。返回 `$this`。

### `tmpCredentials` — 设置临时凭证

```php
tmpCredentials($tmpSecretId, $tmpSecretKey, $securityToken)
```

同时设置临时 SecretId、SecretKey 与安全令牌。返回 `$this`。

### `cancelTmpCredentials` — 取消临时凭证

```php
cancelTmpCredentials()
```

清除临时密钥与安全令牌，恢复使用永久凭证。返回 `$this`。

### `getSecretId` / `getSecretKey` — 获取实际密钥（protected）

```php
getSecretId()
getSecretKey()
```

若存在临时密钥则返回临时密钥，否则返回永久密钥。

### `generateAuthorizaion` — 生成授权信息（protected）

```php
generateAuthorizaion($timestamp, $action, $body = [], $query = [], $canonicalURI = "/", $httpRequestMethod = "POST")
```

按腾讯云 TC3-HMAC-SHA256 签名规范生成 `Authorization` 请求头。签名过程：构造 canonical request → 计算签名串 → 用临时/永久密钥派生签名密钥 → HMAC-SHA256 生成签名。

### `get` — 发送 GET 请求

```php
get($action, $version, $query = [])
```

- `$action`（string）：操作名称（Action）
- `$version`（string）：服务版本（Version）
- `$query`（array）：查询参数

返回 `Result`：
- 网络错误 → `$Result->error(false, 500, errorNo, "服务器错误", error)`
- 接口返回 `Error` → `$Result->error(500, Code, "服务器错误", data)`
- `Result < 0` → `$Result->error(400, "400-{Result}", Description, data)`
- 成功 → `$Result->success(Response 数据)`

### `post` — 发送 POST 请求

```php
post($action, $version, $body = [], $query = [])
```

- `$action`（string）：操作名称
- `$version`（string）：服务版本
- `$body`（array）：JSON 请求体
- `$query`（array）：查询参数

返回 `Result`，错误处理逻辑与 `get()` 一致。

## 使用

```php
use kernel\Platform\QCloud\QCloud;

$qcloud = new QCloud("SecretId", "SecretKey", "faceid");
$result = $qcloud->post("DetectFace", "2018-03-01", ["ImageBase64" => "..."]);
if ($result->isSuccess()) {
  $data = $result->getData();
}
```
