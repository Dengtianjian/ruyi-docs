# DiscuzXWechatUsersModel — Discuz!X 微信用户模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXWechatUsersModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends WechatUsersModel`
- **是否可继承**: 是

Discuz!X 场景下的微信用户数据模型，表名固定为 `gstudio_kernel_wechat_users`，存储微信用户与 Discuz!X 会员的绑定关系。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `gstudio_kernel_wechat_users` | 表名 |

## 构造

```php
function __construct($tableName = null)
```

**逻辑**

1. `parent::__construct($this->tableName)`。
2. 生成建表 SQL（`id`/`memberId`/`openId`/`unionId`/`phone`/`createdAt`/`updatedAt`/`deletedAt` 字段，含 memberId/unionId/openId/phone 索引）。
3. `$this->query = new DiscuzXQuery($this->tableName)`。
4. `$this->tableName = \DB::table($this->tableName)`。
5. `$this->DB = DiscuzXDB::class`。

## 方法

### `add` — 添加微信用户

```php
public function add($memberId, $openId, $unionId = null, $phone = null)
```

- `$memberId`（int）：Discuz!X 会员 ID
- `$openId`（string）：微信 OpenID
- `$unionId`（string，可选）：UnionID
- `$phone`（string，可选）：手机号

插入一条微信用户绑定记录。

### `itemByOpenId` — 按 OpenID 查询

```php
public function itemByOpenId($openId)
```

- `$openId`（string）：微信 OpenID

按 `openId` 查询单条微信用户记录。

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXWechatUsersModel;

$wechatUsers = new DiscuzXWechatUsersModel();
$wechatUsers->add($memberId, $openId, $unionId, $phone);

$user = $wechatUsers->itemByOpenId($openId);
```
