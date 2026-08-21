# Extensions — 扩展扫描与配置读取

- **文件位置**: `kernel/Foundation/Extension/Extensions.php`
- **命名空间**: `kernel\Foundation\Extension`
- **类型**: 纯静态类
- **是否可继承**: 是

负责扫描应用（插件）下的扩展目录、读取每个扩展的 `extension.json` 配置。适用于 DiscuzX 插件体系：应用根目录下放一个 `Extensions/` 文件夹，每个子文件夹为一个扩展。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `scanDir($rootPath, $extensionFolderName)` | 扫描目录下所有扩展并返回配置 |
| `config($extensionId, $extensionRootPath)` | 读取指定扩展的 `extension.json` 配置 |

## 方法

### `scanDir($rootPath, $extensionFolderName)` — 扫描目录下的扩展

扫描指定目录下的扩展，读取每个扩展的 `extension.json` 并补充 `root`、`icon` 字段。支持递归扫描子扩展：若某扩展内部还有同名扩展文件夹，则递归扫描并标记为 `sub`（子扩展），未指定 `parent` 时自动取父扩展 `id`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$rootPath` | `string` | 无 | 扩展文件夹目录根目录，基于插件根目录，不用加上 `DISCUZ_ROOT` |
| `$extensionFolderName` | `string` | `"Extensions"` | 指定扩展文件夹名称 |

**返回值**

- `array`：扩展配置集合，键为扩展 `id`，值为扩展配置数组（含 `root`/`icon` 及原 `extension.json` 全部字段；子扩展额外含 `sub`/`parent`）。目录不存在时返回空数组。

### `config($extensionId, $extensionRootPath)` — 读取扩展配置

读取指定扩展的 `extension.json` 文件并解析为数组。未传入扩展路径时，按当前应用（`_STORE['__App.id']`）的 `source/plugin/{App}/Extensions/{extensionId}/extension.json` 定位。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$extensionId` | `string` | 无 | 扩展 `id` |
| `$extensionRootPath` | `string` | `NULL` | 扩展所在文件夹（不用加 `extension.json`，也不用加 `DISCUZ_ROOT`） |

**返回值**

- `array\|false`：扩展配置数组；配置文件不存在时返回 `false`。
