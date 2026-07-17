# Response — HTTP 响应

Response 负责构建和输出 HTTP 响应，支持 JSON、XML、HTML、文本等多种输出格式。

- **命名空间**: `kernel\Foundation\HTTP`
- **文件位置**: `kernel/Foundation/HTTP/Response.php`
- **子类**: `ControllerResponse`（增加了文件、下载、视图等方法）

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$error` | `bool` | 是否返回失败响应 |

## 方法列表

### `__construct($data = null, $statusCode = 200, $code = 200, $message = "ok", $details = [])`

构建响应实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 响应数据 |
| `$statusCode` | `int` | HTTP 状态码 |
| `$code` | `int\|string` | 业务响应码 |
| `$message` | `string` | 响应信息 |
| `$details` | `array` | 错误详情（statusCode > 299 时使用） |

### `header($key, $value, $replace = true)`

设置响应头。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string` | 响应头键名 |
| `$value` | `string` | 响应头值 |
| `$replace` | `bool` | 是否替换已有头 |

返回值：`Response`

```php
$this->response->header("X-Custom", "value");
$this->response->header("Authorization", "Bearer xxx...");
$this->response->header("Content-Type", "application/json");
```

### `null($statusCode = 200)`

返回空响应。

```php
return $this->response->null();       // 200 空响应
return $this->response->null(204);    // 204 No Content
```

### `error($statusCode, $code = 500, $message = "error", $details = [], $data = [])`

返回错误响应。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$statusCode` | `int` | HTTP 状态码 |
| `$code` | `int\|string` | 业务错误码 |
| `$message` | `string` | 错误信息 |
| `$details` | `mixed` | 错误详情 |
| `$data` | `mixed` | 附带数据 |

返回值：`Response`

```php
return $this->response->error(400, "400001:ValidateFailed", "参数错误");
return $this->response->error(401, "Auth:401001", "请登录后重试");
return $this->response->error(500, "500:ServerError", "服务器内部错误");
```

### `success($data, $statusCode = 200, $code = 200, $message = "ok")`

返回成功响应。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 响应数据 |
| `$statusCode` | `int` | HTTP 状态码 |
| `$code` | `int\|string` | 业务响应码 |
| `$message` | `string` | 响应信息 |

返回值：`Response`

```php
return $this->response->success($userData);
return $this->response->success(["message" => "创建成功"], 201);
```

### `statusCode($statusCode = null)`

设置或获取 HTTP 状态码。

```php
$this->response->statusCode(201);         // 设置
$code = $this->response->statusCode();    // 获取
```

### `setBody($body)`

设置响应主体内容（直接覆盖输出）。

```php
$this->response->setBody("自定义输出内容");
```

### `addBody($responseBody, $cover = false)`

添加数据到响应主体。

```php
$this->response->addBody(["version" => "1.0.0"]);
$this->response->addBody(["extra" => "value"]);
```

### `addData($data, $cover = false)`

添加/合并数据到主体数据。

```php
$this->response->addData(["extra" => "value"]);
```

### `setData($data)`

设置响应主体数据（覆盖）。

```php
$this->response->setData($userData);
```

### `json()`

设置输出格式为 JSON。

返回值：`Response`

```php
$this->response->json();  // 默认就是 JSON
```

### `xml()`

设置输出格式为 XML。

返回值：`Response`

```php
$this->response->xml();
```

### `text($format = false)`

设置输出格式为文本。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$format` | `bool` | `true` 时格式化输出 |

返回值：`Response`

```php
$this->response->text();
$this->response->text(true);  // 格式化输出
```

### `html()`

设置输出格式为 HTML。

返回值：`Response`

```php
$this->response->html();
```

### `redirect($url, $statusCode = 301)`

重定向。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$url` | `string` | 重定向目标 URL |
| `$statusCode` | `int` | HTTP 状态码 |

返回值：`Response`

```php
return $this->response->redirect("https://example.com");
return $this->response->redirect("/login", 302);
```

### `getBody()`

获取响应主体数据（含状态码、响应码等元数据）。

返回值：`array`

```php
$body = $response->getBody();
// ["statusCode" => 200, "code" => 200, "data" => [...], "message" => "ok", ...]
```

### `getData()`

获取响应主体数据（仅数据部分）。

返回值：`mixed`

```php
$data = $response->getData();
```

### `output()`

输出响应内容（调用后程序退出）。

### `outputType()`

获取当前输出格式类型。

返回值：`string|null` — `"json"`, `"xml"`, `"text"`, `"html"`, `null`

### `interaction(\Closure $callback, $statusCode, $errorCode, $responseType)`

静态方法，注册响应拦截器。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$callback` | `\Closure` | 拦截回调 |
| `$statusCode` | `int\|null` | 匹配状态码 |
| `$errorCode` | `string\|int\|null` | 匹配错误码 |
| `$responseType` | `string\|int\|null` | 匹配响应类型（`"success"`, `"error"`, `1`, `0`） |

```php
Response::interaction(function ($response) {
    Log::record("响应了 404 错误");
}, 404);

Response::interaction(function ($response) {
    // 所有成功响应都会触发
}, null, null, "success");
```

## ControllerResponse（控制器响应扩展）

`ControllerResponse` 继承自 `Response`，在控制器中通过 `$this->response` 使用，增加了以下方法：

### `file($filePath, $downloadFileName = null, $imageQuality = null, $cacheControl = "no-cache", $httpExpires = null)`

输出文件。

```php
return $this->response->file("/path/to/image.png");
return $this->response->file("/path/to/image.png", "avatar.png", 80);
```

### `download($filePath, $downloadFileName = null, $rateLimit = false)`

下载文件。

```php
return $this->response->download("/path/to/report.pdf");
return $this->response->download("/path/to/report.pdf", "月报.pdf", 1024); // 限速 1024KB/s
```

### `list($total, $data = null)`

返回分页列表响应。

```php
return $this->response->list($totalCount, $items);
// 等同于: new ResponsePagination($request, $totalCount, $items)
```

### `view($viewFile, $viewData = [], $viewFileBaseDir = "Views", $templateId = "page", $viewFileDir = null)`

渲染视图模板。

```php
return $this->response->view("index", ["title" => "首页"]);
```

## 响应数据结构

框架自动将控制器返回的数据包装为以下 JSON 结构：

```json
{
    "statusCode": 200,
    "code": 200,
    "data": { ... },
    "message": "ok",
    "details": null,
    "version": "1.0.0"
}
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 使用 | 控制器通过 `$this->response` 构建响应 |
| [App](./app.md) | 输出 | App 在流程最后调用 output() |
| [Request](./request.md) | 配对 | 请求-响应对 |
| [ReturnResult](./return-result.md) | 父类 | ReturnResult 继承自 Response |
