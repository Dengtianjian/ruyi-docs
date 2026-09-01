# RequestFiltering — 请求筛选参数

- **文件位置**: `kernel/Foundation/HTTP/Request/Extract/RequestFiltering.php`
- **命名空间**: `kernel\Foundation\HTTP\Request\Extract`
- **是否可继承**: 是

封装请求中的**筛选相关参数**（`filter` / `search`）。构造时从 query 读取并转换。若请求传了任一相关参数则标记"已传筛选参数"。

**支持的 query 参数**：
- `filter`：筛选条件，逗号分隔的多条 `字段:值`，例如 `status:active,type:post`；单条同样支持 `字段:值`
- `search`：模糊搜索关键词

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$filter` | `array` | `[]` | protected | 筛选条件（键为字段名，值为筛选值） |
| `$search` | `string\|null` | `null` | protected | 模糊搜索关键词 |
| `$filtered` | `bool` | `false` | protected | 是否传了筛选相关参数 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct(Request $R)` | 构造：从 query 读取筛选参数 |
| `filter($field, $value)` | 获取/设置筛选条件 |
| `search($keyword)` | 获取/设置搜索关键词 |
| `filtered($flag)` | 获取/设置是否已传筛选参数 |

## 方法

### `__construct(Request $R)` — 构造

从 `$R->query` 读取 `filter` 与 `search`（存在才取，缺失则不覆盖默认）。`filter` 解析为关联数组（字段名 => 值）；任一存在则标记 `filtered(true)`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$R` | `Request` | 无 | 请求实例 |

**返回值**

- 无。

### `filter($field = null, $value = null)` — 获取/设置筛选条件

读写一体，三种用法：
- 传 `$field` 与 `$value`：设置该字段的筛选值并返回 `$this`（链式）
- 仅传 `$field`：返回该字段的筛选值（不存在返回 `null`）
- 两者都不传：返回全部筛选条件数组

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$field` | `string\|null` | `null` | 字段名 |
| `$value` | `mixed` | `null` | 筛选值（仅与 `$field` 同时传入时生效） |

**返回值**

- `static\|array\|mixed`

### `search($keyword = null)` — 获取/设置搜索关键词

读写一体：传 `$keyword` 时设置 `$search` 并返回 `$this`（链式）；不传时返回当前关键词。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$keyword` | `string\|null` | `null` | 传入则设置搜索关键词 |

**返回值**

- `static\|string\|null`

### `filtered($flag = null)` — 获取/设置是否已传筛选参数

读写一体：传 `$flag` 时设置标记并返回 `$this`（链式）；不传时返回当前标记。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$flag` | `bool\|null` | `null` | 传入则设置标记 |

**返回值**

- `static\|bool`
