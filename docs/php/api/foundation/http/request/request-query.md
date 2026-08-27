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
| `get($key, $default)` | 获取某个 query 参数的值（支持点号/通配符） |
| `has($key)` | 是否存在某参数（支持点号路径） |

> 注：仅保留 **字符串值**，数组型 query 参数（如 `?tag[]=a`）会被丢弃，这是有意的设计约束。

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

### `get($key, $default = null)` — 获取查询参数值

委托父类 `get()`，支持点号路径（如 `user.profile.name`）与 `*` 通配符（命中时返回平铺数组）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 参数名，支持点号/通配符 |
| `$default` | `mixed` | `null` | 参数不存在时的默认值 |

**返回值**

- `mixed`：参数值；不存在返回 `$default`。

**示例**

```php
$request->query->get("page");          // 例如 "2"
$request->query->get("nope", 10);      // 不存在返回 10
$request->query->get("user.name");     // 点号取嵌套值
$request->query->has("sort");          // 是否传了 sort
```

---

> **继承自 `RequestData`**：`has()` / `some()` / `handle()` 等可用，见《RequestData》页。
