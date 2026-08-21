# Exception 异常体系

- **目录位置**: `kernel/Foundation/Exception/`（保留） · `kernel/Foundation/Error.php`（业务异常基类，独立于目录外）
- **命名空间**: `kernel\Foundation\Error` / `kernel\Foundation\Exception\*`

框架统一异常体系。业务异常基类 `Error` 构造签名**消息在前**：`__construct($message, $statusCode, $errorCode, $errorDetails)`。

## Error — 框架业务异常

- **文件位置**: `kernel/Foundation/Error.php`
- **命名空间**: `kernel\Foundation`
- **继承**: `\Exception`

框架业务异常基类（替代了原 `kernel\Foundation\Exception\Exception`，与原 `RuyiException` 合并）。**注意构造签名**：

```php
new Error($message, $statusCode, $errorCode, $errorDetails)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `$message` | `string` | 异常消息（**第一位**） |
| `$statusCode` | `int` | HTTP 状态码 |
| `$errorCode` | `int\|string` | 业务错误码 |
| `$errorDetails` | `mixed` | 错误详情（可选） |

```php
use kernel\Foundation\Error;

throw new Error("导入文件错误", 500, 500);
throw new Error("无权访问", 403, "403:Forbidden", $details);
```

> 历史：旧版名为 `kernel\Foundation\Exception\Exception`（之后试图拆分为 `RuyiException` 业务语义），现已统一为 `kernel\Foundation\Error`，避免与 PHP 全局 `\Exception` 命名冲突。

## ErrorCode — 错误码常量

- **文件位置**: `kernel/Foundation/Exception/ErrorCode.php`
- **命名空间**: `kernel\Foundation\Exception`

集中定义业务错误码常量，通过静态池自增 / `load(file)` 注入 / `match(key)` 读取。

```php
use kernel\Foundation\Exception\ErrorCode;

ErrorCode::load($appConfigPath . "/errorCodes.php");
throw new Error("用户不存在", 404, ErrorCode::match("USER_NOT_FOUND")->code, ErrorCode::match("USER_NOT_FOUND"));
```

错误码常量集中在配置文件中维护，业务代码通过 `ErrorCode::match($key)` 引用，避免魔法数字。

## ExceptionHandler — 异常处理器

- **文件位置**: `kernel/Foundation/Exception/ExceptionHandler.php`
- **命名空间**: `kernel\Foundation\Exception`

全局异常处理器，由 App 注册。捕获未处理异常、转换为响应、触发生命周期 `onError`。

```php
$handler = new ExceptionHandler($app);
$handler->register();    // 注册 set_exception_handler / set_error_handler
```

### 处理流程

接收任意 `Throwable` → 若 `instanceof Error` 提取 `statusCode` / `errorCode` / `errorDetails` → 判定 PHP 错误级别 → 致命级别 Log + AJAX / 页面分流输出 → exit；非致命级别仅记录日志。
