# Cache — 缓存

Cache 提供基于文件的缓存读写功能。支持设置过期时间，缓存内容以 PHP 序列化格式存储。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Cache.php`
- **存储位置**: `Data/Cache/` 目录下
- **特点**: 全部为静态方法

## 缓存元数据

每个缓存文件包含以下元数据：

| 字段 | 说明 |
|------|------|
| `updatedAt` | 最后更新时间戳 |
| `addedAt` | 首次创建时间戳 |
| `expiredAt` | 过期时间戳（0 表示永不过期） |
| `format` | 存储格式（`php_serialize`） |

## 方法列表

### `has($id)`

检查指定 ID 的缓存是否存在。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`bool`

```php
if (Cache::has("user_settings")) {
    $settings = Cache::read("user_settings");
}
```

### `read($id)`

读取缓存内容。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`mixed|bool|null`

- 返回缓存内容：读取成功且未过期
- 返回 `null`：读取成功但已过期
- 返回 `false`：缓存不存在

```php
$data = Cache::read("api_response");
if ($data === false) {
    // 缓存不存在，重新获取数据
    $data = fetchFromAPI();
    Cache::write("api_response", $data, 1); // 缓存 1 天
}
if ($data === null) {
    // 缓存已过期
}
```

### `meta($id)`

读取缓存元数据（不判断过期）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`array|bool|null`

```php
$meta = Cache::meta("api_response");
echo $meta['updatedAt'];  // 更新时间戳
echo $meta['expiredAt'];  // 过期时间戳
```

### `write($id, $content, $expiresIn = 30)`

写入缓存（合并模式）。如果缓存已存在且内容是数组，会进行数组合并。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$content` | `mixed` | 缓存内容 |
| `$expiresIn` | `int` | 有效期（天），`<=0` 或 `null` 表示永不过期 |

返回值：`bool`

```php
Cache::write("user_data", ["name" => "张三"], 7);  // 缓存 7 天
Cache::write("user_data", ["age" => 25], 7);        // 合并：name + age
Cache::write("counter", 1, 0);                       // 永不过期
```

### `overwrite($id, $content, $expiresIn = 30)`

覆盖写入缓存（不合并，完全替换）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |
| `$content` | `mixed` | 缓存内容 |
| `$expiresIn` | `int` | 有效期（天） |

返回值：`bool`

```php
Cache::overwrite("config", ["theme" => "dark"], 30);
```

### `clear($id)`

清除缓存内容（将内容设为空数组，不删除文件）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`bool`

```php
Cache::clear("temp_data");
```

### `remove($id)`

删除缓存文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 缓存 ID |

返回值：`bool`

```php
Cache::remove("old_cache");
```

## 使用示例

### 基本缓存读写

```php
// 尝试从缓存读取
$articles = Cache::read("home_articles");

if ($articles === false || $articles === null) {
    // 缓存不存在或已过期，从数据库获取
    $articles = (new ArticlesModel())
        ->order("createdAt", "DESC")
        ->page(1, 10)
        ->getAll();
    
    // 写入缓存，有效期 1 小时（传入小数天）
    Cache::overwrite("home_articles", $articles, 1/24);
}

return $articles;
```

### 缓存计数器

```php
// write 合并模式：多次调用会累加
Cache::write("stats", ["pageViews" => 1], 0);
Cache::write("stats", ["pageViews" => 1], 0);
// 结果: pageViews = 2
// 注意：数组相同键会覆盖，所以用不同的键
Cache::write("stats", ["visit_" . time() => 1], 0);
```

### 缓存 API 响应

```php
function getWeather($city) {
    $cacheKey = "weather_" . $city;
    
    $cached = Cache::read($cacheKey);
    if ($cached !== false && $cached !== null) {
        return $cached;
    }
    
    $data = file_get_contents("https://api.weather.com/" . $city);
    $data = json_decode($data, true);
    
    Cache::overwrite($cacheKey, $data, 1/24); // 1 小时
    return $data;
}
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
