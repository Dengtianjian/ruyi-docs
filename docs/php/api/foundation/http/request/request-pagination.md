# RequestPagination — 请求分页参数

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestPagination.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **是否可继承**: 是

> **弃用**（`@deprecated`）：建议使用 `RequestModelParams`。

封装请求中的**分页相关参数**（`page` / `limit` / `perPage` / `skip`）。构造时从 query 读取并转换。若请求传了任一相关参数则标记"已传分页参数"。

**支持的 query 参数**：
- `page`：页码（默认 `1`）
- `limit` / `perPage`：每页条数（默认 `10`）
- `skip`：跳过的记录数（默认 `null`）

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$_page` | `int` | `1` | protected | 页码 |
| `$_perPage` | `int` | `10` | protected | 每页条数 |
| `$_skip` | `int\|null` | `null` | protected | 跳过的记录数 |
| `$_passed` | `bool` | `false` | protected | 是否传了分页相关参数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R)` | 构造：从 query 读取分页参数 |
| `page($page)` | 获取/设置页码 |
| `perPage($count)` | 获取/设置每页条数 |
| `skip($count)` | 获取/设置跳过条数 |
| `passed($flag)` | 获取/设置是否已传分页参数 |

## 方法

### `__construct(Request $R)` — 构造

从 `$R->query` 读取 `page` / `limit` / `perPage` / `skip` 并转换；任一存在则标记 `passed(true)`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |

**返回值**

- 无。

### `page($page = null)` — 获取/设置页码

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$page` | `int\|null` | `null` | 传入则设置页码 |

**返回值**

- `int`：当前页码。

### `perPage($count = null)` — 获取/设置每页条数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$count` | `int\|null` | `null` | 传入则设置每页条数 |

**返回值**

- `int`：每页条数。

### `skip($count = null)` — 获取/设置跳过条数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$count` | `int\|null` | `null` | 传入则设置跳过条数 |

**返回值**

- `int\|null`：跳过条数。

### `passed($flag = null)` — 获取/设置是否已传分页参数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flag` | `bool\|null` | `null` | 传入则设置标记 |

**返回值**

- `bool`：是否已传分页参数。

---

> **魔术访问**：`__get` / `__set` 允许以 `limit`、`page`、`perPage`、`skip`、`passed` 属性方式读写；其中 `limit` 会映射到 `perPage`。
