# FileSystem — 文件系统管理

- **文件位置**: `kernel/Foundation/FileSystem/FileSystem.php`
- **命名空间**: `kernel\Foundation\FileSystem`
- **是否可继承**: **final**（不可继承）

文件系统总管理：负责实际的文件操作（上传、创建、复制、移动、删除、读取、目录操作等）。全静态方法。路径操作均通过 `FileHelper` 规范化，保证跨平台兼容。**目录路径推导已抽离到 `Path` 类**，本类仅保留实际文件动作。

无参构造（构造时确保应用 `data/storage` 目录存在）；App 在 `defineConstants()` 之后 `new FileSystem` 即可。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （无属性） | — | — | — | 无任何静态属性、无缓存 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct()` | 无参构造，确保 data/storage 目录存在 |
| `upload($file, $savePath, $fileName)` | 上传文件并保存到存储目录 |
| `cloneDirectory($sourcePath, $destPath)` | 递归克隆目录 |
| `createFile($filePath, $fileContent, $overwrite)` | 创建文件并写入内容 |
| `deleteDirectory($path)` | 递归删除目录 |
| `clearFolder($targetPath, $whiteList)` | 清空文件夹（保留文件夹本身） |
| `copyFolder($targetPath, $destPath, $whiteList)` | 复制目录（带白名单与失败回滚） |
| `getFileInfo($filePath)` | 获取文件信息（含图片宽高） |
| `deleteFile($filePath)` | 删除单个文件 |
| `readFile($filePath)` | 读取文件内容 |
| `copyFile($sourcePath, $destPath, $overwrite)` | 复制单个文件 |
| `moveFile($sourcePath, $destPath, $overwrite)` | 移动/重命名文件 |
| `ensureDirectory($path, $permissions)` | 确保目录存在 |
| `fileSize($filePath)` | 获取文件大小 |

## 方法

### `__construct()` — 构造

无参构造，确保当前应用 `Data`/`Storage` 目录存在（递归创建）。未实例化 App（`App::id()` 为 `null`）时路径不可推导，直接跳过。

**参数**

- 无。

**返回值**

- 无。

### `upload($file, $savePath, $fileName = null)` — 上传文件并保存

支持两种上传方式：`$_FILES` 数组上传（HTTP POST）与本地文件路径上传（服务端已存在文件）。文件默认保存到 `Path::storage()` 存储根目录，`$savePath` 指定相对子目录。图片自动获取宽高。文件名为空时用 `uniqid()` 生成，扩展名取自源文件。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$file` | `array\|string` | 无 | `$_FILES` 中的某一项（含 `error`/`tmp_name`/`name`/`size`），或本地文件的完整路径 |
| `$savePath` | `string` | 无 | 保存的相对子目录（相对 `Path::storage()`）；传 `"."` 或空串表示直接存到存储根目录 |
| `$fileName` | `string\|null` | `null` | 自定义存储文件名（不含扩展名，扩展名由源文件决定）；为空时用 `uniqid()` 生成 |

**返回值**

- `array`：文件信息数组，含 `name` / `sourceFileName` / `path` / `extension` / `size` / `width` / `height` / `filePath`。

**异常**

- `\kernel\Foundation\Exception\Error`：上传失败（错误码前缀 `FileUpload` / `FileSave`）。

**示例**

```php
$info = FileSystem::upload($_FILES['avatar'], 'avatars', 'user_123.jpg');
$info = FileSystem::upload('/tmp/export.csv', 'exports');   // 本地路径
```

### `cloneDirectory($sourcePath, $destPath)` — 递归克隆目录

将源目录下所有文件与子目录递归复制到目标目录（目标不存在自动创建）。源目录不存在则直接返回。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sourcePath` | `string` | 无 | 被克隆的目录路径 |
| `$destPath` | `string` | 无 | 克隆到的目标目录路径（不存在自动创建） |

**返回值**

- 无（`void`）。

### `createFile($filePath, $fileContent = "", $overwrite = false)` — 创建文件

父目录不存在自动创建。`$overwrite` 为 `false` 且文件已存在时**跳过不覆盖**（直接返回 `true`）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径（含文件名与扩展名） |
| `$fileContent` | `string` | `""` | 写入的文件内容 |
| `$overwrite` | `bool` | `false` | `true` 覆盖已存在文件；`false` 文件已存在则跳过 |

**返回值**

- `bool`：创建成功返回 `true`，失败返回 `false`。

### `deleteDirectory($path)` — 递归删除目录

递归删除目录下所有内容并删除目录本身。**删除后无法恢复，请谨慎使用。**

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string` | 无 | 要删除的目录路径 |

**返回值**

- `bool`：删除成功返回 `true`；目录不存在或删除失败返回 `false`。

### `clearFolder($targetPath, $whiteList = [])` — 清空文件夹

递归删除文件夹内所有文件与子文件夹，**保留文件夹本身**。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetPath` | `string` | 无 | 被清除的文件夹路径 |
| `$whiteList` | `array` | `[]` | 跳过的白名单；元素须为完整路径（含 `$targetPath` 前缀），命中则跳过 |

**返回值**

- `bool`：清除成功返回 `true`；文件夹不存在或部分删除失败返回 `false`。

### `copyFolder($targetPath, $destPath, $whiteList = [])` — 复制目录

复制目标目录下所有内容；目标目录不存在自动创建。**任一文件复制失败会回滚**（删除已复制内容）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$targetPath` | `string` | 无 | 被复制的目录路径 |
| `$destPath` | `string` | 无 | 复制到的目标目录路径 |
| `$whiteList` | `array` | `[]` | 跳过的白名单；元素须为完整路径（含 `$destPath` 前缀），命中则跳过 |

**返回值**

- `bool`：复制成功返回 `true`，失败返回 `false`（失败自动清理已复制内容）。

### `getFileInfo($filePath)` — 获取文件信息

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径 |

**返回值**

- `array|false`：文件信息数组（`name` / `sourceFileName` / `path` / `extension` / `size` / `width` / `height` / `filePath`）；文件不存在返回 `false`。

### `deleteFile($filePath)` — 删除单个文件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径 |

**返回值**

- `bool`：文件不存在时返回 `true`（视为已删除）；存在时返回 `unlink` 的实际结果。

### `readFile($filePath)` — 读取文件内容

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径 |

**返回值**

- `string|false`：文件内容字符串；文件不存在返回 `false`。

### `copyFile($sourcePath, $destPath, $overwrite = false)` — 复制单个文件

目标目录不存在自动创建。`$overwrite` 为 `false` 且目标已存在时返回 `false`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sourcePath` | `string` | 无 | 源文件完整路径 |
| `$destPath` | `string` | 无 | 目标文件完整路径 |
| `$overwrite` | `bool` | `false` | `true` 覆盖已存在目标；`false` 目标存在时返回 `false` |

**返回值**

- `bool`：复制成功返回 `true`，失败返回 `false`。

### `moveFile($sourcePath, $destPath, $overwrite = false)` — 移动/重命名文件

移动等同重命名，源文件操作成功后不再存在。目标目录不存在自动创建。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$sourcePath` | `string` | 无 | 源文件完整路径 |
| `$destPath` | `string` | 无 | 目标文件完整路径 |
| `$overwrite` | `bool` | `false` | `true` 先删除目标再移动；`false` 目标存在时返回 `false` |

**返回值**

- `bool`：移动成功返回 `true`，失败返回 `false`。

### `ensureDirectory($path, $permissions = 0755)` — 确保目录存在

目录不存在则递归创建。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$path` | `string` | 无 | 目录完整路径 |
| `$permissions` | `int` | `0755` | 目录权限（八进制） |

**返回值**

- `bool`：目录已存在或创建成功返回 `true`，创建失败返回 `false`。

### `fileSize($filePath)` — 获取文件大小

提供存在性检查与路径规范化，比直接 `filesize()` 更安全。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$filePath` | `string` | 无 | 文件完整路径 |

**返回值**

- `int|false`：文件大小（字节）；文件不存在或读取失败返回 `false`。
