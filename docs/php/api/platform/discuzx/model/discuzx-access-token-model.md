# DiscuzXAccessTokenModel — Discuz!X AccessToken 模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXAccessTokenModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends AccessTokenModel`
- **是否可继承**: 是

Discuz!X 场景下的第三方平台 AccessToken 数据模型，表名固定为 `gstudio_kernel_access_token`，存储微信公众号/钉钉等平台的访问令牌，供 DiscuzX 环境复用。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `gstudio_kernel_access_token` | 表名 |

## 构造

```php
function __construct()
```

**逻辑**

1. `parent::__construct($this->tableName)`。
2. 生成建表 SQL（`accessToken`/`id`/`platform`/`createdAt`/`expiredAt`/`expires`/`appId` 字段）。
3. `$this->query = new DiscuzXQuery($this->tableName)`。
4. `$this->tableName = \DB::table($this->tableName)`。
5. `$this->DB = DiscuzXDB::class`。

## 继承方法

来自 `AccessTokenModel`：`saveToken()`、`getToken()`、`checkExpired()` 等（AccessToken 的保存、读取、过期校验）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXAccessTokenModel;

$token = new DiscuzXAccessTokenModel();
$token->saveToken("wechatOfficialAccount", $accessToken, $expires, $appId);
```
