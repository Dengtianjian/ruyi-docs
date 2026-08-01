# Config — 配置管理

Config 是框架的配置管理中心，负责配置文件的加载、缓存和运行时访问。全部为静态方法，配置按 `$appId` 隔离存储，进程生命周期内无需重复加载。

## 概览

| 方法 | 签名 | 说明 |
|------|------|------|
| `read` | `($filePath, $appId)` → `bool` | 加载配置文件并合并到内存 |
| `get` | `($key, $defaultValue, $appId)` → `mixed` | 获取配置项，按层级路径查找 |
| `set` | `($keyOrValue, $value, $appId)` → `void` | 运行时设置配置（数组合并或单键赋值） |
| `has` | `($key, $appId)` → `bool` | 判断指定键是否存在 |
| `forget` | `($key, $appId)` → `void` | 删除指定键 |
| `push` | `($key, $value, $appId)` → `void` | 向数组配置项追加值 |
| `flush` | `($appId)` → `void` | 清空指定应用的全部配置 |
| `flushAll` | `()` → `void` | 清空所有应用的全部配置 |

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Config.php`

---

## 键路径语法

键路径支持 `.` 和 `/` 两种层级分隔符，两者等价：

| 分隔符 | 示例 | 说明 |
|--------|------|------|
| `.` | `database.mysql.host` | 点号分隔 |
| `/` | `database/mysql/host` | 斜线分隔 |

```php
Config::get("database.mysql.host");   // 点号
Config::get("database/mysql/host");   // 斜线，结果完全相同
```

---

## 配置文件

### 格式

配置文件直接 return 一个配置数组即可，**无需以 App ID 作为顶级键**。框架在加载时会根据 `$appId` 参数自动将配置归类到对应应用下。

```php
<?php
// Configs/Config.php
return [
    "mode" => "production",
    "database" => [
        "mysql" => [
            "host" => "localhost",
            "name" => "mydb",
            "username" => "root",
            "password" => ""
        ]
    ],
    "app" => [
        "name" => "MyApp",
        "debug" => false
    ],
    "cors" => [
        "allowOrigin" => ["https://example.com"],
        "sameOrigin" => true
    ]
];
```

### 加载顺序

框架按以下顺序加载配置文件，**后加载覆盖先加载**（使用 `Arr::merge()` 深度合并）：

```
Config.php                ← 默认配置（最低优先级）
  ↓
Config.development.php    ← 开发环境
  ↓
Config.local.php          ← 本地覆盖
  ↓
Config.production.php     ← 生产环境
  ↓
Config.release.php        ← 发布配置（最高优先级）
```

> 只有存在的文件才会被加载，不存在的文件会被跳过。

### 手动加载

除框架自动加载外，也可通过 `read()` 手动加载配置文件：

```php
// 加载到当前应用，文件直接返回配置数组即可
Config::read("/path/to/custom/config.php");

// 加载到指定应用
Config::read("/path/to/other-app.php", "otherApp");
```

> 配置文件只需 `return [...]`，`read()` 会自动按 `$appId` 归类。

---

## 方法详解

### `read($filePath = null, $appId = F_APP_ID)`

读取配置文件，将其内容通过 `Arr::merge()` 深度合并到指定 appId 的内存配置中。

配置文件直接返回数组即可，无需在数组中包含 appId 顶层键。`read()` 会自动根据 `$appId` 参数将返回的整个数组合并到对应应用名下。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string\|null` | 配置文件完整路径，为 `null` 或文件不存在时返回 `false` |
| `$appId` | `string` | 应用 ID，决定配置写入哪个应用的分组，默认当前应用 |

**返回值**：`bool` — 成功返回 `true`，文件不存在或内容非数组返回 `false`

**跨 APP 加载**：通过 `$appId` 参数可将同一配置文件加载到不同应用名下：

```php
// 主应用加载
Config::read("/path/to/config.php");                      // → F_APP_ID

// 同一份配置加载到 B 应用
Config::read("/path/to/config.php", "appB");              // → appB
```

> 返回 `false` 时不会修改内存中的已有配置。

---

### `get($key = null, $defaultValue = null, $appId = F_APP_ID)`

按键路径逐层深入查找配置值。任一层级不存在，或目标 appId 未加载时，返回 `$defaultValue`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 键路径，支持 `.` 或 `/` 分隔。传 `null` 返回该应用全部配置 |
| `$defaultValue` | `mixed` | 缺省值，默认 `null` |
| `$appId` | `string` | 应用 ID |

**返回值**：`mixed`

```php
// 读取嵌套值
$host = Config::get("database.mysql.host");
$name = Config::get("database/mysql/name");

// 带默认值 — 键不存在时返回 false 而非 null
$debug = Config::get("app.debug", false);

// 获取当前应用全部配置
$all = Config::get();

// 跨 APP 读取
$otherMode = Config::get("mode", "production", "otherApp");
```

> **注意**：若键存在但值为 `null`，`get()` 也会返回 `null`。需要区分「不存在」与「值为 null」时请使用 [`has()`](#haskey-appid--f_app_id)。

---

### `set($keyOrValue, $value = null, $appId = F_APP_ID)`

运行时设置配置值，仅修改内存中的缓存，**不会写入文件**。支持两种调用模式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$keyOrValue` | `string\|array` | 键路径或配置数组 |
| `$value` | `mixed` | 键值。不传且第一个参数为数组时进入数组合并模式。可显式传 `null` 将键值设为 null |
| `$appId` | `string` | 应用 ID |

**模式一：数组合并**

只传一个数组参数（`$value` 未传），使用 `Arr::merge()` 深度合并到现有配置：

```php
Config::set([
    "app" => [
        "debug" => true,
        "name"  => "DevApp"
    ]
]);
// 原配置中的 database、cors 等不受影响，仅 app 段被合并覆盖
```

**模式二：键路径设值**

传入键路径和值（`$value` 已传），沿路径穿透设置。中间节点不存在时自动创建空数组：

```php
Config::set("database.mysql.host", "127.0.0.1");
Config::set("app/debug", true);
Config::set("feature.flag", null);          // 显式设为 null

// 跨 APP 设置
Config::set("mode", "development", "otherApp");
```

> 模式判断基于 `func_num_args()`（实参个数）而非 `$value === null`，因此传两个参数 `("key", null)` 会正确进入键值设置模式。传一个参数 `(["array"])` 进入数组合并模式。

---

### `has($key, $appId = F_APP_ID)`

判断指定配置键是否存在。**区分「键不存在」与「键存在但值为 null」**，弥补 `get()` 无法区分两者的不足。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 键路径，支持 `.` 或 `/` 分隔 |
| `$appId` | `string` | 应用 ID |

**返回值**：`bool`

```php
// 安全的可选配置检查
if (Config::has("app.debug")) {
    $debug = Config::get("app.debug");
}

// 检查配置段是否存在
if (!Config::has("database.mysql")) {
    throw new \RuntimeException("数据库配置缺失");
}
```

> **典型场景**：用户显式设置 `Config::set("feature.flag", null)` 后，`get("feature.flag")` 返回 `null`，
> 而 `has("feature.flag")` 返回 `true`，能正确区分「未配置」与「显式设为 null」。

---

### `forget($key, $appId = F_APP_ID)`

删除指定配置键。键或其中间路径不存在时静默返回，不会抛异常。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 键路径，支持 `.` 或 `/` 分隔 |
| `$appId` | `string` | 应用 ID |

```php
// 临时移除配置
Config::forget("app.debug");
Config::has("app.debug");   // false

// 删除嵌套键
Config::forget("temp.cache.ttl");
Config::get("temp.cache");  // 父级仍然存在，仅 ttl 被移除

// 键不存在时不报错
Config::forget("nonexistent.key");  // 静默返回
```

---

### `push($key, $value, $appId = F_APP_ID)`

向数组类型的配置项末尾追加值。目标不存在或不是数组时**自动创建空数组**再追加。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 键路径，支持 `.` 或 `/` 分隔 |
| `$value` | `mixed` | 要追加的值，可以是标量、数组或对象 |
| `$appId` | `string` | 应用 ID |

```php
// 文件配置：
// "cors" => ["allowOrigin" => ["https://example.com"]]
// "dingtalk" => ["receivers" => ["user001"]]

// 运行中追加域名
Config::push("cors.allowOrigin", "https://new-domain.com");
// => ["https://example.com", "https://new-domain.com"]

// 追加通知接收人
Config::push("dingtalk.receivers", "user002");

// 键不存在时自动创建数组
Config::push("audit.logTargets", "database");
Config::get("audit.logTargets");  // => ["database"]
```

> **与 `set()` 的区别**：`set()` 会覆盖整个键的值，`push()` 在保留已有元素的基础上追加。
> 如果目标值已整个替换为标量，`push()` 会将其丢弃并重建为数组。

---

### `flush($appId = F_APP_ID)`

清空指定应用的全部内存配置。清空后 `get()` 返回 `$defaultValue`，`set()`/`push()` 会重新初始化空数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$appId` | `string` | 应用 ID，默认当前应用 |

```php
// 测试 tearDown 中重置配置状态
public function tearDown(): void
{
    Config::flush();
    parent::tearDown();
}

// 清理已卸载的应用
Config::flush("dynamicallyLoadedApp");
```

### `flushAll()`

清空所有应用的全部内存配置。常用于测试 `setUp()` 中完全重置配置状态。

```php
Config::flushAll();
// 等价于 self::$configs = [];
```

**返回值**：`void`

| 场景 | 说明 |
|------|------|
| 测试 setUp | 每个测试用例开始时完全重置，避免跨用例污染 |
| 进程重启模拟 | 清空全部缓存，后续访问触发重新加载 |

---

## 使用场景

### 基础读取

```php
// 路由入口：读取数据库配置
$host = Config::get("database.mysql.host");
$port = Config::get("database.mysql.port", 3306);
$user = Config::get("database.mysql.username");
$pass = Config::get("database.mysql.password");

// 中间件：读取 CORS 配置
$allowOrigin = Config::get("cors.allowOrigin", ["*"]);
$sameOrigin  = Config::get("cors.sameOrigin", false);
```

### 运行时覆盖

```php
// 单次请求内切换模式
Config::set("mode", "development");
Config::set("database.mysql.host", "10.0.0.1");
```

### 可选功能开关

```php
// has() + get() 配合，安全处理可选配置
if (Config::has("features.newDashboard")) {
    $dashboardConfig = Config::get("features.newDashboard");
    enableDashboard($dashboardConfig);
}
```

### 运行时动态收集

```php
// 中间件链中收集审计日志目标
Config::push("audit.targets", "file");
Config::push("audit.targets", "database");

// 请求结束时
$targets = Config::get("audit.targets");  // ["file", "database"]
```

### 测试环境隔离

```php
class MyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Config::flushAll();   // 从干净状态开始
    }

    private function setupConfig(): void
    {
        Config::set([
            "mode" => "testing",
            "database" => [
                "mysql" => ["host" => "127.0.0.1"]
            ]
        ]);
    }

    protected function tearDown(): void
    {
        Config::flush();
        parent::tearDown();
    }
}
```

### 跨应用多环境

```php
<?php
// Configs/Config.local.php — 开发者本地覆盖
return [
    "mode" => "development",
    "app"   => ["debug" => true],
    "database" => [
        "mysql" => [
            "host" => "127.0.0.1",
            "name" => "mydb_dev"
        ]
    ]
];
```

> `read()` 加载时根据 `$appId` 自动将数组归类，无需手动在配置文件中包裹 `"my-app" => [...]` 顶层键。

---

## 行为约定

| 场景 | 行为 |
|------|------|
| 键不存在时 `get()` | 返回 `$defaultValue`（默认 `null`） |
| 键存在但值为 `null` 时 `get()` | 返回 `null`（需 `has()` 区分） |
| 中间节点不存在时 `set()` / `push()` | 自动创建空数组 |
| 中间节点不存在时 `forget()` | 静默返回 |
| `flush()` 后首次 `set()` / `push()` | 自动初始化空数组 |
| 配置文件不存在时 `read()` | 返回 `false`，不修改内存配置 |
| 配置文件返回非数组时 `read()` | 返回 `false`，不修改内存配置 |
| 多次 `read()` 同一文件 | 每次加载都会重新合并（使用 `include`，配置内容会被覆盖） |
| `flushAll()` 后首次访问 | 等同于全新状态，`get()` 返回默认值 |

---

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 初始化加载 | `App::initConfig()` 在启动时遍历并按顺序加载多层配置文件 |
| [Middleware](./middleware.md) | 读取配置 | 中间件通过 `Config::get()` 获取运行时参数 |
