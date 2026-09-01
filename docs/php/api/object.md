# Object 对象基类

- **目录位置**: `kernel/Foundation/Object/`
- **命名空间**: `kernel\Foundation\Object`

对象层基类体系。继承链：**`BaseObject` → `AbilityBaseObject`**。另有 `DataObject`（可写数据对象，继承 `\stdClass`）与 `ReadonlyDataObject`（只读变体，继承 `DataObject`）。

## BaseObject — 对象基类

- **文件位置**: `kernel/Foundation/Object/BaseObject.php`
- **命名空间**: `kernel\Foundation\Object`

对象基类，提供单例与工厂能力。**`singleton()` 是 Model 层核心约定**（`XxxModel::singleton()`）。

### `singleton(...$args)`

单例获取（final）。单例池按 `get_called_class()` 分类（故意用 `self::` 非 `static::`）；只认类型不认参数，参数仅首次生效；「非空参数且指纹不同」抛 `\LogicException`。防克隆（`private __clone`）防反序列化（`__wakeup` 抛 `LogicException`）。

```php
$model = UserModel::singleton();          // 单例
```

### `make(...$args)`

工厂创建新实例（final，非单例）。

```php
$model = UserModel::make();
```

### 单例管理

| 方法 | 说明 |
|------|------|
| `hasSingleton($class = null)` | 判断单例池中是否有（默认当前类） |
| `clearSingleton($class = null)` | 清空单例池（默认当前类） |

## AbilityBaseObject — 能力对象基类

- **文件位置**: `kernel/Foundation/Object/AbilityBaseObject.php`
- **命名空间**: `kernel\Foundation\Object`
- **继承**: `BaseObject`

带实例错误机制的对象基类。提供统一的结果返回与错误处理范式（`Service`/`Controller` 广泛使用）。

### 错误设置

```php
$this->setError($statusCode, $code, $message, $details = null, $data = null);
```

> **注意**：`setError()` **已移除 `$return` 参数**（旧版传布尔决定是否抛错，现改为始终设置错误态，通过 `return()`/`break()` 控制流程）。

### 结果返回

| 方法 | 说明 |
|------|------|
| `return()` | 无错误守卫返回 `Result::succeeded()`，否则返回错误 Result |
| `break(Result $result)` | 分支加 `isError` 守卫，用错误态 getter 处理 |
| `forwardBreak()` | 空错误守卫（无错误直接返回） |
| `isError()` | 是否处于错误态 |
| `reset()` | 重置错误态 |
| `getError()` | 获取错误对象 |

`break()`/`return()` 方法名与 PHP 关键字相同，**不可改名**。

### 错误态 getter

| 方法 | 说明 |
|------|------|
| `errorStatusCode()` | 错误状态码 |
| `errorCode()` | 错误码 |
| `errorMessage()` | 错误消息 |
| `errorDetails()` | 错误详情 |

> **注意**：用错误态 getter（`errorStatusCode()` 等），勿用「无论成败」的 `getStatusCode()`/`getMessage()`。

### 魔术访问防御

`__get` 用 `property_exists` 防御，并配对 `__isset`。控制器 `if ($this->platform->error) return $this->platform->return()` 通过 `__get` 读 protected `error`（**`__get` 不可删**）。

```php
class PlatformService extends Service
{
    public function login($params): Result
    {
        $this->setError(400, "400:X", "账号或密码错误");
        return $this->return();
    }
}

if ($platform->isError()) {
    return Result::failed(
        $platform->errorStatusCode(),
        $platform->errorCode(),
        $platform->errorMessage(),
        $platform->errorDetails()
    );
}
```

## DataObject — 数据对象（可写）

- **文件位置**: `kernel/Foundation/Object/DataObject.php`
- **命名空间**: `kernel\Foundation\Object`
- **继承**: `\stdClass`

可写数据对象。实例化一次性赋值，之后仍可通过 `set()` 或 `->prop = $v` 继续写入（含动态属性）。需只读语义请使用 {@see ReadonlyDataObject}。

```php
$data = new DataObject(["name" => "张三", "age" => 18]);
$name = $data->name;      // 张三
$data->name = "李四";      // 允许写入
```

> 只读变体见 {@see ReadonlyDataObject}（在 `__set` 上叠加写入拦截）。

## ReadonlyDataObject — 只读数据对象

- **文件位置**: `kernel/Foundation/Object/ReadonlyDataObject.php`
- **命名空间**: `kernel\Foundation\Object`
- **继承**: `DataObject`

`DataObject` 的只读变体：继承全部读写与序列化能力，但重写 `__set` 禁止实例化后的任何写入。子类包括 `StorageFile`、`StorageFileInfoData` 等。

```php
$data = new ReadonlyDataObject(["name" => "张三", "age" => 18]);
$name = $data->name;      // 张三
$data->name = "李四";      // 抛异常（__set 只读）
```

### 方法

| 方法 | 说明 |
|------|------|
| `properties()` | 抽公共方法（ReflectionClass 滤 static），列出所有属性 |
| `toJson($flags)` | 转 JSON（未实现 `JsonSerializable`） |
| `__toString()` | 转字符串 |
| `has($key)` | 是否有该键 |
| `get($key, $default)` | 取值 |
| `keys()` | 所有键 |

### 构造行为

构造缺键保留默认值（`array_key_exists` 守卫）；`__set` 抛异常保证只读。
