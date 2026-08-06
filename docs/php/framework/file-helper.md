# FileHelper — 文件操作辅助

FileHelper 提供文件类型判断、路径处理、目录扫描、格式化等底层工具方法。所有方法均为静态方法，无需实例化。

- **命名空间**: `kernel\Foundation\File\FileHelper`
- **文件位置**: `kernel/Foundation/File/FileHelper.php`
- **特点**: 全部为静态方法

## 文件类型判断

### `isImage($fileName)`

判断指定的文件是否是图片文件（通过 MIME 类型判断，文件必须存在且可读）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileName` | `string` | 文件完整路径 |

返回值：`bool`

```php
if (FileHelper::isImage('/path/to/photo.png')) {
    // 处理图片文件
}
```

### `isVideo($fileName)`

判断指定的文件是否是视频文件（通过 MIME 类型判断）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$fileName` | `string` | 文件完整路径 |

返回值：`bool`

```php
if (FileHelper::isVideo('/path/to/video.mp4')) {
    // 处理视频文件
}
```

### `isAudio($filePath)`

判断指定的文件是否是音频文件（通过 MIME 类型判断）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |

返回值：`bool`

```php
if (FileHelper::isAudio('/path/to/music.mp3')) {
    // 处理音频文件
}
```

### `getMimeType($filePath)`

获取文件的 MIME 类型。在进行文件类型判断时，推荐使用 `isImage()`、`isVideo()`、`isAudio()` 等专用方法。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |

返回值：`string|false` — MIME 类型字符串（如 `"image/png"`），文件不存在或读取失败时返回 `false`

```php
$mime = FileHelper::getMimeType('/path/to/file.pdf');
// 返回: "application/pdf"
```

### `extension($path)`

获取文件扩展名（不含前导点号）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 文件路径或文件名 |

返回值：`string` — 扩展名字符串，无扩展名时返回空字符串

```php
FileHelper::extension('/path/to/file.txt');    // "txt"
FileHelper::extension('archive.tar.gz');       // "gz"
FileHelper::extension('noextension');          // ""
```

## 路径处理

### `combinedFilePath(...$paths)`

组合多个路径段为一个完整路径。自动过滤空路径段，并规范化路径分隔符为当前系统的 `DIRECTORY_SEPARATOR`。适用于跨平台路径拼接。

| 参数 | 类型 | 说明 |
|------|------|------|
| `...$paths` | `string` | 可变数量的路径段 |

返回值：`string`

```php
FileHelper::combinedFilePath('/var/www', 'app', 'config.php');
// Linux:   "/var/www/app/config.php"
// Windows: "\var\www\app\config.php"

// 空路径段会被自动过滤
FileHelper::combinedFilePath('/var/www', '', 'config.php');
// 返回: "/var/www/config.php"
```

### `optimizedPath($path)`

将路径中的分隔符统一替换为当前运行系统的 `DIRECTORY_SEPARATOR`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 需要优化的路径字符串 |

返回值：`string`

```php
FileHelper::optimizedPath('path/to\\file.txt');
// Linux:   "path/to/file.txt"
// Windows: "path\to\file.txt"
```

## 目录扫描

### `scandir($targetPath, $sortingOrder = 0, $context = null)`

对 PHP 内置 `scandir()` 的增强封装，自动过滤掉 `.` 和 `..`，并使用 `array_values` 重新索引结果数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 被扫描的目录路径 |
| `$sortingOrder` | `int` | 排序方式。`0`=升序（默认），`1`=降序 |
| `$context` | `mixed\|null` | 流上下文资源 |

返回值：`array|false` — 文件名数组（不含 `.` 和 `..`），失败返回 `false`

```php
$files = FileHelper::scandir('/path/to/directory');
// 返回: ['file1.txt', 'file2.txt', 'subdir']  不包含 "." 和 ".."

// 降序排列
$files = FileHelper::scandir('/path/to/directory', 1);
```

### `recursionScanDir($rootDir, $parentDir = null, $includeRootDir = false)`

深度遍历目标目录及其所有子目录，返回所有文件的路径列表。支持返回绝对路径或相对路径。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$rootDir` | `string` | 被扫描的根目录路径 |
| `$parentDir` | `string\|null` | 父级路径前缀。`null` 或 `false` 时仅使用文件名 |
| `$includeRootDir` | `bool` | `true`=返回绝对路径，`false`=返回相对路径或仅文件名 |

返回值：`string[]` — 一维文件路径数组

```php
// 获取所有文件的相对路径
$files = FileHelper::recursionScanDir('/path/to/project');
// 返回: ['src/App.php', 'src/Config.php', 'public/index.php', ...]

// 获取所有文件的绝对路径
$files = FileHelper::recursionScanDir('/path/to/project', null, true);
// 返回: ['/path/to/project/src/App.php', ...]

// 指定父级路径前缀
$files = FileHelper::recursionScanDir('/path/to/project/src', 'project');
// 返回: ['project/App.php', 'project/Config.php', ...]
```

### `compareDirectories($targetPath, $sourcePath)`

递归扫描两个目录，比较目录结构（文件/子目录名称）是否完全相同。

::: warning 注意
此方法仅比较文件名称，不比较文件内容。
:::

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 第一个目录路径 |
| `$sourcePath` | `string` | 第二个目录路径 |

返回值：`bool`

```php
// 比较两个版本的模板目录结构
$equal = FileHelper::compareDirectories('/templates/v1', '/templates/v2');
```

## 格式化与工具

### `humanReadableSize($bytes, $decimals = 2)`

将字节数格式化为人类可读的大小字符串。自动选择合适的单位（B/KB/MB/GB/TB/PB）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$bytes` | `int` | 字节数 |
| `$decimals` | `int` | 小数位数，默认 2 |

返回值：`string`

```php
FileHelper::humanReadableSize(0);            // "0 B"
FileHelper::humanReadableSize(1024);         // "1 KB"
FileHelper::humanReadableSize(1536000);      // "1.46 MB"
FileHelper::humanReadableSize(1536000, 0);   // "1 MB"
```

### `maxUploadSize()`

获取 PHP 配置允许的最大上传文件大小。取 `post_max_size` 和 `upload_max_filesize` 中的较小值。

| 参数 | 类型 | 说明 |
|------|------|------|
| （无参数） | - | - |

返回值：`int` — 最大上传大小（字节）

```php
$maxSize = FileHelper::maxUploadSize();
if ($fileSize > $maxSize) {
    throw new Exception('文件大小超出限制: ' . FileHelper::humanReadableSize($maxSize));
}
```
