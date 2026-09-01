# RequestSorting — 请求排序参数

- **文件位置**: `kernel/Foundation/HTTP/Request/Extract/RequestSorting.php`
- **命名空间**: `kernel\Foundation\HTTP\Request\Extract`
- **是否可继承**: 是

封装请求中的**排序相关参数**（`order` / `orderBy` / `orders`）。构造时从 query 读取并转换。若请求传了任一相关参数则标记"已传排序参数"。

**支持的 query 参数**：
- `order`：排序字段名（单条排序的字段）
- `orderBy`：排序方式（`ASC` / `DESC`，单条排序的方式）
- `orders`：多条排序规则，逗号分隔的 `字段:方式`，例如 `createTime:DESC,title:ASC`；缺失方式时回退 `orderBy`，再回退 `ASC`

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$order` | `array` | `[]` | protected | 单条排序规则（`fieldName` + `sort`） |
| `$orders` | `array` | `[]` | protected | 多条排序规则（键为字段名，值为方式） |
| `$sorted` | `bool` | `false` | protected | 是否传了排序相关参数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R)` | 构造：从 query 读取排序参数 |
| `order($fieldName)` | 获取/设置排序字段 |
| `orderBy($sort)` | 获取/设置排序方式 |
| `orders($rules)` | 获取/设置多条排序规则 |
| `sorted($flag)` | 获取/设置是否已传排序参数 |

## 方法

### `__construct(Request $R)` — 构造

从 `$R->query` 读取 `order` / `orderBy` / `orders`（存在才取，缺失则不覆盖默认）。`orders` 解析为关联数组（字段名 => 方式）；若解析出规则但缺少 `order`/`orderBy`，则回退取首条规则的字段名与方式。任一存在则标记 `sorted(true)`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |

**返回值**

- 无。

### `order($fieldName = null)` — 获取/设置排序字段

读写一体：传 `$fieldName` 时设置 `$order['fieldName']` 并返回 `$this`（链式）；不传时返回当前字段名（未设置返回 `null`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fieldName` | `string\|null` | `null` | 传入则设置排序字段 |

**返回值**

- `static\|string\|null`

### `orderBy($sort = null)` — 获取/设置排序方式

读写一体：传 `$sort` 时设置 `$order['sort']` 并返回 `$this`（链式）；不传时返回当前方式（未设置返回 `null`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sort` | `string\|null` | `null` | 传入则设置排序方式（`ASC` / `DESC`） |

**返回值**

- `static\|string\|null`

### `orders($rules = null)` — 获取/设置多条排序规则

读写一体：传 `$rules` 时设置 `$orders` 并返回 `$this`（链式）；不传时返回当前规则数组（未设置返回 `null`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rules` | `array\|null` | `null` | 关联数组，键为字段名，值为方式 |

**返回值**

- `static\|array\|null`

### `sorted($flag = null)` — 获取/设置是否已传排序参数

读写一体：传 `$flag` 时设置标记并返回 `$this`（链式）；不传时返回当前标记。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flag` | `bool\|null` | `null` | 传入则设置标记 |

**返回值**

- `static\|bool`
