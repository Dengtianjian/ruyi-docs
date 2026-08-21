# FileHelper — 文件操作辅助类

- **文件位置**: `kernel/Foundation/FileSystem/FileHelper.php`
- **命名空间**: `kernel\Foundation\FileSystem`
- **是否可继承**: 是

提供文件类型判断、路径处理、目录扫描、大小格式化等底层工具方法。全静态，无需实例化。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （无属性） | — | — | — | 纯静态工具类，无实例属性 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `isVideo($fileName)` | 判断文件是否为视频（按 MIME） |
| `isImage($fileName)` | 判断文件是否为图片（按 MIME） |
| `isAudio($filePath)` | 判断文件是否为音频（按 MIME） |
| `getMimeType($filePath)` | 获取文件 MIME 类型 |
| `extension($path)` | 获取文件扩展名（不含点号） |
| `combinedFilePath(...$paths)` | 组合多个路径段为一个完整路径 |
| `optimizedPath($path)` | 统一路径分隔符 |
| `scandir($targetPath, $sortingOrder, $context)` | 扫描目录（过滤 `.`/`..`） |
| `recursionScanDir($rootDir, $parentDir, $includeRootDir)` | 递归扫描目录返回文件列表 |
| `compareDirectories($targetPath, $sourcePath)` | 深度比较两个目录结构是否相同 |
| `humanReadableSize($bytes, $decimals)` | 字节数格式化为可读大小 |
| `maxUploadSize()` | 获取 PHP 配置最大上传大小 |
| `parseIniSize($size)` | 解析 ini 大小字符串为字节（private） |

## 方法

### `isVideo($fileName)` — 判断文件是否为视频

按 MIME 类型判断，文件必须存在且可读。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileName` | `string` | 无 | 文件完整路径（含文件名和扩展名） |

**返回值**

- `bool`：是视频返回 `true`；文件不存在或非视频返回 `false`。

### `isImage($fileName)` — 判断文件是否为图片

按 MIME 类型判断，文件必须存在且可读。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$fileName` | `string` | 无 | 文件完整路径 |

**返回值**

- `bool`：是图片返回 `true`；文件不存在或非图片返回 `false`。

### `isAudio($filePath)` — 判断文件是否为音频

按 MIME 类型判断，文件必须存在且可读。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径 |

**返回值**

- `bool`：是音频返回 `true`；文件不存在或非音频返回 `false`。

### `getMimeType($filePath)` — 获取文件 MIME 类型

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径 |

**返回值**

- `string|false`：MIME 类型字符串（如 `"image/png"`）；文件不存在或读取失败返回 `false`。

### `extension($path)` — 获取文件扩展名

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string` | 无 | 文件路径或文件名 |

**返回值**

- `string`：扩展名字符串（不含前导点号）；无扩展名返回 `""`。

**示例**

```php
FileHelper::extension('/path/to/file.txt'); // "txt"
FileHelper::extension('archive.tar.gz');    // "gz"
```

### `combinedFilePath(...$paths)` — 组合路径段

自动过滤空路径段，规范化分隔符为当前系统 `DIRECTORY_SEPARATOR`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$paths` | `string`（可变参数） | 无 | 一个或多个路径段 |

**返回值**

- `string`：组合后的完整路径。

### `optimizedPath($path)` — 统一路径分隔符

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string` | 无 | 需优化的路径字符串 |

**返回值**

- `string`：分隔符统一的路径。

### `scandir($targetPath, $sortingOrder = 0, $context = null)` — 扫描目录

对 PHP `scandir()` 的增强封装，自动过滤 `.`/`..` 并重新索引。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetPath` | `string` | 无 | 被扫描的目录路径 |
| `$sortingOrder` | `int` | `0` | 排序：`0` 升序（默认）、`1` 降序 |
| `$context` | `mixed` | `null` | 流上下文资源；传入则透传给 `scandir` |

**返回值**

- `array|false`：文件名数组（不含 `.`/`..`）；失败返回 `false`。

### `recursionScanDir($rootDir, $parentDir = null, $includeRootDir = false)` — 递归扫描目录

深度遍历目标目录及所有子目录，返回所有文件路径列表。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rootDir` | `string` | 无 | 被扫描的根目录路径 |
| `$parentDir` | `string\|null` | `null` | 父级路径前缀；字符串作为结果前缀，`null`/`false` 时仅用文件名 |
| `$includeRootDir` | `bool` | `false` | `true` 返回绝对路径（含根目录）；`false` 返回相对路径 |

**返回值**

- `string[]`：文件路径列表（一维数组）。

**示例**

```php
FileHelper::recursionScanDir('/path/to/project');                       // 相对路径
FileHelper::recursionScanDir('/path/to/project', null, true);           // 绝对路径
```

### `compareDirectories($targetPath, $sourcePath)` — 深度比较目录结构

递归比较两目录结构是否相同（仅比较名称，不比较内容）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetPath` | `string` | 无 | 第一个目录路径 |
| `$sourcePath` | `string` | 无 | 第二个目录路径 |

**返回值**

- `bool`：结构完全相同时返回 `true`。

### `humanReadableSize($bytes, $decimals = 2)` — 格式化字节大小

自动选择单位（B/KB/MB/GB/TB/PB）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$bytes` | `int` | 无 | 字节数 |
| `$decimals` | `int` | `2` | 小数位数 |

**返回值**

- `string`：格式化后的大小字符串，如 `"1.46 MB"`。

### `maxUploadSize()` — 获取最大上传大小

取 `post_max_size` 与 `upload_max_filesize` 的较小值。

**参数**

- 无。

**返回值**

- `int`：最大上传大小（字节）。

### `parseIniSize($size)` — 解析 ini 大小字符串

> private。将 `"2M"`/`"1G"`/`"512K"` 等格式转为字节数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$size` | `string` | 无 | ini 大小字符串 |

**返回值**

- `int`：字节数。
