# RequestParams — 请求路径参数

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestParams.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **继承**: 继承 `kernel\Foundation\HTTP\Request\RequestData`
- **是否可继承**: 是

封装当前请求的 **URI 路径参数**（路由动态参数，如 `/user/{id}` 中的 `id`）。数据由 `Router::run()` 在路由匹配后经 `set()` 注入。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （继承自 `RequestData`） | — | — | — | `$data` / `$mutator` / `$validator` / `$validatedResult` |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($mutator, $validator)` | 构造（空数据） |
| `set($params)` | 设置路径参数数据 |
| `get($key)` | 获取路径参数值 |

## 方法

### `__construct($mutator = null, $validator = null)` — 构造

初始数据为空，待路由匹配后由 `set()` 填充。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mutator` | `Mutator\|array\|null` | `null` | 数据转换规则 |
| `$validator` | `Validator\|array\|null` | `null` | 数据校验规则或校验器 |

**返回值**

- 无。

### `set($params)` — 设置路径参数数据

通常由 `Router::run()` 在匹配成功后调用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 路径参数键值对 |

**返回值**

- 无。

### `get($key)` — 获取路径参数值

委托父类 `get()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$key` | `string` | 无 | 参数名 |

**返回值**

- `string\|null`：参数值；不存在返回 `null`。

**示例**

```php
// 路由：GET user/{userId}
$request->params->get("userId");
```

---

> **继承自 `RequestData`**：`has()` / `some()` / `handle()` 等可用，见《RequestData》页。
