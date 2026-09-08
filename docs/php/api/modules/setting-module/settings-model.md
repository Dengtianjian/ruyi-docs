# SettingsModel — 设置模型

- **文件位置**: `kernel/Modules/Setting/SettingsModel.php`
- **命名空间**: `kernel\Modules\Setting`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `settings`

纯粹的持久化模型：以键值对形式存储系统设置项，值经 serialize() 序列化后存入 `value` 字段；表结构以 `Schema` 声明（见 `$schema`），主键为 `name`。

设置项的增删改查业务逻辑（含读取反序列化、序列化写入、`updatedAt` 维护）已抽取到 `Setting` 模块类，本模型只负责数据存取，**不再承载业务方法**。

## 构造

```php
new SettingsModel();   // 无参；表名固定为 settings
```

## 说明

- 仅提供通用查询能力：`where()` / `first()` / `get()` / `exists()` / `insert()` / `update()`（来自 Model 基类）。
- 业务方法 `item()` / `items()` / `exist()` / `add()` / `save()` / `saveItems()` 见 [SettingModule](./setting-module)。
