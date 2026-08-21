# ExtensionProvisioner — 扩展生命周期编排器

- **文件位置**: `kernel/Foundation/Extension/ExtensionProvisioner.php`
- **命名空间**: `kernel\Foundation\Extension`
- **继承自**: `Provisioner`
- **是否可继承**: 是

用于扩展的安装 / 升级 / 升级 SQL / 清理。构造时接收插件 ID、扩展 ID 与本地版本，并据此推导扩展路径与命名空间。升级采用与 `Provisioner` 一致的按目录扫描、按版本号对比执行的机制（见 `Provisioner`）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$extensionsPath` | `string` | `NULL` | private | 扩展所在的绝对路径 |
| `$extensionId` | `string` | `NULL` | private | 扩展 ID |
| `$namespace` | `string` | `NULL` | private | 扩展类完全限定命名空间前缀，如 `\PluginId\Extensions\ExtId` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($pluginId, $extensionId, $fromVersion, $extensionsPath)` | 构建扩展编排器 |
| `install()` | 安装扩展（执行安装类） |
| `runInstallSql()` | 运行安装 SQL |
| `upgrade()` | 升级扩展（执行升级文件） |
| `runUpgradeSql()` | 运行升级 SQL |
| `clean()` | 清除 Provisioner 目录下的所有文件与文件夹 |
| `cleanInstall()` | 清除 Install 文件夹 |
| `cleanUpgrade()` | 清除 Upgrade 文件夹 |

## 方法

### `__construct($pluginId, $extensionId, $fromVersion, $extensionsPath)` — 构建扩展编排器

根据插件 ID、扩展 ID 推导扩展路径与命名空间。传入了 `$extensionsPath` 时使用自定义路径，否则按 `{pluginPath}/Extensions/{extensionId}` 定位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$pluginId` | `string` | 无 | 应用 ID |
| `$extensionId` | `string` | 无 | 扩展 ID |
| `$fromVersion` | `string` | 无 | 本地版本 |
| `$extensionsPath` | `string` | `NULL` | 扩展路径（相对插件目录） |

**返回值**

- 无。

### `install()` — 安装扩展

若扩展目录下存在 `Provisioner/Install/Install.php`，则实例化命名空间 `{namespace}\Provisioner\Install\Install` 并调用其 `handle()`。

**参数**

- 无。

**返回值**

- `$this`：当前实例（支持链式调用）。

### `runInstallSql()` — 运行安装 SQL

按多编码（`multipleEncode` 配置）选择 SQL 文件路径，优先 `<Charset>/install.sql`，其次 `<Charset>.sql`，最后兜底 `install.sql`，存在则执行 `runquery()`。

**参数**

- 无。

**返回值**

- `$this`：当前实例（支持链式调用）。

### `upgrade()` — 升级扩展

扫描 `Provisioner/Upgrade/Files` 目录下的升级文件，按版本号对比执行，每个文件实例化 `{namespace}\Provisioner\Upgrade\Files\{FileName}` 并调用其 `handle()`。

**参数**

- 无。

**返回值**

- `$this`：当前实例（支持链式调用）。

### `runUpgradeSql()` — 运行升级 SQL

按多编码配置选择 SQL 目录（多编码时 `Provisioner/Upgrade/{Charset}`，否则 `Provisioner/Upgrade/SQL`），扫描并按版本对比执行其中的 `.sql` 文件。

**参数**

- 无。

**返回值**

- `$this`：当前实例（支持链式调用）。

### `clean()` — 清除 Provisioner 目录

清除扩展 `Provisioner` 目录下的全部文件与文件夹（先清理 Install 与 Upgrade，再删除 `Provisioner` 目录本身）。

**参数**

- 无。

**返回值**

- `bool`：`FileSystem::deleteDirectory()` 的返回结果。

### `cleanInstall()` — 清除 Install 目录

删除扩展的 `Provisioner/Install` 目录。

**参数**

- 无。

**返回值**

- `bool`：`FileSystem::deleteDirectory()` 的返回结果。

### `cleanUpgrade()` — 清除 Upgrade 目录

删除扩展的 `Provisioner/Upgrade` 目录。

**参数**

- 无。

**返回值**

- `bool`：`FileSystem::deleteDirectory()` 的返回结果。
