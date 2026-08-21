# DiscuzXQCloudSTSScope — 腾讯云 COS 授权 Scope

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/Storage/QCloud/QCloudSTS/DiscuzXQCloudSTSScope.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation\Storage\QCloud\QCloudSTS`
- **继承**: 无（普通类）
- **是否可继承**: 否

腾讯云 COS 授权范围（Scope）描述类。构造一个 Scope 对象代表对某存储桶下指定资源、指定操作的授权范围，供 STS 策略生成使用。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$action` | string | `name/cos:PutObject` | 允许的 COS API 操作 |
| public | `$bucket` | string | 空 | 存储桶名称 |
| public | `$region` | string | 空 | 地域 |
| public | `$prefix` | string | 空 | 资源前缀 |
| public | `$effect` | string | `allow` | 生效效果 |

## 构造

```php
function __construct($action, $bucket, $region, $prefix, $effect = "allow")
```

- `$action`（string）：操作，如 `name/cos:PutObject`
- `$bucket`（string）：存储桶
- `$region`（string）：地域
- `$prefix`（string）：资源前缀
- `$effect`（string）：生效效果，默认 `allow`

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\Storage\QCloud\QCloudSTS\DiscuzXQCloudSTSScope;

$scope = new DiscuzXQCloudSTSScope(
  "name/cos:PutObject",
  "test-125000000",
  "ap-guangzhou",
  "user/"
);
```
