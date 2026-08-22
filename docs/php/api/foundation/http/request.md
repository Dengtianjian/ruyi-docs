# Request — 请求对象

- **文件位置**: `kernel/Foundation/HTTP/Request.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **是否可继承**: 是

请求上下文对象，封装了当前 HTTP 请求的查询参数、请求体、请求头、URI 参数。构造时自动初始化各子对象。请求方法 / URI 通过 `method()` / `uri()` 方法**延迟解析**（首次调用时读取）。可通过 `getApp()->request()` 获取（或 `$this->request` 在控制器内）。

**开发模式下**（`App::mode() === "development"`）额外支持：
- 通过 `_method` 参数模拟请求方法；
- 通过 `x-async` 参数模拟内部请求。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$query` | `RequestQuery` | `null` | public | 请求 query 参数 |
| `$body` | `RequestBody` | `null` | public | 请求体 |
| `$header` | `RequestHeader` | `null` | public | 请求头 |
| `$params` | `RequestParams` | `null` | public | URI 参数（路由动态参数） |
| `$route` | `array\|null` | `null` | public | 匹配到的路由（`App::run()` 写入，业务经 `route()` 读取） |

> `$method` / `$uri` 为私有属性，经 `method()` / `uri()` 读写。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 构造：初始化各请求子对象 |
| `Request::ip()` | 获取真实客户端 IP |
| `method()` | 获取/设置请求方法（传参写入，无参延迟解析，dev 支持 `_method` 覆盖） |
| `uri()` | 获取/设置请求 URI（传参写入，无参延迟解析） |
| `route()` | 获取当前匹配到的路由 |
| `input()` | 统一读取输入（params → query → body） |
| `hasInput()` | 是否存在指定输入 |
| `all()` | 合并全部输入参数 |
| `hasFile()` | 是否存在上传文件 |
| `file()` | 获取上传文件（可指定键，多文件字段自动展平） |
| `isMethod()` | 判断请求方法是否等于指定方法 |
| `isGet()` / `isPost()` / `isPut()` / `isDelete()` / `isPatch()` | 常用请求方法快捷判断 |
| `path()` | 规范化请求路径（去除 query、首尾斜杠） |
| `segments()` | 请求路径分段数组 |
| `segment()` | 取第 index 段 |
| `isPath()` | 判断路径是否匹配模式（支持 `{param}` / `{param:regex}`） |
| `userAgent()` | 获取 User-Agent 头 |
| `referrer()` | 获取 Referer 头 |
| `scheme()` | 获取请求协议（http/https） |
| `isSecure()` | 是否为 HTTPS |
| `host()` | 获取请求主机名 |
| `fullUrl()` | 完整请求 URL（不含 query） |
| `cookie()` | 读取 Cookie 值 |
| `isCli()` | 是否为 CLI 环境 |
| `preferredOutputType()` | 根据请求头推断期望输出格式 |
| `async()` | 是否为内部 ASYNC 请求 |

## 方法

### `__construct()` — 构造请求对象

初始化 `query` / `body` / `header` / `params` 四个子对象。请求方法与 URI 采用延迟解析，首次调用 `method()` / `uri()` 时读取。

**参数**

- 无。

**返回值**

- 无。

### `Request::ip()` — 获取真实客户端 IP

默认取 `$_SERVER['REMOTE_ADDR']`（TCP 远端地址，不可伪造）。仅当设置了 `TRUSTED_PROXY` / `trusted_proxy` 环境变量时，才回退读取 `HTTP_X_FORWARDED_FOR` / `HTTP_CLIENT_IP`；`X-Forwarded-For` 逗号链取最左侧有效 IP。所有候选值经 `FILTER_VALIDATE_IP` 校验。

**参数**

- 无。

**返回值**

- `string|null`：IP 地址；无法获取时返回 `null`。

### `method()` — 获取/设置请求方法

传参则写入请求方法（转小写并 `addslashes`）；无参调用时延迟解析：首次从 `$_SERVER['REQUEST_METHOD']` 读取（默认 `get`），开发模式下可用 `_method` query/params 参数模拟，始终允许请求体 `_method` 覆盖。

**参数**

- `string|null $value = null`：请求方法。传入则写入；`null` 表示仅读取。

**返回值**

- `string`：请求方法（小写）。

### `uri()` — 获取/设置请求 URI

传参则写入请求 URI；无参调用时延迟解析：首次优先取 `uri` query 参数；否则从 `$_SERVER['REQUEST_URI']` 截取到 `?` 前（CLI 下为 `/` 兜底）。

**参数**

- `string|null $value = null`：请求 URI。传入则写入；`null` 表示仅读取。

**返回值**

- `string`：请求 URI。

### `route()` — 获取当前匹配到的路由

返回 `App::run()` 路由匹配后写入 `$route` 的路由数组。业务代码统一从 `route()` 读取。

**参数**

- 无。

**返回值**

- `array|null`：匹配到的路由；未匹配时返回 `null`。

### `input()` — 统一读取输入参数

按 **params（路由参数）→ query → body** 的顺序返回第一个存在的值；均不存在返回默认值。适用于不确定参数来源（路由参数或查询参数）的场景。

**参数**

- `string $key`：键名。
- `mixed $default = null`：默认值。

**返回值**

- `mixed`：命中的值；均不存在时返回默认值。

### `hasInput()` — 是否存在指定输入

**参数**

- `string $key`：键名。

**返回值**

- `bool`：任一输入源存在该键返回 `true`，否则 `false`。

### `all()` — 合并全部输入参数

按 **params → query → body** 顺序合并，后者覆盖前者；body 非数组时忽略。

**参数**

- 无。

**返回值**

- `array`：合并后的输入参数。

### `hasFile()` — 是否存在上传文件

不传键时判断是否有任意上传文件；传键时判断指定键是否有有效上传。

**参数**

- `string|null $key = null`：文件键名；`null` 表示任意上传。

**返回值**

- `bool`：存在有效上传返回 `true`，否则 `false`。

### `file()` — 获取上传文件

不传键时返回全部归一化后的上传文件映射（键名 => 单文件数组）；传键时返回归一化后的单文件数组，不存在或无效上传返回 `null`。PHP 的数组型多文件字段（`$_FILES['name']['tmp_name'][0]…`）会自动展平为以原始文件名为键的单文件数组。

归一化后的单文件结构：

```php
[
  "name"      => "photo.jpg",     // 原始文件名
  "tmp_name"  => "/tmp/phpXXXX",  // 临时文件路径
  "error"     => 0,               // UPLOAD_ERR_* 错误码
  "size"      => 12345,           // 文件大小（字节）
  "type"      => "image/jpeg",    // MIME 类型
  "full_path" => "photo.jpg",     // 客户端提交的完整路径
]
```

**参数**

- `string|null $key = null`：文件键名；`null` 返回全部。

**返回值**

- `array|null`：单文件数组（传键时）或键名=>单文件数组的映射（不传键时）；键不存在或无效返回 `null`。

### `isMethod()` — 判断请求方法

**参数**

- `string $method`：方法名（大小写不敏感）。

**返回值**

- `bool`：相等返回 `true`。

### `isGet()` / `isPost()` / `isPut()` / `isDelete()` / `isPatch()` — 请求方法快捷判断

等价于 `isMethod("get")` / `isMethod("post")` 等。

**参数**

- 无。

**返回值**

- `bool`。

### `path()` — 规范化请求路径

去除 query 串与首尾斜杠；根路径返回 `/`。

**参数**

- 无。

**返回值**

- `string`：如 `/links/5` → `links/5`。

### `segments()` — 请求路径分段

**参数**

- 无。

**返回值**

- `array`：按 `/` 拆分；`/` 或空返回 `[]`。

### `segment()` — 取第 index 段

**参数**

- `int $index`：段下标（从 0 开始）。

**返回值**

- `string|null`：对应段；越界返回 `null`。

### `isPath()` — 判断路径是否匹配模式

模式支持 `{param}` 与 `{param:regex}` 占位符；匹配成功会把提取出的参数合并进 `params`。

**参数**

- `string $pattern`：路径模式，如 `links/{id}`、`posts/{pid:[0-9]+}/{page}`。

**返回值**

- `bool`：匹配返回 `true`（并把参数写入 `params`），否则 `false`。

### `userAgent()` — 获取 User-Agent 头

**参数**

- 无。

**返回值**

- `string|null`。

### `referrer()` — 获取 Referer 头

**参数**

- 无。

**返回值**

- `string|null`。

### `scheme()` — 获取请求协议

默认按 `$_SERVER['HTTPS']` 判断；仅配置可信代理时才回退 `HTTP_X_FORWARDED_PROTO`。

**参数**

- 无。

**返回值**

- `string`：`http` 或 `https`。

### `isSecure()` — 是否为 HTTPS

**参数**

- 无。

**返回值**

- `bool`。

### `host()` — 获取请求主机名

Host 头优先，缺省取 `SERVER_NAME`。

**参数**

- 无。

**返回值**

- `string|null`。

### `fullUrl()` — 完整请求 URL

`scheme://host/path`（不含 query）。

**参数**

- 无。

**返回值**

- `string|null`：无法取得主机名时返回 `null`。

### `cookie()` — 读取 Cookie 值

**参数**

- `string $key`：键名。
- `mixed $default = null`：默认值。

**返回值**

- `mixed`。

### `isCli()` — 是否为 CLI 环境

**参数**

- 无。

**返回值**

- `bool`：`PHP_SAPI === "cli"`。

### `async()` — 是否为内部 ASYNC 请求

ASYNC 请求是服务器通过 cURL 向自身发起的内部 HTTP 请求，头部带 `x-async` 标识（由 `Router::dispatch()` 附加）。开发模式支持 `x-async` 参数模拟。

**参数**

- 无。

**返回值**

- `bool`：是 ASYNC 请求返回 `true`，否则 `false`。
