# DiscuzXProvisioner — Discuz!X 应用装配器

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXProvisioner.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: `extends Provisioner`
- **是否可继承**: 是

Discuz!X 插件的安装/升级/卸载装配器，扩展内核 `Provisioner`，增加了 Discuz!X 插件数据目录的创建与清理。

> 该文件顶部有守卫：`if (!defined("IN_DISCUZ") || !defined('IN_ADMINCP')) { exit('Access Denied'); }`，只能在 Discuz!X 后台执行。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| protected | `$pluginPath` | string | `null` | 插件路径 |
| protected | `$Charset` | string | `null` | 字符集（大写，如 `UTF-8`） |

继承自 `Provisioner` 的属性见 [Provisioner](../../foundation/provisioner.md)。

## 构造

```php
public function __construct($pluginId, $fromVersion = null)
```

- `$pluginId`（string）：插件 ID
- `$fromVersion`（string，可选）：从某版本升级

**逻辑**

1. `parent::__construct($pluginId, $fromVersion)`。
2. 从 `getglobal("setting/plugins/version/$pluginId")` 读取最新版本号。
3. 设置 `$this->Charset = strtoupper(CHARSET)`。
4. `new DiscuzXApp($pluginId)` 装配应用。

## 方法

### `install` — 安装

```php
public function install()
```

调用父类 `install()` 后，创建 `F_DISCUZX_DATA_PLUGIN` 插件数据目录（`mkdir(..., 0777, true)`）。返回 `$this`。

### `uninstall` — 卸载

```php
public function uninstall()
```

调用父类 `uninstall()` 后，删除 `F_DISCUZX_DATA_PLUGIN` 插件数据目录。

### `clean` — 清理

```php
public function clean()
```

依次调用 `cleanInstall()`、`cleanUpgrade()`，删除 `{Path::root()}/Provisioner` 目录。

### `cleanInstall` — 清理安装脚本

```php
public function cleanInstall()
```

删除 `{Path::root()}/Provisioner/Install` 目录。

### `cleanUpgrade` — 清理升级脚本

```php
public function cleanUpgrade()
```

删除 `{Path::root()}/Provisioner/Upgrade` 目录。

## 使用

由插件安装/升级/卸载入口脚本调用：

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXProvisioner;

$provisioner = new DiscuzXProvisioner("your_plugin_id");
$provisioner->install(); // 或 upgrade() / uninstall()
```
