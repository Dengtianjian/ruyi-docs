# Log — 日志

- **文件位置**: `kernel/Foundation/Log.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

日志记录工具（全静态）。按 `年/月/日.jsonl` 结构写入 `Data/Logs/` 目录，每行一条单行 JSON 日志。支持级别过滤、分页读取、按天清理。

日志级别（数值越大越严重）：`debug(0)` → `info(1)` → `warning(2)` → `error(3)`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$minLevel` | `string\|null` | `null` | static private | 最小记录级别；`null` 表示不限制，全部记录 |
| `$levels` | `array<string, int>` | `["debug"=>0,"info"=>1,"warning"=>2,"error"=>3]` | static private | 级别优先级映射（数值越大越严重） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 构造时检查并创建日志存储根目录 |
| `level($level = null)` | 设置或读取最小记录级别 |
| `record($content, $level = "info")` | 记录一条日志 |
| `info($message, $context = [])` | 记录 info 级别日志 |
| `warning($message, $context = [])` | 记录 warning 级别日志 |
| `error($message, $context = [])` | 记录 error 级别日志 |
| `debug($message, $context = [])` | 记录 debug 级别日志 |
| `read($day = null, $month = null, $year = null)` | 读取日志（目录列表 / 日志文件列表 / 当日日志） |
| `page($page = 1, $pageSize = 20, $day = null, $month = null, $year = null)` | 分页读取指定日期日志 |
| `cleanup($days = 30)` | 清理指定天数前的日志文件（含空目录回收） |

## 方法

### `__construct()` — 构造方法

检查并创建日志存储根目录（`Data/Logs`）。仅当根目录可确定时创建；不可确定时静默跳过。

**参数**

- 无。

**返回值**

- 无。

### `level($level = null)` — 设置或读取最小记录级别

低于该级别的日志将被忽略（`record()` 返回 `false`）。传 `null`（或不传参数）时读取当前级别；初始为 `null` 表示不限制。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$level` | `string\|null` | `null` | 级别：`debug` / `info` / `warning` / `error`；`null` 时仅读取当前最小级别 |

**返回值**

- `string|null`：当前最小记录级别。

**示例**

```php
Log::level("error");       // 只记录 error 及更严重级别
Log::level();              // 读取当前最小级别 → "error"
Log::level(null);          // 恢复不限制
```

### `record($content, $level = "info")` — 记录一条日志

根据当前年/月创建目录，以日创建 `.jsonl` 文件，每行一条单行 JSON：`{"time":"Y-m-d H:i:s","level":"info","content":...}`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$content` | `mixed` | 无 | 记录内容；数组/对象自动转 JSON；`Throwable` 转成 `message`+`file`+`trace` 结构化数据 |
| `$level` | `string` | `"info"` | 日志级别：`debug` / `info` / `warning` / `error` |

**返回值**

- `bool`：是否写入成功（被级别过滤忽略时返回 `false`）。

**示例**

```php
Log::record("用户登录成功");
Log::record(["action" => "login", "uid" => 1], "warning");
```

### `info($message, $context = [])` — 记录 info 级别日志

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `mixed` | 无 | 日志消息 |
| `$context` | `array` | `[]` | 附加上下文，会自动并入日志内容 |

**返回值**

- `bool`：是否写入成功。

### `warning($message, $context = [])` — 记录 warning 级别日志

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `mixed` | 无 | 日志消息 |
| `$context` | `array` | `[]` | 附加上下文，会自动并入日志内容 |

**返回值**

- `bool`：是否写入成功。

### `error($message, $context = [])` — 记录 error 级别日志

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `mixed` | 无 | 日志消息 |
| `$context` | `array` | `[]` | 附加上下文，会自动并入日志内容 |

**返回值**

- `bool`：是否写入成功。

### `debug($message, $context = [])` — 记录 debug 级别日志

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `mixed` | 无 | 日志消息 |
| `$context` | `array` | `[]` | 附加上下文，会自动并入日志内容 |

**返回值**

- `bool`：是否写入成功。

### `read($day = null, $month = null, $year = null)` — 读取日志

参数组合决定返回结构：

- 三个参数均不传：当年月份目录列表
- 只传 `$year`：该年月份目录列表
- 传 `$year` + `$month`（不传 `$day`）：该月日志文件列表
- 全部传入：该日逐条解析后的日志（每项含 `time` / `level` / `content`）

兼容读取旧版 `.yml` 文件（`"时间: 内容"` 行格式）。非法日期或未来日期返回空数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$day` | `int\|null` | `null` | 日（1-31）；`null` 表示不指定到日（返回该月日志文件列表） |
| `$month` | `int\|null` | `null` | 月（1-12）；`null` 表示不指定到月（返回该年月份目录列表） |
| `$year` | `int\|null` | `null` | 年；`null` 为当年 |

**返回值**

- `array`：月份目录列表 / 日志文件列表 / 当日日志条目列表。

**示例**

```php
Log::read();                    // 当年月份目录列表
Log::read(null, 8, 2026);       // 2026 年 8 月的日志文件列表
Log::read(14, 8, 2026);         // 2026-08-14 当日全部日志
```

### `page($page = 1, $pageSize = 20, $day = null, $month = null, $year = null)` — 分页读取日志

基于 `read()` 读取当日全部日志后按页码切片，返回包含列表与分页信息的结果数组。日期行为与 `read()` 一致（`$day` 为 `null` 时取当天，`$month` 为 `null` 时取当月，`$year` 为 `null` 时取当年）。页码或每页条数小于 1 时按 1 处理；当日无日志时返回空的 `list` 与 `totalPages=0`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$page` | `int` | `1` | 页码，从 1 开始 |
| `$pageSize` | `int` | `20` | 每页条数 |
| `$day` | `int\|null` | `null` | 日（1-31），`null` 为当天 |
| `$month` | `int\|null` | `null` | 月（1-12），`null` 为当月 |
| `$year` | `int\|null` | `null` | 年，`null` 为当年 |

**返回值**

- `array`：分页结果，含 `list` / `total` / `page` / `pageSize` / `totalPages`。

### `cleanup($days = 30)` — 清理日志

清理指定天数前的日志文件（含空目录回收）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$days` | `int` | `30` | 保留天数（清理 `$days` 天之前的日志） |

**返回值**

- `int`：清理的文件数量。
