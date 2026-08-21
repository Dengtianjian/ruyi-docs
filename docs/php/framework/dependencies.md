# 依赖管理 — 按需安装

内核（kernel）本身**零第三方依赖**：`kernel/composer.json` 只声明 PSR-4 自动加载，`vendor/` 仅为 `composer dump-autoload` 生成的轻量映射（约 44K），不含任何第三方包。

云平台 SDK（腾讯云 COS/STS、阿里云 OSS/STS 等）为**可选依赖**，由业务应用按需安装到**应用自身的 `vendor/`**，不会拖大内核目录。

## 可选依赖一览

| 包名 | 版本建议 | 用途 | 使用位置 |
|------|---------|------|----------|
| `qcloud/cos-sdk-v5` | `2.*` | 腾讯云 COS 对象存储客户端 | `kernel/Platform/QCloud/QCloudCos/QCloudCOSStorage.php` |
| `qcloud_sts/qcloud-sts-sdk` | `^3.0` | 腾讯云 STS 临时密钥签发 | `kernel/Platform/QCloud/QCloudSTS.php` |
| `aliyuncs/oss-sdk-php` | `^2.7` | 阿里云 OSS 对象存储客户端 | `kernel/Platform/Aliyun/AliyunOSS/AliyunOSSStorage.php` |
| `alibabacloud/sts-20150401` | `^1.1` | 阿里云 STS 临时密钥签发 | `kernel/Platform/Aliyun/AliyunOSS/AliyunOSSStorage.php` |

## 应用侧前置条件

内核按约定自动发现命令类，应用需在 `composer.json` 配置与**目录名一致的 PSR-4 加载规则**，命令类才能被自动加载（`{AppId}\` 为应用命名空间前缀，与目录名相同）：

```json
{
  "autoload": {
    "psr-4": {
      "app\\": ""
    }
  }
}
```

## 按需安装

在**应用目录**（如 `app/`）安装对应 SDK，`composer` 自动带入其传递依赖：

```bash
# 仅使用腾讯云 COS（含 STS）
composer require qcloud/cos-sdk-v5:2.* qcloud_sts/qcloud-sts-sdk:^3.0

# 仅使用阿里云 OSS（含 STS）
composer require aliyuncs/oss-sdk-php:^2.7 alibabacloud/sts-20150401:^1.1

# 两者都用则同时安装上面两组
```

## 未安装依赖时的行为

云存储类是**按需加载**的：`StorageService::bootstrap()` 传入的平台类在 `loadSDK()` 阶段才 `new` 对应 SDK。因此：

- 未安装对应 SDK 且不调用该云存储功能 → 完全无影响，正常使用
- 未安装 SDK 却调用该云存储 → 抛 `Class not found` 异常，提示先安装对应包
- 建议在入口处用 `class_exists()` 做能力探测，未安装时优雅降级为本地存储

```php
if (class_exists(\Qcloud\Cos\Client::class)) {
  // COS 可用
} else {
  // 回退本地存储
}
```

## 历史遗留说明

`alibabacloud/sdk`、`alibabacloud/sts` 两个包原在 `require` 中但代码无直接引用，已随清理移除，勿再安装。
