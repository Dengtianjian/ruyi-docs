# RequestParams — 请求路径参数

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestParams.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **继承**: 继承 `kernel\Foundation\HTTP\Request\RequestData`
- **是否可继承**: 是

封装当前请求的 **URI 路径参数**（路由动态参数，如 `/user/{id}` 中的 `id`）。数据由 `App::run()`/`Console` 在路由匹配后经父类 `fill()` 注入。

本类**自身不定义任何方法**，仅作为类型标识区分 `params` 与 `query`/`body`/`header`；取值、注入、转换、校验等能力全部继承自 `RequestData`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （继承自 `RequestData`） | — | — | — | `$data` / `$mutator` / `$validator` / `$validatedResult` |

## 方法速查表

| 方法 | 作用 | 来源 |
|------|------|------|
| `fill($data)` | 注入数据并合并（路由匹配后注入参数） | `RequestData` |
| `get($key, $default)` | 获取参数值 | `RequestData` |
| `has($key)` | 是否存在某个键 | `RequestData` |
| `some($keys, $completion)` | 批量获取 | `RequestData` |

## 示例

```php
// 路由：GET user/{userId}
$id = $request->params->get("userId");
```

---

> **本类无自有方法**：`fill()` / `has()` / `get()` / `some()` / `handle()` 等均继承自《RequestData》页。
