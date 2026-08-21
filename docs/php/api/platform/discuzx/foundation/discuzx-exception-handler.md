# DiscuzXExceptionHandler — Discuz!X 异常处理类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXExceptionHandler.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: 无（静态工具类）
- **是否可继承**: 否

Discuz!X 平台的统一异常与错误处理类。作为全局 `set_exception_handler` 与 `set_error_handler` 的处理目标，负责按错误级别记录日志，并根据是否为 AJAX 请求输出 JSON 错误响应或渲染错误视图。

## 常量（错误级别）

类内定义两组错误级别常量（非类常量，为方法内局部数组）：

- `$ErrorLevels`：写入日志的错误级别（含致命性级别）：`E_ERROR, E_USER_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE, E_CORE_WARNING, E_COMPILE_WARNING, E_WARNING`
- `$DeadlyLevels`：致命性错误级别：`E_ERROR, E_USER_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE`

## 方法

### `handle` — 处理错误

```php
public static function handle(
  $code = 0,
  $message = "",
  $file = "",
  $line = null,
  $trace = "",
  $traceString = NULL,
  $previous = null,
  $statusCode = 500,
  $errorCode = 500,
  $errorDetails = null,
  $directlyThrow = false
)
```

接收参数与 PHP 原生错误处理回调一致。

**参数**

- `$code`（int）：错误码（`E_*`）
- `$message`（string）：错误信息
- `$file`（string）：错误所在文件
- `$line`（int）：错误行号
- `$trace`：错误堆栈
- `$traceString`：堆栈字符串（按 `PHP_EOL` 拆分为数组）
- `$previous`：前一个 Throwable
- `$statusCode`（int）：HTTP 状态码，默认 `500`
- `$errorCode`（int）：响应错误码，默认 `500`
- `$errorDetails`（mixed）：响应详情
- `$directlyThrow`（bool）：是否直接抛出（忽略错误级别判断）

**逻辑**

1. `$directlyThrow` 或错误码属于致命级别时：
   - 通过 `Log::record` 记录错误日志。
   - 若 `getApp()` 存在且请求为 AJAX：构造 `Response`，生产模式返回 `SERVER_ERROR`，否则返回错误详情（含 code/message/file/line/trace/previous），`json()->output()` 后 `exit`。
   - 否则：构造 `ResponseView("error")` 渲染内核 `Views/error.php`，传入错误信息，`output()` 后 `exit`。
2. 非致命错误（如 `E_NOTICE` 等）不处理。

### `receive` — 接收异常对象

```php
public static function receive($exception)
```

- `$exception`（\Exception）：捕获到的异常对象

作为 `set_exception_handler` 回调。从异常对象提取 `statusCode`/`errorCode`/`errorDetails`（若为内核 `Exception`），并取得 `code`/`message`/`file`/`line`/`trace`/`traceString`/`previous`，以 `$directlyThrow = true` 调用 `handle()`。

## 使用

`DiscuzXApp` 构造时自动注册：

```php
\set_exception_handler("kernel\Platform\DiscuzX\Foundation\DiscuzXExceptionHandler::receive");
\set_error_handler("kernel\Platform\DiscuzX\Foundation\DiscuzXExceptionHandler::handle", E_ALL);
```
