# DiscuzXLoginsModel — Discuz!X 登录令牌模型

- **文件位置**: `kernel/Platform/DiscuzX/Model/DiscuzXLoginsModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Model`
- **继承**: `extends LoginsModel`
- **是否可继承**: 是

Discuz!X 场景下的登录令牌数据模型，表名固定为 `gstudio_kernel_logins`，继承 `LoginsModel` 的登录态管理能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `gstudio_kernel_logins` | 表名 |

## 构造

```php
function __construct()
```

**逻辑**

1. `parent::__construct($this->tableName)`。
2. 生成建表 SQL（`id`/`token`/`expiration`/`userId`/`appId`/`createdAt`/`updatedAt`/`deletedAt` 字段，`id` 主键）。
3. `$this->query = new DiscuzXQuery($this->tableName)`。
4. `$this->tableName = \DB::table($this->tableName)`。
5. `$this->DB = DiscuzXDB::class`。

## 继承方法

来自 `LoginsModel`：登录令牌的创建、校验、注销等（详见 [LoginsModel](../../../model/logins-model.md)）。

## 使用

```php
use kernel\Platform\DiscuzX\Model\DiscuzXLoginsModel;

$logins = new DiscuzXLoginsModel();
```
