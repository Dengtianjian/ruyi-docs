# BaseObject — 基对象

- **文件位置**: `kernel/Foundation/Object/BaseObject.php`
- **命名空间**: `kernel\Foundation\Object`
- **是否可继承**: 是（继承链根）

提供通用的实例化与单例能力，是整个对象继承链的根类。`singleton()` 是 **Model 层核心约定**，不可改名。

**单例设计约定**：
- 单例缓存按 `get_called_class()`（实际类名，后期静态绑定）分类存放，**互不共享、不随继承传递**——每个具体子类各持有一份单例。
- 单例"只认类型、不认参数"：构造参数仅在**首次实例化**时生效；首次实例化后无参调用 `singleton()` 是取缓存的常规用法；若之后以**不同的非空参数**调用，会抛 `LogicException` 提示。
- 单例不可通过 `clone` 或反序列化绕过唯一性（`__clone` 私有化，`__wakeup` 抛异常）。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$singletonPool` | `array<string, static>` | `[]` | static private | 单例实例池，键为实际类名 |
| `$singletonFingerprints` | `array<string, string\|null>` | `[]` | static private | 单例首次实例化的构造参数指纹；`null` 表示参数无法序列化，跳过一致性检测 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `singleton(...$args)` | 单例调用：每个类仅实例化一次，后续返回缓存实例 |
| `make(...$args)` | 工厂调用：每次调用都实例化一次 |
| `hasSingleton($class = null)` | 判断某类是否已单例实例化 |
| `clearSingleton($class = null)` | 清空单例缓存（测试重置/释放实例） |
| `buildFingerprint($args)` | 生成构造参数指纹（private） |
| `__clone()` | 私有化，防止克隆破坏单例唯一性（private） |
| `__wakeup()` | 反序列化抛异常，防止重建实例 |

## 方法

### `singleton(...$args)` — 单例调用

每个类仅实例化一次，后续调用返回缓存实例。**final**，不可覆盖。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$args` | `mixed`（可变参数） | 无 | 首次实例化时传入的构造参数 |

**返回值**

- `static`：单例实例。

**异常**

- `\LogicException`：首次实例化后，又以不同的非空参数调用单例时抛出。

**示例**

```php
$db = Database::singleton("host", "user");
$db = Database::singleton();   // 取缓存实例（无参调用为常规用法）
```

### `make(...$args)` — 工厂调用

每次调用都实例化一次类。需要单例时请用 `singleton()`。**final**。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$args` | `mixed`（可变参数） | 无 | 实例化时传入的参数 |

**返回值**

- `static`：新实例。

### `hasSingleton($class = null)` — 判断是否已单例实例化

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$class` | `string\|null` | `null` | 要查询的类名；为空时使用调用者类名 |

**返回值**

- `bool`：已单例实例化返回 `true`，否则 `false`。

### `clearSingleton($class = null)` — 清空单例缓存

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$class` | `string\|null` | `null` | 要清除的类名；为空时清空全部单例缓存 |

**返回值**

- 无（`void`）。

### `buildFingerprint($args)` — 生成构造参数指纹

参数无法序列化（如闭包、资源、含闭包对象）时返回 `null`，表示跳过一致性检测。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$args` | `array` | 无 | 构造参数 |

**返回值**

- `string|null`：参数的序列化指纹；无法序列化返回 `null`。

### `__clone()` — 防止克隆

> private。空实现，禁止外部克隆。

**参数**

- 无。

### `__wakeup()` — 防止反序列化

**参数**

- 无。

**异常**

- `\LogicException`：始终抛出"单例类不允许被反序列化"。
