# Result — 调用结果对象

- **文件位置**: `kernel/Foundation/Result.php`
- **命名空间**: `kernel\Foundation`
- **继承**: `extends Response`（`kernel\Foundation\HTTP\Response`）
- **是否可继承**: 是

被调用方返回调用结果时，将「业务结果数据 + HTTP 响应」合二为一：成功携带数据，失败携带错误码/错误信息/错误详情。继承自 `Response`，可原样 `return` 给控制器透传输出。

**判断成败**：用 `isError()` / `isSuccess()`，勿用无条件返回的 `getStatusCode()` 等。

## 属性

| 属性 | 类型 | 可见性 | 说明 |
|------|------|--------|------|
| `$responseData` | `mixed` | protected（继承） | 主体数据。成功态为业务数据；错误态为错误时的主体数据 |
| `$responseStatusCode` | `int` | protected（继承） | HTTP 状态码，错误态为错误状态码 |
| `$responseCode` | `int\|string` | protected（继承） | 响应/业务码，错误态为错误码 |
| `$responseMessage` | `string` | protected（继承） | 响应/错误消息 |
| `$responseDetails` | `mixed` | protected（继承） | 错误详情，仅开发模式输出 |
| `$error` | `bool` | protected（继承） | 是否错误态（`true` 为失败） |

> 以上属性多数经方法访问，`__construct` 通过 `$this->responseData = $result` 直接写入主体数据。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 构造：写主体数据，`$errorStatusCode > 299` 进入错误态 |
| `succeeded()` | 静态工厂：创建成功结果 |
| `failed()` | 静态工厂：创建失败结果（强制错误态） |
| `result()` | 返回主体数据（无论成败） |
| `isError()` / `isSuccess()` | 判断成败 |
| `withData()` / `withMessage()` | 链式追加数据 / 改消息 |
| `errorMessage()` / `errorStatusCode()` / `errorCode()` / `errorDetails()` | 读取错误信息（仅错误态有值） |
| `throwError()` / `throwErrorIf()` | 错误态抛异常 |
| `getStatusCode()` / `getCode()` / `getMessage()` | 读取状态码/响应码/消息（无论成败） |
| `getData()` / `hasData()` / `getResult()` | 读取/判断主体数据 |
| `getBody()` / `toArray()` / `toJson()` | 序列化输出 |

---

## `__construct()` — 构造

> 直接 `new Result(...)` 场景较少，多数走静态工厂。

**签名**

```php
__construct($result, $errorStatusCode = null, $errorCode = 500, $errorMessage = "error", $errorDetails = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$result` | `mixed` | —（必填） | 结果数据。成功态为业务数据；错误态为错误时的主体数据 |
| `$errorStatusCode` | `int\|null` | `null` | HTTP 状态码，`>299` 视为失败并自动进入错误态；`null` 或不传表示成功 |
| `$errorCode` | `int\|string` | `500` | 错误码 |
| `$errorMessage` | `string` | `"error"` | 错误信息 |
| `$errorDetails` | `mixed` | `null` | 错误详情（仅开发模式输出） |

**返回值**

- `Result`（实例）。

**示例**

```php
new Result($data, 401, "401:Unauthorized", "登录已过期", ["uri" => "/api/login"]);
```

---

## `succeeded()` — 成功工厂（静态）

**签名**

```php
static succeeded($data = null, $statusCode = 200, $code = 200, $message = "ok"): Result
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | `null` | 返回的数据 |
| `$statusCode` | `int` | `200` | HTTP 状态码 |
| `$code` | `int\|string` | `200` | 响应码 |
| `$message` | `string` | `"ok"` | 响应信息 |

**返回值**

- `Result`：成功态实例（若 `$statusCode > 299` 会意外进入错误态，此时应改用 `failed()`）。

**示例**

```php
return Result::succeeded($userList);
return Result::succeeded($data, 200, 200, "查询成功");
```

---

## `failed()` — 失败工厂（静态）

> **注意：第 1 参是状态码，不是消息。** 即使传入 `<=299` 的状态码，也**强制**进入错误态。

**签名**

```php
static failed($statusCode = 400, $code = "400:FAIL", $message = "error", $details = null, $result = null): Result
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | `400` | HTTP 状态码 |
| `$code` | `int\|string` | `"400:FAIL"` | 错误码 |
| `$message` | `string` | `"error"` | 错误信息 |
| `$details` | `mixed` | `null` | 错误详情 |
| `$result` | `mixed` | `null` | 失败时的主体数据（可选） |

**返回值**

- `Result`：错误态实例（强制）。

**示例**

```php
// 第 1 参是状态码
return Result::failed(401, "401:Unauthorized", "登录失败");
return Result::failed(500, "500:ServerError", "服务器内部错误", ["file" => $e->getFile()]);
```

---

## `result()` — 获取主体数据

**签名**

```php
result()
```

**参数**

- 无。

**返回值**

- `mixed`：主体数据（`responseData`）。无论成败都返回，请结合 `isError()`/`isSuccess()` 使用。

---

## 成败判断

### `isError()` / `isSuccess()`

**签名**

```php
isError(): bool
isSuccess(): bool
```

**参数**

- 无。

**返回值**

- `isError()` → `bool`：失败态返回 `true`。
- `isSuccess()` → `bool`：成功态返回 `true`（等价 `!isError()`）。

---

## 链式修改

### `withData($data, $cover = false)`

> 主体为数组时做合并，否则追加（委托父类 `addData()`）。

**签名**

```php
withData($data, $cover = false): Result
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | —（必填） | 追加的数据 |
| `$cover` | `bool` | `false` | 是否覆盖已有主体数据 |

**返回值**

- `Result`：`$this`（链式）。

### `withMessage($message)`

**签名**

```php
withMessage($message): Result
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$message` | `string` | —（必填） | 新的响应信息 |

**返回值**

- `Result`：`$this`（链式）。

---

## 错误信息读取（仅错误态有值，成功态返回 `null`）

> 以下四者走私有 `onlyError()`，仅在错误态返回有效值。

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `errorMessage()` | `string\|null` | 错误信息 |
| `errorStatusCode()` | `int\|null` | 错误 HTTP 状态码 |
| `errorCode()` | `int\|string\|null` | 错误码 |
| `errorDetails()` | `mixed` | 错误详情；开发模式下未显式传入时会自动附带调用栈 |

---

## 抛出错误

### `throwError()`

> 错误态时抛出 `kernel\Foundation\Error` 并终止；非错误态直接返回实例，避免误抛假异常。

**签名**

```php
throwError(): Result|void
```

**参数**

- 无。

### `throwErrorIf($condition = true)`

> 仅当 `$condition` 为真且当前为错误态时抛出。

**签名**

```php
throwErrorIf($condition = true): Result|void
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$condition` | `bool` | `true` | 触发条件，为真才可能抛错 |

**示例**

```php
$result->throwError();          // 错误态即抛异常
$result->throwErrorIf(!$ok);    // 条件满足且错误态才抛
```

---

## 通用访问器（无论成败均返回当前值）

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `getStatusCode()` | `int` | HTTP 状态码 |
| `getCode()` | `int\|string` | 响应/业务码 |
| `getMessage()` | `string` | 响应/错误消息 |

---

## 数据访问

### `getData($key = null)`

> 指定键时用 `Arr::get()` 取，键存在（含值为 `null`/`"0"`/空串）原样返回，键不存在返回 `null`。**单层键，不做深层点号解析。**

**签名**

```php
getData($key = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 指定键的数据；不传或传 `null` 返回全部数据 |

**返回值**

- `mixed`：对应键的值，或全部数据。

### `hasData($key = null)`

> 指定键支持点号语法（如 `user.profile.name`）。

**签名**

```php
hasData($key = null): bool
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 键名，支持点号语法；省略判断整体数据是否非 `null` |

**返回值**

- `bool`：数据或指定键存在返回 `true`。

### `getResult($key = null, $default = null)`

> 错误态直接返回 `$default`。传 `$key` 时区分「键存在但为 `null`」（原样返回）与「键不存在」（返回默认值）。

**签名**

```php
getResult($key = null, $default = null)
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 指定键的数据；不传或传 `null` 返回全部结果 |
| `$default` | `mixed` | `null` | 错误态、指定键不存在、或整体数据为空时返回的默认值 |

**返回值**

- `mixed`：结果数据或 `$default`。

---

## 序列化输出

### `getBody()`

> 覆盖父类；错误态 + 开发模式 + 未显式设详情时自动补充调用栈。

**签名**

```php
getBody(): array
```

**返回值**

- `array`：结构 `statusCode` / `code` / `data` / `message` / `details`（+ 附加主体）。

### `toArray()`

**签名**

```php
toArray(): array
```

**返回值**

- `array`：即 `getBody()`。

### `toJson($flags = JSON_UNESCAPED_UNICODE)`

> 序列化失败时抛 `\RuntimeException`，避免静默返回 `false`。

**签名**

```php
toJson($flags = JSON_UNESCAPED_UNICODE): string
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flags` | `int` | `JSON_UNESCAPED_UNICODE` | `json_encode` 的 flags 位掩码，可按位或组合（如 `JSON_PRETTY_PRINT`） |

**返回值**

- `string`：JSON 字符串。

---

## 私有方法

| 方法 | 说明 |
|------|------|
| `buildBacktrace($skipFrames = 0)` | 构建错误调用栈，`$skipFrames` 为额外跳过的内部帧数；返回 `array` |
| `onlyError($field)` | 仅错误态时返回指定响应字段，否则返回 `null`；`$field` 为父类 Response 的受保护属性名 |
