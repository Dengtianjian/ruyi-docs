# Command — 系统命令执行器

- **文件位置**: `kernel/Foundation/Console/Command.php`
- **命名空间**: `kernel\Foundation\Console`
- **是否可继承**: 是

基于 `proc_open` 封装的操作系统命令执行器，支持三种执行模式：

1. **单次进程**：每次 `exec()` 打开一个新进程，执行后关闭（默认）。
2. **会话复用**：`open()` 后复用长驻 shell 进程，通过随机标记分隔每次命令的输出。
3. **异步执行**：`start()` 非阻塞启动，`poll()`/`wait()` 轮询获取结果。

同步执行支持 `onStdout()`/`onStderr()` 实时输出回调、超时与最大输出限制。

> **注意**：本类非线程安全，同一实例不应被多个并发执行上下文共享。会话模式（`open()`）仅支持 Unix/Linux，Windows 下返回 `false`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$process` | `resource\|null` | `null` | private | 子进程句柄（`proc_open` 返回值），`null` 表示当前无进程 |
| `$pipes` | `array<int, resource\|null>` | `[]` | private | 子进程管道：0=stdin、1=stdout、2=stderr |
| `$env` | `array` | `[]` | private | 环境变量，作为 `proc_open` 的 env 参数，`exec()` 时与传入值合并 |
| `$options` | `array` | `[]` | private | `proc_open` 的 options 参数（bypass_shell、suppress_errors 等） |
| `$cwd` | `string` | `""` | private | 当前工作目录，默认应用根目录 `Path::root()` |
| `$initCommand` | `string` | `""` | private | 初始化命令（shell 路径），`exec()` 执行的命令基于它运行 |
| `$lastExitcode` | `int\|null` | `null` | private | 最近一次执行的退出码，执行中/尚未执行为 `null` |
| `$timedOut` | `bool` | `false` | private | 最近一次执行是否超时 |
| `$outputExceeded` | `bool` | `false` | private | 最近一次执行是否因输出超限被终止 |
| `$timeout` | `int` | `60` | private | 命令执行超时（秒），0 表示不限制 |
| `$maxOutput` | `int` | `10485760` | private | 最大输出字节数（stdout+stderr），0 表示不限制，默认 10MB |
| `$status` | `array` | `[...]` | private | `proc_get_status` 返回的进程状态结构 |
| `$sessionOpened` | `bool` | `false` | private | 会话模式是否已开启 |
| `$sessionMarker` | `string` | `""` | private | 会话命令结束标记，用于切分输出 |
| `$asyncCommand` | `string` | `""` | private | 最近一次执行的命令原文 |
| `$asyncStdout` | `string` | `""` | private | 异步执行累计的 stdout 内容 |
| `$asyncStderr` | `string` | `""` | private | 异步执行累计的 stderr 内容 |
| `$totalBytes` | `int` | `0` | private | 本次执行累计读取的输出字节数 |
| `$stdoutCallback` | `callable\|null` | `null` | private | stdout 实时输出回调 |
| `$stderrCallback` | `callable\|null` | `null` | private | stderr 实时输出回调 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `run($command, $env, $options)` | 便捷静态执行，返回标准输出 |
| `__construct($env, $options, $command)` | 构建命令执行器 |
| `setTimeout($seconds)` | 设置命令执行超时时间 |
| `setMaxOutput($bytes)` | 设置最大输出字节数 |
| `onStdout($callback)` | 注册标准输出实时回调 |
| `onStderr($callback)` | 注册标准错误实时回调 |
| `open()` | 开启长驻 shell 会话 |
| `close()` | 关闭长驻 shell 会话 |
| `isOpen()` | 会话是否开启且进程存活 |
| `start($command, $env, $options)` | 非阻塞启动命令执行 |
| `isRunning()` | 异步命令是否仍在运行 |
| `poll()` | 非阻塞轮询，读取已产生的输出 |
| `wait($timeout)` | 阻塞等待异步命令执行完成 |
| `input($data)` | 向子进程标准输入写入数据 |
| `execResult($command, $env, $options)` | 执行命令并返回完整执行结果 |
| `exec($command, $env, $options)` | 执行命令并返回标准输出 |
| `cd($cwd)` | 切换目录 |
| `echo($content)` | 输出内容 |
| `which($fileName)` | 在 PATH 中查找文件 |
| `pwd()` | 获取当前工作目录 |
| `exitcode()` | 获取最近一次执行退出码 |
| `isSuccessful()` | 最近一次执行是否成功 |
| `isTimedOut()` | 最近一次执行是否超时 |
| `isOutputExceeded()` | 最近一次执行是否输出超限 |
| `terminate($signal, $escalateAfter)` | 终止当前子进程 |
| `ln($source, $target, $options)` | 建立软连接 |
| `whereis($target)` | 查找文件位置 |

## 方法

### `run($command, $env = [], $options = [])` — 便捷静态执行

静态调用，单次执行命令并返回标准输出。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$command` | `string` | 无 | 命令 |
| `$env` | `array` | `[]` | 环境变量 |
| `$options` | `array` | `[]` | `proc_open` 选项 |

**返回值**

- `string`：标准输出。

**示例**

```php
use kernel\Foundation\Console\Command;

$output = Command::run("ls -la");
```

### `__construct($env = [], $options = [], $command = "/bin/bash")` — 构建命令执行器

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$env` | `array` | `[]` | 环境变量，`exec()` 执行时与传入的 env 合并 |
| `$options` | `array` | `[]` | `proc_open` 选项（bypass_shell、suppress_errors、cwd 等） |
| `$command` | `string` | `"/bin/bash"` | 初始化命令（shell 路径），后续 `exec()` 传入的命令基于它运行，例如 `/bin/bash` |

**返回值**

- 无。

### `setTimeout($seconds)` — 设置命令执行超时时间

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$seconds` | `int` | 无 | 超时秒数，0 表示不限制 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `setMaxOutput($bytes)` — 设置最大输出字节数

**参数**

| 参数 |类型 | 默认 | 说明 |
|------|------|------|------|
| `$bytes` | `int` | 无 | 最大字节数，0 表示不限制；超过则终止命令 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `onStdout($callback)` — 注册标准输出实时回调

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable` | 无 | 回调函数，参数为输出片段 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `onStderr($callback)` — 注册标准错误实时回调

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$callback` | `callable` | 无 | 回调函数，参数为输出片段 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `open()` — 开启长驻 shell 会话

之后 `exec()`/`execResult()` 将复用该会话进程。Windows 下不支持会话模式，返回 `false`。

**参数**

- 无。

**返回值**

- `bool`：是否成功开启。

### `close()` — 关闭长驻 shell 会话

**参数**

- 无。

**返回值**

- 无。

### `isOpen()` — 会话是否开启且进程存活

**参数**

- 无。

**返回值**

- `bool`：会话已开启且进程存活返回 `true`。

### `start($command, $env = [], $options = [])` — 非阻塞启动命令执行

若已存在运行中的进程或会话，会先关闭。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$command` | `string` | 无 | 命令 |
| `$env` | `array` | `[]` | 环境变量 |
| `$options` | `array` | `[]` | 选项 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `isRunning()` — 异步命令是否仍在运行

**参数**

- 无。

**返回值**

- `bool`：运行中返回 `true`。

### `poll()` — 非阻塞轮询

读取当前已产生的输出。

**参数**

- 无。

**返回值**

- `array`：`["running" => bool, "exitcode" => int|null, "stdout" => string, "stderr" => string]`。

### `wait($timeout = 0)` — 阻塞等待异步命令执行完成

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$timeout` | `int` | `0` | 等待超时秒数，0 表示按 `setTimeout()` 配置 |

**返回值**

- `array`：`["exitcode" => int|null, "stdout" => string, "stderr" => string, "timedout" => bool, "output_exceeded" => bool, "command" => string]`。

### `input($data)` — 向子进程标准输入写入数据

用于交互式命令。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$data` | `string` | 无 | 数据 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `execResult($command, $env = [], $options = [])` — 执行命令并返回完整结果

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$command` | `string` | 无 | 命令 |
| `$env` | `array` | `[]` | 环境变量，与构造时的环境变量合并 |
| `$options` | `array` | `[]` | 选项，与构造时的选项合并 |

**返回值**

- `array`：`["exitcode" => int|null, "stdout" => string, "stderr" => string, "timedout" => bool, "output_exceeded" => bool, "command" => string]`。

### `exec($command, $env = [], $options = [])` — 执行命令

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$command` | `string` | 无 | 命令 |
| `$env` | `array` | `[]` | 环境变量 |
| `$options` | `array` | `[]` | 选项 |

**返回值**

- `string`：标准输出。如需完整结果（含退出码/错误输出）请使用 `execResult()`。

### `cd($cwd = "/")` — 切换目录

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$cwd` | `string` | `"/"` | 目标目录 |

**返回值**

- `Command`：当前实例（支持链式调用）。

### `echo($content)` — 输出内容

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$content` | `string` | 无 | echo 的内容 |

**返回值**

- `string`：输出结果。

### `which($fileName)` — 在 PATH 中查找文件

`which` 指令会在环境变量 `$PATH` 设置的目录里查找符合条件的文件。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileName` | `string` | 无 | 文件名称，如 `php`，最终执行的命令是 `which php` |

**返回值**

- `string`：查找结果。

### `pwd()` — 获取当前工作目录

执行 `pwd` 指令获取目前所在工作目录的绝对路径。

**参数**

- 无。

**返回值**

- `string`：当前工作目录绝对路径。

### `exitcode()` — 获取最近一次执行退出码

返回最近一次执行（同步/异步/会话）的退出码；执行中或尚未执行返回 `null`。

**参数**

- 无。

**返回值**

- `int\|null`：退出码。

### `isSuccessful()` — 最近一次执行是否成功

**参数**

- 无。

**返回值**

- `bool`：退出码为 0 返回 `true`。

### `isTimedOut()` — 最近一次执行是否超时

**参数**

- 无。

**返回值**

- `bool`：超时返回 `true`。

### `isOutputExceeded()` — 最近一次执行是否输出超限

**参数**

- 无。

**返回值**

- `bool`：输出超限返回 `true`。

### `terminate($signal = 15, $escalateAfter = 2)` — 终止当前子进程

先发 SIGTERM 优雅终止，指定时间内未退出则升级为 SIGKILL。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$signal` | `int` | `15` | 首次发送的信号，默认 SIGTERM(15) |
| `$escalateAfter` | `int` | `2` | 等待秒数后升级 SIGKILL，0 表示不升级 |

**返回值**

- 无。

### `ln($source, $target, $options = "-s")` — 建立软连接

为某一个文件在另外一个位置建立一个同步的链接，如 `ln -s /bin/php /usr/bin/php`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$source` | `string` | 无 | 文件源路径 |
| `$target` | `string` | 无 | 软连接到的目标路径 |
| `$options` | `string` | `"-s"` | 选项，默认 `-s` 符号链接 |

**返回值**

- `string`：执行结果。

### `whereis($target)` — 查找文件位置

`whereis` 指令在特定目录中查找符合条件的文件（二进制文件、源代码文件和 man 手册页）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$target` | `string` | 无 | 文件名称 |

**返回值**

- `string`：执行结果。
