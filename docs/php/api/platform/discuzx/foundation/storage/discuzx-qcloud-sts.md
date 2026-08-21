# DiscuzXQCloudSTS — Discuz!X 腾讯云 STS 安全凭证服务

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Storage/QCloud/QCloudSTS/DiscuzXQCloudSTS.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Storage\QCloud\QCloudSTS`
- **继承**: `extends AbilityBaseObject`
- **是否可继承**: 是

Discuz!X 场景下的腾讯云 STS 安全凭证服务，基于 `DiscuzXQCloudStsBase` 扩展。用于获取 COS 临时密钥，并提供资源描述与策略语句生成辅助。参考官方 SDK：https://github.com/tencentyun/qcloud-cos-sts-sdk/tree/master/php

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$UserId` | int | `null` | 腾讯云用户 ID（从 Bucket 提取） |
| private | `$SecretId` | string | `null` | 云 API 密钥 Id |
| private | `$SecretKey` | string | `null` | 云 API 密钥 Key |
| public | `$Bucket` | string | `null` | 存储桶名称（`bucket-appid`） |
| public | `$Region` | string | `null` | 存储桶地域 |
| private | `$STSInstance` | `DiscuzXQCloudStsBase` | `null` | STS 处理实例 |

## 构造

```php
function __construct($SecretId, $SecretKey, $Region, $Bucket)
```

- `$SecretId` / `$SecretKey`：云 API 密钥
- `$Region`（string）：存储桶地域
- `$Bucket`（string）：存储桶名称

创建 `DiscuzXQCloudStsBase` 实例，并从 Bucket 中 `-` 后部分提取 `$UserId`。

## 方法

### `getTempKeys` — 获取临时密钥

```php
function getTempKeys($AllowPrefix, $AllowActions, $DurationSeconds = 1800)
```

- `$AllowPrefix`（string|string[]）：资源前缀，如 `*`、`a/*`、`a/test.jpg`
- `$AllowActions`（array）：授予的 COS API 权限集合，如 `name/cos:PutObject`
- `$DurationSeconds`（int）：有效期（秒），默认 1800，最大 7200

组装配置后调用 `$STSInstance->getTempKeys()`，返回含 `credentials`、`tmpSecretId`、`tmpSecretKey`、`sessionToken`、`startTime`、`expiredTime` 的数组。

### `getTempKeysByPolicy` — 基于策略获取临时密钥

```php
function getTempKeysByPolicy($Statement, $DurationSeconds = 1800, $Version = "2.0")
```

- `$Statement`（array）：CAM 策略语句
- `$DurationSeconds`（int）：有效期（秒）
- `$Version`（string）：策略版本，默认 `2.0`

> **注意**：当前实现组装 `$Config` 后直接 `return $Config`（后续 `getTempKeys` 调用被注释），因此返回的是策略配置数组而非临时密钥结果。如需真实临时密钥请使用 `getTempKeys`。

### `generateResourceDescription` — 生成资源描述

```php
function generateResourceDescription($ResourceName, $ServiceType = "cos")
```

返回资源六段式描述：`qcs::{ServiceType}:{Region}:uid/{UserId}:{Bucket}/{ResourceName}`。

### `generatePolicyStatement` — 生成策略语句

```php
function generatePolicyStatement($Action, $Resource, $Effect = "allow", $Condition = [])
```

- `$Action`（array|string）：操作（API 或功能集）
- `$Resource`（array|string）：授权资源
- `$Effect`（string）：`allow`/`deny`
- `$Condition`（array）：条件

返回 `["action", "resource", "effect", "condition"]` 结构的策略语句数组。

### `handleResponseData` — 处理响应数据（protected）

```php
protected function handleResponseData($ResponseData)
```

通过 `json_decode(json_encode($ResponseData), true)` 将对象转为关联数组。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Storage\QCloud\QCloudSTS\DiscuzXQCloudSTS;

$sts = new DiscuzXQCloudSTS("SecretId", "SecretKey", "ap-guangzhou", "test-125000000");
$tempKeys = $sts->getTempKeys("*", ["name/cos:PutObject", "name/cos:GetObject"], 1800);
echo $tempKeys['tmpSecretId'], $tempKeys['sessionToken'];
```
