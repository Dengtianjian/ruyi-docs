# RequestModelParams — 请求模型查询参数

- **文件位置**: `kernel/Foundation/HTTP/Request/RequestModelParams.php`
- **命名空间**: `kernel\Foundation\HTTP\Request`
- **继承**: 继承 `kernel\Foundation\HTTP\Request\RequestData`
- **是否可继承**: 是

封装请求中用于**模型查询**的分页与排序参数，供数据层直接构造查询。构造时从 query 读取并转换。

**分页参数**（任一存在则 `paged(true)`）：
- `page`（默认 `1`）/ `limit`、`perPage`（默认 `10`）/ `skip`

**排序参数**（任一存在则 `ordered(true)`）：
- `order`：排序字段
- `orderBy`：排序方式（`DESC` / `ASC`）
- `orders`：多条排序，逗号分隔，每项 `字段[:排序方式]`（如 `id:DESC,name:ASC`）

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$_order` | `array` | `[]` | private | 单条排序 `["fieldName"=>, "sort"=>]` |
| `$_orders` | `array` | `[]` | private | 多条排序规则 |
| `$_ordered` | `bool` | `false` | protected | 是否传了排序参数 |
| `$_page` | `int` | `1` | protected | 页码 |
| `$_perPage` | `int` | `10` | protected | 每页条数 |
| `$_skip` | `int\|null` | `null` | protected | 跳过的记录数 |
| `$_paged` | `bool` | `false` | protected | 是否传了分页参数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R)` | 构造：解析分页与排序参数 |
| `order($fieldName)` | 获取/设置排序字段 |
| `orderBy($sort)` | 获取/设置排序方式 |
| `orders($rules)` | 获取/设置多条排序规则 |
| `ordered($flag)` | 获取/设置是否传了排序参数 |
| `page($page)` | 获取/设置页码 |
| `perPage($count)` | 获取/设置每页条数 |
| `skip($count)` | 获取/设置跳过条数 |
| `paged($flag)` | 获取/设置是否传了分页参数 |

## 方法

### `__construct(Request $R)` — 构造

解析分页与排序参数，设置对应标记。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |

**返回值**

- 无。

### `order($fieldName = null)` — 获取/设置排序字段

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fieldName` | `string\|null` | `null` | 传入则设置排序字段 |

**返回值**

- `string\|null`：排序字段名；未设置返回 `null`。

### `orderBy($sort = null)` — 获取/设置排序方式

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sort` | `string\|null` | `null` | 传入则设置排序方式（`DESC` / `ASC`） |

**返回值**

- `string\|null`：排序方式；未设置返回 `null`。

### `orders($rules = null)` — 获取/设置多条排序规则

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rules` | `array\|null` | `null` | 传入则设置多条规则（键=字段名，值=`DESC`/`ASC`） |

**返回值**

- `array\|null`：排序规则；未设置返回 `null`。

### `ordered($flag = null)` — 获取/设置是否传了排序参数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flag` | `bool\|null` | `null` | 传入则设置标记 |

**返回值**

- `bool`：是否传了排序参数。

### `page($page = null)` — 获取/设置页码

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$page` | `int\|null` | `null` | 传入则设置页码 |

**返回值**

- `int`：页码。

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

### `paged($flag = null)` — 获取/设置是否传了分页参数

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flag` | `bool\|null` | `null` | 传入则设置标记 |

**返回值**

- `bool`：是否传了分页参数。

---

> **继承自 `RequestData`**：`has()` / `get()` / `some()` / `handle()` 等可用，见《RequestData》页。
