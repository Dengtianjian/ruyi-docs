# ControllerQuery — Query 参数处理器

- **文件位置**: `kernel/Foundation/Controller/ControllerQuery.php`
- **命名空间**: `kernel\Foundation\Controller`
- **继承自**: `RequestQuery`
- **是否可继承**: 是

HTTP 查询字符串（query string）的封装对象。构造时从 `Request` 提取 query 数据，按规则执行类型转换与校验。

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
