# Transform — 数据转换器

Transform 将客户端传入的 `_transform` 参数解析为标准化的转换器调用链，通过白名单校验后依次调用 handler 上的转换器方法（Data In, Data Out），实现纯函数流转管道。

- **命名空间**: `kernel\Foundation\Data\Transform`
- **文件位置**: `kernel/Foundation/Data/Transform.php`
- **特点**: 全部为静态方法；转换器为纯函数，便于组合与复用

## 设计理念

客户端通过 `_transform` 声明对返回数据的转换（如选择字段、关联分组），服务端解析后按白名单过滤，再交给 handler 依次执行：

```
客户端 _transform 参数
      ↓  parse()
标准化转换器链 [{name, args}, ...]
      ↓  apply()（白名单过滤 + 串联执行）
转换后数据
```

**转换器方法签名**：`function name($data, ...$args): mixed`

## GET 语法

```
_transform=withGroup:categoryId
_transform=limitFields:id,title,withGroup:author_id
```

## POST 语法（JSON body）

```json
"_transform": ["withGroup", {"limit": [10]}]
```

## 方法

### `parse($raw)`

解析原始 `_transform` 输入为标准化格式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$raw` | `string\|array` | 原始 `_transform` 值 |

返回值：`array` 标准化数组 `[{"name": "...", "args": [...]}, ...]`

```php
Transform::parse("withGroup:categoryId");
// [["name" => "withGroup", "args" => ["categoryId"]]]

Transform::parse(["withGroup", ["limit" => [10]]]);
// [["name" => "withGroup", "args" => []], ["name" => "limit", "args" => [10]]]
```

### `apply(array $transforms, array $whitelist, object $handler, $data)`

对数据依次执行转换器链（白名单校验 + 纯函数串联）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$transforms` | `array` | 标准化后的转换器列表 `[{name, args}]` |
| `$whitelist` | `array` | 允许调用的转换器名称白名单 |
| `$handler` | `object` | 持有转换器方法的对象实例 |
| `$data` | `mixed` | 待处理的原始数据 |

返回值：`mixed` 处理后的数据

```php
$transforms = Transform::parse("limitFields:id,title,withGroup:author_id");
$data = Transform::apply($transforms, ["limitFields", "withGroup"], $model, $list);
```

## 解析规则

`parseString` 对 GET 字符串的解析规则：

- `:` 标记一个新转换器的开始，后面是第一个参数
- 后续不含 `:` 的 token 作为当前转换器的额外参数
- 遇到下一个含 `:` 的 token，则开始一个新的转换器

```php
"limitFields:id,title"                   // [["name" => "limitFields", "args" => ["id", "title"]]]
"limitFields:id,title,withGroup:author_id"
// [
//   ["name" => "limitFields", "args" => ["id", "title"]],
//   ["name" => "withGroup",   "args" => ["author_id"]],
// ]
```
