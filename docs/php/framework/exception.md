# 异常体系 Exception

框架统一的错误处理与错误码机制，由 **三个类** 协同：

| 类 | 角色 |
|------|------|
| [`Error`](../api/foundation/exception/error.md) | 业务异常基类（构造签名：消息在前） |
| [`ErrorCode`](../api/foundation/exception/error-code.md) | 错误码静态注册器 |
| [`ExceptionHandler`](../api/foundation/exception/exception-handler.md) | 全局异常 / 错误处理器（PHP 钩子专用） |

完整类级 API 参见 [API 参考 · 异常体系](../api/exception.md)。本文从 **使用场景** 角度描述如何抛、如何接、以及如何联动生命周期钩子。

## 业务抛异常

任意位置抛 [`Error`](../api/foundation/exception/error.md)，构造签名 **消息在前**：

```php
use kernel\Foundation\Exception\Error;

throw new Error("用户不存在", 404, "404:UserNotFound", ["uid" => 1]);
```

**快捷方式**：`Error::raise($name, $details)` —— 在已经 `ErrorCode::load()` 后，按错误码 name 直接抛，免去手动构造 4 字段：

```php
Error::raise("USER_NOT_FOUND", ["uid" => $uid]);
```

四字段：

| 参数 | 类型 | 含义 |
|------|------|------|
| `$message` | `string` | 异常消息 |
| `$statusCode` | `int` | HTTP 状态码 |
| `$errorCode` | `int\|string` | 业务错误码（与 `ErrorCode::$errorCode` 对齐） |
| `$errorDetails` | `mixed` | 错误详情，可附 debug / 业务数据 |

## 集中错误码管理

不直接 throw 写魔法字符串，而是先把所有错误码集中到一个配置文件：

```php
// app/Configs/errorCodes.php
use kernel\Foundation\Exception\ErrorCode;

return [
    "USER_NOT_FOUND"    => [404, "404:UserNotFound", "用户不存在"],
    "PERMISSION_DENIED" => [403, "403:Forbidden",    "无权限"],
    ErrorCode::create("INTERNAL_ERROR", 500, "500:ServerError", "服务器错误"),
];
```

加载并用：

```php
use kernel\Foundation\Exception\ErrorCode;
use kernel\Foundation\Exception\Error;

ErrorCode::load($appPath . "/Configs/errorCodes.php");
$c = ErrorCode::find("USER_NOT_FOUND");
throw new Error($c->message, $c->statusCode, $c->errorCode, ["uid" => $uid]);
```

## 全局异常处理器

在 App 启动时（通常在 `Setup/Bootstrap.php`）注册：

```php
set_exception_handler("kernel\\Foundation\\Exception\\ExceptionHandler::receive");
set_error_handler("kernel\\Foundation\\Exception\\ExceptionHandler::handle", E_ALL);
```

`ExceptionHandler::receive(Throwable)` 在异常未捕获时被调，会：

1. 识别 `instanceof Error` 后透传 `statusCode/errorCode/errorDetails`
2. 写日志（`Log::error`）
3. AJAX 请求回 JSON；普通请求渲染 `Views/error.php` 模板
4. `exit(1)` 终止程序

详细处理流程见 [ExceptionHandler 文档](../api/foundation/exception/exception-handler.md)。

## 与生命周期钩子联动

错误信号不仅触发全局处理器，还会按顺序进入 [Lifecycle](./lifecycle.md) 的错误钩子：

```
异常抛出
  ↓
onError()   ← 错误钩子：错误处理（上报监控 / 错误日志）
  ↓
onShutdown() ← 关闭钩子：资源释放 / 执行轨迹
  ↓
全局 ExceptionHandler::receive() ← 输出响应 + exit
```

注册方式：

```php
// Setup/Bootstrap.php
use kernel\Foundation\Lifecycle;
use kernel\Foundation\App;

$lifeCycle = new Lifecycle();
$lifeCycle->onError(function (\Throwable $e) {
    // 上报监控、记录日志等
});
$lifeCycle->onShutdown(function () {
    // 资源清理
});

$this->set(["lifeCycle" => $lifeCycle]);
```

> 详细生命周期机制、钩子顺序、异常时序见 [Lifecycle](./lifecycle.md)。

## 捕获兼容性

- `Error` 继承自 `\Exception`，**所有原生 `catch (\Exception)` 仍生效**
- 例外：在回调内部 `throw Error` 又被 PHP 钩子再捕获时，要确保 catch 的范围在业务层就完成

```php
try {
    externalSdkCall();   // 内部可能 throw \RuntimeException
} catch (\Exception $e) {
    throw new Error("调用失败", 502, "502:UpstreamError", [
        "upstream" => "sdk",
        "original" => $e->getMessage(),
    ]);
}
```

## 与 Result 的区别

框架业务有两种返回风格：

| 风格 | 类型 | 何时用 |
|------|------|--------|
| `Error` 异常 | throw | 抛出中断流程的真正错误 |
| `Result` 结果 | return | 业务结果对象（成功/失败都走正常返回路径） |

`Result` 也支持失败态（见 [Result](./result.md)），但它**不会触发** ExceptionHandler / Lifecycle 错误钩子——只有真的 `throw` 才会。

## 相关

- [API 参考 · Error 业务异常基类](../api/foundation/exception/error.md)
- [API 参考 · ErrorCode 错误码](../api/foundation/exception/error-code.md)
- [API 参考 · ExceptionHandler 全局处理器](../api/foundation/exception/exception-handler.md)
- [API 参考 · 异常体系索引](../api/exception.md)
- [生命周期 Lifecycle（onError / onShutdown）](./lifecycle.md)
- [App 装配入口](./app.md)
- [Result 返回结果（与异常对照）](./result.md)
