# URL — 统一资源定位器

- **文件位置**: `kernel/Foundation/HTTP/URL.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **是否可继承**: 是

URL 解析、构建与修改工具。实例化时把 URL 拆解为 protocol / host / port / user / password / pathName / queryString / queryParams / fragment / origin 等属性，可修改后经 `toString()` 重组；也可静态构建 URL、查询字符串、路径等。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$URL` | `string\|null` | `null` | protected | 原始 URL 字符串 |
| `$host` | `string\|null` | `null` | public | 主机名 |
| `$origin` | `string\|null` | `null` | public | 源（origin，不含协议后的参数） |
| `$port` | `int\|null` | `null` | public | 端口 |
| `$user` | `string\|null` | `null` | public | 用户名 |
| `$password` | `string\|null` | `null` | public | 密码 |
| `$pathName` | `string\|null` | `null` | public | 路径 |
| `$protocol` | `string\|null` | `null` | public | 协议（scheme） |
| `$queryString` | `string\|null` | `null` | public | 查询字符串（原始） |
| `$queryParams` | `array` | `[]` | public | 查询参数（键值对） |
| `$fragment` | `string\|null` | `null` | public | hash 片段 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($URL)` | 构造并解析 URL |
| `parseURL($URL)` | 静态解析 URL 为数组 |
| `parseQueryString($queryString)` | 解析查询字符串为数组 |
| `buildQuery($queryParams, $encode)` | 构建查询字符串 |
| `buildURL(...)` | 静态构建完整 URL |
| `combinedPathName(...$paths)` | 组合多个路径段 |
| `toString()` | 将当前属性重组为 URL 字符串 |
| `__toString()` | 转字符串时调用 `toString()` |
| `queryParam($value, $key)` | 设置查询参数（链式） |

## 方法

### `__construct($URL = null)` — 构造并解析 URL

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$URL` | `string\|null` | `null` | URL 地址 |

**返回值**

- 无。

### `parseURL($URL)` — 解析 URL

基于 `parse_url`，额外解析 origin 与 queryParams。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$URL` | `string` | 无 | URL 地址 |

**返回值**

- `array`：含 `protocol` / `host` / `port` / `user` / `password` / `pathName` / `queryString` / `fragment` / `origin` / `queryParams`。

### `parseQueryString($queryString)` — 解析查询字符串

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$queryString` | `string` | 无 | 查询字符串（不含 `?`） |

**返回值**

- `array`：键值对数组（键值均做 URL 解码）。

### `buildQuery($queryParams, $encode = true)` — 构建查询字符串

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$queryParams` | `array` | 无 | 请求参数（键值对） |
| `$encode` | `bool` | `true` | 是否对键值做 `rawurlencode` |

**返回值**

- `string`：构建后的查询字符串（`k1=v1&k2=v2`）。

### `buildURL($host = "", $pathName = "", $queryParams = [], $fragment = null, $protocol = "https", $port = null, $user = null, $password = null)` — 构建完整 URL

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$host` | `string` | `""` | 主机信息 |
| `$pathName` | `string` | `""` | 路径（自动补前导 `/`） |
| `$queryParams` | `array` | `[]` | 请求参数 |
| `$fragment` | `string\|null` | `null` | hash 片段 |
| `$protocol` | `string` | `"https"` | 请求协议 |
| `$port` | `int\|null` | `null` | 端口 |
| `$user` | `string\|null` | `null` | 用户名 |
| `$password` | `string\|null` | `null` | 密码 |

**返回值**

- `string`：构建后的完整 URL。

### `combinedPathName(...$paths)` — 组合路径段

过滤空路径段，统一分隔符为 `/`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$paths` | `string`（可变参数） | 无 | 路径元素 |

**返回值**

- `string`：组合后的路径。

### `toString()` — 重组 URL 字符串

用当前各属性（host/pathName/queryParams/fragment/protocol/port/user/password）重新构建完整 URL。

**参数**

- 无。

**返回值**

- `string`：重组后的 URL。

### `__toString()` — 转字符串

调用 `toString()`。

**参数**

- 无。

**返回值**

- `string`：URL 字符串。

### `queryParam($value, $key = null)` — 设置查询参数

传入数组批量设置，或传入 `(值, 键)` 单个设置。值为空且键为空的字符串项会当作 `键名=空值` 处理。链式。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$value` | `string\|array` | 无 | 参数值，或键值对数组 |
| `$key` | `string\|null` | `null` | 参数名 |

**返回值**

- `$this`：支持链式调用。

**示例**

```php
$url = new URL("https://example.com/files/a.png");
$url->queryParam("s", 40);                 // 添加单个参数
$url->queryParam(["s" => 40, "q" => 80]);  // 批量添加
$url->toString();                          // "https://example.com/files/a.png?s=40&q=80"
```
