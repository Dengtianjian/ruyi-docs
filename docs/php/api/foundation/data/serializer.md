# Serializer — 序列化规则

- **文件位置**: `kernel/Foundation/Data/Serializer.php`
- **命名空间**: `kernel\Foundation\Data`
- **是否可继承**: 是

响应数据序列化规则管理器。定义/复用命名规则，对数据做字段筛选与类型转换。是 `Controller::$responseSerializes` 的核心。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$useRuleName` | `string` | `""` | public | 实例绑定的规则名（构造时传入） |
| `private static $Rules` | `array` | `[]` | private static | 静态规则仓库，保存所有已注册的命名规则 |

## 构造

### `__construct($RuleName)` — 绑定规则名

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$RuleName` | `string` | 无 | 绑定一个已注册的规则名，供实例使用该规则序列化 |

**返回值**

- 无。

**示例**

```php
$s = new Serializer("userPublic");
```

## 方法速查表

| 方法 | 作用 |
|------|------|
| `Serializer::get` | 获取规则（支持点号路径） |
| `Serializer::add` | 注册命名规则 |
| `Serializer::serialization` | 按规则序列化数据 |
| `Serializer::load` | 从文件加载规则（`import()` 唯一调用点） |
| `Serializer::loadGet` | 加载并获取规则 |

## 方法

### `Serializer::get($Names, $upperLevel = null)` — 获取规则

从规则仓库中按名称获取规则。支持点号路径（如 `"user.public"`）逐层读取。`$Names` 支持字符串或数组。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Names` | `string\|array` | 无 | 规则名或规则名数组（支持点号路径） |
| `$upperLevel` | `mixed` | `null` | 上级规则值，作为查找的起点上下文 |

**返回值**

- `mixed`：匹配的规则，未找到返回 `null`。

**示例**

```php
$rule = Serializer::get("userPublic");
$rule = Serializer::get("user.public");
```

### `Serializer::add($Name, $Rule)` — 注册规则

将命名规则注册到静态仓库，供后续 `get()`/`serialization()` 复用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Name` | `string` | 无 | 规则名称 |
| `$Rule` | `array\|mixed` | 无 | 规则定义（键为字段名，值为类型/规则） |

**返回值**

- 无。

**示例**

```php
Serializer::add("userPublic", [
    "id"   => "int",
    "name" => "string",
    "created_at" => "date",
]);
```

### `Serializer::serialization($RuleOrName, $Data, $SerializerName = "temp")` — 按规则序列化

按给定规则（或已注册规则名）对数据执行字段筛选与类型转换。`$RuleOrName` 为字符串时按 `SerializerName` 作为临时规则名注册到仓库；为数组时直接使用。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$RuleOrName` | `array\|string` | 无 | 规则数组，或已注册的规则名 |
| `$Data` | `mixed` | 无 | 待序列化的数据 |
| `$SerializerName` | `string` | `"temp"` | 匿名规则使用的临时规则名 |

**返回值**

- `mixed`：序列化后的数据。

**示例**

```php
$data = Serializer::serialization("userPublic", $userData);
// 或直接传规则数组
$data = Serializer::serialization(["id" => "int", "name" => "string"], $userData);
```

### `Serializer::load($FileName, $ruleName = null, $BasePath = null)` — 从文件加载规则

从规则文件加载序列化规则。底层调用全局 `import()` 函数加载 PHP 文件。是 `import()` 的唯一调用点。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileName` | `string` | 无 | 规则文件名 |
| `$ruleName` | `string\|null` | `null` | 从文件中提取的规则名 |
| `$BasePath` | `string\|null` | `null` | 基础路径，缺省时使用默认路径 |

**返回值**

- `mixed`：加载得到的规则。

**示例**

```php
Serializer::load("userRules.php", "userPublic");
```

### `Serializer::loadGet(...)` — 加载并获取规则

加载规则文件并立即获取指定规则。是 `load()` 与 `get()` 的组合便捷方法。参数与 `load()`/`get()` 对齐（文件名、规则名、基础路径）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| 变长参数 | `mixed` | 无 | 透传给加载与获取逻辑 |

**返回值**

- `mixed`：加载并获取到的规则。

**示例**

```php
$rule = Serializer::loadGet("userRules.php", "userPublic");
```

## 完整示例

```php
use kernel\Foundation\Data\Serializer;

// 1. 注册规则
Serializer::add("userPublic", [
    "id"   => "int",
    "name" => "string",
]);

// 2. 序列化
$user = ["id" => "1", "name" => "张三", "password" => "secret"];
$data = Serializer::serialization("userPublic", $user);
// ["id" => 1, "name" => "张三"]

// 3. 或从文件加载
Serializer::load("App/Serializers/UserRules.php", "userPublic");
```
