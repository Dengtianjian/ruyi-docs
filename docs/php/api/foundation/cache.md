# Cache — 文件缓存

- **文件位置**: `kernel/Foundation/Cache.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

基于文件的缓存。以 PHP 序列化格式将缓存内容写入应用 `Data/Cache/` 目录，支持过期时间与合并写入，进程内维护已读取缓存避免重复读文件。

**特性**：
- 过期时间以"天"为单位，支持小数（如 `1/24` 表示 1 小时）；`<=0` 或 `null` 表示永不过期。
- `write()` 对数组内容做合并（一层，新键覆盖旧键），`overwrite()` 完全替换，`clear()` 清空内容。
- `has()` / `read()` 均自动跳过已过期缓存，过期文件在读取时顺手清理。
- `remember()` 一键"读-生成-写"，`get()` 支持默认值。
- `increment()` / `decrement()` 基于文件锁的原子计数器。
- `flush()` 清空全部缓存，`gc()` 清理过期缓存（运维方法）。

**安全**：
- 缓存 ID 中的路径分隔符与空字节会被替换，防止目录穿越。
- 文件写入使用 `LOCK_EX`，避免并发写坏缓存。

**注意**：
- `read()` 返回 `false` 表示缓存不存在，`null` 表示已过期，其他值为缓存内容。
- 内容为 `0` / `""` / `false` 等 falsy 值时同样会被正确缓存与返回。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$currentCache` | `Cache\|null` | `null` | static protected | 当前（最近实例化）的 Cache 实例，`Cache::key()` 从该实例读取 key |
| `$key` | `string` | `""` | private | 缓存动态 KEY（16 位随机字符串），构造时生成 |
| `$readCaches` | `array` | `[]` | static private | 已读取的缓存内容，键为缓存 ID |
| `$readCacheMetas` | `array` | `[]` | static private | 已读取的缓存元数据，键为缓存 ID |
| `$daySeconds` | `int` | `86400` | static private | 一天的秒数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 生成 16 位随机 KEY 并注册当前实例 |
| `key()` | 获取缓存动态 KEY（16 位随机字符串） |
| `has($id)` | 缓存是否存在（存在且未过期） |
| `read($id)` | 读取缓存（false=不存在，null=已过期） |
| `meta($id)` | 读取缓存元数据（不判断过期） |
| `write($id, $content, $expiresIn = 30)` | 写入缓存（数组合并模式） |
| `overwrite($id, $content, $expiresIn = 30)` | 覆盖写入缓存（完全替换） |
| `clear($id)` | 清除缓存内容（设为空数组） |
| `remove($id)` | 删除缓存文件并清理进程内缓存 |
| `remember($id, $callback, $expiresIn = 30)` | 读-生成-写缓存模式 |
| `get($id, $default = null)` | 读取缓存，未命中返回默认值 |
| `increment($id, $step = 1, $expiresIn = 30)` | 原子自增计数器 |
| `decrement($id, $step = 1, $expiresIn = 30)` | 原子自减计数器 |
| `flush()` | 清空全部缓存文件 |
| `gc()` | 清理过期或损坏的缓存文件 |

## 方法

### `__construct()` — 构造 Cache

生成 16 位随机字符串 KEY 并注册当前实例（`Cache::key()` 读取）。App 构造时执行 `new Cache;` 自动触发。

**参数**

- 无。

**返回值**

- 无。

### `key()` — 获取缓存动态 KEY

替代原 `F_CACHE_KEY` 常量（`time()`），每次 App 实例化（`new Cache`）时重新生成。主要用于静态文件。

**参数**

- 无。

**返回值**

- `string`：当前实例的 KEY（16 位随机字符串）；未实例化 Cache 时返回空字符串。

### `has($id)` — 缓存是否存在

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |

**返回值**

- `bool`：缓存存在且未过期返回 `true`，否则 `false`。

### `read($id)` — 读取缓存

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |

**返回值**

- `mixed|bool|null`：
  - 缓存内容：读取成功且未过期
  - `null`：缓存已过期（会顺手删除过期文件）
  - `false`：缓存不存在或文件损坏

### `meta($id)` — 读取缓存元数据

不判断过期、不清理文件。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |

**返回值**

- `array|bool`：元数据；缓存不存在或损坏时返回 `false`。

### `write($id, $content, $expiresIn = 30)` — 写入缓存（合并模式）

缓存已存在且新旧内容均为数组时做数组合并（新键覆盖旧键），否则新内容完全替换旧内容。过期缓存视为不存在，直接全新写入。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |
| `$content` | `mixed` | 无 | 缓存内容（数组时自动合并） |
| `$expiresIn` | `int\|float\|null` | `30` | 有效期（天）；`<=0` 或 `null` 表示永不过期 |

**返回值**

- `bool`：是否写入成功。

**示例**

```php
Cache::write("settings", ["theme" => "dark"]);     // 首次写入
Cache::write("settings", ["lang" => "zh"]);        // 合并 → ["theme"=>"dark","lang"=>"zh"]
Cache::write("token", $token, 1 / 24);             // 有效期 1 小时
```

### `overwrite($id, $content, $expiresIn = 30)` — 覆盖写入缓存

**不合并，完全替换**旧内容。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |
| `$content` | `mixed` | 无 | 覆盖的内容 |
| `$expiresIn` | `int\|float\|null` | `30` | 有效期（天）；`<=0` 或 `null` 表示永不过期 |

**返回值**

- `bool`：是否写入成功。

### `clear($id)` — 清除缓存内容

将内容设为空数组 `[]`，保留文件与默认 30 天有效期。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |

**返回值**

- `bool`：是否成功。

### `remove($id)` — 删除缓存

删除缓存文件并清理进程内缓存。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |

**返回值**

- `bool`：文件不存在时返回 `true`（视为已删除）。

### `remember($id, $callback, $expiresIn = 30)` — 读-生成-写模式

缓存命中直接返回，未命中用回调生成并写入。等价于"read → 生成 → overwrite"完整流程，适合缓存计算结果、数据库查询等场景。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |
| `$callback` | `callable` | 无 | 生成缓存的回调（缓存未命中时调用） |
| `$expiresIn` | `int\|float\|null` | `30` | 有效期（天）；`<=0` 或 `null` 表示永不过期 |

**返回值**

- `mixed`：缓存内容。

**示例**

```php
$users = Cache::remember("users", function () {
    return $db->query("SELECT * FROM users");
}, 1);   // 缓存 1 天
```

### `get($id, $default = null)` — 读取缓存（带默认值）

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |
| `$default` | `mixed` | `null` | 未命中（不存在或已过期）时的返回值 |

**返回值**

- `mixed`：缓存内容；未命中返回 `$default`。

### `increment($id, $step = 1, $expiresIn = 30)` — 原子自增

通过文件锁保证并发安全，计数器内容为数字。缓存不存在时从 `0` 开始。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |
| `$step` | `int\|float` | `1` | 增量 |
| `$expiresIn` | `int\|float\|null` | `30` | 有效期（天）；`<=0` 或 `null` 表示永不过期 |

**返回值**

- `int|float|false`：自增后的新值；打开文件失败时返回 `false`。

### `decrement($id, $step = 1, $expiresIn = 30)` — 原子自减

基于 `increment()` 实现。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$id` | `string` | 无 | 缓存 ID |
| `$step` | `int\|float` | `1` | 减量 |
| `$expiresIn` | `int\|float\|null` | `30` | 有效期（天）；`<=0` 或 `null` 表示永不过期 |

**返回值**

- `int|float|false`：自减后的新值；打开文件失败时返回 `false`。

### `flush()` — 清空全部缓存

清空缓存目录下的全部缓存文件，并清空进程内缓存。

**参数**

- 无。

**返回值**

- `int`：清理的文件数量。

### `gc()` — 清理过期缓存

清理过期或损坏的缓存文件。

**参数**

- 无。

**返回值**

- `int`：清理的文件数量。
