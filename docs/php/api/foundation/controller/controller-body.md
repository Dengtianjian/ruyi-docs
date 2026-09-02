# ControllerBody — Body 参数处理器

- **文件位置**: `kernel/Foundation/Controller/ControllerBody.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `RequestBody`
- **是否可继承**: 是

HTTP 请求体（POST/PUT/PATCH body）的封装对象，继承 `RequestBody`。作为控制器上下文中处理请求体参数的专用载体。

**与 `ControllerQuery` 的取舍不同**：本类先调用父类 `RequestBody::__construct` 完成 mutator/validator 初始化，再以 `$request->body`（框架封装后的请求体组件）覆盖 `data`，确保数据类型转换与 `Controller::body()` 读取到的内容一致。

构造时应用传入的 `$bodyMutator`（类型转换）与 `$bodyValidator`（校验规则），校验结果写入 `validatedResult`，供 `Controller::before()` 拦截使用。

## 构造

### `__construct(Request $request, $bodyMutator = null, $bodyValidator = null)` — 构建 Body 参数处理器

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$request` | `Request` | 无 | 当前请求对象 |
| `$bodyMutator` | `array\|Mutator\|null` | `null` | Body 参数序列化规则（`["name" => "string"]` 形式）。`null` 不做类型转换 |
| `$bodyValidator` | `array\|Validator\|null` | `null` | Body 参数校验规则（`["name" => Rule::required()]` 形式）。`null` 不校验 |

**返回值**

- 无。

继承自 `RequestBody`，具备 `data()`/`some()`/`get()`/`addData()`/`validatedResult` 等方法（参见 `RequestBody` 文档）。
