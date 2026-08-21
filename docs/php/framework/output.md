# Output — 输出工具

Output 提供调试输出、堆栈打印与数据格式化能力，是调试与错误展示的便捷工具类。全部方法均为静态调用。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Output.php`

## 设计约定

- 纯静态工具类，无实例化需求。
- **输出 vs 取值分离**：`format()` / `printContent()` / `debug()` 直接向标准输出 `echo`；需要拿到格式化后的**字符串**用于拼接时应使用 `string()`。
- **环境感知**：`format()` 输出 HTML `<pre>` 包裹内容，适合 HTTP 场景；CLI 场景建议用 `string()` 取纯文本，避免 HTML 标签污染日志与终端。

## 方法列表

### `string(...$data)`

将数据格式化为纯文本字符串（**不含任何 HTML 标签**），CLI / HTTP 通用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 任意数据。字符串、数值直接拼接；数组 / 对象用 `print_r` 展开 |

返回值：`string`

```php
$text = Output::string(['code' => 500, 'msg' => '服务器错误']);
// [code] => 500
// [msg] => 服务器错误

$text = Output::string("HTTP", 500, "Internal Error");
// "HTTP\n500\nInternal Error"
```

**典型用途**：需要把格式化结果拼进另一段字符串或返回给调用方时使用，例如错误详情拼接。

### `format(...$data)`

将数据以 HTML `<pre>` 形式**直接输出**到标准输出。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 任意数据，内容与 `string()` 一致，额外用 `<pre>` 包裹 |

返回值：`void`

```php
Output::format(['code' => 500, 'msg' => '服务器错误']);
// <pre>[code] => 500
// [msg] => 服务器错误</pre>
```

**注意**：`format()` 无返回值（只输出）。如需获取字符串请改用 `string()`。

### `debug(...$data)`

调试输出并**终止脚本**（`exit`）。适合定位问题时临时插入。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$data` | `mixed` | 调试数据，输出形式同 `format()` |

返回值：`void`

```php
$value = computeSomething();
Output::debug($value);
// 输出 <pre>...</pre> 后终止脚本
```

**空参守卫**：调用 `debug()` 且未传任何数据时，仅打印一条提示并 `return`，**不会** `exit`，避免误调导致脚本被意外终止。

### `backtrace($options = DEBUG_BACKTRACE_IGNORE_ARGS, $limit = 0)`

输出调用堆栈并终止脚本。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$options` | `int` | `debug_backtrace` 选项。默认 `DEBUG_BACKTRACE_IGNORE_ARGS`（忽略参数，避免附带对象引用 / 敏感信息） |
| `$limit` | `int` | 返回的最大帧数，`0` 表示不限制 |

返回值：`void`

```php
Output::backtrace();
```

### `printContent($outputString, ...$value)`

打印内容到标准输出。字符串按 `printf` 格式处理，其他类型用 `print_r`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$outputString` | `string\|mixed` | 字符串则按 `printf` 格式输出；否则 `print_r` |
| `$value` | `mixed` | `printf` 的占位符参数 |

返回值：`void`

```php
Output::printContent("用户 %s 共 %d 条记录", $name, $count);
// 用户 admin 共 3 条记录
```

### `isCli()`

判断当前是否为 CLI 运行环境。

返回值：`bool`

```php
if (Output::isCli()) {
    // 命令行环境，使用纯文本输出
    echo Output::string($data);
} else {
    // HTTP 环境
    Output::format($data);
}
```

## 使用方式

### 拼接格式化字符串

```php
$details = Output::string([
    'statusCode' => 500,
    'message'    => '数据库连接失败',
]);
$log = "错误详情:\n" . $details;
```

### 环境自适应输出

```php
if (Output::isCli()) {
    echo Output::string($data);      // CLI：纯文本
} else {
    Output::format($data);           // HTTP：<pre> 包裹
}
```

### 临时调试

```php
// 打断点：输出变量并终止
Output::debug($request);

// 只看调用栈
Output::backtrace();

// 不终止，仅打印后继续执行
Output::printContent("进度: %d%%", $progress);
```
