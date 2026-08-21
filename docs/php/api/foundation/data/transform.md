# Transform — 数据变换

- **文件位置**: `kernel/Foundation/Data/Transform.php`
- **命名空间**: `kernel\Foundation\Data`
- **类型**: 纯静态工具类

客户端请求驱动的响应数据变换器。通过 `_transform` 参数调用白名单内的变换逻辑，由 `Controller::after()` 触发。提供从字符串/数组两种语法到白名单校验 + 纯函数串联的完整链路。

## 语法

### GET 字符串语法

```
_transform=withGroup:categoryId
_transform=limitFields:id,title,withGroup:author_id
```

规则：

- `:` 标记了一个新 transformer 的开始，后面是第一个参数
- 后续不含 `:` 的 token 作为当前 transformer 的额外参数
- 遇到下一个含 `:` 的 token，则开始一个新的 transformer

### POST 数组语法（JSON body）

```json
{
  "_transform": ["withGroup", {"limit": [10]}]
}
```

- 字符串项：`"withGroup"` 或 `"withGroup:categoryId"`
- 对象项：`{"methodName": [arg1, arg2]}`，key 为方法名、value 为参数数组

## 转换器方法签名

```
function name($data, ...$args): mixed
```

定义在 handler 对象上，由 `Controller::$allowedTransformers` 控制允许访问的变换器类名白名单。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `Transform::parse($raw)` | 解析 `_transform` 参数 |
| `Transform::apply($transforms, $whitelist, $handler, $data)` | 应用变换（仅允许白名单类名） |

## 方法

### `Transform::parse($raw)` — 解析 `_transform` 参数

支持字符串（GET）与数组（POST）两种输入。空值返回 `[]`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$raw` | `string\|array` | 无 | 原始 `_transform` 值。字符串走 `parseString`，数组走 `normalize` |

**返回值**

- `array`：标准化格式 `[{"name": "...", "args": [...]}, ...]`。

**示例**

```php
Transform::parse("withGroup:categoryId");
// [["name" => "withGroup", "args" => ["categoryId"]]]

Transform::parse("limitFields:id,title,withGroup:author_id");
// [
//   ["name" => "limitFields", "args" => ["id", "title"]],
//   ["name" => "withGroup",  "args" => ["author_id"]],
// ]

Transform::parse(["withGroup", ["limit" => [10]]]);
// [
//   ["name" => "withGroup", "args" => []],
//   ["name" => "limit",     "args" => [10]],
// ]
```

### `Transform::apply($transforms, $whitelist, $handler, $data)` — 应用变换

先按 `$whitelist` 过滤掉不在白名单内的变换器名称，再依次执行 handler 上对应的方法。每个 transformer 接收 `$data` 与自身参数，返回值作为下一轮的 `$data`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$transforms` | `array` | 无 | 标准化后的转换器列表 `[{name, args}]`，由 `parse()` 返回 |
| `$whitelist` | `array` | 无 | 允许调用的转换器名称白名单 |
| `$handler` | `object` | 无 | 持有转换器方法的对象实例 |
| `$data` | `mixed` | 无 | 待处理的原始数据 |

**返回值**

- `mixed`：处理后的数据。

**示例**

```php
// Controller 启用
protected $allowedTransformers = [
    \App\Transformers\UserTransformer::class,
];

// handler 必须实现与白名单中方法同名的方法
class UserTransformer
{
    public function maskName($user, $mask = "*") {
        return [...$user, "name" => Str::mask($user["name"], $mask)];
    }
}

// 客户端请求：?_transform=UserTransformer|maskName:#
// 仅在 allowedTransformers 中的类方法会被执行
```

## 私有辅助方法

| 方法 | 说明 |
|------|------|
| `normalize($raw)` | 标准化数组格式的 `_transform`（POST body） |
| `parseString($input)` | 解析 GET `_transform` 字符串 |

## 完整示例

```php
use kernel\Foundation\Data\Transform;
use kernel\Foundation\Controller\Controller;

class ArticleController extends Controller
{
    protected array $allowedTransformers = [
        \App\Transformers\ArticleTransformer::class,
    ];

    protected $responseSerializes = [
        "id"    => "int",
        "title" => "string",
        "body"  => "string",
    ];

    protected function data()
    {
        $articles = \App\Models\Article::all();
        return $this->success($articles);
    }
}

// 客户端请求
// GET /articles?_transform=limitFields:id,title
//   → response: [{"id":1,"title":"标题1"}, {"id":2,"title":"标题2"}, ...]
```

> `Transform::apply()` 只执行 `$whitelist` 中声明的变换器，防止未授权逻辑执行。
