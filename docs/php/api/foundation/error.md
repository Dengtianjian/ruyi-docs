# Error — 框架业务异常类

- **文件位置**: `kernel/Foundation/Error.php`
- **命名空间**: `kernel\Foundation`
- **继承自**: `\Exception`
- **是否可继承**: 是

框架业务异常的基类，替代了原 `kernel\Foundation\Error`，与 `Error` 合并而成。在原生 `Exception` 基础上扩展了 HTTP 状态码、业务错误码、错误详情三个字段，便于统一异常处理与错误响应。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$statusCode` | `int` | `500` | public | HTTP 状态码 |
| `$errorCode` | `int\|string` | `500` | public | 业务错误码 |
| `$errorDetails` | `mixed` | `null` | public | 错误详情，附加的调试或业务数据 |
| `$code` | `int` | `E_USER_ERROR`（构造时设置） | public | 继承自 `\Exception`，构造时固定写为 `E_USER_ERROR` |
| `$message` | `string` | `"Server error"` | public | 错误信息，继承自 `\Exception` |

## 方法

### `__construct($message, $statusCode, $errorCode, $errorDetails)` — 抛出异常

初始化错误信息及各错误字段。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | `"Server error"` | 错误信息 |
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$errorCode` | `int\|string` | `500` | 业务错误码 |
| `$errorDetails` | `mixed` | `null` | 错误详情 |

**返回值**

- 无。

**示例**

```php
use kernel\Foundation\Error;

throw new Error("请求失败", 400, "400:BadRequest");
```
