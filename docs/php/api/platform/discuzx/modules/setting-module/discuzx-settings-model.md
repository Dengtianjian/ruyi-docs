# DiscuzXSettingsModel — Discuz!X 设置项模型

- **文件位置**: `kernel/Platform/DiscuzX/Modules/SettingModule/DiscuzXSettingsModel.php`
- **命名空间**: `kernel\Platform\DiscuzX\Modules\SettingModule`
- **继承**: `extends SettingsModel`
- **是否可继承**: 是

Discuz!X 场景下的设置项数据模型，使用应用 ID 命名数据表（`{App::id()}_settings`），适配 `DiscuzXQuery` / `DiscuzXDB`，并提供建表能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$tableName` | string | `""` | 表名，构造时设为 `{App::id()}_settings` |

## 构造

```php
public function __construct($tableName = NULL)
```

- `$tableName`（string，可选）：表名；`null` 时使用 `App::id() . "_settings"`

**逻辑**

1. 设置 `$this->tableName`。
2. `$this->query = new DiscuzXQuery($this->tableName)`。
3. `$this->tableName = \DB::table($this->tableName)` 应用 DiscuzX 表前缀。
4. `$this->DB = DiscuzXDB::class`。
5. 生成建表 SQL：`pre_{$tableName}` 表，字段 `name`（主键）、`value`、`updatedAt`，InnoDB / utf8。

## 方法

### `createTable` — 建表

```php
function createTable()
```

`$tableStructureSQL` 为空返回 `true`；否则 `include_once libfile("function/plugin")` 后调用 `runquery($this->tableStructureSQL)` 建表。

## 继承方法

来自 `SettingsModel`：`items()`、`item()`、`get()`、`set()`、`remove()` 等（设置项读写，详见 [SettingsModel](../../../../modules/setting-module/settings-model.md)）。

## 使用

```php
use kernel\Platform\DiscuzX\Modules\SettingModule\DiscuzXSettingsModel;

$settings = new DiscuzXSettingsModel();
$settings->createTable();
$value = $settings->item("site_name");
```
