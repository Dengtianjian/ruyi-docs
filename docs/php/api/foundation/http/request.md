# Request — 请求对象

- **文件位置**: `kernel/Foundation/HTTP/Request.php`
- **命名空间**: `kernel\Foundation\HTTP`
- **是否可继承**: 是

请求上下文对象，封装了当前 HTTP 请求的查询参数、请求体、请求头、分页、URI 参数与模型查询参数。构造时自动初始化各子对象并解析请求方法与 URI。可通过 `getApp()->request()` 获取（或 `$this->request` 在控制器内）。

**开发模式下**（`App::mode() === "development"`）额外支持：
- 通过 `_method` 参数模拟请求方法；
- 通过 `x-ajax` / `x-async` 参数模拟异步/内部请求。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$query` | `RequestQuery` | `null` | public | 请求 query 参数 |
| `$body` | `RequestBody` | `null` | public | 请求体 |
| `$header` | `RequestHeader` | `null` | public | 请求头 |
| `$pagination` | `RequestPagination` | `null` | public | 分页信息 |
| `$params` | `RequestParams` | `null` | public | URI 参数（路由动态参数） |
| `$modelParams` | `RequestModelParams` | `null` | public | 模型查询参数 |
| `$method` | `string` | `"get"` | public | 请求方法（小写） |
| `$URI` | `string\|null` | `null` | public | 请求 URI |
| `$Route` | `array\|null` | `null` | public | 匹配到的路由（`App::run()` 匹配后写入，业务从 `$request->Route` 读取） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 构造：初始化各请求子对象并解析方法与 URI |
| `Request::realClientIp()` | 获取真实客户端 IP |
| `ajax()` | 是否为 AJAX 异步请求 |
| `async()` | 是否为内部 ASYNC 请求 |
| `getMethod()` | 解析请求方法（private） |
| `getURI()` | 解析请求 URI（private） |

## 方法

### `__construct()` — 构造请求对象

初始化 `query` / `body` / `header` / `pagination` / `params` / `modelParams` 六个子对象，并解析请求方法与 URI。

**参数**

- 无。

**返回值**

- 无。

### `Request::realClientIp()` — 获取真实客户端 IP

按 `HTTP_CLIENT_IP` → `HTTP_X_FORWARDED_FOR` → `REMOTE_ADDR` 顺序读取环境变量。

**参数**

- 无。

**返回值**

- `string|null`：IP 地址；无则返回 `null`。

### `ajax()` — 是否为 AJAX 异步请求

开发模式支持 `x-ajax` 参数模拟。检测 `X-Requested-With`（`XMLHttpRequest`/`fetch`）、`X-Ajax`/`x-ajax` 请求头、`isAjax` query 参数。

**参数**

- 无。

**返回值**

- `int\|bool`：是 AJAX 请求返回 `true`（或 `1`），否则返回 `0`。

### `async()` — 是否为内部 ASYNC 请求

ASYNC 请求是服务器通过 cURL 向自身发起的内部 HTTP 请求，头部带 `x-async` 标识（由 `Router::dispatch()` 附加）。开发模式支持 `x-async` 参数模拟。

**参数**

- 无。

**返回值**

- `bool`：是 ASYNC 请求返回 `true`，否则 `false`。

### `getMethod()` — 解析请求方法

> private。默认取 `$_SERVER['REQUEST_METHOD']`；开发模式下可用 `_method` query/params 参数模拟；始终允许请求体 `_method` 覆盖。转小写并 `addslashes`。

**参数**

- 无。

### `getURI()` — 解析请求 URI

> private。优先取 `uri` query 参数；否则从 `$_SERVER['REQUEST_URI']` 截取到 `?` 前（CLI 下为 `/` 兜底），`addslashes` 处理。

**参数**

- 无。
