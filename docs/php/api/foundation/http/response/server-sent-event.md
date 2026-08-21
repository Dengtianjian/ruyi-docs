# ServerSentEvent — 服务端推送事件（SSE）

- **文件位置**: `kernel/Foundation/HTTP/Response/ServerSentEvent.php`
- **命名空间**: `kernel\Foundation\HTTP\Response`
- **继承**: 继承 `kernel\Foundation\HTTP\Response`
- **是否可继承**: 是

**SSE（Server-Sent Events）** 响应，服务端持续向浏览器推送事件。构造后进入循环，反复调用回调向客户端推送数据，直到连接断开或调用 `close()`。

**协议输出**（每帧）：
```
id: <uniqid>
event: <事件名>
data: <JSON/XML/文本>

```

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$responseEventName` | `string` | `"message"` | protected | 事件名称（输出到 `event:` 行） |
| `$closed` | `bool` | `false` | protected | 是否已关闭（退出循环） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($callback, $intervalTime, $outputType)` | 构造：进入 SSE 推送循环 |
| `success($data, $event, $statusCode, $code, $message)` | 推送成功事件 |
| `error($statusCode, $code, $message, $details, $data)` | 推送错误事件 |
| `ping()` | 推送 ping 心跳事件 |
| `output()` | 输出一帧 SSE 数据 |
| `close()` | 关闭 SSE 连接 |

## 方法

### `__construct($callback, $intervalTime = 1, $outputType = "json")` — 构造并进入 SSE 循环

设置响应头（`X-Accel-Buffering: no` / `Content-Type: text/event-stream` / `Cache-Control: no-cache`），随后进入循环：调用回调 → 清空输出缓冲并 `flush` → 连接断开则跳出 → `sleep($intervalTime)`。需在回调内调用 `success()` / `error()` 等输出方法。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable` | 无 | 推送回调，第一参数为当前响应实例 |
| `$intervalTime` | `int` | `1` | 推送间隔（秒） |
| `$outputType` | `string` | `"json"` | 输出数据类型：`json` / `text` / `xml` |

**返回值**

- 无。

**示例**

```php
use kernel\Foundation\HTTP\Response\ServerSentEvent;

new ServerSentEvent(function (ServerSentEvent $Response) {
    $Response->success(["time" => time()]);
    $Response->ping();
});
```

### `success($data, $event = "message", $statusCode = 200, $code = 200000, $message = "ok")` — 推送成功事件

构造成功响应并输出一帧。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `mixed` | 无 | 主体数据 |
| `$event` | `string` | `"message"` | 事件名称 |
| `$statusCode` | `int` | `200` | HTTP 状态码 |
| `$code` | `int\|string` | `200000` | 响应码 |
| `$message` | `string` | `"ok"` | 响应信息 |

**返回值**

- `$this`：支持链式调用。

### `error($statusCode, $code = 500, $message = "error", $details = [], $data = [])` — 推送错误事件

构造错误响应（事件名 `error`）并输出一帧。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$statusCode` | `int` | 无 | HTTP 状态码 |
| `$code` | `int\|string` | `500` | 响应码 |
| `$message` | `string` | `"error"` | 响应信息 |
| `$details` | `mixed` | `[]` | 错误详情 |
| `$data` | `mixed` | `[]` | 主体数据 |

**返回值**

- `$this`：支持链式调用。

### `ping()` — 推送 ping 心跳事件

推送 `event: ping`、`data: <时间戳>`，用于保持连接活跃。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。

### `output()` — 输出一帧 SSE 数据

输出响应头，按 `outputType` 编码数据（`json` 用 `json_encode`、`xml` 用 `Arr::toXML`、其余原样），拼装 `id` / `event` / `data` 三行并输出。

**参数**

- 无。

**返回值**

- 无（`void`）。

### `close()` — 关闭 SSE 连接

置 `closed = true`，让构造循环退出。

**参数**

- 无。

**返回值**

- `$this`：支持链式调用。
