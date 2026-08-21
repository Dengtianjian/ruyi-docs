# ErrorCode — 错误码管理

- **文件位置**: `kernel/Foundation/Exception/ErrorCode.php`
- **命名空间**: `kernel\Foundation\Exception`
- **类型**: 纯静态类
- **是否可继承**: 是

集中管理与复用错误码。通过 `make()` 创建错误码对象、`add()` 注册到库、`load()` 批量加载错误码文件、`match()` 按标识符匹配错误码。错误码对象结构为 `{key, statusCode, code, message}`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$ErrorCodes` | `array` | `[]` | private static | 错误码库，键为错误码标识符（key），值为错误码对象 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `load($filePath)` | 加载错误码文件并注册库中全部错误码 |
| `add($keyOrCodeObject, $statusCode, $code, $message)` | 添加一个错误码到库 |
| `match($key)` | 按标识符匹配错误码对象 |
| `make($key, $statusCode, $code, $message)` | 创建错误码对象 |

## 方法

### `load($filePath)` — 加载错误码文件

加载一个返回错误码对象数组的 PHP 文件，并将其全部错误码注册进错误码库。文件应 `return [ErrorCode::make(...), ErrorCode::make(...), ...]`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 错误码文件的地址 |

**返回值**

- 无。

**异常**

- `Exception`：文件不存在时抛出，错误信息 `"错误码文件不存在"`，HTTP 状态码 `500`，错误码 `500:ErrorCodeFileNotExist`。

**示例**

```php
use kernel\Foundation\Exception\ErrorCode;

ErrorCode::load(APP_PATH . '/ErrorCodes.php');
```

### `add($keyOrCodeObject, $statusCode, $code, $message)` — 添加错误码

将一个错误码注册进库中。若第一个参数为对象（通过 `make()` 创建），则直接取对象的 `key`/`statusCode`/`code`/`message`；否则需分别传入各字段。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$keyOrCodeObject` | `string\|object` | 无 | 错误码标识符，或用 `make()` 创建的错误码对象。为对象时后续参数无需传 |
| `$statusCode` | `int` | `null` | HTTP 状态码 |
| `$code` | `string\|int` | `null` | 错误码 |
| `$message` | `string` | `null` | 错误信息 |

**返回值**

- `true`：恒为 `true`。

### `match($key)` — 匹配错误码

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 错误码标识符 |

**返回值**

- `object`：匹配到的错误码对象，结构为 `{statusCode, code, message}`。

### `make($key, $statusCode, $code, $message)` — 创建错误码对象

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 错误码标识符，用于唯一标识该错误码 |
| `$statusCode` | `int` | 无 | HTTP 状态码 |
| `$code` | `string\|int` | 无 | 错误码 |
| `$message` | `string` | 无 | 错误信息 |

**返回值**

- `object`：错误码对象，结构为 `{key, statusCode, code, message}`。

**示例**

```php
use kernel\Foundation\Exception\ErrorCode;

$codeObject = ErrorCode::make('user.not_found', 404, '404:UserNotFound', '用户不存在');
ErrorCode::add($codeObject);
$matched = ErrorCode::match('user.not_found');
```
