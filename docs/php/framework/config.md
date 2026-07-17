# Config — 配置管理

Config 提供配置文件读取和运行时配置管理功能。支持多环境配置文件的自动合并。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Config.php`
- **特点**: 全部为静态方法

## 配置文件加载顺序

框架按以下顺序加载配置文件，**后加载的覆盖先加载的**：

```
Config.php                ← 默认配置（最低优先级）
  ↓ 覆盖
Config.development.php    ← 开发环境配置
  ↓ 覆盖
Config.local.php          ← 本地配置
  ↓ 覆盖
Config.production.php     ← 生产环境配置
  ↓ 覆盖
Config.release.php        ← 发布配置（最高优先级）
```

> 只有存在的文件才会被加载，不存在的文件会被跳过。

## 配置文件格式

```php
<?php
// Configs/Config.php
return [
    "my-app" => [               // App ID 作为顶级键
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
        ]
    ]
];
```

## 方法列表

### `read($filePath = null, $appId = F_APP_ID)`

读取配置文件并将其配置合并到内存配置中。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 配置文件完整路径 |
| `$appId` | `string` | 应用 ID，默认当前应用 |

返回值：`array|bool`

### `get($key = null, $defaultValue = null, $appId = F_APP_ID)`

获取配置项值。支持用 `/` 分隔的层级路径。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 配置键路径，用 `/` 分隔层级。`null` 返回所有配置 |
| `$defaultValue` | `mixed` | 缺省值，配置不存在时返回 |
| `$appId` | `string` | 应用 ID |

返回值：`mixed`

```php
// 获取嵌套配置
$host = Config::get("database/mysql/host");  // "localhost"
$name = Config::get("app/name");             // "MyApp"

// 多个键一起获取
$dbConfig = Config::get("database/mysql/host,database/mysql/name");
// ["host" => "localhost", "name" => "mydb"]

// 带默认值
$debug = Config::get("app/debug", false);

// 获取所有配置
$all = Config::get();
```

### `set($value)`

运行时设置配置值（不会写入文件）。使用 `Arr::merge()` 深度合并。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `array` | 要设置的配置数组 |

```php
Config::set([
    "app" => [
        "debug" => true
    ]
]);
```

## 使用示例

### 配置文件

```php
<?php
// Configs/Config.php
return [
    "my-app" => [
        "mode" => "production",
        "version" => "1.0.0",
        "database" => [
            "mysql" => [
                "host" => "localhost",
                "name" => "my_app",
                "username" => "root",
                "password" => "secret"
            ]
        ],
        "cors" => [
            "sameOrigin" => "http://localhost:3000"
        ]
    ]
];
```

### 读取配置

```php
// 在入口文件中读取数据库配置
$host = Config::get("database/mysql/host");
$name = Config::get("database/mysql/name");
$user = Config::get("database/mysql/username");
$pass = Config::get("database/mysql/password");

// 在中间件中读取 CORS 配置
$origin = Config::get("cors/sameOrigin");

// 在控制器中读取应用配置
$version = Config::get("version");
$mode = Config::get("mode");
```

### 多环境配置

```php
<?php
// Configs/Config.development.php（开发环境，覆盖默认配置）
return [
    "my-app" => [
        "mode" => "development",
        "app" => [
            "debug" => true
        ]
    ]
];
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 初始化加载 | App 启动时自动加载配置 |
| [Middleware](./middleware.md) | 读取配置 | 中间件通过 Config 获取配置 |
