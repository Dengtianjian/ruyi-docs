# Filesystem — 文件管理

Filesystem 提供文件的上传、创建、复制、移动、删除、读取等高级文件操作。所有路径操作均通过 FileHelper 进行规范化处理，确保跨平台兼容。

- **命名空间**: `kernel\Foundation\File\Filesystem`
- **文件位置**: `kernel/Foundation/File/Filesystem.php`
- **特点**: 全部为静态方法，无需实例化

## 文件上传

### `upload($file, $savePath, $fileName = null)`

上传文件并保存到服务器。支持两种上传方式：
- 通过 `$_FILES` 数组上传（HTTP POST 文件上传）
- 通过本地文件路径上传（用于服务端已存在的文件）

文件默认保存到 `F_APP_STORAGE` 常量指定的存储根目录下，通过 `$savePath` 参数可指定相对子目录。对于图片类型的文件，会自动获取宽高信息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$file` | `array\|string` | `$_FILES` 数组中的某一项，或本地文件的完整路径 |
| `$savePath` | `string` | 保存的相对路径（相对于 `F_APP_STORAGE`），传入 `"."` 或空字符串表示直接保存在存储根目录 |
| `$fileName` | `string\|null` | 自定义存储文件名（不含扩展名），`null` 时自动使用 `uniqid()` 生成 |

返回值：`array`

```php
// 通过 $_FILES 上传
$fileInfo = Filesystem::upload($_FILES['avatar'], 'avatars', 'user_123');
// 返回: {
//   name: "user_123.jpg",
//   sourceFileName: "original_name.jpg",
//   path: "avatars",
//   extension: "jpg",
//   size: 12345,
//   filePath: "/storage/avatars/user_123.jpg",
//   width: 800,
//   height: 600
// }

// 通过本地路径上传
$fileInfo = Filesystem::upload('/tmp/export.csv', 'exports');
```

::: warning 注意
当使用字符串路径（本地文件）方式上传时，源文件会在复制完成后被删除（即实际行为是"移动"）。
:::

**返回值字段说明:**

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 保存后的文件名 |
| `sourceFileName` | `string` | 原始文件名 |
| `path` | `string\|null` | 保存的相对路径目录 |
| `extension` | `string` | 文件扩展名 |
| `size` | `int` | 文件大小（字节） |
| `filePath` | `string` | 文件完整路径 |
| `width` | `int` | 图片宽度（非图片时为 0） |
| `height` | `int` | 图片高度（非图片时为 0） |

## 文件信息

### `getFileInfo($filePath)`

获取文件的综合信息，对于图片文件会自动获取宽高。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |

返回值：`array|false` — 文件信息数组，文件不存在时返回 `false`

```php
$info = Filesystem::getFileInfo('/storage/avatars/user_123.jpg');
echo $info['size'];   // 文件大小（字节）
echo $info['width'];  // 图片宽度，非图片时为 null
echo $info['height']; // 图片高度，非图片时为 null
```

### `fileSize($filePath)`

获取文件大小（带错误处理）。先检查文件是否存在再获取大小。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |

返回值：`int|false` — 文件大小（字节），文件不存在或读取失败时返回 `false`

```php
$size = Filesystem::fileSize('/path/to/file.txt');
if ($size !== false) {
    echo '文件大小: ' . FileHelper::humanReadableSize($size);
}
```

### `readFile($filePath)`

读取文件全部内容。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |

返回值：`string|false` — 文件内容字符串，文件不存在时返回 `false`

```php
$content = Filesystem::readFile('/path/to/config.json');
if ($content !== false) {
    $config = json_decode($content, true);
}
```

## 文件创建

### `createFile($filePath, $fileContent = "", $overwrite = false)`

在指定路径创建文件并写入内容。父目录不存在时会自动创建。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径（包含文件名和扩展名） |
| `$fileContent` | `string` | 写入的文件内容，默认为空字符串 |
| `$overwrite` | `bool` | 是否覆盖。`true`=覆盖，`false`=文件已存在时跳过并返回 `true` |

返回值：`bool`

```php
// 创建新文件
Filesystem::createFile('/path/to/newfile.txt', 'Hello World');

// 覆盖已存在的文件
Filesystem::createFile('/path/to/existing.txt', 'New Content', true);

// 文件已存在时不覆盖（直接返回 true）
Filesystem::createFile('/path/to/existing.txt', 'ignored', false);
```

## 文件复制与移动

### `copyFile($sourcePath, $destPath, $overwrite = false)`

复制单个文件。目标目录不存在时会自动创建。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$sourcePath` | `string` | 源文件完整路径 |
| `$destPath` | `string` | 目标文件完整路径 |
| `$overwrite` | `bool` | 是否覆盖已存在的目标文件 |

返回值：`bool`

```php
// 复制文件（不覆盖）
Filesystem::copyFile('/path/to/source.txt', '/path/to/dest.txt');

// 复制并覆盖
Filesystem::copyFile('/path/to/source.txt', '/path/to/dest.txt', true);
```

### `moveFile($sourcePath, $destPath, $overwrite = false)`

移动或重命名文件。目标目录不存在时会自动创建。移动操作等同于重命名——源文件在操作成功后不再存在。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$sourcePath` | `string` | 源文件完整路径 |
| `$destPath` | `string` | 目标文件完整路径 |
| `$overwrite` | `bool` | 是否覆盖已存在的目标文件。`true`=先删除目标再移动 |

返回值：`bool`

```php
// 重命名文件
Filesystem::moveFile('/path/to/oldname.txt', '/path/to/newname.txt');

// 移动文件到另一个目录
Filesystem::moveFile('/path/to/file.txt', '/another/path/file.txt');

// 移动并覆盖目标文件
Filesystem::moveFile('/path/to/source.txt', '/path/to/dest.txt', true);
```

### `cloneDirectory($sourcePath, $destPath)`

将源目录下的所有文件和子目录递归复制到目标目录。目标目录不存在时会自动创建。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$sourcePath` | `string` | 被克隆的目录路径 |
| `$destPath` | `string` | 目标目录路径 |

返回值：`void`

```php
// 将 templates/default 克隆到 themes/newtheme
Filesystem::cloneDirectory('/path/to/templates/default', '/path/to/themes/newtheme');
```

### `copyFolder($targetPath, $destPath, $whiteList = [])`

复制文件夹到目标目录，支持白名单跳过指定路径。复制过程中任一文件失败时会自动回滚（删除已复制的内容）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 源目录路径 |
| `$destPath` | `string` | 目标目录路径 |
| `$whiteList` | `array` | 路径白名单，元素必须是包含 `$destPath` 前缀的完整路径 |

返回值：`bool` — 成功返回 `true`，失败返回 `false`（失败时自动清理已复制的部分）

```php
// 复制主题文件夹，跳过配置文件
$whiteList = ['/themes/newtheme/config.php'];
Filesystem::copyFolder('/themes/default', '/themes/newtheme', $whiteList);
```

## 文件删除

### `deleteFile($filePath)`

删除单个文件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$filePath` | `string` | 文件完整路径 |

返回值：`bool` — 文件不存在时返回 `true`（视为已删除）

```php
Filesystem::deleteFile('/path/to/file.txt');
```

### `deleteDirectory($path)`

递归删除目录及其所有子文件和子目录。

::: danger 危险操作
删除后无法恢复，请谨慎使用。
:::

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 要删除的目录路径 |

返回值：`bool`

```php
Filesystem::deleteDirectory('/path/to/temp');
```

### `clearFolder($targetPath, $whiteList = [])`

清空文件夹内的所有内容（保留文件夹本身）。可通过白名单指定不删除的路径。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$targetPath` | `string` | 目标文件夹路径 |
| `$whiteList` | `array` | 跳过的白名单路径，元素必须包含 `$targetPath` 前缀 |

返回值：`bool` — 成功返回 `true`，文件夹不存在或部分删除失败返回 `false`

```php
// 清空缓存目录，但保留 index.html
Filesystem::clearFolder('/path/to/cache', ['/path/to/cache/index.html']);
```

## 目录操作

### `ensureDirectory($path, $permissions = 0755)`

确保目录存在。如果目录不存在，则递归创建。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 目录完整路径 |
| `$permissions` | `int` | 目录权限（八进制），默认 `0755` |

返回值：`bool`

```php
// 确保日志目录存在
Filesystem::ensureDirectory('/var/log/myapp');

// 指定目录权限
Filesystem::ensureDirectory('/data/uploads', 0775);
```
