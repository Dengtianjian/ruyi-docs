# RedisService — Redis 服务

- **文件位置**: `kernel/Service/RedisService.php`
- **命名空间**: `kernel\Service`
- **是否可继承**: 是

Redis 连接服务，提供默认单例实例与多连接池管理。所有成员与属性均为静态，底层使用 PhpRedis 扩展。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$singleton` | `\Redis` | `null` | protected static | 默认单例实例，由 `init()` 惰性创建 |
| `$connects` | `array` | `[]` | protected static | 连接池，键为连接别名、值为 `\Redis` 实例 |

## 方法速查

| 方法 | 说明 |
|------|------|
| `init($host, $port, $DBIndex, $timeout, $persistent_id, $retry_interval, $read_timeout, $context)` | 初始化并返回默认单例实例 |
| `connect($useKey, $host, $DBIndex, $port, $timeout, $persistent_id, $retry_interval, $read_timeout, $context)` | 新增连接并加入连接池 |
| `use($useKey)` | 获取连接实例 |

## 方法

### `init($host = "127.0.0.1", $port = 6379, $DBIndex = 0, $timeout = 0, $persistent_id = null, $retry_interval = 0, $read_timeout = 0, $context = [])` — 初始化默认实例

> 使用持久连接（`pconnect`）建立单例实例，仅在 `$singleton` 未创建时建立。已初始化后再次调用直接返回既有实例。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$host` | `string` | `"127.0.0.1"` | 主机地址，也可以是 unix 域套接字路径 |
| `$port` | `int` | `6379` | 端口 |
| `$DBIndex` | `int` | `0` | 数据库索引 |
| `$timeout` | `float` | `0` | 连接超时时长（秒），`0` 表示无限制 |
| `$persistent_id` | `string` | `null` | 请求的持久连接标识 |
| `$retry_interval` | `int` | `0` | 重试间隔（毫秒） |
| `$read_timeout` | `int` | `0` | 读取超时时长（秒），`0` 表示无限制 |
| `$context` | `array` | `[]` | 连接时的身份验证与流信息（PhpRedis >= 5.3.0） |

**返回值**

- `\Redis|false`：成功返回 `\Redis` 实例，连接失败返回 `false`。

**示例**

```php
$redis = RedisService::init("127.0.0.1", 6379, 0);
$redis->set("name", "张三");
```

### `connect($useKey = null, $host = "127.0.0.1", $DBIndex = 0, $port = 6379, $timeout = 0, $persistent_id = null, $retry_interval = 0, $read_timeout = 0, $context = null)` — 新增连接并加入连接池

> 每次调用都新建独立连接，放入 `$connects` 连接池，供后续 `use()` 获取。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$useKey` | `string` | `null` | 连接别名，缺省时以 `time()` 时间戳作为键 |
| `$host` | `string` | `"127.0.0.1"` | 主机地址或 unix 域套接字路径 |
| `$DBIndex` | `int` | `0` | 数据库索引 |
| `$port` | `int` | `6379` | 端口 |
| `$timeout` | `float` | `0` | 连接超时时长（秒） |
| `$persistent_id` | `string` | `null` | 持久连接标识 |
| `$retry_interval` | `int` | `0` | 重试间隔（毫秒） |
| `$read_timeout` | `int` | `0` | 读取超时时长（秒） |
| `$context` | `array` | `null` | 身份验证与流信息 |

**返回值**

- `\Redis|false`：成功返回该连接的 `\Redis` 实例，失败返回 `false`。

**示例**

```php
RedisService::connect("cache", "127.0.0.1", 0, 6379);
$cache = RedisService::use("cache");
```

### `use($useKey = null)` — 获取连接实例

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$useKey` | `string` | `null` | 连接池别名；传入则返回对应连接，缺省返回默认单例实例 |

**返回值**

- `\Redis`：指定别名对应的连接实例；未传别名时返回默认单例实例。

**示例**

```php
$default = RedisService::use();            // 默认实例
$cache   = RedisService::use("cache");     // 连接池指定连接
```
