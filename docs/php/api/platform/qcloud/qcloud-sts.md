# QCloudSTS — 腾讯云 STS 安全凭证服务

- **文件位置**: `kernel/Platform/QCloud/QCloudSTS.php`
- **命名空间**: `kernel\Platform\QCloud`
- **继承**: `extends AbilityBaseObject`
- **是否可继承**: 是

基于腾讯云官方 STS SDK（`QCloud\COSSTS\Sts`）扩展的安全凭证服务，用于获取临时密钥，并提供生成资源描述与策略语句的辅助方法。参考文档：https://github.com/tencentyun/qcloud-cos-sts-sdk

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$UserId` | int | `null` | 腾讯云用户 ID（自动从 Bucket 提取） |
| private | `$SecretId` | string | `null` | 云 API 密钥 Id |
| private | `$SecretKey` | string | `null` | 云 API 密钥 Key |
| public | `$Bucket` | string | `null` | 存储桶名称（`bucket-appid`） |
| public | `$Region` | string | `null` | 存储桶地域，如 `ap-guangzhou` |
| private | `$STSInstance` | `Sts` | `null` | STS 客户端实例 |

## 构造

```php
__construct($SecretId, $SecretKey, $Region, $Bucket)
```

- `$SecretId`（string）：云 API 密钥 Id
- `$SecretKey`（string）：云 API 密钥 Key
- `$Region`（string）：存储桶地域
- `$Bucket`（string）：存储桶名称

构造时创建 `Sts` 实例，并从 Bucket 提取 `UserId`（`-` 之后的部分）。

## 方法

### `getTempKeys` — 获取临时密钥

```php
getTempKeys($AllowPrefix, $AllowActions, $DurationSeconds = 1800)
```

- `$AllowPrefix`（string|string[]）：资源前缀，如 `*` 表示所有资源，`a/*` 表示 a 路径下所有资源，`a/test.jpg` 表示特定文件
- `$AllowActions`（array）：授予 COS API 权限集合，如 `name/cos:PutObject`
- `$DurationSeconds`（int）：有效期（秒），默认 1800，最大 7200

返回数组：

| 字段 | 类型 | 说明 |
|------|------|------|
| `credentials` | string | 临时密钥信息 |
| `tmpSecretId` | string | 临时密钥 Id |
| `tmpSecretKey` | string | 临时密钥 Key |
| `sessionToken` | string | 请求 COS 时放在 `x-cos-security-token` Header 的 token |
| `startTime` | string | 密钥起始时间（UNIX 时间戳） |
| `expiredTime` | string | 密钥失效时间（UNIX 时间戳） |

### `getTempKeysByPolicy` — 基于策略获取临时密钥

```php
getTempKeysByPolicy($Statement, $DurationSeconds = 1800, $Version = "2.0")
```

- `$Statement`（array）：CAM 策略语句，如 `[{"effect":"allow","action":"sts:AssumeRole","resource":"*"}]`
- `$DurationSeconds`（int）：有效期（秒），默认 1800，最大 7200
- `$Version`（string）：策略版本，默认 `2.0`

返回与 `getTempKeys` 相同的临时密钥数组。

**注意**：当前实现中该方法返回构造好的 `$Config` 数组而非直接返回临时密钥结果（源码中后续调用被注释）。如需临时密钥建议使用 `getTempKeys`。

### `generateResourceDescription` — 生成资源描述

```php
generateResourceDescription($ResourceName, $ServiceType = "cos")
```

- `$ResourceName`（string）：具体资源名称或路径，如 `*`、`a/*`
- `$ServiceType`（string）：产品简称，默认 `cos`，空值表示所有产品

返回资源六段式描述：`qcs::{ServiceType}:{Region}:uid/{UserId}:{Bucket}/{ResourceName}`。

### `generatePolicyStatement` — 生成策略语句

```php
generatePolicyStatement($Action, $Resource, $Effect = "allow", $Condition = [])
```

- `$Action`（array|string）：操作（API 或功能集），`*` 为所有操作
- `$Resource`（array|string）：授权资源，建议用 `generateResourceDescription` 生成
- `$Effect`（string）：`allow` 或 `deny`
- `$Condition`（array）：策略生效条件

返回策略语句数组。

## 使用

```php
use kernel\Platform\QCloud\QCloudSTS;

$sts = new QCloudSTS("SecretId", "SecretKey", "ap-guangzhou", "test-125000000");

$tempKeys = $sts->getTempKeys(
  "*",
  ["name/cos:PutObject", "name/cos:GetObject"],
  1800
);

echo $tempKeys['tmpSecretId'];
echo $tempKeys['sessionToken'];
```
