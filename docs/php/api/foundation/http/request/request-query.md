# RequestQuery — 请求查询参数

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestQuery.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **继承**: 继承 `kernel\Foundation\HTTP\Request\RequestData`
- **是否可继承**: 是

封装当前请求的 **query 字符串参数**（`$_GET`）。构造时从 `$_GET` 填充数据（仅字符串值）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （继承自 `RequestData`） | — | — | — | `$data` / `$mutator` / `$validator` / `$validatedResult` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($mutator, $validator)` | 构造：从 `$_GET` 填充数据 |
| `get($key)` | 获取某个 query 参数的值 |

## 方法

### `__construct($mutator = null, $validator = null)` — 构造

从 `$_GET` 读取所有字符串值填充数据。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mutator` | `Mutator\|array\|null` | `null` | 数据转换规则 |
| `$validator` | `Validator\|array\|null` | `null` | 数据校验规则或校验器 |

**返回值**

- 无。

### `get($key)` — 获取查询参数值

委托父类 `get()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 参数名 |

**返回值**

- `string\|null`：参数值；不存在返回 `null`。

**示例**

```php
$request->query->get("page");   // 例如 "2"
$request->query->has("sort");   // 是否传了 sort
```

---

> **继承自 `RequestData`**：`has()` / `some()` / `handle()` 等可用，见《RequestData》页。
