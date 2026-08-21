# AbilityBaseObject — 能力基对象

AbilityBaseObject 适用于作为**提供功能、能力类**的基类，在 `BaseObject` 的单例/工厂能力之上，提供了**实例级错误机制**（错误状态 + 错误返回）。

- **命名空间**: `kernel\Foundation\Object`
- **文件位置**: `kernel/Foundation/Object/AbilityBaseObject.php`
- **继承**: `BaseObject`
- **子类**: `kernel\Foundation\Service` 等
- **属性**: `$error`、`$errorCode`、`$errorMessage`、`$errorStatusCode`、`$errorDetails`、`$errorData`（均 `protected`）

> 注意：错误机制为**实例级**（依赖 `$this->`），适用于被实例化使用的能力类。若你的类是**纯静态无状态**调用，应直接返回 `kernel\Foundation\Result`，而非依赖本类错误机制。

## 方法列表

### `setError($statusCode, $code, $message, $return, $details, $data)`

设置错误状态。`protected`。

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$code` | `int\|string` | `500` | 响应码 |
| `$message` | `string` | `"error"` | 错误信息 |
| `$return` | `bool` | `false` | 为 `true` 时直接返回错误 `Result` |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 主体数据 |

返回值：`AbilityBaseObject`（`$return=false`）或 `Result`（`$return=true`）

### `break($statusCode, $code, $message, $details, $data)`

设置错误并返回 `false`，适用于 `return $this->break(...)` 直接中断。`protected`。

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int\|Result` | `500` | HTTP 状态码；传 `Result` 时从其错误信息构建 |
| `$code` | `int\|string` | `500` | 响应码 |
| `$message` | `string` | `"error"` | 错误信息 |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 主体数据 |

返回值：`false`

### `forwardBreak()`

转发错误：等价于 `$this->break($this->return())`。适用于将调用方返回的 `Result` 错误继续向上中断。`protected`。

返回值：`false`

### `getErrorMessage()`

获取错误信息。`public`。返回值：`string`

### `getErrorCode()`

获取错误码。`public`。返回值：`int|string`

### `getStatusCode()`

获取错误 HTTP 状态码。`public`。返回值：`int`

### `getErrorDetails()`

获取错误详情。`public`。返回值：`mixed`

### `getErrorData()`

获取错误数据。`public`。返回值：`mixed`

### `return()`

将当前错误状态打包成 `Result` 返回。`public`。返回值：`kernel\Foundation\Result`

```php
// 调用方拿到错误 Result
$result = $obj->return();
if ($result->isError()) {
    // 处理错误
}
```

## 使用方式

```php
class PaymentService extends AbilityBaseObject
{
    public function charge($amount)
    {
        if ($amount <= 0) {
            return $this->break(422, 422, "金额必须大于 0");
        }
        // ...
        return true;
    }
}
```
