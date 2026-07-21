# ReturnResult & ReturnList — 返回结果

ReturnResult 和 ReturnList 是标准化的方法返回值封装，用于在服务层/模型层返回带错误信息的结果。

## ReturnResult

ReturnResult 继承自 Response，用于封装方法的返回值（成功或失败），让调用方可以统一处理。

- **命名空间**: `kernel\Foundation\ReturnResult`
- **文件位置**: `kernel/Foundation/ReturnResult/ReturnResult.php`
- **继承**: `Response`

### 方法列表

#### 静态工厂方法

##### `succeeded($data = null, $statusCode = 200, $code = 200, $message = "ok")`

快速创建成功结果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 返回的数据 |
| `$statusCode` | `int` | HTTP 状态码（默认 200） |
| `$code` | `int\|string` | 响应码（默认 200） |
| `$message` | `string` | 响应信息（默认 "ok"） |

返回值：`static`

```php
$result = ReturnResult::succeeded(["id" => 1, "name" => "张三"]);
```

##### `failed($statusCode = 400, $code = "400:FAIL", $message = "error", $details = null)`

快速创建失败结果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$statusCode` | `int` | HTTP 状态码（默认 400） |
| `$code` | `int\|string` | 错误码（默认 "400:FAIL"） |
| `$message` | `string` | 错误信息（默认 "error"） |
| `$details` | `mixed` | 错误详情 |

返回值：`static`

```php
$result = ReturnResult::failed(400, "400:ValidateFailed:Custom", "用户名已存在");
```

#### 实例方法

#### `__construct($result, $errorStatusCode = null, $errorCode = 500, $errorMessage = "error", $errorDetails = null)`

构建返回结果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$result` | `mixed` | 结果数据 |
| `$errorStatusCode` | `int\|null` | HTTP 错误状态码（>299 表示失败） |
| `$errorCode` | `int\|string` | 业务错误码 |
| `$errorMessage` | `string` | 错误信息 |
| `$errorDetails` | `mixed` | 错误详情 |

```php
// 成功结果
$result = new ReturnResult(["id" => 1, "name" => "张三"]);

// 失败结果
$result = new ReturnResult(false, 400, "400001", "参数错误");
```

#### `result()`

获取成功的处理结果。

返回值：`mixed`

```php
$data = $result->result();  // 获取返回数据
```

#### `errorMessage()`

获取失败的错误信息。

返回值：`string|null`

```php
if ($result->error) {
    echo $result->errorMessage();  // "参数错误"
}
```

#### `errorStatusCode()`

获取失败的 HTTP 状态码。

返回值：`int|null`

```php
echo $result->errorStatusCode();  // 400
```

#### `errorCode()`

获取失败的业务错误码。

返回值：`string|int|null`

```php
echo $result->errorCode();  // "400001"
```

#### `errorDetails()`

获取失败的错误详情。

返回值：`mixed|null`

#### `throwError()`

将 ReturnResult 中的错误作为异常抛出。

```php
$result = someService();
if ($result->error) {
    $result->throwError();  // 抛出 Exception
}
```

#### `getData($key = null)`

获取响应数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 指定键，`null` 返回全部 |

返回值：`mixed`

#### `getResult($key = null)`

获取成功结果（失败时返回 null）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$key` | `string\|null` | 指定键，`null` 返回全部 |

返回值：`mixed|null`

```php
$data = $result->getResult();       // 成功返回数据，失败返回 null
$name = $result->getResult("name"); // 成功返回 name，失败返回 null
```

## ReturnList

ReturnList 继承自 ReturnResult，专门用于封装列表/分页数据。

- **命名空间**: `kernel\Foundation\ReturnResult`
- **文件位置**: `kernel/Foundation/ReturnResult/ReturnList.php`
- **继承**: `ReturnResult`

### 方法列表

#### 静态工厂方法

##### `succeeded($data = null, $statusCode = 200, $code = 200, $message = "ok")`

快速创建成功结果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 返回的数据 |
| `$statusCode` | `int` | HTTP 状态码（默认 200） |
| `$code` | `int\|string` | 响应码（默认 200） |
| `$message` | `string` | 响应信息（默认 "ok"） |

返回值：`static`

```php
$result = ReturnResult::succeeded(["id" => 1, "name" => "张三"]);
```

##### `failed($statusCode = 400, $code = "400:FAIL", $message = "error", $details = null)`

快速创建失败结果。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$statusCode` | `int` | HTTP 状态码（默认 400） |
| `$code` | `int\|string` | 错误码（默认 "400:FAIL"） |
| `$message` | `string` | 错误信息（默认 "error"） |
| `$details` | `mixed` | 错误详情 |

返回值：`static`

```php
$result = ReturnResult::failed(400, "400:ValidateFailed:Custom", "用户名已存在");
```

#### 实例方法

#### `__construct($list, $total = 0, $page = null, $limit = null, $items = null)`

构建列表返回。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$list` | `array` | 数据列表 |
| `$total` | `int` | 总条数 |
| `$page` | `int\|null` | 当前页数 |
| `$limit` | `int\|null` | 每页数量 |
| `$items` | `int\|null` | 当前页数据量（默认使用 count($list)） |

```php
$list = new ReturnList($articles, 100, 1, 20);
// 或
$list = new ReturnList($articles, 100);
```

#### `page($page = null)`

获取/设置页数。

```php
$page = $list->page();     // 获取
$list->page(2);            // 设置
```

#### `limit($limit = null)`

获取/设置每页数量。

```php
$perPage = $list->limit();  // 获取
$list->limit(50);           // 设置
```

#### `total($total = null)`

获取/设置总条数。

```php
$total = $list->total();   // 获取
$list->total(200);         // 设置
```

#### `items($items = null)`

获取/设置当前页数据量。

```php
$count = $list->items();   // 获取
$list->items(20);          // 设置
```

## 使用方式

### 服务层返回统一结果

```php
// Service/UserService.php
class UserService
{
    public function createUser($data)
    {
        // 校验
        if (empty($data['username'])) {
            return new ReturnResult(false, 400, "400001", "用户名不能为空");
        }
        
        // 检查重复
        $exists = (new UsersModel())->usernameExist($data['username']);
        if ($exists) {
            return new ReturnResult(false, 400, "400002", "用户名已存在");
        }
        
        // 创建
        $userId = (new UsersModel())->insert($data);
        
        return new ReturnResult(["id" => $userId]);
    }
}
```

### 控制器中处理 ReturnResult

```php
class RegisterController extends AuthController
{
    public function data()
    {
        $service = new UserService();
        $result = $service->createUser($this->requestBody->all());
        
        if ($result->error) {
            // 方式 1：直接返回（ReturnResult 继承自 Response）
            return $result;
            
            // 方式 2：抛出异常
            // $result->throwError();
        }
        
        return $result->result();
    }
}
```

### 分页列表返回

```php
public function listArticles($page, $perPage)
{
    $model = new ArticlesModel();
    
    $articles = $model
        ->where("status", "published")
        ->page($page, $perPage)
        ->order("createdAt", "DESC")
        ->getAll();
    
    $total = $model->where("status", "published")->count();
    
    return new ReturnList($articles, $total, $page, $perPage);
}
```

### 链式调用

```php
$list = new ReturnList($data);
$list->total(100)->page(2)->limit(20);
```

## ReturnResult vs 直接抛异常

| 方式 | 优点 | 缺点 |
|------|------|------|
| **ReturnResult** | 调用方可选择处理方式；不中断程序流程 | 需要手动检查 `$result->error` |
| **抛出异常** | 强制中断；不处理会暴露错误 | 必须 try/catch；不适合业务逻辑错误 |

推荐在服务层使用 ReturnResult，让调用方（控制器）决定如何处理错误。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Response](./response.md) | 父类 | ReturnResult 继承自 Response |
| [Controller](./controller.md) | 消费 | 控制器接收服务层返回的 ReturnResult |
| [Validator](./validator.md) | 返回值 | 校验器返回 ReturnResult |
| [AuthController](./auth-controller.md) | verifyAdmin/verifyAuth 返回值 | 认证方法返回 ReturnResult |
