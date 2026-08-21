# Config — 配置管理

- **文件位置**: `kernel/Foundation/Config.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是
- **方法性质**: 全部为静态方法

多应用配置管理类。配置按 `$appId` 隔离缓存在内存中，键路径支持 `.` 与 `/` 两种层级分隔符（`"database.mysql.host"` 等价于 `"database/mysql/host"`）。

由 `setup()` 装配类手动 `new Config` 触发加载，或 `run()`/`handle()` 前由框架兜底加载。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$configs` | `array<string, array>` | `[]` | private static | 内存配置缓存，按应用 ID 分组存储（键为 `$appId`，值为该应用的完整配置数组） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 初始化：加载应用 `Configs/` 目录下多层配置文件 |
| `read()` | 读取单个配置文件并深度合并到指定应用的配置 |
| `get()` | 按键路径读取配置值 |
| `set()` | 运行时写入配置（数组合并 / 键值两种模式） |
| `has()` | 判断配置键是否存在 |
| `loaded()` | 判断应用配置是否已加载 |
| `forget()` | 删除指定配置键 |
| `push()` | 向数组配置项追加值 |
| `flush()` | 清空指定应用的全部配置 |
| `flushAll()` | 清空所有应用的全部配置 |

---

## `__construct()` — 加载配置

> 由 `setup()` 手动触发（`new Config`）或框架兜底触发。加载 `Path::root()/Configs/` 下的配置文件并合并。

**读取顺序**（存在才读取，后者覆盖前者）：

`Config.php` → `Config.development.php` → `Config.local.php` → `Config.production.php` → `Config.release.php`

**参数**

- 无。

**返回值**

- `void`。应用无 `Configs/` 目录时直接返回，不产生缓存。

---

## `read()` — 读取并合并单个配置文件

> 配置文件直接 `return` 一个数组即可，无需以 `appId` 作为顶级键。`read()` 自动按 `$appId` 归类，用 `Arr::merge()` 深度合并。

**签名**

```php
static read($filePath = null, $appId = null): bool
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string\|null` | `null` | 配置文件完整路径。传 `null` 或文件不存在时直接返回 `false` |
| `$appId` | `string\|null` | `null` | 应用标识，决定配置合并到哪个应用分组；省略取 `App::id()`（当前应用） |

**返回值**

- `bool`：文件存在且返回数组、合并成功返回 `true`；文件不存在或返回非数组返回 `false`。

**示例**

```php
Config::read(FileHelper::combinedFilePath(Path::root(), "Configs", "Config.custom.php"));
```

---

## `get()` — 读取配置值

> 用 `.` 或 `/` 分隔逐层深入查找，任一层级不存在即返回 `$defaultValue`。传 `null` 可获取当前应用全部配置。

**签名**

```php
static get($key = null, $defaultValue = null, $appId = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 配置键路径，`.` 与 `/` 等价。传 `null` 返回该应用全部配置数组 |
| `$defaultValue` | `mixed` | `null` | 缺省值；键路径任一层级不存在或该 `appId` 未加载时返回此值 |
| `$appId` | `string\|null` | `null` | 应用标识；省略取当前应用 |

**返回值**

- `mixed`：匹配的配置值；`$key` 为 `null` 时返回全部配置数组；未命中返回 `$defaultValue`。

**示例**

```php
Config::get("database.mysql.host");     // 点号
Config::get("database/mysql/host");     // 斜线（等价）
Config::get("app.debug", false);        // 带默认值
Config::get();                          // 获取当前应用全部配置
```

---

## `set()` — 运行时写入配置

> 仅写内存，不落盘。**两种调用模式**：

**模式一 · 数组合并**：`set(数组)`——**只传一个参数**时，用 `Arr::merge()` 深度合并到现有配置（此时 `$value` 必须省略）。

```php
Config::set(["mode" => "debug"]);
```

**模式二 · 键值设置**：`set($key, $value)`——支持点号/斜线路径，中间节点不存在自动创建空数组；可显式设 `null`。

```php
Config::set("database.mysql.host", "127.0.0.1");
Config::set("app/debug", true);
Config::set("feature.flag", null);
```

**签名**

```php
static set($keyOrValue, $value = null, $appId = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$keyOrValue` | `string\|array` | —（必填） | 键名（支持 `/`、`.` 路径）或整个配置数组。**注意**：只有「只传这一个参数且为数组」时才进入数组合并模式 |
| `$value` | `mixed` | `null` | 键值。模式二下写入该值（可为 `null`）；模式一下必须省略 |
| `$appId` | `string\|null` | `null` | 应用标识；省略取当前应用 |

**返回值**

- `void`

---

## `has()` — 判断配置键是否存在

> 用于区分「键不存在」与「键存在但值为 `null`」，弥补 `get()` 无法区分的不足。`appId` 未加载返回 `false`。

**签名**

```php
static has($key, $appId = null): bool
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | —（必填） | 配置键路径，支持 `/`、`.` 分隔 |
| `$appId` | `string\|null` | `null` | 应用标识；省略取当前应用 |

**返回值**

- `bool`：键存在返回 `true`；不存在或 `appId` 未加载返回 `false`。

**示例**

```php
Config::has("app.debug");      // 检查调试模式是否已配置
Config::has("database.mysql"); // 检查数据库配置段是否存在
```

---

## `loaded()` — 配置是否已加载

> 框架在 `run()`/`handle()` 前用它判断是否兜底加载。应用无 `Configs/` 目录时不产生缓存，返回 `false`（重复加载无副作用）。

**签名**

```php
static loaded($appId = null): bool
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$appId` | `string\|null` | `null` | 应用标识；省略取当前应用 |

**返回值**

- `bool`：缓存中已有该应用配置（已加载）返回 `true`。

---

## `forget()` — 删除配置键

> 键或中间层级不存在时静默返回，不抛异常。仅删目标键本身，不影响同级或上级节点。

**签名**

```php
static forget($key, $appId = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | —（必填） | 要删除的配置键路径，支持 `/`、`.` 分隔 |
| `$appId` | `string\|null` | `null` | 应用标识；省略取当前应用 |

**返回值**

- `void`

**示例**

```php
Config::forget("app.debug");    // 移除调试开关
Config::forget("temp.runtime"); // 清除已完成的运行时临时配置
```

---

## `push()` — 向数组配置项追加值

> 目标键不存在或不是数组时自动创建空数组再追加；中间节点不存在同样自动创建。

**签名**

```php
static push($key, $value, $appId = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | —（必填） | 目标键路径，支持 `/`、`.` 分隔，其值应为数组 |
| `$value` | `mixed` | —（必填） | 要追加到数组末尾的值，可为标量、数组或对象 |
| `$appId` | `string\|null` | `null` | 应用标识；省略取当前应用 |

**返回值**

- `void`

**示例**

```php
Config::push("cors.allowOrigin", "https://new-domain.com");
Config::push("dingtalk.receivers", "user123");
```

---

## `flush()` — 清空指定应用的配置

> 清空后 `get()` 返回 `$defaultValue`，`set()`/`push()` 会重新初始化空数组。常用于测试 `tearDown` 或长进程中卸载失效应用配置。

**签名**

```php
static flush($appId = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$appId` | `string\|null` | `null` | 应用标识；省略清空当前应用 |

**返回值**

- `void`

**示例**

```php
Config::flush();            // 清空当前应用
Config::flush("otherApp");  // 清空指定应用
```

---

## `flushAll()` — 清空所有应用的配置

> 常用于测试 `setUp` 中完全重置配置状态，等价 `self::$configs = []`。

**签名**

```php
static flushAll()
```

**参数**

- 无。

**返回值**

- `void`

**示例**

```php
Config::flushAll();
```

---

## 私有方法

| 方法 | 说明 |
|------|------|
| `parseKey($key)` | 解析键路径：将 `.` 统一转为 `/` 后 `explode` 为层级数组。返回 `array` |
