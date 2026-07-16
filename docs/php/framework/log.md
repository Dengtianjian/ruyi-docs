# Log — 日志记录

Log 提供基于文件的日志记录功能。按年/月目录组织，按日创建日志文件。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Log.php`
- **存储路径**: `Data/Logs/年/月/日.yml`

## 方法列表

### `record($content)`

记录日志。自动按当前日期创建目录和文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$content` | `mixed` | 日志内容，数组会自动转 JSON |

```php
Log::record("用户登录成功");
Log::record(["action" => "login", "userId" => 123, "ip" => "127.0.0.1"]);
Log::record($exception->getMessage());
```

### `read($day = null, $month = null, $year = null)`

读取指定日期的日志。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$day` | `int\|null` | 日（1-31），`null` 为当天 |
| `$month` | `int\|null` | 月（1-12），`null` 为当月 |
| `$year` | `int\|null` | 年，`null` 为当年 |

返回值：`string[]`

```php
// 读取今天的日志
$logs = Log::read();

// 读取指定日期的日志
$logs = Log::read(15, 6, 2024);

// 读取某月的日志文件列表（不传 day）
$files = Log::read(null, 6);

// 读取某年的日志文件夹列表（不传 month 和 day）
$dirs = Log::read(null, null, 2024);
```

## 使用方式

### 基本日志记录

```php
// 记录简单信息
Log::record("应用启动成功");

// 记录数组数据
Log::record([
    "event" => "user.login",
    "userId" => 123,
    "timestamp" => time()
]);

// 记录错误
try {
    // ... 业务代码
} catch (\Exception $e) {
    Log::record("错误: " . $e->getMessage());
    Log::record($e->getTraceAsString());
}
```

### 在中间件中记录请求日志

```php
class RequestLogMiddleware extends Middleware
{
    public function handle(\Closure $next)
    {
        $start = microtime(true);
        
        Log::record([
            "type" => "request",
            "method" => $this->request->method,
            "uri" => $this->request->URI,
            "ip" => \kernel\Foundation\HTTP\Request::realClientIp()
        ]);
        
        $response = $next();
        
        Log::record([
            "type" => "response",
            "duration" => round((microtime(true) - $start) * 1000) . "ms",
            "status" => $response->statusCode()
        ]);
        
        return $response;
    }
}
```

## 日志文件结构

```
Data/Logs/
└── 2024/
    └── 06/
        ├── 01.yml
        ├── 02.yml
        ├── ...
        └── 30.yml
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 启动日志 | 记录应用启动信息 |
| [Middleware](./middleware.md) | 请求日志 | 记录请求/响应信息 |
| [Controller](./controller.md) | 业务日志 | 记录业务操作 |
