# AbilityBaseObject — 能力基础对象（错误状态机）

- **文件位置**: `kernel/Foundation/Object/AbilityBaseObject.php`
- **命名空间**: `kernel\Foundation\Object`
- **继承**: 继承 `kernel\Foundation\Object\BaseObject`
- **是否可继承**: 是

为"提供功能、能力"的实例类提供一套统一的**错误状态机制**。

**典型流程**：
1. 方法内部遇到失败，用 `break()` **记录错误状态并中断**当前方法（返回 `false`）；
2. 方法末尾用 `return()` 把当前错误状态打包成一个 **Result** 交给调用方；
3. 调用方通过 `isError()` / `getError()` 或 Result 的判态方法消费结果。

**与 Result 的分工**：
- `AbilityBaseObject` 是"实例级错误状态机"，在方法执行过程中**累积并中断**错误；
- `Result` 是"独立值对象"，承载一次调用的**最终结果**，供调用方消费；
- 两者互补：内部用 `break()` 设状态 + 中断，末尾用 `return()` 打包成 Result 输出。

**注意**：纯静态 Service 类不应依赖这套实例错误机制（静态上下文无 `$this`）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$error` | `bool` | `false` | protected | 是否处于错误态 |
| `$errorCode` | `int\|null` | `null` | protected | 错误码 |
| `$errorMessage` | `string\|null` | `null` | protected | 错误信息 |
| `$errorStatusCode` | `int\|null` | `null` | protected | HTTP 响应状态码（仅错误态有效） |
| `$errorDetails` | `mixed` | `null` | protected | 错误详情 |
| `$errorData` | `mixed` | `null` | protected | 错误数据（主体数据） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `setError(...)` | 记录错误状态（protected final） |
| `__get($name)` | 魔术读取：以属性方式访问 protected 错误字段 |
| `__isset($name)` | 魔术 isset 判断，与 `__get` 配套 |
| `break(...)` | 记录错误并中断当前方法（protected final，返回 `false`） |
| `forwardBreak()` | 转发当前已记录的错误并中断（protected final） |
| `getErrorMessage()` | 获取错误信息 |
| `getErrorCode()` | 获取错误码 |
| `getStatusCode()` | 获取错误 HTTP 状态码 |
| `getErrorDetails()` | 获取错误详情 |
| `getErrorData()` | 获取错误数据 |
| `getError()` | 一次性返回全部错误字段 |
| `return()` | 将当前错误状态打包为 Result（final） |
| `isError()` | 是否处于错误态 |
| `reset()` | 重置错误状态 |

## 方法

### `setError($statusCode = 500, $code = 500, $message = "error", $details = [], $data = [])` — 记录错误状态

> protected final。仅供类内部调用（通常由 `break()`/`forwardBreak()` 触发），一般不建议子类直接调用——需要"记录错误并中断"请用 `break()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$code` | `int\|string` | `500` | 响应码 |
| `$message` | `string` | `"error"` | 响应信息 |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 主体数据 |

**返回值**

- `AbilityBaseObject`：返回 `$this` 支持链式调用。

### `__get($name)` — 魔术读取方法

允许外部以属性方式读取 protected 错误字段（如 Controller 中的 `$this->platform->error`）。仅对真实存在的属性生效，访问不存在的属性返回 `null` 而非触发警告。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 属性名 |

**返回值**

- `mixed`：属性值；属性不存在返回 `null`。

### `__isset($name)` — 魔术 isset 判断

与 `__get` 配套，保证 `isset($obj->error)` 等判断行为一致。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 属性名 |

**返回值**

- `bool`：属性存在且非空返回 `true`。

### `break($statusCode = 500, $code = 500, $message = "error", $details = [], $data = [])` — 记录错误并中断

> protected final。记录错误后**始终返回 `false`**，适合 `return $this->break(...)` 一步完成"记录错误 + 中断"。

**第一个参数为 `Result` 时**：会从该 Result 的错误态字段提取错误信息；若该 Result 处于**成功态**（无错误），则不会污染当前错误状态，直接返回 `false`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int\|Result` | `500` | HTTP 状态码，或一个 Result 实例（从错误态提取信息） |
| `$code` | `int\|string` | `500` | 响应码 |
| `$message` | `string` | `"error"` | 响应信息 |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 主体数据 |

**返回值**

- `false`：始终返回 `false`。

**示例**

```php
public function upload()
{
    if (!$ok) {
        return $this->break(500, 500, "服务错误"); // 记录错误并返回 false
    }
    // ...
}
```

### `forwardBreak()` — 转发当前错误并中断

> protected final。适用于"当前实例已记录过错误，需要再次中断流程"——直接转发当前错误字段，避免经 Result 中转。若当前实例尚未设置错误，直接返回 `false`，不构造"空错误"。

**参数**

- 无。

**返回值**

- `false`：始终返回 `false`。

### `getErrorMessage()` — 获取错误信息

**参数**

- 无。

**返回值**

- `string|null`：错误信息；无错误时返回 `null`。

### `getErrorCode()` — 获取错误码

**参数**

- 无。

**返回值**

- `int|string|null`：错误码；无错误时返回 `null`。

### `getStatusCode()` — 获取错误 HTTP 状态码

**参数**

- 无。

**返回值**

- `int|null`：错误 HTTP 状态码；无错误时返回 `null`。

> **注意**：语义上等价于 `Result::errorStatusCode()`（仅错误态有效），**不要**与 `Result::getStatusCode()`（无论成败都返回 responseStatusCode）混淆。

### `getErrorDetails()` — 获取错误详情

**参数**

- 无。

**返回值**

- `mixed`：错误详情；无错误时返回 `null`。

### `getErrorData()` — 获取错误数据

**参数**

- 无。

**返回值**

- `mixed`：错误数据；无错误时返回 `null`。

### `getError()` — 获取聚合错误信息

**参数**

- 无。

**返回值**

- `array|null`：全部错误字段的关联数组（`code` / `message` / `statusCode` / `details` / `data`）；无错误返回 `null`。

### `return()` — 将错误状态打包为 Result

> final。通常在方法末尾调用，把累积的错误状态输出为一个 Result 交给调用方。
> 若当前未处于错误态，返回成功态 Result（`Result::succeeded`），避免构造"假错误"。

**参数**

- 无。

**返回值**

- `Result`：有错误 → 错误态 Result；无错误 → 成功态 Result。

**示例**

```php
public function upload()
{
    if (!$ok) return $this->break(500, 500, "失败");
    // ...
    return $this->return(); // 错误态 → 错误 Result；否则成功 Result
}
```

### `isError()` — 是否处于错误态

**参数**

- 无。

**返回值**

- `bool`：错误态返回 `true`。

### `reset()` — 重置错误状态

清空全部错误字段并回到非错误态，便于复用同一实例进行多次操作。

**参数**

- 无。

**返回值**

- `AbilityBaseObject`：返回 `$this` 支持链式调用。

---

> **继承自 `BaseObject`**：`singleton()` / `make()` / `hasSingleton()` 等实例化能力可用，见《Object/BaseObject》页。
