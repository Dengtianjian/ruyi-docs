# Log — 日志记录

Log 提供基于文件的日志记录功能。按年/月目录组织，按日创建日志文件；支持级别过滤、结构化的异常记录、旧版本文件兼容读取与定时清理。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Log.php`
- **存储路径**: `Data/Logs/年/月/日.jsonl`（根目录为 `Path::data()/Logs`，由 `Path::data()` 自动推导；实例化 Log 时自动创建根目录）
- **文件格式**: JSON Lines，每行一条单行 JSON：`{"time":"...","level":"...","content":...}`
- **调用方式**: 全部为静态方法，直接 `Log::xxx()` 调用

## 特性

- **按年月日分目录**：自动创建 `年/月/` 目录（`0755`）、按日生成 `日.jsonl` 文件（`0644`）
- **级别过滤**：可设置最小记录级别，低于该级别的日志直接丢弃（`record` 返回 `false`），不落盘
- **并发安全**：写入使用 `file_put_contents(..., FILE_APPEND | LOCK_EX)`，追加 + 排他锁，多请求/多进程同时写不会互相覆盖、不会产生半个 JSON 行
- **结构化内容**：数组/对象自动转 JSON，`Throwable` 自动提取 `message` / `file:line` / `trace`
- **中文直读**：JSON 使用 `JSON_UNESCAPED_UNICODE` 编码，中文日志以原文存储，可直接查看
- **健壮编码**：非法 UTF-8 字节自动替换为 `U+FFFD`（`JSON_INVALID_UTF8_SUBSTITUTE`），保证 `json_encode` 永不失败；极端情况兜底转字符串
- **兼容旧版**：可读取旧版 `.yml` 日志文件（`"时间: 内容"` 行格式）

## 日志级别

级别系统由 4 个级别组成，按严重程度递增：

| 级别 | 优先级 | 说明 |
|------|--------|------|
| `debug` | 0 | 调试信息，开发阶段使用 |
| `info` | 1 | 常规信息（默认级别） |
| `warning` | 2 | 警告，不影响主流程但值得关注 |
| `error` | 3 | 错误，业务异常或失败 |

优先级数值仅用于内部比较（`数值越大越严重`），不会写入日志文件——文件中记录的是级别名称字符串。

### 过滤规则

- 未设置最小级别（初始状态）时**全部记录**，不做任何过滤
- 设置了最小级别后，**优先级低于**最小级别的日志被丢弃（`record` 返回 `false`，不写文件）
- 过滤只针对已知的 4 个级别；**传入未知级别字符串时不受过滤，总是写入**（见下方"注意事项"）

过滤效果速查表（✓ 写入 / ✗ 丢弃）：

| 最小级别 | `debug` | `info` | `warning` | `error` |
|----------|---------|--------|-----------|---------|
| `debug`（或未设置） | ✓ | ✓ | ✓ | ✓ |
| `info` | ✗ | ✓ | ✓ | ✓ |
| `warning` | ✗ | ✗ | ✓ | ✓ |
| `error` | ✗ | ✗ | ✗ | ✓ |

## 方法列表

### `record($content, $level = "info")`

核心记录方法，其余快捷方法（`info`/`warning`/`error`/`debug`）最终都调用它。自动按当前日期创建目录和文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$content` | `mixed` | 日志内容（见下方"内容类型处理"） |
| `$level` | `string` | 日志级别：`debug` / `info` / `warning` / `error`，默认 `info` |

返回值：`bool` — 写入成功返回 `true`；被级别过滤或写入失败（如磁盘错误）返回 `false`

**内容类型处理**：

| 类型 | 处理方式 |
|------|----------|
| 字符串 / 数字 | 直接作为 `content` 存储 |
| 数组 / 对象 | 自动 `json_encode` 为 JSON 对象存储，读取时还原为数组 |
| `Throwable` | 自动转换为结构体：`{"message": ..., "file": "文件:行号", "trace": ...}`（trace 为 `getTraceAsString()` 多行字符串） |
| 其他无法 JSON 化的值（如资源、闭包） | 兜底调用 `strval()` 转为字符串 |

```php
Log::record("用户登录成功");                       // content 为字符串
Log::record(["action" => "login", "userId" => 123]); // content 为 JSON 对象
Log::record($exception);                          // content 为 message/file/trace 结构体
```

### 级别快捷方法（info / warning / error / debug）

按级别记录日志的快捷方法，支持附加上下文。本质是 `record(组装后的内容, 对应级别)`。

四个方法签名一致，仅记录级别不同：

| 参数 | 类型 | 说明 |
|------|------|------|
| `$message` | `mixed` | 日志消息 |
| `$context` | `array` | 附加上下文，**有值时**内容结构变为 `{"message": ..., "context": ...}` |

返回值：`bool`（同 `record`）

**上下文合并规则**：`$context` 为空（`empty($context)` 为真，即空数组、`null`、`0`、`""`）时，内容就是 `$message` 本身；否则内容为 `{"message": ..., "context": ...}` 两层结构。

```php
// 无上下文时内容保持简单结构
Log::info("应用启动成功"); // content = "应用启动成功"
```

#### `info($message, $context = [])`

记录 `info` 级别日志（优先级 1）。适合常规业务信息。

```php
Log::info("SQL executed", ["query" => $query, "time_ms" => 1.2]);
```

#### `warning($message, $context = [])`

记录 `warning` 级别日志（优先级 2）。适合不阻塞主流程但值得关注的问题。

```php
Log::warning("慢查询: $query", ["time" => $time]);
```

#### `error($message, $context = [])`

记录 `error` 级别日志（优先级 3）。适合业务异常或操作失败。

```php
Log::error("支付失败", ["orderId" => 10086]);
```

#### `debug($message, $context = [])`

记录 `debug` 级别日志（优先级 0）。适合开发阶段的调试信息，生产环境可用 `level()` 过滤。

```php
Log::debug("请求头", $request->headers);
```

### `level($level = null)`

设置或读取最小记录级别。低于该级别的日志会被忽略（`record` 返回 `false`）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$level` | `string\|null` | 级别：`debug` / `info` / `warning` / `error`；传 `null`（或不传）时读取当前级别 |

返回值：`string|null` — 当前最小级别（`null` 表示不限制）

调用语义：

- **设置**：传入级别字符串（任意字符串均接受，不做合法性校验）→ 返回设置后的值
- **读取**：传 `null` 或省略参数 → 返回当前最小级别

```php
// 生产环境：只记录 warning 及以上
Log::level("warning");

// 读取当前级别
$current = Log::level(); // "warning"
```

> **注意**：设置后**无法通过传 `null` 恢复"不限制"**——因为 `null` 参数语义是"读取"。进程生命周期内如需放宽，只能设置一个更低的级别（如 `Log::level("debug")`）。

### `read($day = null, $month = null, $year = null)`

读取日志。返回结构根据参数组合变化，详见下表。

| 参数组合 | 返回值 |
|---------|--------|
| 全部为 `null` | 当年月份目录列表（如 `["01","02",...,"08"]`） |
| 只传 `$year` | 该年月份目录列表 |
| 传 `$year` + `$month` | 该月日志文件列表（如 `["01.jsonl","02.jsonl",...]`） |
| 三个全传 | 该日日志数组，每项含 `time` / `level` / `content` |

目录/文件列表为**纯名称数组**（不含路径、不含 `.`/`..`），按系统默认升序返回。

其他行为：

- `$year` 为 `null` 时取当前年；`$month` 为 `null` 但 `$day` 非 `null` 时，月份取**当月**（即 `read(15, null, 2026)` 读取当月 15 日）
- 年/月目录不存在 → 返回空数组
- **未来日期**（日期时间戳晚于当前时刻）或**非法日期**（月不在 1-12、日不在 1-31、`strtotime` 失败）→ 返回空数组
- 当日 `.jsonl` 文件不存在时，自动尝试同名 `.yml`（旧版格式）；都不存在 → 返回空数组

```php
// 读取今天的日志
$logs = Log::read(date("d"), date("m"), date("Y"));
// $logs = [["time" => "2026-08-14 09:25:30", "level" => "info", "content" => "..."]]

// 读取指定日期的日志
$logs = Log::read(15, 6, 2024);

// 读取某月的日志文件列表（不传 day）
$files = Log::read(null, 6, 2024);
// $files = ["01.jsonl", "02.jsonl", ..., "30.jsonl"]

// 读取某年的日志文件夹列表（不传 month 和 day）
$dirs = Log::read(null, null, 2024);
// $dirs = ["01", "02", ..., "12"]
```

**逐条解析规则**（对应单日日志）：

逐行读取文件（跳过空行），对每一行按以下顺序尝试解析：

| 行内容 | 解析结果 |
|--------|----------|
| JSON 行（解码为数组且含 `time` + `content` 键） | 原样返回该数组（`level` 一并保留） |
| 旧格式 `Y-m-d H:i:s: 内容` | `{"time": ..., "level": "info", "content": ...}` |
| 其他无法解析的行 | `{"content": 整行原文}` |

```php
// 文件中一行：
// {"time":"2026-08-14 09:25:30","level":"error","content":{"message":"支付失败","file":"/app/App/Controller/Pay.php:88","trace":"#0 ..."}}
// 解析后（content 自动还原为数组）：
// ["time" => "2026-08-14 09:25:30", "level" => "error", "content" => ["message" => ..., "file" => ..., "trace" => ...]]
```

### `page($page = 1, $pageSize = 20, $day = null, $month = null, $year = null)`

分页读取指定日期的日志内容。基于 `read()` 读取当日全部日志后按页码切片，返回分页结果数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$page` | `int` | 页码，从 1 开始，默认 1 |
| `$pageSize` | `int` | 每页条数，默认 20 |
| `$day` | `int\|null` | 日（1-31），`null` 为当天 |
| `$month` | `int\|null` | 月（1-12），`null` 为当月 |
| `$year` | `int\|null` | 年，`null` 为当年 |

返回值：`array` 分页结果，含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `list` | `array` | 当前页日志（每项含 `time` / `level` / `content`） |
| `total` | `int` | 当日日志总条数 |
| `page` | `int` | 当前页码（与传入一致） |
| `pageSize` | `int` | 每页条数 |
| `totalPages` | `int` | 总页数（当日无日志时为 0） |

日期行为与 `read()` 一致：`$day` 为 `null` 时取当天，`$month` 为 `null` 时取当月，`$year` 为 `null` 时取当年；未来日期或非法日期返回空的 `list`（`total` / `totalPages` 均为 0）。页码或每页条数小于 1 时按 1 处理。

```php
// 读取今天日志第 1 页（每页 20 条）
$result = Log::page();
// $result = ["list" => [...], "total" => 56, "page" => 1, "pageSize" => 20, "totalPages" => 3]

// 读取 2024-06-15 的日志第 2 页，每页 10 条
$result = Log::page(2, 10, 15, 6, 2024);

// 翻页渲染
foreach ($result["list"] as $log) {
    echo $log["time"] . " [" . $log["level"] . "] " . json_encode($log["content"]) . "\n";
}
echo "第 {$result['page']} / {$result['totalPages']} 页，共 {$result['total']} 条";
```

### `cleanup($days = 30)`

清理指定天数前的日志文件（含空目录回收），返回清理的文件数量。适合配合定时任务每日执行。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$days` | `int` | 保留天数，默认 30；负数/非数字按 `0` 处理 |

清理逻辑：

- 计算截止时间 `cutoff = 当前时间 - $days 天`
- 扫描 `Logs/*/*/*` 下所有文件，按路径解析出年/月/日
- **文件对应日期 < cutoff**（严格小于）时删除；日期解析失败的文件跳过
- 删除完成后回收空目录（先回收空月目录，再回收空年目录）

```php
Log::cleanup(30); // 清理 30 天前的日志
Log::cleanup(0);  // 保留 0 天：删除今天及之前的所有日志
```

> **注意**：`cleanup(0)` 会删除今天（含）之前的所有文件——"保留 0 天"意味着只保留未来日志（即全部清理）。

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

// 记录错误（自动提取 message/file/trace）
try {
    // ... 业务代码
} catch (\Exception $e) {
    Log::error("业务出错", ["message" => $e->getMessage()]);
}
```

### 在中间件中记录请求日志

```php
class RequestLogMiddleware extends MiddlewareBase
{
    public function handle(\Closure $next)
    {
        $start = microtime(true);

        Log::info("收到请求", [
            "method" => $this->request->method,
            "uri" => $this->request->URI,
            "ip" => \kernel\Foundation\HTTP\Request::realClientIp()
        ]);

        $response = $next();

        Log::info("响应完成", [
            "duration" => round((microtime(true) - $start) * 1000) . "ms",
            "status" => $response->statusCode()
        ]);

        return $response;
    }
}
```

### 按环境调整日志级别

```php
// 开发环境记录全部，生产环境只记录 warning 及以上
if (Config::get("app.env") === "production") {
    Log::level("warning");
}
```

### 定时清理旧日志

配合 `schedule:run` 每日执行（见 [schedule:run](./commands/schedule-run)）：

```php
// Crons/CleanupLogsTask.php
class CleanupLogsTask
{
    protected $schedule = "h3"; // 每天 3 点

    public function handle($console)
    {
        $removed = \kernel\Foundation\Log::cleanup(30);
        $console->line("清理过期日志 {$removed} 个文件。");
    }
}
```

## 日志文件结构

```
Data/Logs/
└── 2026/
    └── 08/
        ├── 01.jsonl
        ├── 02.jsonl
        ├── ...
        └── 30.jsonl
```

单条日志内容示例（为便于阅读做格式化展示，**实际写入文件时每条日志为单行 JSON**）：

```json
{
  "time": "2026-08-14 09:25:30",
  "level": "info",
  "content": "用户登录成功"
}
```

对应文件中的真实存储：

```
{"time":"2026-08-14 09:25:30","level":"info","content":"用户登录成功"}
```

带上下文的日志示例（快捷方法 + 非空 `$context` 时，格式化展示）：

```json
{
  "time": "2026-08-14 09:25:31",
  "level": "warning",
  "content": {
    "message": "慢查询: SELECT * FROM orders",
    "context": {
      "time": 230
    }
  }
}
```

异常日志示例（`record` 传入 `Throwable` 时，格式化展示）：

```json
{
  "time": "2026-08-14 09:25:32",
  "level": "error",
  "content": {
    "message": "SQLSTATE[HY000]: Connection refused",
    "file": "/app/kernel/Foundation/Database/Connection.php:156",
    "trace": "#0 /app/kernel/Foundation/Database/Connection.php(120): ..."
  }
}
```

**文件写入细节**：

- 每条日志一行，以换行符结尾；追加写入（`FILE_APPEND`）+ 排他锁（`LOCK_EX`）
- JSON 编码：`JSON_UNESCAPED_UNICODE`（中文不转义）+ `JSON_INVALID_UTF8_SUBSTITUTE`（非法 UTF-8 替换为 `U+FFFD`）
- 目录权限 `0755`，文件权限 `0644`

## 注意事项

1. **`level(null)` 是读取不是重置**：设置过级别后无法用 `null` 恢复"不限制"；需要放宽时设置为更低级别。
2. **未知级别绕过过滤**：`record("...", "verbose")` 之类的未知级别字符串不受最小级别限制，总是写入。
3. **未来日期读不到日志**：`read()` 对晚于当前时刻的日期返回空数组（防止误读尚未发生的数据）。
4. **`cleanup(0)` 全删**：保留 0 天会删除今天及之前的全部日志文件，使用前确认。
5. **`$context` 判空**：快捷方法的上下文合并使用 `empty()` 判定——传 `null`、`0`、`""` 同样视为"无上下文"，消息原样存储。
6. **存储路径不可配置**：根目录固定为 `Path::data()/Logs`（未赋值时退化为相对路径），无配置项可修改。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 启动日志 | 记录应用启动信息 |
| [Middleware](./middleware.md) | 请求日志 | 记录请求/响应信息 |
| [Controller](./controller.md) | 业务日志 | 记录业务操作 |
| [ExceptionHandler](./exception-handler.md) | 异常日志 | 记录未捕获异常 |
| [schedule:run](./commands/schedule-run.md) | 定时清理 | 配合 `cleanup()` 每日清理过期日志 |
