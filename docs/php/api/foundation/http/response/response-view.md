# ResponseView — 视图响应

- **文件位置**: `kernel/Foundation/HTTP/Response/ResponseView.php`
- **命名空间**: `kernel\Foundation\HTTP\Response`
- **继承**: 继承 `kernel\Foundation\HTTP\Response`
- **是否可继承**: 是

页面视图响应。渲染指定模板文件（PHP 模板）并输出。支持**页面 + 布局**组合渲染：先渲染页面，再渲染布局，布局内用 `inject()` 注入页面内容。模板文件以 `include` 方式执行，可访问通过 `$viewData` 注入的变量。

**模板约定**：
- 默认视图根目录：应用根目录 `Path::root()`
- 默认视图基目录：`Views`
- 页面默认模板 ID：`page`；布局默认 `layout`

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$viewFilePath` | `string` | `""` | protected | 视图文件绝对路径 |
| `$viewFileBaseDir` | `string` | `""` | protected | 视图文件所在基目录 |
| `$templateId` | `string` | `""` | protected | 模板 ID（用于缓存模板） |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($viewFile, $viewData, $viewFileBaseDir, $templateId, $viewFileDir)` | 构造：渲染页面 |
| `page(...)` | 渲染页面 |
| `layout($layout, $viewData, $fileBaseDir, $templateId)` | 布局渲染 |
| `getBody()` | 获取渲染配置信息 |
| `output()` | 输出页面（渲染模板） |
| `render($viewFiles, $viewData)` | 渲染模板文件（静态） |
| `renderAppPage($viewFiles, $viewFileBaseDir, $viewData, $templateId)` | 渲染应用内模板（静态） |
| `inject()` | 布局内注入页面内容（静态） |
| `section($viewFiles, $viewData, $viewFileBaseDir, $templateId)` | 渲染模板组件（静态） |

## 方法

### `__construct($viewFile, $viewData = [], $viewFileBaseDir = "Views", $templateId = "page", $viewFileDir = null)` — 构造并渲染页面

等价于调用 `page()`。

**参数**：同 `page()`。

### `page($viewFile, $viewData, $viewFileDirBaseProject = "Views", $templateId = "page", $viewFileDir = null)` — 渲染页面

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$viewFile` | `string` | 无 | 渲染的视图文件（相对 `$viewFileDirBaseProject`）；无扩展名自动补 `.php` |
| `$viewData` | `array` | `[]` | 渲染的数据（注入模板的变量） |
| `$viewFileDirBaseProject` | `string` | `"Views"` | 视图文件所在目录（相对视图根目录） |
| `$templateId` | `string` | `"page"` | 模板 ID（用于缓存模板） |
| `$viewFileDir` | `string\|null` | `null` | 视图文件根目录；为空默认 `Path::root()`（当前应用根目录） |

**返回值**

- `$this`：支持链式调用。

**异常**

- `\kernel\Foundation\Exception\Error`：模板文件不存在时抛出（500）。

### `layout($layout = null, $viewData = [], $fileBaseDir = "Views/Layout", $templateId = "layout")` — 布局渲染

先用 `inject()` 约定存储当前页面的文件路径与数据，再把布局文件设为待渲染文件。布局模板内调用 `ResponseView::inject()` 渲染被布局包裹的页面内容。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$layout` | `string\|null` | `null` | 布局文件（相对 `$fileBaseDir`），自动补 `.php` |
| `$viewData` | `array` | `[]` | 布局渲染的数据 |
| `$fileBaseDir` | `string` | `"Views/Layout"` | 布局文件所在目录（相对根目录） |
| `$templateId` | `string` | `"layout"` | 模板 ID |

**返回值**

- `$this`：支持链式调用。

### `getBody()` — 获取渲染配置信息

**参数**

- 无。

**返回值**

- `array`：`{ filePath, baseDir, templateId, data }`。

### `output()` — 输出页面

输出响应头与状态码后，调用 `render($viewFilePath, $responseData, $templateId)` 渲染并返回。

**参数**

- 无。

**返回值**

- `mixed`：渲染结果。

### `render($viewFiles, $viewData = [])` — 渲染模板文件

> 静态。文件必须存在（否则 500 异常）。`$viewData` 非关联数组则置空；将数据键声明为模板局部变量，通过 `include_once` 执行模板，返回执行结果。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$viewFiles` | `string\|string[]` | 无 | 模板文件绝对路径，或路径数组 |
| `$viewData` | `array` | `[]` | 渲染的数据 |

**返回值**

- `bool`：渲染成功返回 `true`；无模板文件返回 `false`。

**异常**

- `\kernel\Foundation\Exception\Error`：模板文件不存在时抛出。

### `renderAppPage($viewFiles, $viewFileBaseDir = "", $viewData = [], $templateId = "page")` — 渲染应用内模板

> 静态。模板文件相对**当前应用根目录**，自动补 `.php`，组合绝对路径后调用 `render()`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$viewFiles` | `string\|string[]` | 无 | 模板文件名或数组（相对 `$viewFileBaseDir`） |
| `$viewFileBaseDir` | `string` | `""` | 文件所在目录（相对应用根目录） |
| `$viewData` | `array` | `[]` | 渲染数据 |
| `$templateId` | `string` | `"page"` | 模板 ID |

**返回值**

- `bool`：渲染结果。

### `inject()` — 布局内注入页面内容

> 静态。在布局模板内调用，渲染之前 `layout()` 存储的页面文件与数据，实现"布局包裹页面"。

**参数**

- 无。

**返回值**

- `bool`：渲染结果。

### `section($viewFiles, $viewData = [], $viewFileBaseDir = "Views", $templateId = "section")` — 渲染模板组件

> 静态。渲染可复用的视图片段（组件）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$viewFiles` | `string\|string[]` | 无 | 组件文件名或数组（相对 `$viewFileBaseDir`） |
| `$viewData` | `array` | `[]` | 渲染数据 |
| `$viewFileBaseDir` | `string` | `"Views"` | 组件所在目录（相对项目根目录） |
| `$templateId` | `string` | `"section"` | 模板 ID |

**返回值**

- `bool`：渲染结果。
