# ExceptionHandler — 全局异常 / 错误处理器

- **文件位置**: `kernel/Foundation/Exception/ExceptionHandler.php`
- **命名空间**: `kernel\Foundation\Exception`
- **类型**: 纯静态门面（不存储任何实例状态）
- **是否可继承**: 是

专门用于 `set_exception_handler()` 与 `set_error_handler()` 回调注册：

```php
set_exception_handler('kernel\Foundation\Exception\ExceptionHandler::receive');
set_error_handler('kernel\Foundation\Exception\ExceptionHandler::handle', E_ALL);
```

## 设计要点

1. **静态门面是合理设计**：PHP 全局钩子要求字符串 callable，整类静态化是必要约束
2. **不存实例状态**：所有方法均为 static，无构造函数、无 setter，方便 PHP 直接注册
3. **业务字段识别**：仅 `instanceof Error` 时透传 `statusCode/errorCode/errorDetails`，普通 `\Exception` 落到默认 500/500/null
4. **错误级别分类**：
   - 致命集：`E_ERROR / E_CORE_ERROR / E_COMPILE_ERROR / E_USER_ERROR / E_PARSE / E_RECOVERABLE_ERROR`
   - 警告 / 通知集：`E_WARNING / E_CORE_WARNING / E_COMPILE_WARNING / E_USER_WARNING / E_NOTICE / E_USER_NOTICE / E_DEPRECATED / E_USER_DEPRECATED`
5. **receive 永远按致命分支处理**：`receive()` 调 `handle(..., directlyThrow = true)`，不再依赖错误号 0
6. **防死循环**：`handle()` 主体整体 `try/catch`，抛错时降级 `stderr` + `exit(1)`，不会被 PHP 钩子再次回调形成无限递归

## 方法速查表

| 方法 | 可见性 | 作用 |
|------|--------|------|
| `receive(Throwable $exception): void` | public static | 给 `set_exception_handler` 使用，处理未捕异常 |
| `handle(...)` | public static | 给 `set_error_handler` / 内部调用，处理错误信号 |
| `mode()` | private static | 安全获取运行模式（配置未装配兜底 "development"） |
| `isAjax()` | private static | 检测请求是否为 AJAX（App 未装配兜底 `false`） |
| `writeLog(...)` | private static | 写日志（致命走 Log::error，警告走 Log::warning） |
| `respondJson(...)` | private static | AJAX 致命分支：构造 Response 输出 JSON |
| `renderView(...)` | private static | 非 AJAX 致命分支：渲染错误视图或降级纯文本 |

## 方法

### `receive(Throwable $exception): void` — 处理未捕异常

给 `set_exception_handler` 使用。识别 `Error` 实例后透传业务字段，构造 11 字段上下文委托给 `handle(..., directlyThrow = true)`。

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$exception` | `\Throwable` | PHP 异常实例（含 `\Exception` 与 `\Error`） |

**返回值**

- 无（`void`），致命分支会 `exit(1)`，非致命不会进此路径。

**示例**

```php
use kernel\Foundation\Exception\ExceptionHandler;

// 全局注册
set_exception_handler([ExceptionHandler::class, 'receive']);

// 业务代码
throw new Error("用户不存在", 404, "404:UserNotFound", ["uid" => 1]);
// → receive() 透传 404 / 404:UserNotFound 到 handle()，按致命分支输出 + exit
```

### `handle(...)` — 通用错误信号处理

11 个形参：前 5 个对齐 PHP `set_error_handler` 钩子签名；后 6 个由 `receive()` 注入业务字段。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$code` | `int` | `0` | PHP 错误号 / `Throwable::getCode()` |
| `$message` | `string` | `""` | 错误信息 |
| `$file` | `string` | `""` | 源文件 |
| `$line` | `int` | `0` | 行号 |
| `$trace` | `array` | `[]` | 调用栈数组 |
| `$traceString` | `string\|null` | `null` | 格式化后的调用栈 |
| `$previous` | `Throwable\|null` | `null` | 上一个异常 |
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$errorCode` | `int\|string` | `500` | 业务错误码 |
| `$errorDetails` | `mixed` | `null` | 错误详情 |
| `$directlyThrow` | `bool` | `false` | `true` 时强制按致命分支处理 |

**处理流程**

1. **判级**：`$directlyThrow || in_array($code, fatalLevels)` → 致命；`in_array($code, warningLevels)` → 仅日志；其他 → 丢弃
2. **日志**：致命走 `Log::error`，警告走 `Log::warning`，把 `$trace` / `$traceString` / `$previous` 放入 context
3. **致命分支**：
   - AJAX：`respondJson()`，根据 `mode()` 决定 production 仅回 status+message 或非生产回完整 trace+details
   - 非 AJAX：`renderView()` 优先应用 `{App}/Views/error.php`，退回 `kernel/Views/error.php`，再退回纯文本
4. **`exit(1)`**：除非是非致命分支

**返回值**

- 无。致命分支会 `exit(1)`。

**示例**

```php
// 给 set_error_handler 直接传类名 + 方法
set_error_handler([ExceptionHandler::class, 'handle'], E_ALL);
```

## 私有方法（实现细节）

### `mode(): string` — 安全获取运行模式

优先 `Config::get("mode", "development")`；Config 未装配或抛错时降级到 `"development"`。用于 `respondJson()` 的生产 / 调试分支判断。

### 期望 JSON 判定（内联于 `handle()`）

致命分支判断是否输出 JSON：经 `App::getInstance()` → `$app->request()` → `$request->preferredOutputType() === "json"`；任一阶段抛错时降级 `false`。CLI 模式下（无 App 实例）自然返回 `false`，走 `renderView()`。

### `writeLog(...)` — 写日志

调用 `Log::error` 或 `Log::warning`（按致命性），仅 2 个参数：

```
Log::$level("code={$code} file={$file}:{$line} message={$message}", $context);
```

`$context` 是数组，含 `trace` / `traceString` / `previous` 三个键。

### `respondJson(...)` — AJAX 致命分支

- `mode() === "production"`：`Response::error($statusCode, $errorCode, "SERVER_ERROR")`（仅回 状态码）
- 其他模式：携带完整 trace + file + line + details
- `$response->output()` 输出

### `renderView(...)` — 非 AJAX 致命分支

- 优先 `Path::root() . "/Views/error.php"` （应用层）
- 退回 `Path::kernelRoot() . "/Views/error.php"` （内核兜底）
- 都找不到：用 `http_response_code()` + `header("Content-Type: text/plain")` + `echo` 降级输出

## 完整调用链

```
业务 throw new Error(...)
        ↓
PHP 异常机制触发 set_exception_handler
        ↓
ExceptionHandler::receive($exception)
        ↓
拆 Throwable → 提取 Error 实例的 statusCode/errorCode/errorDetails
        ↓
ExceptionHandler::handle(..., directlyThrow = true)
        ↓
判级：directlyThrow → 致命
        ↓
writeLog() → Log::error()
        ↓
isAjax() ?
   ├─ true  → respondJson() → Response::error() → exit(1)
   └─ false → renderView()  → Views/error.php 或纯文本 → exit(1)
```

## 历史变更

- **过去**：单文件 11 形参 + 内嵌 if-else 链；`$DeadlyLevels` 含 `0` 取巧让 receive 命中致命；handler 自身抛错会二次回调死循环
- **现在**：拆 5 个 private 静态方法；明确 fatal/warning 双集；`directlyThrow` 真正承担"按致命处理"职责；防死循环 try/catch

## 相关

- 业务异常基类：[Error](./error.md)
- 错误码注册器：[ErrorCode](./error-code.md)
