# RequestHeader — 请求头

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestHeader.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **继承**: 继承 `kernel\Foundation\HTTP\Request\RequestData`
- **是否可继承**: 是

封装当前请求的**请求头**。构造时优先用 `getallheaders()`（含 `$_SERVER` 的 `HTTP_*` 兜底），将头名统一为小写键填充数据。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （继承自 `RequestData`） | — | — | — | `$data` / `$mutator` / `$validator` / `$validatedResult` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($mutator, $validator)` | 构造：收集请求头并统一小写键 |

## 方法

### `__construct($mutator = null, $validator = null)` — 构造

收集请求头，键名统一小写（如 `X-Token` → `x-token`）。CLI 下无请求头，数据为空。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mutator` | `Mutator\|array\|null` | `null` | 数据转换规则 |
| `$validator` | `Validator\|array\|null` | `null` | 数据校验规则或校验器 |

**返回值**

- 无。

**示例**

```php
$request->header->get("x-token");   // 读取 X-Token 头
```

---

> **继承自 `RequestData`**：`has()` / `get()` / `some()` / `handle()` 等可用，见《RequestData》页。
