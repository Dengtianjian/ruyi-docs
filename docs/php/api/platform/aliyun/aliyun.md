# Aliyun — 阿里云平台基类

- **文件位置**: `kernel/Platform/Aliyun/Aliyun.php`
- **命名空间**: `kernel\Platform\Aliyun`
- **继承**: 无（普通类）
- **是否可继承**: 是（阿里云各服务子类的基类）

阿里云平台基类，持有云 API 密钥（AccessKeyId / AccessKeySecret），供子类（如 `AliyunRequest`、`AliyunSignature`）共享密钥信息。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$AppId` | string | `""` | 阿里云 AccessKeyId |
| protected | `$AppSecret` | string | `""` | 阿里云 AccessKeySecret |

## 构造

```php
__construct($appId, $appSecret)
```

- `$appId`（string）：阿里云 AccessKeyId
- `$appSecret`（string）：阿里云 AccessKeySecret

构造时保存密钥到 `$this->AppId` 与 `$this->AppSecret`。

## 使用

```php
use kernel\Platform\Aliyun\Aliyun;

$aliyun = new Aliyun("your-access-key-id", "your-access-key-secret");
```

## 扩展

子类可通过 `$this->AppId` / `$this->AppSecret` 访问密钥，用于签名或发起 API 请求。
