# DiscuzXQCloudStsBase — 腾讯云 STS 处理基类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Storage/QCloud/QCloudSTS/DiscuzXQCloudStsBase.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Storage\QCloud\QCloudSTS`
- **继承**: 无（普通类）
- **是否可继承**: 是

腾讯云 STS 临时密钥请求的核心处理类，适配 Discuz!X 环境（使用 `DiscuzXQCloud` 基类能力发送请求），封装 STS 请求参数组装与响应解析。参考官方 SDK：https://github.com/tencentyun/qcloud-cos-sts-sdk/tree/master/php

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$SecretId` | string | `null` | 云 API 密钥 Id |
| protected | `$SecretKey` | string | `null` | 云 API 密钥 Key |
| protected | `$Config` | array | 见下 | 请求配置 |
| private | `$STSClient` | `DiscuzXQCloud` | `null` | 请求客户端实例 |

`$Config` 默认包含：

| 键 | 默认值 | 说明 |
|----|--------|------|
| `url` | `https://sts.tencentcloudapi.com/` | STS 接口地址 |
| `domain` | `sts.tencentcloudapi.com` | 请求域名 |
| `proxy` | 空 | 代理 |
| `scheme` | `https` | 协议 |
| `path` | `/` | 路径 |
| `method` | `POST` | 请求方法 |
| `secretId` / `secretKey` | `null` | 密钥 |
| `region` | `ap-guangzhou` | 地域 |
| `host` | `sts.tencentcloudapi.com` | Host 头 |

## 构造

```php
function __construct($secretId, $secretKey, $policy, $durationSeconds, $region)
```

- `$secretId` / `$secretKey`：云 API 密钥
- `$policy`（array）：STS 权限策略
- `$durationSeconds`（int）：有效期（秒）
- `$region`（string）：地域

创建 `DiscuzXQCloud` 实例，更新 `$Config` 中的密钥、地域与有效期。

## 方法

### `getTempKeys` — 获取临时密钥

```php
function getTempKeys()
```

**逻辑**

1. 生成 `Timestamp`、`RequestClient`、`Nonce`。
2. 发送 `POST` 请求 `sts.tencentcloudapi.com`，Action 为 `GetFederationToken`，Version `2018-08-13`，Body 含 `Name`、`Policy`（JSON）、`DurationSeconds`。
3. 解析响应 `Credentials`：提取 `TmpSecretId`、`TmpSecretKey`、`Token`、`ExpiredTime`、`StartTime`。
4. 返回数组：

| 字段 | 说明 |
|------|------|
| `credentials` | 临时凭证原始信息 |
| `tmpSecretId` | 临时密钥 Id |
| `tmpSecretKey` | 临时密钥 Key |
| `sessionToken` | 安全令牌 |
| `startTime` | 起始时间（毫秒时间戳） |
| `expiredTime` | 过期时间（毫秒时间戳） |

## 使用

通常通过 `DiscuzXQCloudSTS::getTempKeys()` 间接调用。
