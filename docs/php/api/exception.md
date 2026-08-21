# Exception 异常体系

- **目录位置**: `kernel/Foundation/Exception/`
- **命名空间**: `kernel\Foundation\Exception\*`

框架统一异常体系，包含 **3 个类**：

| 类 | 角色 |
|------|------|
| [`Error`](./foundation/exception/error.md) | 业务异常基类（extends `\Exception`，3 字段 `statusCode/errorCode/errorDetails`） |
| [`ErrorCode`](./foundation/exception/error-code.md) | 错误码静态注册器（真类 + 静态门面） |
| [`ExceptionHandler`](./foundation/exception/exception-handler.md) | 全局异常 / 错误处理器（纯静态门面，给 PHP 钩子用） |

业务异常基类 `Error` 构造签名**消息在前**：`__construct($message, $statusCode, $errorCode, $errorDetails)`。

## 全链路示意

```
业务 throw new Error(...)
        ↓
PHP 异常机制触发 set_exception_handler 回调
        ↓
ExceptionHandler::receive($exception)
        ↓
透传 Error 字段 statusCode/errorCode/errorDetails 到 handle()
        ↓
ExceptionHandler::handle(..., directlyThrow = true)
        ↓
判级致命：Log::error()
        ↓
isAjax() ?
   ├─ true  → Response::error() → exit(1)
   └─ false → Views/error.php 或纯文本 → exit(1)
```

## 三类协作关系

### Error（业务异常基类）

直接构造：

```php
use kernel\Foundation\Exception\Error;

throw new Error("用户不存在", 404, "404:UserNotFound", ["uid" => 1]);
```

按错误码 name 快捷抛（推荐，需先 `ErrorCode::load()`）：

```php
Error::raise("USER_NOT_FOUND", ["uid" => $uid]);
```

详见 [Error 文档](./foundation/exception/error.md)。

### ErrorCode（错误码注册器）

```php
use kernel\Foundation\Exception\ErrorCode;

ErrorCode::load($appConfigPath . "/Configs/errorCodes.php");
$c = ErrorCode::find("USER_NOT_FOUND");          // ← find (不是 match)
throw new Error($c->message, $c->statusCode, $c->errorCode);  // ← errorCode (不是 code)
```

详见 [ErrorCode 文档](./foundation/exception/error-code.md)。

### ExceptionHandler（全局处理器）

```php
// 直接给 PHP 钩子用，整类静态化
set_exception_handler('kernel\Foundation\Exception\ExceptionHandler::receive');
set_error_handler('kernel\Foundation\Exception\ExceptionHandler::handle', E_ALL);
```

详见 [ExceptionHandler 文档](./foundation/exception/exception-handler.md)。

## 关键约定

1. **消息在前**：`new Error($message, $statusCode, $errorCode, $errorDetails)` —— 仿 Laravel/Lumen 风格
2. **`code = E_USER_ERROR`** 强制：构造时硬置，确保被 PHP 异常处理器识别
3. **camelCase 命名**：ErrorCode 已统一 `register / find / create / name / errorCode / statusCode`
4. **同一目录**：三个类统一在 `kernel/Foundation/Exception/`，通过命名空间 `kernel\Foundation\Exception\*` 引用
5. **静态门面是合理设计**：ExceptionHandler 不存实例状态，因为要直接喂给 `set_error_handler` 这种字符串 callable
6. **快捷抛错 `Error::raise($name, $details)`**：在 `ErrorCode::load()` 之后，业务代码用一行抛错替代手动构造 4 字段；详见 Error 类文档
