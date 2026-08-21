# RequestBody — 请求体

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestBody.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **继承**: 继承 `kernel\Foundation\HTTP\Request\RequestData`
- **是否可继承**: 是

封装当前请求的**请求体**（`php://input`）。构造时按 `Content-Type` 自动解析：

- `application/json`：JSON 解码后与 `$_POST` 合并
- `application/xml`：XML 解析后与 `$_POST` 合并
- `application/x-www-form-urlencoded` / `multipart/form-data`：取 `$_POST`
- `text/plain` / `application/javascript`：URL 解码并转义
- `text/html`：`htmlspecialchars_decode` + 转义
- 其他：直接转义字符串

请求体为空时数据为 `null`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$body` | `array` | `[]` | protected | 原始请求体（预留，未直接使用） |
| （继承自 `RequestData`） | — | — | — | `$data` / `$mutator` / `$validator` / `$validatedResult` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($mutator, $validator)` | 构造：按 Content-Type 解析请求体 |

## 方法

### `__construct($mutator = null, $validator = null)` — 构造

按请求 `Content-Type` 解析 `php://input` 并填充数据（见类顶部说明）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mutator` | `Mutator\|array\|null` | `null` | 数据转换规则 |
| `$validator` | `Validator\|array\|null` | `null` | 数据校验规则或校验器 |

**返回值**

- 无。

**示例**

```php
// POST 请求体 {"name":"张三"}
$request->body->get("name");   // "张三"
$request->body->some(["name", "email"]);
```

---

> **继承自 `RequestData`**：`has()` / `get()` / `some()` / `handle()` 等可用，见《RequestData》页。
