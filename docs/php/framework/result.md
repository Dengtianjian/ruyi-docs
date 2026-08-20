# Result — 返回结果

`Result` 是标准化的方法返回值封装，用于在服务层/模型层返回带错误信息的结果。它继承自 `Response`，让调用方（通常是控制器）可以统一处理成功与失败，并可将失败结果直接作为 HTTP 响应返回。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Result.php`
- **继承**: `Response`

> 说明：框架早期版本中的 `ReturnResult` / `ReturnList` 已合并重构为 `Result`（命名空间提升至 `kernel\Foundation`，删除了冗余的 `ReturnList`）。

## 设计理念

`Result` 将「业务结果 + HTTP 响应」合二为一：

- **被调用方**（服务/校验/模型）：返回一个 `Result`，成功时携带数据，失败时携带错误码、错误信息、错误详情
- **调用方**（控制器/中间件）：通过 `isError()`/`isSuccess()` 判断成败；不再处理错误时，可直接 `return $result`，因为它继承自 `Response`，控制器可原样透传输出
- **错误是否抛出**：决定权留给调用方——`throwError()` 可将其转为异常，也可选择直接返回响应

## 方法列表

### 静态工厂方法

#### `succeeded($data = null, $statusCode = 200, $code = 200, $message = "ok")`

快速创建成功结果，返回 `Result` 实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 返回的数据 |
| `$statusCode` | `int` | HTTP 状态码（默认 200） |
| `$code` | `int\|string` | 响应码（默认 200） |
| `$message` | `string` | 响应信息（默认 "ok"） |

```php
$result = Result::succeeded(["id" => 1, "name" => "张三"]);
```

#### `failed($statusCode = 400, $code = "400:FAIL", $message = "error", $details = null, $result = null)`

快速创建失败结果，返回 `Result` 实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$statusCode` | `int` | HTTP 状态码（默认 400） |
| `$code` | `int\|string` | 错误码（默认 "400:FAIL"） |
| `$message` | `string` | 错误信息（默认 "error"） |
| `$details` | `mixed` | 错误详情（仅开发模式输出） |
| `$result` | `mixed` | 失败时的主体数据（可选，默认 null） |

> `failed()` 语义上必为失败：即使传入的 `$statusCode <= 299`，也会强制进入错误态并组装错误字段，避免出现「由 `failed()` 创建却是成功态」的边界不一致。

```php
$result = Result::failed(400, "400:ValidateFailed:Custom", "用户名已存在");
```

### 构造方法

#### `__construct($result, $errorStatusCode = null, $errorCode = 500, $errorMessage = "error", $errorDetails = null)`

构建返回结果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$result` | `mixed` | 结果数据（成功态为业务数据；错误态为主体数据） |
| `$errorStatusCode` | `int\|null` | HTTP 错误状态码（>299 视为失败，自动进入错误态） |
| `$errorCode` | `int\|string` | 业务错误码 |
| `$errorMessage` | `string` | 错误信息 |
| `$errorDetails` | `mixed` | 错误详情 |

```php
// 成功结果
$result = new Result(["id" => 1, "name" => "张三"]);

// 失败结果
$result = new Result(false, 400, "400001", "参数错误");
```

### 判态方法

#### `isError(): bool`

判断是否为失败结果。

```php
if ($result->isError()) {
    // 失败处理
}
```

#### `isSuccess(): bool`

判断是否为成功结果。

```php
if ($result->isSuccess()) {
    // 成功处理
}
```

### 数据访问方法

#### `result()`

获取成功态的处理结果（无论成败都返回主体数据，请结合 `isError()`/`isSuccess()` 使用）。

返回值：`mixed`

```php
$data = $result->result();  // 获取返回数据
```

#### `getData($key = null)`

获取响应数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 指定键，支持点号语法（如 `user.name`）；`null` 返回全部；键不存在返回 `null` |

返回值：`mixed`

```php
$data = $result->getData();              // 全部
$name = $result->getData("name");        // 指定键，支持 "0"/空串键，缺失返回 null
$city = $result->getData("user.city");   // 点号语法深层取值
```

#### `hasData($key = null): bool`

判断指定键（支持点号语法）是否存在于主体数据中。区别于 `getData()`：**键存在但值为 `null`** 时 `hasData()` 仍返回 `true`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 指定键，`null` 判断整体数据是否非空 |

```php
$result->hasData("user.name");   // true（存在）
$result->hasData("user.missing");// false（不存在）
```

#### `getResult($key = null, $default = null)`

获取成功结果。**失败时**返回 `$default`（默认 `null`）。指定键时区分「键存在但为 `null`」与「键不存在」：**键存在（含 `null` 值）原样返回，仅键不存在才回退默认值**。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 指定键（支持点号语法），`null` 返回全部 |
| `$default` | `mixed` | 失败/键不存在/整体为空时的默认值（默认 null） |

返回值：`mixed`

```php
$data = $result->getResult();                       // 成功返回数据，失败返回 null
$name = $result->getResult("name");                 // 成功返回 name，失败返回 null
$name = $result->getResult("name", "默认值");        // 失败或缺失返回 "默认值"
$age  = $result->getResult("user.age", 18);         // 存在（值 null 或数字）原样返回，不存在返回 18
```

### 错误信息方法

以下方法仅在失败态返回对应错误信息，成功态均返回 `null`。

#### `errorMessage(): string|null`

获取失败的错误信息。

```php
echo $result->errorMessage();  // "参数错误"
```

#### `errorStatusCode(): int|null`

获取失败的 HTTP 状态码。

```php
echo $result->errorStatusCode();  // 400
```

#### `errorCode(): int|string|null`

获取失败的业务错误码。

```php
echo $result->errorCode();  // "400001"
```

#### `errorDetails(): mixed|null`

获取失败的错误详情。开发模式（`App::mode() === "development"`）下若未显式传入详情，会自动附带调用栈（已去除 Result 内部方法自身的调用帧），便于定位问题；生产模式不输出详情。

```php
$details = $result->errorDetails();
```

### 通用取值方法

以下方法**无论成败**均返回当前值（区别于仅限失败态的 `errorStatusCode()/errorCode()/errorMessage()`）。

#### `getStatusCode(): int`

获取 HTTP 状态码。

```php
echo $result->getStatusCode();  // 200 或 400
```

#### `getCode(): int|string`

获取响应码。

```php
echo $result->getCode();  // 200 或 "400:FAIL"
```

#### `getMessage(): string`

获取响应信息。

```php
echo $result->getMessage();  // "ok" 或 "error"
```

### 链式方法

#### `withData($data, $cover = false): Result`

追加数据到主体（链式）。主体为数组时做合并，否则追加；`$cover = true` 时覆盖已有主体。

```php
$result = Result::succeeded(["x" => 1])
    ->withData(["y" => 2])          // 合并 → ["x" => 1, "y" => 2]
    ->withMessage("已合并");
```

#### `withMessage($message): Result`

设置响应信息（链式）。

```php
$result->withMessage("操作成功");
```

### 序列化方法

#### `toArray(): array`

将当前结果序列化为响应体数组结构：`statusCode / code / data / message / details`（+ 附加主体）。**在开发模式下，错误态未显式设置详情时自动补充调用栈**，与 `output()`/`toJson()` 保持一致的输出。

```php
$arr = $result->toArray();
```

#### `toJson($flags = JSON_UNESCAPED_UNICODE): string`

将当前结果序列化为 JSON 字符串。序列化失败（如数据含非法 UTF-8）时抛出 `\RuntimeException`，而非静默返回 `false`。

```php
$json = $result->toJson();
```

### 异常方法

#### `throwError(): Result|void`

将错误作为异常抛出（`kernel\Foundation\Exception\Exception`），并终止程序。**当前为成功态时直接返回实例本身**，避免误抛假异常。

```php
$result = someService();
if ($result->isError()) {
    $result->throwError();  // 抛出 Exception
}
// 成功态继续执行
```

#### `throwErrorIf($condition = true): Result|void`

**条件抛出**：仅当 `$condition` 为真且当前为错误态时才抛出；否则返回实例本身（成功态）。

```php
$result = someService();
$result->throwErrorIf($needStrict);  // 需要严格校验时才抛错
```

## 使用方式

### 服务层返回统一结果

```php
// Service/UserService.php
class UserService
{
    public function createUser($data)
    {
        // 校验
        if (empty($data['username'])) {
            return Result::failed(400, "400001", "用户名不能为空");
        }

        // 检查重复
        $exists = (new UsersModel())->usernameExist($data['username']);
        if ($exists) {
            return Result::failed(400, "400002", "用户名已存在");
        }

        // 创建
        $userId = (new UsersModel())->insert($data);

        return Result::succeeded(["id" => $userId]);
    }
}
```

### 控制器中处理 Result

```php
class RegisterController extends AuthController
{
    public function data()
    {
        $service = new UserService();
        $result = $service->createUser($this->requestBody->all());

        if ($result->isError()) {
            // 方式 1：直接返回（Result 继承自 Response）
            return $result;

            // 方式 2：抛出异常
            // $result->throwError();
        }

        return $result->result();
    }
}
```

### 分页列表返回

分页列表不再使用 Result，直接返回 `ResponsePagination` 分页响应（等价于控制器的 `ControllerResponse::list($total, $data)`）：

```php
use kernel\Foundation\HTTP\Response\ResponsePagination;

public function listArticles($page, $perPage)
{
    $model = new ArticlesModel();
    $articles = $model->where("status", "published")->page($page, $perPage)->getAll();
    $total = $model->where("status", "published")->count();

    return new ResponsePagination(getApp()->request(), $total, $articles);
}
```

## Result vs 直接抛异常

| 方式 | 优点 | 缺点 |
|------|------|------|
| **Result** | 调用方可选择处理方式；不中断程序流程 | 需要手动检查 `$result->isError()` |
| **抛出异常** | 强制中断；不处理会暴露错误 | 必须 try/catch；不适合业务逻辑错误 |

推荐在服务层使用 Result，让调用方（控制器）决定如何处理错误。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Response](./response.md) | 父类 | Result 继承自 Response |
| [Controller](./controller.md) | 消费 | 控制器接收服务层返回的 Result |
| [Validator](./validator.md) | 返回值 | 校验器返回 Result |
| [AuthController](./auth-controller.md) | verifyAdmin/verifyAuth 返回值 | 认证方法返回 Result |
