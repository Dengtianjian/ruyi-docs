# DiscuzXSettingModuleBase — Discuz!X 设置模块基类

- **文件位置**: `kernel/Platform/DiscuzX/Modules/SettingModule/DiscuzXSettingModuleBase.php`
- **命名空间**: `kernel\Platform\DiscuzX\Modules\SettingModule`
- **继承**: `extends SettingModule`
- **是否可继承**: 是

Discuz!X 通用设置存储模块基类。在通用 `SettingModule` 基础上，扩展了按用户组/管理组进行设置项访问控制的能力，并提供设置项的增查改能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$SettingModelInstance` | `DiscuzXSettingsModel` | `null` | 设置项模型实例 |
| protected | `$publicNames` | array | `[]` | 所有用户可获取的键名 |
| protected | `$groupNames` | array | `[]` | 按用户组划分的可获取键名，`[组ID=>[键名...]]` |
| protected | `$adminNames` | array | `[]` | 按管理组划分的可获取键名，`[管理组ID=>[键名...]]` |

## 构造

```php
public function __construct(DiscuzXSettingsModel $SettingsModel, $publicNames = [], $groupNames = [], $adminNames = [])
```

- `$SettingsModel`（`DiscuzXSettingsModel`）：设置项模型实例
- `$publicNames`（array）：所有用户可获取的键名
- `$groupNames`（array）：用户组键名映射，如 `[1=>['appId','appName'], 3=>['appName']]`
- `$adminNames`（array）：管理组键名映射，如 `[1=>['appId'], 2=>['appName']]`

## 方法

### `filterName` — 按权限过滤键名

```php
public function filterName(...$names)
```

基于全局 `$_G['groupid']` / `$_G['adminid']`：

- 当前用户组在 `$groupNames` 中 → 该组可访问键名并入白名单。
- 当前管理组在 `$adminNames` 中 → 该组可访问键名并入白名单。
- 返回 `array_intersect($names, $publicNames)` 去重后的可访问键名交集。

### `items` — 获取多个设置项

```php
public function items(...$names)
```

委托 `$SettingModelInstance->items(...$names)`，返回 `键名=>值` 关联数组。

### `item` — 获取单个设置项

```php
public function item($name)
```

委托 `$SettingModelInstance->item($name)` 返回单值。

### `exist` — 判断设置项是否存在

```php
public function exist($name)
```

`$SettingModelInstance->where("name", $name)->exist()` 返回布尔值。

### `add` — 添加设置项

```php
public function add($name, $value = null, $serialization = true)
```

- `$name`（string）：设置项名称
- `$value`：值
- `$serialization`（bool）：是否序列化存储，默认 `true`

插入一条记录，返回插入结果。

### `save` — 保存单个设置项

```php
public function save($name, $value, $serialization = true)
```

按 `name` 更新 `value` 与 `updatedAt`，返回更新结果。

### `saveItems` — 保存多个设置项

```php
public function saveItems($settings)
```

- `$settings`（array）：`键名=>值` 关联数组

遍历批量 `update`，写入序列化后的值，返回 `true`。

## 使用

```php
use kernel\Platform\DiscuzX\Modules\SettingModule\DiscuzXSettingModuleBase;
use kernel\Platform\DiscuzX\Modules\SettingModule\DiscuzXSettingsModel;

$setting = new DiscuzXSettingModuleBase(
  new DiscuzXSettingsModel(),
  ["appName", "version"],           // 公开键
  [1 => ["siteName"]],              // 用户组1可额外访问
  [1 => ["appSecret"]]              // 管理组1可额外访问
);

$value = $setting->item("appName");
$setting->save("siteName", "我的站点");
```
