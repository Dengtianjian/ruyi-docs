# ErrorCode — 错误码注册器

- **文件位置**: `kernel/Foundation/Exception/ErrorCode.php`
- **命名空间**: `kernel\Foundation\Exception`
- **类型**: 静态门面 + 真类（同一类同时提供静态 API 和可实例化对象）

业务错误码的集中注册器。**对象类型从过去的 `(object)` 升级为 `kernel\Foundation\Exception\ErrorCode` 真类**，所有 API 都围绕该类展开。

## 设计目标

- **统一错误码对象类型**：原本用 `stdClass` 强制转换，没有任何 IDE 提示；现在用真类
- **统一注册表**：进程内 `self::$errorCodes` 按 name 索引，新增 `exists/remove/all/clear` 等维护 API
- **集中加载**：配置文件 `return` 的内容可以是 `ErrorCode::create(...)` 对象、也可以是 `[statusCode, errorCode, message]` 三元组（向后兼容）
- **可观测性**：重复注册触发 `E_USER_WARNING`，方便调试
- **零误差防线**：`find($name)` 不存在即抛错，杜绝 NPE

## API 速查

| 方法 | 作用 |
|------|------|
| `load($filePath)` | 从 PHP 文件批量加载错误码 |
| `register($name \| $obj, ...)` | 注册单个错误码，支持字段模式或对象模式 |
| `find($name)` | 按 name 取错误码对象（不存在即抛错） |
| `exists($name)` | 判断 name 是否已注册 |
| `remove($name)` | 移除一条错误码 |
| `all()` | 取全部已注册错误码（调试/文档生成用） |
| `clear()` | 清空错误码池（主要给单元测试用） |
| `create($name, $statusCode, $errorCode, $message)` | 工厂方法，创建 `ErrorCode` 实例 |

## 属性

每条错误码 `name/statusCode/errorCode/message` 4 字段，全部 camelCase：

| 属性 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 错误码名称（唯一标识） |
| `$statusCode` | `int` | HTTP 状态码 |
| `$errorCode` | `int\|string` | 业务错误码（与 `Error::$errorCode` 对齐） |
| `$message` | `string` | 错误描述 |

## 方法详情

### `load($filePath)` — 从 PHP 文件批量加载

文件必须 `return array`，元素可以是：

- `ErrorCode::create(...)` 真对象
- `'<NAME>' => [statusCode, errorCode, message]` 三元组（name 即错误的 name）

```php
return [
  ErrorCode::create("USER_NOT_FOUND", 404, "404:UserNotFound", "用户不存在"),
  "PERM_DENIED" => [403, "403:Forbidden", "禁止"],
];
```

**异常**

- `Error`：文件不存在 → `500:ErrorCodeFileNotExist`
- `Error`：文件未 return 数组 → `500:ErrorCodeFileInvalid`
- `Error`：注册项既非对象也非三元组 → `500:ErrorCodeItemInvalid`

### `register(...)` — 注册错误码

字段模式：

```php
ErrorCode::register("USER_NOT_FOUND", 404, "404:UserNotFound", "用户不存在");
```

对象模式（更清晰、IDE 友好）：

```php
ErrorCode::register(ErrorCode::create("USER_NOT_FOUND", 404, "404:UserNotFound", "用户不存在"));
```

**返回值**：`ErrorCode` 对象（已注册到池中）；重复 name 会触发 `E_USER_WARNING` 并覆盖。

### `find($name)` — 取错误码

```php
$c = ErrorCode::find("USER_NOT_FOUND");
throw new Error($c->message, $c->statusCode, $c->errorCode);
```

**异常**：name 不存在抛 `500:ErrorCodeNotExist`，details 为 name 本身。

### `exists/remove/all/clear` — 维护 API

```php
ErrorCode::exists("USER_NOT_FOUND");   // bool
ErrorCode::remove("USER_NOT_FOUND");   // 移除单条
$all = ErrorCode::all();               // 取全部
ErrorCode::clear();                    // 清空（unit test 用）
```

## 业务错误码配置文件示例

```php
// app/Configs/errorCodes.php
use kernel\Foundation\Exception\ErrorCode;

return [
    "USER_NOT_FOUND"        => [404, "404:UserNotFound", "用户不存在"],
    "USER_DISABLED"         => [403, "403:UserDisabled", "账号已停用"],
    "PERMISSION_DENIED"     => [403, "403:Forbidden", "无权限"],
    ErrorCode::create("INTERNAL_ERROR", 500, "500:ServerError", "服务器错误"),
];
```

加载并使用：

```php
use kernel\Foundation\Exception\ErrorCode;
use kernel\Foundation\Exception\Error;

ErrorCode::load($app->path("dir") . "/Configs/errorCodes.php");
$c = ErrorCode::find("USER_NOT_FOUND");
throw new Error($c->message, $c->statusCode, $c->errorCode, ["uid" => $uid]);
```
