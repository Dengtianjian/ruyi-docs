# BaseObject — 基对象

BaseObject 是所有模型、服务和能力类的基类，提供**单例**与**工厂实例化**能力。

- **命名空间**: `kernel\Foundation\Object`
- **文件位置**: `kernel/Foundation/Object/BaseObject.php`
- **子类**: `AbilityBaseObject`（提供实例级错误机制）

## 设计约定

- 单例缓存按 `get_called_class()`（后期静态绑定的实际类名）分类存放，互不共享、不随继承传递——每个具体子类各持有一份单例。
- 单例「只认类型、不认参数」：构造参数仅在**首次实例化**时生效。
- 单例不可通过 `clone` 或反序列化绕过唯一性（已私有化 `__clone`，`__wakeup` 会抛 `LogicException`）。

## 方法列表

### `singleton(...$args)`

单例调用。每个类仅实例化一次，后续调用返回缓存实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$args` | `mixed` | 首次实例化时传入的构造参数 |

返回值：`static`

| 异常 | 说明 |
|------|------|
| `\LogicException` | 首次实例化后，又以**不同的非空参数**调用 |

```php
// 第一次调用：创建实例
$instance1 = MyService::singleton();

// 再次无参调用：返回同一个实例（取缓存，不受影响）
$instance2 = MyService::singleton();

// $instance1 === $instance2  // true
```

**参数一致性**：单例只认类型、不认参数。若首次用一组参数实例化，之后又以**不同的非空参数**调用，会抛出 `\LogicException`；无参再调用始终返回缓存。

### `make(...$args)`

工厂调用。每次调用都会实例化一次类。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$args` | `mixed` | 实例化参数 |

返回值：`static`

```php
$instance1 = MyService::make();
$instance2 = MyService::make();

// $instance1 !== $instance2  // true
```

需要单例时请用 `singleton()`。

### `hasSingleton($class = null)`

判断某个类是否已经完成单例实例化。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$class` | `string\|null` | 要查询的类名，为空时使用调用者类名 |

返回值：`bool`

```php
$isReady = MyService::hasSingleton();
```

### `clearSingleton($class = null)`

清空单例缓存，便于测试重置或释放常驻进程中的实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$class` | `string\|null` | 要清除的类名，为空时清空全部单例缓存 |

返回值：`void`

```php
// 清除某个类的单例
MyService::clearSingleton(MyService::class);

// 清空全部单例
BaseObject::clearSingleton();
```

## 使用方式

### 单例模式

```php
class DatabaseService extends BaseObject
{
    private $connection;

    public function __construct()
    {
        $this->connection = new PDO(...);
    }

    public function query($sql)
    {
        return $this->connection->query($sql);
    }
}

// 整个请求生命周期内共享同一个数据库连接
$db = DatabaseService::singleton();
$db->query("SELECT * FROM users");

// 其他地方获取同一个实例
$db2 = DatabaseService::singleton();
// $db === $db2
```

### 每次新建实例

```php
$validator1 = ValidatorService::make($data1);
$validator2 = ValidatorService::make($data2);
// 两个独立的实例
```
