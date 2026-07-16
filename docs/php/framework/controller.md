# Controller — 基础控制器

Controller 是所有控制器的基类，提供请求参数校验、数据转换（Transform）、序列化和响应输出等基础功能。

- **命名空间**: `kernel\Foundation\Controller`
- **文件位置**: `kernel/Foundation/Controller/Controller.php`

## 生命周期

```
__construct()
  │  初始化 $request, $response
  │  创建 $requestQuery / $requestBody（序列化 + 校验）
  │
  ▼
boot()              ← 子类可覆盖，自定义初始化
  │
  ▼
before()（final）
  │
  ├─ $requestQuery 校验  → 失败则 $this->response = error
  └─ $requestBody 校验   → 失败则 $this->response = error
  │
  ▼
handleMethod()      ← Router 指定的方法（默认 data()），子类定义
  │  路由参数通过方法参数传入
  │
  ▼
after()（final）
  │
  ├─ transform()        ← 白名单数据转换器链
  └─ serialization()    ← 响应序列化（字段过滤）
  │
  ▼
$response->output()
```

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$request` | `Request` | 当前请求实例 |
| `$response` | `Response` | 控制器响应实例。生命周期内可能被替换为 ReturnResult / ResponsePagination 等 |
| `$requestBody` | `ControllerBody` | 请求体数据（构造时已完成类型转换和校验） |
| `$requestBodySerializes` | `array\|DataConversion\|null` | 请求体数据的序列化规则（类型转换） |
| `$requestBodyValidator` | `array\|Validator\|null` | 请求体数据校验器 |
| `$requestQuery` | `ControllerQuery` | 查询参数数据（构造时已完成类型转换和校验） |
| `$requestQuerySerializes` | `array\|DataConversion\|null` | 查询参数的序列化规则（类型转换） |
| `$requestQueryValidator` | `array\|Validator\|null` | 查询参数校验器 |
| `$responseSerializes` | `array\|string\|DataConversion\|Serializer\|null` | 响应数据序列化规则（输出字段过滤） |
| `$allowedTransformers` | `string[]` | 允许客户端通过 `_transform` 调用的数据转换器白名单 |

## 方法列表

### `__construct(Request $request)`

构造函数，接收请求实例，完成以下初始化：
1. 初始化 `$request` 和 `$response`
2. 创建 `$requestQuery` / `$requestBody` 实例（含序列化和校验）
3. 调用 `boot()` 钩子

### `boot()`（可覆写）

子类初始化钩子。在构造函数末尾、输入校验之前调用。

```php
class MyController extends Controller
{
    protected function boot(): void
    {
        // 在此执行自定义初始化，此时 $request / $response 已就绪
        // 但输入校验尚未执行
    }
}
```

### `before()`（final，不可覆写）

控制器执行前的钩子。执行顺序：
1. 检查 `$requestQuery` 校验结果
2. 检查 `$requestBody` 校验结果

任一步校验失败即设置 `$this->response` 为错误响应，跳过后续业务逻辑。

### `data(): mixed`（可覆写）

控制器核心业务处理方法。路由参数由 Router 匹配后通过方法参数传入。

```php
// 路由: /links/{linkId:\w+}
public function data($linkId): mixed
{
    $link = (new LinksModel())->where('id', $linkId)->getOne();
    return $link;
}
```

### `after()`（final，不可覆写）

控制器执行后的钩子。执行顺序：
1. 执行 `transform()` — 白名单数据转换器链
2. 执行 `serialization()` — 响应序列化

### `success(mixed $data, int $statusCode, int|string $code, string $message): Response`

快速构造成功响应。

### `fail(int $statusCode, int|string $code, string $message, mixed $details, mixed $data): Response`

快速构造失败响应，设置 `$this->response` 为错误状态。

## 使用方式

### 1. 定义请求参数类型转换（序列化规则）

```php
class MyController extends Controller
{
    // 请求体参数类型转换
    protected $requestBodySerializes = [
        "username" => "string",     // username 转换为字符串
        "age" => "int",             // age 转换为整数
        "active" => "bool",         // active 转换为布尔值
        "tags" => "array",          // tags 转换为数组
    ];

    public function data()
    {
        $body = $this->requestBody->all();  // 获取已转换的数据
        // $body['age'] 现在是整数类型
    }
}
```

### 2. 定义请求参数校验

```php
use kernel\Foundation\Validate\ValidateRules;

class MyController extends Controller
{
    protected $requestBodyValidator = [
        "username" => (new ValidateRules)->required()->type("string")->minLength(3),
        "age" => (new ValidateRules)->type("integer")->min(0)->max(150),
    ];

    public function data()
    {
        // 如果校验失败，before() 会自动设置错误响应
        // 校验通过才能执行到这里
    }
}
```

### 3. 定义响应数据序列化（输出过滤）

```php
class UserController extends Controller
{
    // 只输出指定字段
    protected $responseSerializes = [
        "id" => "int",
        "username" => "string",
        "nickname" => "string",
        "avatar" => "string",
    ];

    public function data()
    {
        $user = (new UsersModel())->where("id", 1)->getOne();
        // 返回的 user 数据只包含 id、username、nickname、avatar
        // password 等敏感字段被自动过滤
        return $user;
    }
}
```

### 4. 使用 Transform（数据转换器）

Transform 是 `data()` 执行后的数据处理管道，允许客户端灵活控制输出数据形态（分组、排序、字段过滤等）。

#### 设计理念：纯函数流转（Data In, Data Out）

转换器方法采用纯函数模式：**接收数据作为参数，返回处理后的新数据**。不再直接操作 `$this->response`，彻底解除与底层响应类的耦合，提高可测试性和复用性。

```
data() 返回数据
      │
      ▼
transform("withGroup", ["categoryId"], data) → 返回新数据
      │
      ▼
transform("limitFields", ["id,title"], data) → 返回新数据
      │
      ▼
serialization() → 输出
```

#### 声明可用转换器

```php
class ListLinksController extends Controller
{
    // 白名单：只允许客户端调用这些转换器
    protected $allowedTransformers = ["withGroup", "limitFields"];

    public function data()
    {
        return (new LinksModel())->getAll();
    }

    // 转换器方法签名：function name($data, ...$args): mixed
    // 接收数据，返回处理后的数据
    function withGroup($data, $field = null)
    {
        $key = $field ?? 'categoryId';
        $groups = [];
        foreach ($data as $item) {
            $groups[$item[$key]][] = $item;
        }
        return array_values($groups);
    }

    function limitFields($data, $fields = null)
    {
        if (!$fields) return $data;
        $allowedFields = explode(',', $fields);
        return array_map(function ($item) use ($allowedFields) {
            return array_intersect_key($item, array_flip($allowedFields));
        }, $data);
    }
}
```

> **安全机制**：框架通过白名单校验，客户端只能调用 `$allowedTransformers` 中声明的转换器，无法执行任意方法。

#### GET 请求触发转换器

客户端通过 `_transform` 查询参数指定转换器，支持传入参数：

```bash
# 按 categoryId 分组
GET /api/links?_transform=withGroup:categoryId

# 按 author_id 分组
GET /api/links?_transform=withGroup:author_id

# 同时限制字段并分组
GET /api/links?_transform=limitFields:id,title,withGroup:author_id

# 无参数转换器
GET /api/links?_transform=withStats
```

**GET 语法规则**：

| 示例 | 说明 |
|------|------|
| `withGroup` | 调用无参转换器 |
| `withGroup:categoryId` | 冒号 `:` 后为第一个参数 |
| `limitFields:id,title` | 逗号分隔的后续部分为额外参数 |
| `methodA:argA,methodB:argB` | 多个转换器，遇到新 `:` 即视为新转换器开始 |

> **解析规则**：`:` 标记了转换器名与参数的边界，遇到下一个含 `:` 的 token 就开始一个新的转换器。不含 `:` 的 token 属于当前转换器的参数。

#### POST 请求触发转换器

POST 请求体中通过 `_transform` 字段传入，支持更复杂的参数构型：

```json
{
    "_transform": [
        "withGroup",
        { "limitFields": ["id", "title", "createdAt"] }
    ]
}
```

也同时支持 GET 的字符串语法（嵌套在 body 中）：

```json
{
    "_transform": [
        "withStats",
        "withGroup:categoryId",
        "limitFields:id,title,url"
    ]
}
```

**POST 语法规则**：

| 形式 | 示例 | 说明 |
|------|------|------|
| 字符串（无参） | `"withGroup"` | 不传参数 |
| 字符串（带参） | `"withGroup:categoryId"` | 使用 GET 字符串语法 |
| 对象（精确传参） | `{"limitFields": ["id", "title"]}` | key 为方法名，value 为参数数组 |

#### 转换器执行流程

```php
// Controller.php 内部执行逻辑
private function transform()
{
    // 1. 从 query 或 body 获取 _transform（优先 query）
    $raw = $this->request->query->get("_transform") 
        ?? $this->request->body->get("_transform");
    if (!$raw) return;

    // 2. 委托 Transform 工具类解析为标准格式
    $transforms = Transform::parse($raw);

    // 3. 委托 Transform 工具类执行链（白名单校验 + 纯函数串联）
    $data = Transform::apply(
        $transforms, 
        $this->allowedTransformers, 
        $this,                            // handler: 转换器方法所在的实例
        $this->response->getData()        // 初始数据
    );

    $this->response->addData($data, true);
}
```

> `Transform` 是纯静态工具类（`kernel\Foundation\Data\Transform`），不依赖 Controller，可独立复用。

#### 完整示例：列表接口支持动态分组和字段过滤

```php
class ListArticlesController extends Controller
{
    protected $allowedTransformers = ["withGroup", "limitFields"];

    public function data()
    {
        return (new ArticlesModel())
            ->where('status', 1)
            ->orderBy('createdAt', 'DESC')
            ->get();
    }

    // 按指定字段分组（纯函数）
    function withGroup($data, $field = null)
    {
        $key = $field ?? 'categoryId';
        $groups = [];
        foreach ($data as $item) {
            $groups[$item[$key]][] = $item;
        }
        return $groups;
    }

    // 限制输出字段（纯函数）
    function limitFields($data, $fields = null)
    {
        if (!$fields) return $data;
        $allowed = explode(',', $fields);
        return array_map(fn($item) => 
            array_intersect_key($item, array_flip($allowed)), 
            $data
        );
    }
}
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [AuthController](./auth-controller.md) | 子类 | 增加认证功能 |
| [Request](./request.md) | 依赖 | 获取请求参数 |
| [Transform](../data/transform.md) | 工具类 | 解析 `_transform` 参数，执行转换器链 |
| [Validator](./validator.md) | 校验器 | 参数校验 |
| [DataConversion](./data-conversion.md) | 类型转换 | 参数类型转换 |
| [Serializer](./serializer.md) | 序列化 | 响应数据过滤 |
