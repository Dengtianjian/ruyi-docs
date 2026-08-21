# ExceptionHandler — 异常处理器

- **文件位置**: `kernel/Foundation/Exception/ExceptionHandler.php`
- **命名空间**: `kernel\Foundation\Exception`
- **类型**: 纯静态类
- **是否可继承**: 是

统一处理框架错误与异常。区分日志记录、致命错误响应（AJAX JSON / 页面渲染）等场景。非致命错误仅记录日志；致命错误按请求类型输出响应并终止进程。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `handle($code, $message, $file, $line, $trace, $traceString, $previous, $statusCode, $errorCode, $errorDetails, $directlyThrow)` | 处理错误/异常 |
| `receive($exception)` | 接收 `Exception` 实例并处理 |

## 方法

### `handle($code, $message, $file, $line, $trace, $traceString, $previous, $statusCode, $errorCode, $errorDetails, $directlyThrow)` — 处理错误/异常

参数与原生抛出的 `Exception` 类一致。逻辑分三步：

1. **日志记录**：错误码在需记录的错误级别中（含致命性错误级别）或 `$directlyThrow` 为真时，写入日志。
2. **致命错误响应**：错误码在致命性错误级别中时，按请求类型输出响应：
   - AJAX 请求：返回 `Response::error(...)` 的 JSON，生产模式固定错误信息为 `"SERVER_ERROR"`，非生产模式携带完整错误详情。
   - 非 AJAX 请求：优先渲染应用 `{App}/Views/error.php`，否则渲染内核 `kernel/Views/error.php` 兜底页面。
   - 响应输出后 `exit`。
3. **非致命错误**：仅记录日志，不中断执行。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$code` | `int` | `0` | 异常码/错误级别，如 `E_ERROR`/`E_USER_ERROR` |
| `$message` | `string` | `""` | 异常信息 |
| `$file` | `string` | `""` | 异常所在文件 |
| `$line` | `int` | `null` | 异常所在文件的行数 |
| `$trace` | `string` | `""` | 异常堆栈 |
| `$traceString` | `string` | `NULL` | 异常堆栈的字符串信息 |
| `$previous` | `Throwable` | `null` | 前一个 `Throwable` |
| `$statusCode` | `int` | `500` | HTTP 响应状态码 |
| `$errorCode` | `int\|string` | `500` | 响应错误码 |
| `$errorDetails` | `mixed` | `null` | 响应错误详情 |
| `$directlyThrow` | `bool` | `false` | 为 `true` 时强制记录日志，无需判断错误级别 |

**返回值**

- 无。

### `receive($exception)` — 接收并处理异常

接收 PHP `Exception` 实例（含继承自 `Exception` 的类）。若异常是 `Error`，则提取其 `statusCode`/`errorCode`/`errorDetails` 用于错误响应；随后提取异常各字段并委托给 `handle()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$exception` | `\Exception` | 无 | PHP 的 `Exception` 及其子类实例 |

**返回值**

- 无。

**示例**

```php
use kernel\Foundation\ErrorHandler;

try {
    // ...
} catch (\Throwable $e) {
    ExceptionHandler::receive($e);
}
```
