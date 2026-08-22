# ResponsePagination — 分页响应

- **文件位置**: `kernel/Foundation/HTTP/Response/ResponsePagination.php`
- **命名空间**: `kernel\Foundation\HTTP\Response`
- **继承**: 继承 `kernel\Foundation\HTTP\Response`
- **是否可继承**: 是

分页响应对象。输出时把数据包装为 `{ list, pagination }` 结构，`pagination` 含总量、每页条数、页码、跳过条数、当前页条数。控制器返回分页列表请用它（`ControllerResponse::list()` 内部也用它）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$request` | `Request\|null` | `null` | private | 请求实例 |
| `$total` | `int\|null` | `null` | private | 数据总量 |
| `$items` | `int\|null` | `null` | private | 当前页数据条数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R, $total, $data)` | 构造：设置分页上下文与数据 |
| `setTotal($total)` | 设置数据总量 |
| `output()` | 输出包装后的分页响应 |

## 方法

### `__construct(Request $R, $total, $data = null)` — 构造

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例（读取分页参数） |
| `$total` | `int` | 无 | 数据总量 |
| `$data` | `mixed` | `null` | 数据列表；为数组时自动统计当前页条数 |

**返回值**

- 无。

### `setTotal($total)` — 设置数据总量

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$total` | `int` | 无 | 数据总量 |

**返回值**

- `$this`：支持链式调用。

### `output()` — 输出分页响应

包装响应数据为 `{ list: $data, pagination: { total, limit, page, skip, items } }` 后交父类输出。分页参数直接取自 `$request->query`（`limit` → `perPage` → 默认 10；`page` → 默认 1；`skip` 有则取）。

**参数**

- 无。

**返回值**

- 无（`void`）。

**示例**

```php
return new ResponsePagination($request, $total, $rows);
// 输出：{ "list": [...], "pagination": { "total": 100, "limit": 10, "page": 1, "skip": 0, "items": 10 } }
```
