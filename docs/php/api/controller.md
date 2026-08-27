# Controller 控制器体系

- **目录位置**: `kernel/Foundation/Controller/`
- **命名空间**: `kernel\Foundation\Controller`

控制器基类与配套的请求体、查询参数、响应封装。业务控制器继承 `Controller`，可选继承 `AuthController` 获取鉴权能力。

## 类一览

| 类 | 作用 |
|----|------|
| [Controller](foundation/controller/controller.md) | 所有业务控制器的抽象基类，封装 `__construct → boot → before → data → after` 完整生命周期 |
| [AuthController](foundation/controller/auth-controller.md) | 带认证能力的控制器基类，扩展 `$Admin`/`$Auth` 属性与 `verifyAdmin`/`verifyAuth` 钩子 |
| [ControllerBody](foundation/controller/controller-body.md) | HTTP Body 参数处理器，从 `Request` 提取 body 并按规则执行类型转换与校验 |
| [ControllerQuery](foundation/controller/controller-query.md) | HTTP Query 参数处理器，从 `Request` 提取 query 并按规则执行类型转换与校验 |
| [ControllerResponse](foundation/controller/controller-response.md) | 控制器响应封装，扩展 `Response` 提供 `file`/`download`/`list`/`view` 等便捷工厂方法 |

## 通用约定

### 控制器构造与生命周期

`Controller` 完整生命周期：

1. **构造** — 注入 `Request`，初始化空 `Response`；按子类配置的序列化/校验规则分别构造 `requestQuery`（GET）和 `requestBody`（POST/PUT/PATCH）；调用 `boot()` 钩子
2. **boot** — 子类初始化钩子（query/body 处理之后触发）
3. **before**（final）— 校验拦截：query/body 校验失败则替换 `response` 为错误响应，跳过 `data()` 直接进入 `after()`
4. **data** — 业务逻辑入口，子类必须覆盖
5. **after**（final）— 响应后处理：先按需 `Transform` 数据变换，再按 `responseSerializes` 规则序列化

### 子类配置属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$requestQuerySerializes` / `$requestBodySerializes` | `array\|Mutator\|null` | 对 GET/Body 参数做类型转换（`["name" => "string", "age" => "int"]`） |
| `$requestQueryValidator` / `$requestBodyValidator` | `array\|Validator\|null` | 对 GET/Body 参数做校验（`["name" => Rule::required()]`） |
| `$responseSerializes` | `array\|string\|Mutator\|Serializer\|null` | 对响应数据做序列化输出 |
| `$allowedTransformers` | `string[]` | 允许通过 `_transform` 参数调用的数据变换器类名列表 |

### 参数访问

```php
// 路由参数（URL 占位符）
$id = $this->params("id", 0);
$all = $this->params();

// Body 参数（经类型转换+校验）
$name = $this->body("name");
$page = $this->body();             // 全部

// Query 参数（经类型转换+校验）
$page = $this->query("page", 1);

// 原始 Body / Query（未经转换）
$raw = $this->rawBody();
$rawQ = $this->rawQuery();
```

### 快速响应

```php
return $this->success($data, 200, 200, "ok");                 // 成功
return $this->fail(500, "500:ServerError", "error", [], []);  // 错误
```

### `data()` 返回值约定

- `null` / `array` / `object` → 直接作为响应数据
- `Response` 实例（如 `success`/`fail` 返回）→ 替换当前 `response`
- `Result` 实例 → 直接作为响应数据
- `ResponsePagination` 实例 → 直接作为分页响应数据

## 完整示例

```php
use kernel\Foundation\Controller\Controller;
use kernel\Foundation\Validation\Rule;

class UserController extends Controller
{
    protected $requestBodySerializes = ["name" => "string", "age" => "int"];
    protected $requestBodyValidator = [
        "name" => Rule::required()->max(50),
        "age"  => Rule::required()->type("integer")->range(0, 150),
    ];

    protected function boot(): void
    {
        // 依赖注入或属性初始化
    }

    protected function data()
    {
        $name = $this->body("name");
        $age  = $this->body("age");
        return $this->success(["name" => $name, "age" => $age]);
    }
}
```

带认证的控制器：

```php
use kernel\Foundation\Controller\AuthController;
use kernel\Foundation\Result;

class AdminController extends AuthController
{
    protected function verifyAdmin(): Result
    {
        if (!$this->Admin) {
            return Result::failed("未登录", 401);
        }
        return new Result(null);
    }

    protected function data()
    {
        return $this->success("管理员面板");
    }
}
```

## 业务控制器目录

业务控制器位于 `kernel/Controller/`：

- `Main/`：HTTP 控制器
  - `IndexController.php`：默认首页控制器
  - `Files/`：文件相关控制器（上传/下载/预览/删除/更新/获取授权等）
  - `Extensions/`：扩展管理控制器（安装/卸载/升级/启停/列表）

命令行命令控制器位于 `kernel/Commands/`，详见 [Commands 命令体系](commands.md)。
