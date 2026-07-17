# DataConversion — 数据类型转换

DataConversion 提供灵活的数据类型转换功能，支持 string、int、bool、array、object、double 等类型转换，以及复杂数组结构的批量转换。

- **命名空间**: `kernel\Foundation\Data`
- **文件位置**: `kernel/Foundation/Data/DataConversion.php`

## 方法列表

### `__construct($types = null, $completion = false, $removeNotExistRuleKey = false, $stringHandleMethod = 0)`

构建数据转换实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | `array\|string\|null` | 目标类型或类型规则数组 |
| `$completion` | `bool` | 是否补全规则中存在但数据中不存在的键（补 null） |
| `$removeNotExistRuleKey` | `bool` | 是否剔除数据中存在但规则中不存在的键 |
| `$stringHandleMethod` | `int` | 字符串处理方式：`0`=addslashes, `1`=stripslashes, `false`=不处理 |

```php
// 简单类型转换
$dc = new DataConversion("int");
echo $dc->data("123")->convert();  // 123 (integer)

// 数组批量转换
$dc = new DataConversion([
    "name" => "string",
    "age" => "int",
    "tags" => "array"
]);

// 补全缺失的键
$dc = new DataConversion(["name" => "string", "age" => "int"], true);
$result = $dc->data(["name" => "张三"])->convert();
// ["name" => "张三", "age" => null]
```

### `data($data)`

设置要转换的数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 待转换数据 |

返回值：`DataConversion`

### `string()`

设置目标类型为字符串。

返回值：`DataConversion`

```php
$dc = new DataConversion();
$result = $dc->data(123)->string()->convert();  // "123"
```

### `int()`

设置目标类型为整数。

返回值：`DataConversion`

```php
$dc = new DataConversion();
$result = $dc->data("123")->int()->convert();  // 123
```

### `arr()`

设置目标类型为数组。

返回值：`DataConversion`

### `object()`

设置目标类型为对象。

返回值：`DataConversion`

### `double()`

设置目标类型为浮点数。

返回值：`DataConversion`

### `bool()`

设置目标类型为布尔值。

返回值：`DataConversion`

### `convert($types = null)`

执行类型转换。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$types` | `array\|string\|null` | 覆盖构造时设定的类型规则 |

返回值：`mixed` — 转换后的数据

### `quick($target, $type = null, $completion = false, $removeNotExistRuleKey = false, $stringHandleMethod = 0)`

静态方法，快速进行类型转换。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$target` | `mixed` | 被转换的数据 |
| `$type` | `string\|array\|null` | 类型规则 |
| `$completion` | `bool` | 是否补全 |
| `$removeNotExistRuleKey` | `bool` | 是否剔除多余键 |
| `$stringHandleMethod` | `int` | 字符串处理方式 |

返回值：`mixed`

```php
$result = DataConversion::quick("123", "int");       // 123
$result = DataConversion::quick(456, "string");       // "456"
$result = DataConversion::quick("true", "bool");      // true
$result = DataConversion::quick([1,2,3], "array");    // [1,2,3]
```

## 使用方式

### 1. 基本类型转换

```php
// 字符串 → 整数
DataConversion::quick("123", "int");  // 123

// 字符串 → 布尔
DataConversion::quick("1", "bool");   // true

// 整数 → 字符串
DataConversion::quick(456, "string"); // "456"
```

### 2. 数组批量转换

```php
$data = [
    "name" => "张三",
    "age" => "25",
    "active" => "1",
    "tags" => "a,b,c"
];

$result = DataConversion::quick($data, [
    "name" => "string",
    "age" => "int",
    "active" => "bool",
    "tags" => "string/,",     // string 类型，用 "," 分割为数组
]);
// ["name" => "张三", "age" => 25, "active" => true, "tags" => ["a","b","c"]]
```

### 3. 嵌套数组转换

```php
$data = [
    "user" => ["name" => "张三", "age" => "25"],
    "items" => [
        ["price" => "9.9"],
        ["price" => "19.9"]
    ]
];

$result = DataConversion::quick($data, [
    "user" => [
        "name" => "string",
        "age" => "int"
    ],
    "items" => [
        "price" => "double"
    ]
]);
```

### 4. 剔除多余字段 / 补全缺失字段

```php
$data = ["name" => "张三", "age" => 25, "extra" => "多余内容"];

// 剔除规则中没有的键
$result = DataConversion::quick($data, 
    ["name" => "string", "age" => "int"],
    false,  // 不补全
    true    // 剔除多余键
);
// ["name" => "张三", "age" => 25]  ← "extra" 被移除

// 补全规则中有但数据中缺失的键
$result = DataConversion::quick(
    ["name" => "张三"],
    ["name" => "string", "gender" => "string"],
    true   // 补全
);
// ["name" => "张三", "gender" => null]
```

### 5. 在控制器中自动使用

```php
class MyController extends Controller
{
    // 通过 $requestBodySerializes 自动转换请求体类型
    protected $requestBodySerializes = [
        "username" => "string",
        "age" => "int",
        "email" => "string",
    ];

    public function data()
    {
        // 数据已自动转换
        $body = $this->requestBody->all();
        // age 已经是 int 类型
    }
}
```

## 支持的类型

| 类型字符串 | PHP 类型 | 说明 |
|-----------|----------|------|
| `"string"` | string | 字符串，自动 addslashes |
| `"int"` / `"integer"` | integer | 整数 |
| `"bool"` / `"boolean"` | boolean | 布尔值 |
| `"float"` / `"double"` | float | 浮点数 |
| `"array"` | array | 数组 |
| `"object"` | object | 对象 |
| `"null"` | null | 空值 |
| `"any"` | 自动识别 | 自动类型识别 |
| `"string/,"` | array | 先按分隔符拆分为数组，再转换每个元素为 string |

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [Controller](./controller.md) | 集成 | 请求参数自动类型转换 |
| [Serializer](./serializer.md) | 配合 | 序列化时也使用 DataConversion |
