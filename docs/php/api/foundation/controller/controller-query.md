# ControllerQuery — Query 参数处理器

- **文件位置**: `kernel/Foundation/Controller/ControllerQuery.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `RequestQuery`
- **是否可继承**: 是

HTTP 查询字符串（query string）的封装对象，继承 `RequestQuery`。作为控制器上下文中处理 URL 查询参数（GET）的专用载体。

**与直接使用 `RequestQuery` 的区别**：`RequestQuery` 的父类构造会从原始 `$_GET` 直接填充数据；而本类显式以 `$request->query`（框架封装、可能经过统一预处理的请求查询组件）为数据源，避免从 `$_GET` 重复填充后被覆盖，从而保证与 `Controller::query()` 读取到的数据一致。

构造时应用传入的 `$queryMutator`（类型转换）与 `$queryValidator`（校验规则），校验结果写入 `validatedResult`，供 `Controller::before()` 拦截使用。

## 构造

### `__construct(Request $request, $queryMutator = null, $queryValidator = null)` — 构建 Query 参数处理器

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$request` | `Request` | 无 | 当前请求对象 |
| `$queryMutator` | `array\|Mutator\|null` | `null` | Query 参数序列化规则。`null` 不做类型转换 |
| `$queryValidator` | `array\|Validator\|null` | `null` | Query 参数校验规则。`null` 不校验 |

**返回值**

- 无。

继承自 `RequestQuery`，具备 `data()`/`some()`/`get()`/`addData()`/`validatedResult` 等方法（参见 `RequestQuery` 文档）。
