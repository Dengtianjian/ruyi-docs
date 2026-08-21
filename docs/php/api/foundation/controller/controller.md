# Controller — 控制器基类

- **文件位置**: `kernel/Foundation/Controller/Controller.php`
- **命名空间**: `kernel\Foundation\Controller`
- **是否可继承**: 是（所有业务控制器抽象基类）

封装完整的请求-响应处理流程。生命周期：`__construct → boot → before → data(子类覆盖) → after`。

## 生命周期

1. **构造** — 注入 `Request`，初始化空 `Response`；按子类配置的序列化/校验规则分别构造 `requestQuery`（GET 参数）和 `requestBody`（POST/PUT/PATCH 参数）；最后调用 `boot()` 钩子
2. **boot** — 子类初始化钩子（query/body 处理之后触发）
3. **before**（final）— 校验拦截：query/body 校验失败则将 `response` 替换为错误响应，跳过 `data()` 直接进入 `after()`
4. **data** — 业务逻辑入口，子类必须覆盖
5. **after**（final）— 响应后处理：先按需 `Transform` 数据变换，再按 `responseSerializes` 规则序列化

## 子类配置属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$requestQuery` | `ControllerQuery` | — | protected | GET 参数处理器（构造注入） |
| `$requestQuerySerializes` | `array\|Mutator\|null` | `null` | protected | GET 参数序列化规则（`["name" => "string", "age" => "int"]` 形式）。`null` 不做类型转换 |
| `$requestQueryValidator` | `array\|Validator\|null` | `null` | protected | GET 参数校验规则（`["name" => Rule::required()]` 形式）。`null` 不校验 |
| `$requestBody` | `ControllerBody` | — | protected | Body 参数处理器（构造注入） |
| `$requestBodySerializes` | `array\|Mutator\|null` | `null` | protected | Body 参数序列化规则。`null` 不做类型转换 |
| `$requestBodyValidator` | `array\|Validator\|null` | `null` | protected | Body 参数校验规则。`null` 不校验 |
| `$responseSerializes` | `array\|string\|Mutator\|Serializer\|null` | `null` | protected | 响应数据序列化规则。`null` 原样输出 |
| `$allowedTransformers` | `string[]` | `[]` | protected | 允许通过 `_transform` 参数调用的数据变换器类名列表 |
| `$request` | `Request` | — | protected | 当前请求对象 |
| `$response` | `Response` | — | public | 响应对象，生命周期内可被替换 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $request)` | 构造控制器 |
| `boot()` | 子类初始化钩子（protected） |
| `params($key, $default)` | 获取路由参数 |
| `body($key, $default)` | 获取 Body 参数（已转换+校验） |
| `query($key, $default)` | 获取 Query 参数（已转换+校验） |
| `rawBody($key, $default)` | 获取原始 Body 参数 |
| `rawQuery($key, $default)` | 获取原始 Query 参数 |
| `success($data, $statusCode, $code, $message)` | 构建成功响应 |
| `fail($statusCode, $code, $message, $details, $data)` | 构建错误响应 |
| `before()` | 校验拦截（final） |
| `after()` | 响应后处理（final） |
| `serialization()` | 响应数据序列化（private） |
| `transform()` | 数据变换（private） |

## 方法

### `__construct(Request $request)` — 构造控制器

执行顺序：

1. 注入 `$request`，初始化空 `Response`（包装 `null`）
2. 用 `$requestQuerySerializes`/`$requestQueryValidator` 构造 `$requestQuery`
3. 用 `$requestBodySerializes`/`$requestBodyValidator` 构造 `$requestBody`
4. 调用 `boot()` 钩子

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$request` | `Request` | 无 | 当前请求对象 |

**返回值**

- 无。

### `boot()` — 子类初始化钩子

在 `requestQuery`/`requestBody` 构造完成后调用。适合做依赖注入、属性初始化等无需依赖 query/body 校验结果的操作。

**参数**

- 无。

**返回值**

- 无。

### `params($key = null, $default = null)` — 获取路由参数

获取 URL 中 `{param}` 占位符捕获的值（如 `/post/{id}` 中的 `id`）。`$key` 为 `null` 时返回全部路由参数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 参数名，`null` 返回全部路由参数 |
| `$default` | `mixed` | `null` | 参数不存在时的默认值 |

**返回值**

- `mixed`：参数值或全部参数数组。

### `body($key = null, $default = null)` — 获取 Body 参数（已转换+校验）

返回经 `$requestBodySerializes` 类型转换和 `$requestBodyValidator` 校验后的数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 参数名，`null` 返回全部 Body 参数 |
| `$default` | `mixed` | `null` | 参数不存在时的默认值 |

**返回值**

- `mixed`：Body 参数值或全部 Body 参数数组。

### `query($key = null, $default = null)` — 获取 Query 参数（已转换+校验）

返回经 `$requestQuerySerializes` 类型转换和 `$requestQueryValidator` 校验后的数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 参数名，`null` 返回全部 Query 参数 |
| `$default` | `mixed` | `null` | 参数不存在时的默认值 |

**返回值**

- `mixed`：Query 参数值或全部 Query 参数数组。

### `rawBody($key = null, $default = null)` — 获取原始 Body 参数

未经类型转换和校验。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 参数名，`null` 返回全部原始 Body |
| `$default` | `mixed` | `null` | 参数不存在时的默认值 |

**返回值**

- `mixed`：原始 Body 参数值或全部原始 Body 数据。

### `rawQuery($key = null, $default = null)` — 获取原始 Query 参数

未经类型转换和校验。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string\|null` | `null` | 参数名，`null` 返回全部原始 Query |
| `$default` | `mixed` | `null` | 参数不存在时的默认值 |

**返回值**

- `mixed`：原始 Query 参数值或全部原始 Query 数据。

### `success($data = null, $statusCode = 200, $code = 200, $message = "ok")` — 构建成功响应

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | `null` | 响应数据 |
| `$statusCode` | `int` | `200` | HTTP 状态码 |
| `$code` | `int\|string` | `200` | 业务状态码 |
| `$message` | `string` | `"ok"` | 响应消息 |

**返回值**

- `Response`：成功响应实例（替换 `$this->response` 并由 App 层输出）。

### `fail($statusCode = 500, $code = "500:ServerError", $message = "error", $details = [], $data = [])` — 构建错误响应

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | `500` | HTTP 状态码 |
| `$code` | `int\|string` | `"500:ServerError"` | 业务错误码 |
| `$message` | `string` | `"error"` | 错误消息 |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 附加数据 |

**返回值**

- `Response`：错误响应实例。

### `before()` — 校验拦截（final，子类不可覆盖）

检查 `$requestQuery` 和 `$requestBody` 的 `validatedResult`。任一校验失败时，将 `$this->response` 替换为错误响应，跳过 `data()` 直接进入 `after()`。

**参数**

- 无。

**返回值**

- 无。

### `after()` — 响应后处理（final，子类不可覆盖）

在 `data()` 成功返回后触发：

1. 若 `$allowedTransformers` 非空，执行 `transform()` 数据变换
2. 若 `$responseSerializes` 非 `null`，执行 `serialization()` 响应数据序列化

若 `$this->response->error` 已为真，跳过所有后处理。

**参数**

- 无。

**返回值**

- 无。

### `serialization()` — 响应数据序列化（private）

按 `$responseSerializes` 类型执行：

- `Mutator` 实例 → 调其 `data()->convert()` 管道处理
- `Serializer` 实例 → 调 `Serializer::serialization($useRuleName, $data)`
- `array` → 调 `Serializer::serialization($rules, $data, $className)`，类名取子类类名去 `Controller` 后缀
- `string` → 调 `Serializer::serialization($ruleName, $data, $className)`

最终通过 `$this->response->addData($data, true)` 替换数据。

**参数**

- 无。

**返回值**

- 无。

### `transform()` — 数据变换（private）

从 `$request->query->_transform`（缺则查 `$request->body->_transform`）读取变换指令，按 `$allowedTransformers` 白名单执行。空或解析失败时跳过。

**参数**

- 无。

**返回值**

- 无。

## `data()` 返回值约定

- `null` / `array` / `object` → 直接作为响应数据
- `Response` 实例（如 `success`/`fail` 返回）→ 替换当前 `response`
- `Result` 实例 → 直接作为响应数据
- `ResponsePagination` 实例 → 直接作为分页响应数据

## 完整示例

```php
use kernel\Foundation\Controller\Controller;
use kernel\Foundation\Validation\Rule;

class UserController extends Controller
{
    // Body 参数类型转换
    protected $requestBodySerializes = ["name" => "string", "age" => "int"];

    // Body 参数校验
    protected $requestBodyValidator = [
        "name" => Rule::required()->max(50),
        "age"  => Rule::required()->type("integer")->range(0, 150),
    ];

    // 响应序列化规则
    protected $responseSerializes = [
        "id"   => "int",
        "name" => "string",
    ];

    // 允许的变换器
    protected array $allowedTransformers = [UserTransformer::class];

    protected function boot(): void
    {
        // 依赖注入或属性初始化
    }

    protected function data()
    {
        $id   = $this->params("id", 0);          // 路由参数
        $name = $this->body("name");             // 已校验 Body
        $page = $this->query("page", 1);         // 已校验 Query

        $raw = $this->rawBody();                 // 原始 Body

        return $this->success([
            "id"   => $id,
            "name" => $name,
            "raw"  => $raw,
        ]);
    }
}
```
