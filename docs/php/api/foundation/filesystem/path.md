# Path — 路径体系

- **文件位置**: `kernel/Foundation/FileSystem/Path.php`
- **命名空间**: `kernel\Foundation\FileSystem`
- **是否可继承**: 是（非 final，getter 均为 public static 可被重写）

集中管理当前应用的目录路径推导，与文件操作解耦。全部为静态 getter，每次调用自动计算，**无任何静态属性、无缓存、无副作用**。

**7 个路径 getter**：
- `kernelRoot` = 本类文件所在目录（内核目录，永远正确，无需外部输入）
- `projectRoot` = DiscuzX 平台取 `DISCUZ_ROOT`（去尾斜杠），否则为 `kernelRoot` 的上级目录
- `root` = `kernelRoot` 同级目录下的 `{App::id()}`
- `data` = `root/Data`
- `storage` = `root/Storage`
- `kernelDir` = `kernelRoot` 相对 `root` 的路径
- `dir` = `appRoot` 相对 `root` 的路径

**注意**：依赖 `App::id()` 的 getter（`root` / `data` / `storage` / `dir`）在未实例化 App（`App::id()` 为 `null`）时返回 `null`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （无属性） | — | — | — | 纯静态类，无任何静态属性、无缓存 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `projectRoot()` | 项目根目录（绝对路径） |
| `kernelRoot()` | 内核根目录（绝对路径） |
| `root()` | 当前应用根目录（绝对路径） |
| `data()` | 应用数据目录（绝对路径） |
| `storage()` | 应用存储目录（绝对路径） |
| `kernelDir()` | 内核目录（相对路径） |
| `dir()` | 应用目录（相对路径） |
| `relativePath($path, $base)` | 求相对路径（private） |

## 方法

### `projectRoot()` — 项目根目录

DiscuzX 平台返回 `DISCUZ_ROOT`（去尾斜杠）；普通项目返回内核目录的上级目录。

**参数**

- 无。

**返回值**

- `string|null`：项目根目录绝对路径。

### `kernelRoot()` — 内核根目录

即本类所在目录，与 `App::kernelId()`、部署位置无关，永远正确。

**参数**

- 无。

**返回值**

- `string`：内核根目录绝对路径。

### `root()` — 当前应用根目录

默认为 `{kernelRoot 同级目录}/{App::id()}`。

**参数**

- 无。

**返回值**

- `string|null`：应用根目录绝对路径；App 未实例化（`App::id()` 为 `null`）时返回 `null`。

### `data()` — 应用数据目录

默认 `appRoot/Data`。

**参数**

- 无。

**返回值**

- `string|null`：应用数据目录绝对路径；App 未实例化时返回 `null`。

### `storage()` — 应用存储目录

默认 `appRoot/Storage`。

**参数**

- 无。

**返回值**

- `string|null`：应用存储目录绝对路径；App 未实例化时返回 `null`。

### `kernelDir()` — 内核目录（相对路径）

即 `kernelRoot` 相对 `root` 的路径。

**参数**

- 无。

**返回值**

- `string|null`：相对路径；App 未实例化时返回 `null`。

### `dir()` — 应用目录（相对路径）

即 `appRoot` 相对 `root` 的路径。

**参数**

- 无。

**返回值**

- `string|null`：相对路径；App 未实例化时返回 `null`。

### `relativePath($path, $base)` — 求相对路径

> private。求 `$path` 相对 `$base`（绝对路径前缀）的路径。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string` | 无 | 绝对路径 |
| `$base` | `string` | 无 | 绝对路径前缀 |

**返回值**

- `string`：相对路径。
