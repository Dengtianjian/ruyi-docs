# Store — 全局状态存储

Store 提供请求生命周期的全局状态存储功能，用于在中间件和控制器之间共享数据（如登录用户信息）。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Store.php`
- **存储方式**: 基于 `$GLOBALS['_STORE']` 全局变量
- **生命周期**: 单次请求内有效

## 方法列表

### `set($value)`

设置全局变量。支持深度合并。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `array` | 关联数组，键值对 |

返回值：`bool`

```php
Store::set([
    "user" => ["id" => 1, "name" => "张三"],
    "config" => ["theme" => "dark"]
]);
```

### `setApp($value)`

设置当前应用的存储数据（会自动添加 `__App` 命名空间）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$value` | `array` | 要存储的数据 |

返回值：`bool`

```php
Store::setApp([
    "auth" => $authData,
    "token" => $token,
    "logged" => true,
    "userId" => $userId
]);
```

### `get($path = "")`

根据路径获取全局变量值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 数组路径，用 `/` 分隔。空字符串返回全部 |

返回值：`mixed`

```php
$count = Store::get("user/loginCount");
$all = Store::get();  // 获取全部
```

### `getApp($path = "")`

获取当前应用下的存储数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 数组路径，用 `/` 分隔 |

返回值：`mixed`

```php
$userId = Store::getApp("userId");     // 获取用户 ID
$logged = Store::getApp("logged");     // 是否已登录
$token = Store::getApp("token");       // 获取 token
$authData = Store::getApp("auth");     // 获取认证数据
$allApp = Store::getApp();             // 获取所有应用数据
```

### `remove($path = "")`

删除全局变量值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 数组路径，用 `/` 分隔。空字符串清空全部 |

### `removeApp($path = "")`

删除应用存储数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 路径，空字符串删除全部应用数据 |

## 使用方式

### 典型使用场景：认证中间件设置登录信息

```php
// GlobalAuthMiddleware::handle() 中
Store::setApp([
    "auth" => $authData,     // 认证数据
    "token" => $token,       // 当前 token
    "logged" => true,        // 登录状态
    "userId" => $authData['userId']  // 用户 ID
]);
```

### 控制器中读取登录信息

```php
class UpdateUserController extends AuthController
{
    public function data()
    {
        // 从 Store 获取登录用户 ID
        $userId = Store::getApp("userId");
        
        if (!$userId) {
            return $this->response->error(401, "未登录");
        }
        
        // 使用 $userId 执行业务逻辑
        $userData = $this->requestBody->all();
        (new UsersModel())->where("id", $userId)->update($userData);
    }
}
```

### 跨中间件共享数据

```php
// 中间件 1：设置数据
class FirstMiddleware extends Middleware
{
    public function handle(\Closure $next)
    {
        Store::set(["request_id" => uniqid()]);
        Store::setApp(["start_time" => microtime(true)]);
        return $next();
    }
}

// 中间件 2：读取数据
class SecondMiddleware extends Middleware
{
    public function handle(\Closure $next)
    {
        $requestId = Store::get("request_id");
        Log::record("处理请求: " . $requestId);
        return $next();
    }
}
```

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [GlobalAuthMiddleware](../application/middleware.md) | 写入 | 中间件设置登录状态 |
| [AuthController](./auth-controller.md) | 读取 | 控制器读取登录用户 ID |
| [Controller](./controller.md) | 读取 | 读取请求级别的共享数据 |
