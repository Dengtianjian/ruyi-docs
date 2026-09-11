# Provisioner — 生命周期编排器

- **文件位置**: `kernel/Foundation/Provisioner.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

应用生命周期编排器：**安装 / 增量升级 / 回滚 / 卸载**。

升级机制：
- 扫描 `upgradesDir` 目录下 `Upgrade_x_y_z.php` 文件，从文件名提取版本号按序执行。
- 每个升级文件定义一个同名类，类有 `upgrade()` 方法则调用，否则构造器即升级逻辑。
- 类可选定义 `rollback()` 方法以支持回滚。

版本管理：
- `.version` 文件存储完整版本号（如 `2.2.0.20260721.1746`）。
- 对比时自动提取前三段基础版本号（`2.2.0`）与升级脚本版本号做比较。

安装辅助：
- `install()` / `lockInstall()` / `installLocked()`：创建数据/存储目录、写入并检测安装锁文件（`install.lock`）。
- `verifiyInstallKey()` / `refreshInstallKey()`：校验与重新生成安装密钥（`install.key`）。
- `resetVersion()` / `uninstall()`：强制改写版本号、删除 `.version` 版本记录。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$latestVersion` | `string\|null` | `null` | protected | 完整版本号（`.version` 文件原文，如 `2.2.0.20260721.1746`） |
| `$currentSemver` | `string` | `'0.0.0'` | protected | 从完整版本号提取的三段基础版本号（如 `2.2.0`），用于版本比较 |
| `$upgradesDir` | `string\|null` | `null` | protected | 升级脚本目录；`null` 时默认为 `{Path::root()}/Upgrades` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(?string $upgradesDir = null)` | 构造，读取 `.version` 初始化版本状态 |
| `install()` | 首次安装：创建应用数据和存储目录 |
| `upgrade($targetVersion = null)` | 执行增量升级 |
| `rollback($targetVersion)` | 执行增量回滚 |
| `uninstall()` | 卸载：删除 `.version` 文件 |
| `getStatus()` | 获取应用当前状态 |
| `getPendingUpgrades(?string $targetVersion = null)` | 获取待升级的版本列表 |
| `resetVersion(string $version)` | 强制重置当前版本号 |
| `installLocked()` | 判断安装是否已锁定（`install.lock` 存在） |
| `lockInstall()` | 写入安装锁文件，标记安装完成 |
| `verifiyInstallKey($key)` | 校验安装密钥 |
| `refreshInstallKey()` | 重新生成并写入安装密钥 |
| `updateVersion()` | 将配置版本号写入 `.version` 文件 |
| `version()` | 读取当前持久化的完整版本号 |

## 方法

### `__construct(?string $upgradesDir = null)` — 构造

读取 `{Path::data()}/.version` 文件初始化 `$latestVersion` 与 `$currentSemver`；文件不存在则保持初始值。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$upgradesDir` | `string\|null` | `null` | 升级脚本目录；`null` 时默认为 `{Path::root()}/Upgrades` |

**返回值**

- 无。

### `install()` — 首次安装

创建应用数据和存储目录（`Path::data()` / `Path::storage()`），目录已存在则跳过。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

### `upgrade($targetVersion = null)` — 执行增量升级

扫描 `upgradesDir` 目录下的 `Upgrade_x_y_z.php` 文件，从文件名提取版本号（如 `Upgrade_1_2_3.php` → `1.2.3`），过滤出 **> currentSemver 且 ≤ targetVersion** 的脚本，按版本升序逐个执行。

每个升级脚本是一个类：include 文件后从文件路径推导完全限定类名并实例化；若类有 `upgrade()` 方法则调用之，否则构造器本身即升级逻辑。每次升级后自动持久化 `.version`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetVersion` | `string\|null` | `null` | 目标版本号；`null` 表示升级到最新 |

**返回值**

- `$this|true`：有升级执行时返回 `$this`；无升级文件或无需升级时返回 `true`。

**异常**

- `\RuntimeException`：升级脚本执行失败时抛出。

**示例**

```php
$p = new Provisioner();
$p->upgrade("2.0.0");       // 升级到 2.0.0（每次升级后自动持久化 .version）
```

### `rollback($targetVersion)` — 执行增量回滚

从当前版本降级到 `$targetVersion`，按版本**降序**执行回滚脚本。过滤出 **≤ currentSemver 且 > targetVersion** 的脚本，逐个执行 `rollback()`。仅定义了 `rollback()` 方法的升级类参与回滚，无该方法则跳过。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetVersion` | `string` | 无 | 回滚目标版本号 |

**返回值**

- `$this|true`：有回滚执行时返回 `$this`；无升级目录或无需回滚时返回 `true`。

**异常**

- `\RuntimeException`：回滚脚本执行失败时抛出。

### `uninstall()` — 卸载

删除 `{Path::data()}/.version` 文件；文件不存在则不做任何操作。

**参数**

- 无。

**返回值**

- 无。

### `getStatus()` — 获取应用当前状态

**参数**

- 无。

**返回值**

- `array`：包含 `app_id`、`current_version`、`latest_version`、`upgrade_dir`、`data_dir`。

### `getPendingUpgrades(?string $targetVersion = null)` — 获取待升级版本列表

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetVersion` | `string\|null` | `null` | 目标版本号；`null` 时返回当前版本之后的所有待升级版本 |

**返回值**

- `array`：待升级的版本号列表，按升序排列。

### `resetVersion(string $version)` — 强制重置当前版本号

直接修改内存状态和 `.version` 文件，**不执行任何升级或回滚逻辑**。适用于手动修正版本号、初始化新环境的基准版本等场景。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$version` | `string` | 无 | 要设置的目标版本号 |

**返回值**

- `Provisioner`：当前实例（支持链式调用）。

### `installLocked()` — 判断安装是否已锁定

检测数据目录下的 `install.lock` 文件是否存在，存在即视为已完成安装。

**参数**

- 无。

**返回值**

- `bool`：已锁定返回 `true`，否则 `false`。

### `lockInstall()` — 写入安装锁文件

在 `{Path::data()}` 目录下创建 `install.lock`，内容为当前时间戳。

**参数**

- 无。

**返回值**

- `int|false`：写入的字节数，失败返回 `false`。

### `verifiyInstallKey($key)` — 校验安装密钥

读取 `install.key` 内容并与传入的 `$key` 比对。`$key` 为空时直接返回 `false`；`install.key` 不存在（无内容）时也返回 `false`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 待校验的安装密钥 |

**返回值**

- `bool`：密钥一致返回 `true`，否则 `false`。

### `refreshInstallKey()` — 重新生成安装密钥

在 `{Path::data()}` 目录下写入一个新的 `uniqid()` 作为 `install.key` 内容。

**参数**

- 无。

**返回值**

- `int|false`：写入的字节数，失败返回 `false`。

### `updateVersion()` — 持久化配置版本号

读取 `config("version")`（应用配置中的目标版本号）并写入 `{Path::data()}/.version`。

**参数**

- 无。

**返回值**

- `int|false`：写入的字节数，失败返回 `false`。

### `version()` — 读取当前完整版本号

返回 `{Path::data()}/.version` 文件的原文（如 `2.2.0.20260721.1746`）；文件不存在时返回 `null`。

**参数**

- 无。

**返回值**

- `string|null`：完整版本号原文，或 `null`。
