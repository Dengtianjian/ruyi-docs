# Error — 框架业务异常基类

- **文件位置**: `kernel/Foundation/Exception/Error.php`
- **命名空间**: `kernel\Foundation\Exception`
- **继承自**: `\Exception`
- **是否可继承**: 是

框架业务异常的基类，**位于 `kernel/Foundation/Exception/` 目录下**（与 `ErrorCode`、`ExceptionHandler` 同级），替代了原 `kernel\Foundation\Exception\Exception` + `RuyiException` 两个等价空壳类。

在原生 `\Exception` 之上扩展了三个业务字段，便于上层做 HTTP 化的统一错误响应：

- `statusCode` —— HTTP 状态码
- `errorCode` —— 业务错误码
- `errorDetails` —— 错误详情

## 设计要点

- **统一构造签名**：`new Error($message, $statusCode, $errorCode, $errorDetails)` —— **消息在前**
- **强制 `code = E_USER_ERROR`**：构造时 `$this->code = E_USER_ERROR`，与 `ExceptionHandler::$fatalLevels` 对齐，确保抛出后被异常处理器识别为致命分支
- **`ExceptionHandler::receive()` 透传业务字段**：仅 `instanceof Error` 时会提取 `statusCode/errorCode/errorDetails`，普通 `\Exception` 会落到 500/500/null 默认值
- **捕获兼容**：`catch (\Exception)`、`catch (Error)` 两种写法都能捕到

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$statusCode` | `int` | `500` | `public` | HTTP 状态码（如 404/500/403） |
| `$errorCode` | `int\|string` | `500` | `public` | 业务错误码（字符串如 `"404:UserNotFound"` 也可） |
| `$errorDetails` | `mixed` | `null` | `public` | 错误详情，可附任意 debug / 业务数据 |
| `$code` | `int` | `E_USER_ERROR` | `public` | 继承自 `\Exception`，构造时硬置 |
| `$message` | `string` | `"Server error"` | `public` | 继承自 `\Exception` |

> **为何 `code` 默认是 `E_USER_ERROR`？** 因为框架的异常处理器 `ExceptionHandler::handle()` 通过 PHP 错误号判定致命分支，业务异常必须按致命处理。

## 方法

### `__construct($message, $statusCode, $errorCode, $errorDetails)` — 抛出异常

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `"Server error"` | 异常消息（**第一位**） |
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$errorCode` | `int\|string` | `500` | 业务错误码（与 `ErrorCode::$errorCode` 对齐） |
| `$errorDetails` | `mixed` | `null` | 错误详情，可附任意 mixed 值 |

**返回值**

- 无。

**示例**

```php
use kernel\Foundation\Exception\Error;
use kernel\Foundation\Exception\ErrorCode;

// 直接抛
throw new Error("用户不存在", 404, "404:UserNotFound", ["uid" => 1]);

// 结合 ErrorCode
ErrorCode::load(dirname(__DIR__) . "/Configs/errorCodes.php");
$c = ErrorCode::find("USER_NOT_FOUND");
throw new Error($c->message, $c->statusCode, $c->errorCode, ["uid" => $uid]);
```

### `raise(string $name, mixed $details = null): never` — 按错误码 name 直接抛

业务层最常用的快捷方式：先用 [`ErrorCode::load()`](./error-code.md) 注册错误码，之后任何位置只要用错误码 name 抛错，框架自动从注册表取出 `message/statusCode/errorCode` 字段构造业务异常，运行时附带的 `$details` 透传给 `errorDetails`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | — | ErrorCode 注册名（如 `"USER_NOT_FOUND"`） |
| `$details` | `mixed` | `null` | 运行期附带的业务上下文，可任意类型 |

**返回值**

- `never`（一定 throw，IDE 可识别为中断流）

**异常**

- name 未注册时抛 `500:ErrorCodeNotExist`（details = name）

**示例**

```php
use kernel\Foundation\Exception\Error;

// 业务代码最简洁的抛错方式
Error::raise("USER_NOT_FOUND", ["uid" => $uid]);
Error::raise("PERMISSION_DENIED");
Error::raise("ORDER_PAID", ["orderId" => $id, "amount" => 99]);
```

**等价于**

```php
$c = ErrorCode::find("USER_NOT_FOUND");
throw new Error($c->message, $c->statusCode, $c->errorCode, ["uid" => $uid]);
```

## 全局捕获

```php
set_exception_handler("kernel\\Foundation\\Exception\\ExceptionHandler::receive");

// 业务代码里：
throw new Error("无权访问", 403, "403:Forbidden");
// → ExceptionHandler::receive 会读取 statusCode=403、errorCode=403:Forbidden，
//   按致命分支输出 AJAX JSON 或渲染错误视图。
```

## 历史变更

- **过去**：`kernel\Foundation\Exception\Exception`（FQCN 太长，强迫 `use` 引入）+ `RuyiException`（空壳子类）
- **现在**：合并为 `kernel\Foundation\Exception\Error`，命名短、与 PHP 全局 `\Exception` 通过命名空间隔离不冲突

## 相关

- 错误码注册器：[ErrorCode](./error-code.md)
- 全局异常处理器：[ExceptionHandler](./exception-handler.md)
