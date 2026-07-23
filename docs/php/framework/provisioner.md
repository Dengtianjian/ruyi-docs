# Provisioner — 生命周期编排器

Provisioner 是应用安装、增量升级、回滚和卸载的编排器。通过扫描升级脚本目录中的版本化类文件，实现从任意版本到目标版本的安全迁移。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Provisioner.php`

## 设计理念

### 版本管理

`.version` 文件位于 `{F_APP_DATA}/.version`，存储完整版本号，格式为 `主版本.次版本.修订版.日期.构建号`：

```
2.2.0.20260721.1746
```

Provisioner 自动提取前三段基础版本号（`2.2.0`）与升级脚本版本号做比较，后两段仅作记录用途。

### 升级脚本发现

扫描 `upgradesDir` 目录下符合命名规则的文件：

```
Upgrade_1_1_0.php   → 版本号 1.1.0
Upgrade_2_0_1.php   → 版本号 2.0.1
Upgrade_3_5_12.php  → 版本号 3.5.12
```

文件名必须严格匹配 `Upgrade_x_y_z.php`，`x`、`y`、`z` 均为数字，否则被忽略。

### 升级脚本格式

每个升级脚本是一个**同名类**，支持两种写法：

**基础写法（向后兼容）**：构造器即升级逻辑

```php
namespace Upgrades;

class Upgrade_1_1_0
{
    public function __construct()
    {
        // 在构造器中执行升级 SQL 或逻辑
        DB::statement("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
    }
}
```

**推荐写法**：显式定义 `upgrade()` 和 `rollback()` 方法

```php
namespace Upgrades;

use kernel\Foundation\Database\DB;

class Upgrade_1_1_0
{
    public function upgrade()
    {
        DB::statement("ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email");
    }

    public function rollback()
    {
        DB::statement("ALTER TABLE users DROP COLUMN phone");
    }
}
```

### 命名空间推导

类名从 `upgradesDir` 路径自动推导命名空间。推导逻辑：`upgradesDir` 相对 `F_APP_ROOT` 的路径 → 目录分隔符转为反斜杠 → 拼接类短名。

```
upgradesDir = /app/Upgrades
相对路径     = Upgrades
命名空间     = Upgrades
最终类名     = Upgrades\Upgrade_1_1_0
```

### 执行流程

| 场景 | 行为 |
|------|------|
| 类有 `upgrade()` 方法 | `new ClassName()` → 调用 `upgrade()` |
| 类无 `upgrade()` 方法 | `new ClassName()` — 构造器即升级逻辑 |
| 类有 `rollback()` 方法 | `new ClassName()` → 调用 `rollback()` |
| 类无 `rollback()` 方法 | 实例化但不执行任何回滚操作 |

## 构造方法

### `__construct($upgradesDir = null)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `$upgradesDir` | `string\|null` | 升级脚本目录，`null` 时默认为 `{F_APP_ROOT}/Upgrades` |

构造时自动读取 `.version` 文件并解析基础版本号：

```php
$p = new Provisioner();
// 读取 {F_APP_DATA}/.version → 2.2.0.20260721.1746
// 自动解析为 currentSemver = 2.2.0，升级脚本目录默认为 {F_APP_ROOT}/Upgrades
```

## 方法列表

### `install()`

首次安装：创建应用数据和存储目录。不会执行升级脚本。

```php
$p = new Provisioner();
$p->install();
// 创建 {F_APP_DATA}/ 和 {F_APP_STORAGE}/ 目录
```

返回值：`$this`（支持链式调用）

### `upgrade($targetVersion = null)`

执行增量升级。扫描升级目录中的版本脚本，过滤出 `> currentSemver` 且 `≤ targetVersion` 的脚本，按版本升序逐个执行。**每成功执行一个版本升级后，自动将版本号持久化到 `.version` 文件**，无需外部回调。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetVersion` | `string\|null` | 目标版本号，`null` 表示升级到最新 |

返回值：`$this` 或 `true`（无升级文件或无需升级时）

```php
$p = new Provisioner();

// 升级到指定版本，每次升级后自动写入 .version
$p->upgrade('2.0.0');

// 升级到最新版本
$p->upgrade();
```

### `rollback($targetVersion)`

执行增量回滚。从当前版本降级到 `$targetVersion`，按版本降序执行回滚脚本。仅定义了 `rollback()` 方法的升级类参与回滚。**每成功执行一个版本回滚后，自动将版本号持久化到 `.version` 文件**。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetVersion` | `string` | 回滚目标版本号 |

返回值：`$this` 或 `true`（无需回滚时）

```php
$p = new Provisioner();

// 回滚到 1.0.0，每次回滚后自动写入 .version
$p->rollback('1.0.0');
```

### `uninstall()`

卸载：删除 `.version` 文件。

```php
$p->uninstall();
// 删除 {F_APP_DATA}/.version
```

### `getStatus()`

获取应用当前状态快照，返回版本号、目录路径等信息。

```php
$p = new Provisioner();
$status = $p->getStatus();
// [
//     'app_id'          => 'myapp',
//     'current_version' => '2.2.0',
//     'latest_version'  => '2.2.0.20260721.1746',
//     'upgrade_dir'     => '/app/Upgrades',
//     'data_dir'        => '/app/Data',
// ]
```

返回值：`array`

| 字段 | 说明 |
|------|------|
| `app_id` | 应用标识（`F_APP_ID` 常量） |
| `current_version` | 三段基础版本号（如 `2.2.0`） |
| `latest_version` | 完整版本号原文（如 `2.2.0.20260721.1746`） |
| `upgrade_dir` | 升级脚本目录路径 |
| `data_dir` | 数据目录路径（`F_APP_DATA`） |

### `getPendingUpgrades($targetVersion = null)`

获取待升级的版本列表（只查询不执行）。过滤条件与 `upgrade()` 一致：`> currentSemver` 且 `≤ targetVersion`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetVersion` | `string\|null` | 目标版本号，`null` 表示查询全部待升级版本 |

返回值：`array` 版本号列表，按升序排列

```php
$p = new Provisioner();

// 查询全部待升级版本
$pending = $p->getPendingUpgrades();
// 当前版本 1.0.0，存在 1.1.0、1.2.0、2.0.0 脚本
// → ['1.1.0', '1.2.0', '2.0.0']

// 查询到指定目标的待升级版本
$pending = $p->getPendingUpgrades('1.2.0');
// → ['1.1.0', '1.2.0']
```

### `resetVersion($version)`

强制重置当前版本号。直接修改内存状态和 `.version` 文件，**不执行任何升级或回滚逻辑**。

适用于手动修正版本号、初始化新环境的基准版本等场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$version` | `string` | 要设置的目标版本号 |

返回值：`$this`

```php
$p = new Provisioner();

// 将当前版本强制设为 2.0.0
$p->resetVersion('2.0.0');
// .version 文件内容变为 2.0.0，内存中 latestVersion 和 currentSemver 同步更新
```

## 完整使用示例

### 基本升级流程

```php
use kernel\Foundation\Provisioner;

// 初始化 Provisioner（使用默认 Upgrades 目录）
$provisioner = new Provisioner();

// 升级到目标版本，每次升级后自动写入 .version
$provisioner->upgrade('2.0.0');
```

### 回滚流程

```php
// 回滚到指定版本，每次回滚后自动写入 .version
$provisioner->rollback('1.0.0');
```

### 查询和重置

```php
// 查看当前状态
$status = $provisioner->getStatus();
echo "当前版本: {$status['current_version']}\n";

// 升级前预览待执行版本
$pending = $provisioner->getPendingUpgrades('2.0.0');
echo "待升级: " . implode(', ', $pending) . "\n";

// 确认无误后执行
$provisioner->upgrade('2.0.0');

// 手动修正版本号（不执行任何脚本）
$provisioner->resetVersion('1.0.0');
```

### 完整的升级脚本示例

```php
<?php
// Upgrades/Upgrade_1_1_0.php

namespace Upgrades;

use kernel\Foundation\Database\DB;
use kernel\Foundation\Database\Model;

class Upgrade_1_1_0
{
    public function upgrade()
    {
        // 新增字段
        DB::statement("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT '' AFTER email");
        DB::statement("ALTER TABLE users ADD COLUMN bio TEXT AFTER avatar");

        // 创建新表
        DB::statement("CREATE TABLE IF NOT EXISTS user_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            theme VARCHAR(20) DEFAULT 'light',
            lang VARCHAR(10) DEFAULT 'zh-CN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 数据迁移
        (new Model('users'))->where('theme', '')->update(['theme' => 'light']);
    }

    public function rollback()
    {
        DB::statement("ALTER TABLE users DROP COLUMN bio");
        DB::statement("ALTER TABLE users DROP COLUMN avatar");
        DB::statement("DROP TABLE IF EXISTS user_settings");
    }
}
```

## 版本管理总结

| 属性 | 来源 | 说明 |
|------|------|------|
| `$latestVersion` | `.version` 原文 | 完整版本号，如 `2.2.0.20260721.1746` |
| `$currentSemver` | `parseSemver()` 提取 | 三段基础版本号 `2.2.0`，用于 `version_compare` |
| 默认值 | 文件不存在 | `latestVersion = null`, `currentSemver = '0.0.0'`（视为全新未安装） |

基础版本号解析规则：

```
2.2.0.20260721.1746  → 2.2.0
1.0                  → 1.0（不足三段原样保留）
"2.2.0"              → 2.2.0（恰好三段）
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | Provisioner 通常由 App 调用以执行初始化/升级 | 应用启动流程 |
| [FileHelper](./file.md) | 用于拼接文件路径 | 路径辅助 |

> **注意**：Provisioner 是通用框架类，具体的升级、回滚、卸载等业务逻辑由各 App 实现，框架不提供系统级控制器。App 应在自身控制器中调用 Provisioner 完成版本管理。
