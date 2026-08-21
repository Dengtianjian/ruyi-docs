# ControllerBody — Body 参数处理器

- **文件位置**: `kernel/Foundation/Controller/ControllerBody.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `RequestBody`
- **是否可继承**: 是

HTTP 请求体（POST/PUT/PATCH body）的封装对象。构造时从 `Request` 提取 body 数据，按规则执行类型转换与校验。

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
