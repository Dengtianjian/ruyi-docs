# RequestPagination — 请求分页参数

- **文件位置**: `kernel/Foundation/HTTP/Request/Extract/RequestPagination.php`
- **命名空间**: `kernel\Foundation\HTTP\Request\Extract`
- **是否可继承**: 是

封装请求中的**分页相关参数**（`page` / `limit` / `perPage` / `skip`）。构造时从 query 读取并转换。若请求传了任一相关参数则标记"已传分页参数"。

分页字段通过父类 `DataObject` 的魔术属性读写（见文末"魔术访问"），本类自身仅提供 `paginated()` 一个显式方法用于读写"是否已传分页参数"标记。

**支持的 query 参数**：
- `page`：页码（默认 `1`）
- `limit` / `perPage`：每页条数（默认 `10`），二者同步为同一值
- `skip`：跳过的记录数（默认 `null`）

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$page` | `int` | `1` | protected | 页码 |
| `$perPage` | `int` | `10` | protected | 每页条数 |
| `$limit` | `int\|null` | `null` | protected | 每页条数（与 `$perPage` 同步） |
| `$skip` | `int\|null` | `null` | protected | 跳过的记录数 |
| `$paginated` | `bool` | `false` | protected | 是否传了分页相关参数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R)` | 构造：从 query 读取分页参数 |
| `paginated($flag)` | 获取/设置是否已传分页参数 |

## 方法

### `__construct(Request $R)` — 构造

从 `$R->query` 读取 `page` / `limit` / `perPage` / `skip`（存在才取，缺失则不覆盖默认值），若取到任意分页参数则标记 `paginated(true)`，最后交由父类按数组填充属性。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |

**返回值**

- 无。

### `paginated($flag = null)` — 获取/设置是否已传分页参数

读写一体：传 `$flag` 时设置标记并返回 `$this`（链式）；不传时返回当前标记。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flag` | `bool\|null` | `null` | 传入则设置标记 |

**返回值**

- `static\|bool`：设值时返回 `$this`；读值时返回 `bool`。

---

> **魔术访问**：`__get` / `__set` 允许以 `page`、`perPage`、`limit`、`skip`、`paginated` 属性方式读写；其中 `limit` 会映射到 `perPage`（二者始终同步）。
> 例如读取 `$pagination->page`、设置 `$pagination->perPage = 20`。
