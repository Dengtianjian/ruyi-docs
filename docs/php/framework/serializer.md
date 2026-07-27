# Serializer — 数据序列化器

Serializer 提供响应数据的过滤和序列化功能。通过定义规则，可以精确控制输出哪些字段、如何处理每个字段。

- **命名空间**: `kernel\Foundation\Data`
- **文件位置**: `kernel/Foundation/Data/Serializer.php`

## 方法列表

### `__construct($RuleName)`

构建序列化实例。使用时仅需指定要调用的规则名称。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$RuleName` | `string` | 已注册的规则名称 |

```php
$serializer = new Serializer("user_profile");
```

### `add($Name, $Rule)`

静态方法，添加/注册序列化规则。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$Name` | `string` | 规则名称 |
| `$Rule` | `array` | 序列化规则数组 |

返回值：`bool`

```php
Serializer::add("user_basic", [
    "id" => "int",
    "username" => "string",
    "nickname" => "string"
]);
```

### `get($Names, $upperLevel = null)`

静态方法，根据名称获取已注册的序列化规则。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$Names` | `string\|string[]` | 规则名称，用 `.` 分隔层级 |
| `$upperLevel` | `array\|null` | 内部递归使用 |

返回值：`array|null`

```php
$rule = Serializer::get("user_profile");
$subRule = Serializer::get("article.author");
```

### `serialization($RuleOrName, $Data, $SerializerName = "temp")`

静态方法，执行序列化转换。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$RuleOrName` | `string\|array` | 序列化规则数组或规则名称 |
| `$Data` | `array` | 被序列化的数据 |
| `$SerializerName` | `string` | 序列化标记名（防止重复序列化） |

返回值：`mixed` — 序列化后的数据

```php
$data = ["id" => 1, "username" => "admin", "password" => "secret", "phone" => "123456"];

$result = Serializer::serialization([
    "id" => "int",
    "username" => "string",
    "phone" => "string"
], $data);

// 结果：password 被过滤掉了
// ["id" => 1, "username" => "admin", "phone" => "123456"]
```

### `load($FileName, $ruleName = null, $BasePath = F_APP_ROOT)`

静态方法，从文件加载序列化规则。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$FileName` | `string` | 文件名 |
| `$ruleName` | `string\|null` | 规则名称，默认使用文件名 |
| `$BasePath` | `string` | 基路径 |

```php
// 从 Serializers/user.php 加载规则
// 文件返回 return ["id" => "int", "username" => "string"];
Serializer::load("Serializers/user", "user_profile");
```

### `loadGet($FileName, $ruleName = null, $Names = null, $upperLevel = null, $BasePath = F_APP_ROOT)`

静态方法，加载并获取规则（`load()` + `get()` 的合体）。

## 使用方式

### 1. 基本字段过滤（白名单模式）

```php
$user = [
    "id" => 1,
    "username" => "admin",
    "password" => "$2y$10$...",
    "phone" => "13800138000",
    "createdAt" => 1620000000
];

// 只输出指定字段
$result = Serializer::serialization([
    "id",
    "username",
    "phone",
    "createdAt"
], $user);
// ["id" => 1, "username" => "admin", "phone" => "13800138000", "createdAt" => 1620000000]
// password 不会被输出
```

### 2. 带类型转换的字段过滤

```php
$result = Serializer::serialization([
    "id" => "int",
    "username" => "string",
    "nickname" => "string",
    "avatar" => "string",
    "phone" => "int",
    "createdAt" => "int"
], $user);
// 每个字段的值会按指定类型转换
```

### 3. 嵌套对象序列化

```php
$article = [
    "id" => 1,
    "title" => "文章标题",
    "content" => "内容...",
    "author" => [
        "id" => 5,
        "username" => "author1",
        "password" => "secret",
        "email" => "author@test.com"
    ],
    "tags" => ["PHP", "框架"]
];

$result = Serializer::serialization([
    "id" => "int",
    "title" => "string",
    "author" => [
        "id" => "int",
        "username" => "string",
        "email" => "string"
        // password 不会被输出
    ],
    "tags"
], $article);
```

### 4. JSON/Serialize 字段自动解析

```php
$data = [
    "id" => 1,
    "settings" => '{"theme":"dark","lang":"zh"}'  // JSON 字符串
];

$result = Serializer::serialization([
    "id" => "int",
    "settings" => "json"  // 自动解析为数组
], $data);
// settings 变成 ["theme" => "dark", "lang" => "zh"]
```

### 5. 使用已注册的规则

```php
// 先注册规则
Serializer::add("link_item", [
    "id" => "int",
    "name" => "string",
    "url" => "string",
    "icon" => "string",
    "sort" => "int"
]);

// 使用规则
$result = Serializer::serialization("link_item", $linkData);

// 或通过实例使用
$serializer = new Serializer("link_item");
$result = Serializer::serialization($serializer->useRuleName, $linkData);
```

### 6. 在控制器中使用

```php
class LoginController extends AuthController
{
    // 通过 $responseSerializes 自动序列化响应
    public $responseSerializes = [
        "id" => "string",
        "username" => "string",
        "nickname" => "string",
        "avatar" => "string",
        "phone" => "int",
        "createdAt" => "int"
    ];

    public function data()
    {
        $user = (new UsersModel())->where("username", $username)->getOne();
        return $user;  // 自动按序列化规则过滤
    }
}
```

### 7. 自定义处理函数

```php
$result = Serializer::serialization([
    "id" => "int",
    "username" => "string",
    "avatar" => function ($value, $allData) {
        // 自定义处理：为空时返回默认头像
        return $value ?: "https://default.com/avatar.png";
    }
], $userData);
```

## 防止重复序列化

Serializer 会在序列化后的数据中添加 `_serilizer` 标记，防止数据被重复序列化。如果数据已包含此标记，会直接跳过。

## 规则支持的格式

| 规则格式 | 说明 | 示例 |
|----------|------|------|
| `"字段名"` | 仅过滤字段（保留原值） | `"username"` |
| `"字段名" => "类型"` | 过滤 + 类型转换 | `"id" => "int"` |
| `"字段名" => Serializer` | 使用已注册的规则 | `"author" => new Serializer("user")` |
| `"字段名" => Mutator` | 使用 Mutator 实例 | `"price" => new Mutator("double")` |
| `"字段名" => "json"` | JSON 字符串自动解析 | `"settings" => "json"` |
| `"字段名" => "serialize"` | PHP serialized 字符串自动解析 | `"meta" => "serialize"` |
| `"字段名" => callable` | 自定义处理函数 | `"name" => function($v){...}` |
| `"字段名" => [...子规则]` | 嵌套对象过滤 | `"author" => ["id"=>"int"]` |

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 集成 | 控制器通过 `$responseSerializes` 自动序列化 |
| [Mutator](./data-conversion.md) | 配合 | 序列化时用 Mutator 做类型转换 |
