# Cache — 缓存

Cache 提供基于文件的缓存读写功能。支持设置过期时间，缓存内容以 PHP 序列化格式存储，进程内维护已读取缓存避免重复读文件。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Cache.php`
- **存储位置**: `Data/Cache/` 目录下
- **特点**: 全部为静态方法

## 特性

- **过期时间**：以"天"为单位，支持小数（如 `1/24` 表示 1 小时），`<=0` 或 `null` 表示永不过期
- **合并写入**：`write()` 对数组内容做合并，`overwrite()` 完全替换
- **过期自动清理**：`read()` 遇到过期缓存返回 `null` 并顺手删除文件；`gc()` 可批量清理
- **安全**：缓存 ID 过滤路径分隔符防目录穿越；文件写入带 `LOCK_EX` 文件锁
- **原子计数器**：`increment()` / `decrement()` 基于文件锁，并发安全

## 缓存元数据

每个缓存文件包含以下元数据：

| 字段 | 说明 |
|------|------|
| `updatedAt` | 最后更新时间戳 |
| `addedAt` | 首次创建时间戳 |
| `expiredAt` | 过期时间戳（0 表示永不过期） |
| `format` | 存储格式（`php_serialize`） |

## 方法列表

### `read($id)`

读取缓存内容。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`mixed|bool|null`

- 返回缓存内容：读取成功且未过期
- 返回 `null`：缓存已过期（会顺手删除过期文件）
- 返回 `false`：缓存不存在或文件损坏

> 注意：内容为 `0` / `""` / `false` / `[]` 等 falsy 值时同样会被正确缓存与返回，不会与"不存在"混淆。

```php
$data = Cache::read("api_response");
if ($data === false) {
    // 缓存不存在，重新获取数据
} elseif ($data === null) {
    // 缓存已过期
}
```

### `write($id, $content, $expiresIn = 30)`

写入缓存（合并模式）。缓存已存在且新旧内容均为数组时做数组合并（新键覆盖旧键），否则新内容完全替换旧内容；过期缓存视为不存在，直接全新写入。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$content` | `mixed` | 缓存内容 |
| `$expiresIn` | `int/float/null` | 有效期（天），`<=0` 或 `null` 表示永不过期 |

返回值：`bool`

```php
Cache::write("user_data", ["name" => "张三"], 7); // 缓存 7 天
Cache::write("user_data", ["age" => 25], 7);      // 合并：name + age
Cache::write("counter", 1, 0);                    // 永不过期
```

### `overwrite($id, $content, $expiresIn = 30)`

覆盖写入缓存（不合并，完全替换）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$content` | `mixed` | 缓存内容 |
| `$expiresIn` | `int/float/null` | 有效期（天） |

返回值：`bool`

```php
Cache::overwrite("config", ["theme" => "dark"], 30);
```

### `has($id)`

检查指定 ID 的缓存是否可用（**存在且未过期**）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`bool`

```php
if (Cache::has("user_settings")) {
    $settings = Cache::read("user_settings");
}
```

### `meta($id)`

读取缓存元数据（不判断过期，不清理文件）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`array|bool`

```php
$meta = Cache::meta("api_response");
echo $meta['updatedAt'];  // 更新时间戳
echo $meta['expiredAt'];  // 过期时间戳
```

### `clear($id)`

清除缓存内容（将内容设为空数组，保留文件与 30 天有效期）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`bool`

```php
Cache::clear("temp_data");
```

### `remove($id)`

删除缓存文件，并清理进程内缓存。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`bool`

```php
Cache::remove("old_cache");
```

### `remember($id, $callback, $expiresIn = 30)` （新增）

缓存-回调模式：缓存命中直接返回，未命中调用回调生成并写入。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$callback` | `callable` | 生成缓存的回调（缓存未命中时调用） |
| `$expiresIn` | `int/float/null` | 有效期（天） |

返回值：`mixed` 缓存内容

```php
$articles = Cache::remember("home_articles", function () {
    return (new ArticlesModel())->order("createdAt", "DESC")->page(1, 10)->getAll();
}, 1 / 24); // 缓存 1 小时
```

### `get($id, $default = null)` （新增）

读取缓存，未命中（不存在或已过期）时返回默认值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$default` | `mixed` | 未命中时的返回值，默认 `null` |

返回值：`mixed`

```php
$settings = Cache::get("user_settings", ["theme" => "light"]);
```

### `increment($id, $step = 1, $expiresIn = 30)` / `decrement($id, $step = 1, $expiresIn = 30)` （新增）

原子自增 / 自减计数器。基于文件锁保证并发安全，内容为数字；缓存不存在时从 0 开始。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$step` | `int/float` | 增量/减量，默认 1 |
| `$expiresIn` | `int/float/null` | 有效期（天） |

返回值：`int|float` 操作后的新值

```php
Cache::increment("page_views");            // 1
Cache::increment("page_views", 5);         // 6
Cache::decrement("stock", 2);              // 4
```

### `flush()` （新增）

清空缓存目录下的全部缓存文件，并清空进程内缓存。

返回值：`int` 清理的文件数量

```php
Cache::flush();
```

### `gc()` （新增）

清理过期或损坏的缓存文件。

返回值：`int` 清理的文件数量

```php
$removed = Cache::gc();
echo "清理了 {$removed} 个过期缓存";
```

## 使用示例

### 基本缓存读写

```php
// 方式一：read + write（手动判断）
$articles = Cache::read("home_articles");
if ($articles === false || $articles === null) {
    $articles = (new ArticlesModel())->order("createdAt", "DESC")->page(1, 10)->getAll();
    Cache::overwrite("home_articles", $articles, 1 / 24); // 缓存 1 小时
}

// 方式二：remember（推荐，一步完成）
$articles = Cache::remember("home_articles", function () {
    return (new ArticlesModel())->order("createdAt", "DESC")->page(1, 10)->getAll();
}, 1 / 24);
```

### 缓存计数器（原子）

```php
// 每次访问自增 1，按天过期（默认 30 天可传 0 表示永不过期）
Cache::increment("page_views_" . date("Y-m-d"), 1, 0);

// 读取计数
$views = Cache::get("page_views_" . date("Y-m-d"), 0);
```

### 缓存 API 响应

```php
function getWeather($city) {
    return Cache::remember("weather_" . $city, function () use ($city) {
        $data = file_get_contents("https://api.weather.com/" . $city);
        return json_decode($data, true);
    }, 1 / 24); // 缓存 1 小时
}
```

### 定期清理过期缓存

```php
// 在定时任务中（Crons/ 目录任务类）定期执行
$removed = Cache::gc();
```

## write vs overwrite 对比

| 方法 | 行为 | 适用场景 |
|------|------|----------|
| `write()` | 合并到已有缓存（数组时） | 增量更新 |
| `overwrite()` | 完全覆盖已有缓存 | 全量替换 |

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 使用 | 控制器中缓存查询结果 |
| [Model] | 使用 | 缓存数据库查询结果 |
| [Middleware](./middleware.md) | 使用 | 限流计数等场景 |
| [schedule:run](./commands/schedule-run.md) | 使用 | 定时清理过期缓存 |
