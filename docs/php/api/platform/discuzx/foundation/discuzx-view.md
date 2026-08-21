# DiscuzXView — Discuz!X 视图类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXView.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: `extends ResponseView`
- **是否可继承**: 是

Discuz!X 视图响应类，扩展内核 `ResponseView`，适配 Discuz!X 的 `template()` 模板机制。支持页面渲染、布局渲染、静态渲染函数式模板，以及钩子视图。

## 构造

```php
public function __construct($viewFile, $viewData = [], $viewFileBaseDir = "Views", $templateId = "page", $viewFileDir = null)
```

- `$viewFile`（string）：视图文件，相对于 `$viewFileBaseDir`
- `$viewData`（array）：渲染数据
- `$viewFileBaseDir`（string）：视图所在目录（相对），默认 `Views`
- `$templateId`（string）：模板 ID（用于缓存），默认 `page`
- `$viewFileDir`（string，可选）：视图文件根目录，默认基于 `Path::root()`

构造即调用 `page()` 设置页面视图。

## 方法

### `generateTemplatePath` — 生成模板路径（static）

```php
static function generateTemplatePath($viewFile, $templateId, $viewFileDirBaseProject, $viewFileDir = null)
```

- `$viewFile`（string）：视图文件
- `$templateId`（string）：模板 ID
- `$viewFileDirBaseProject`（string）：视图目录（相对项目）
- `$viewFileDir`（string，可选）：视图根目录

视图名不含 `.` 时调用 Discuz!X `template()` 生成模板路径（模板 ID 为 `{App::id()}_{$templateId}`）；含 `.` 时用 `FileHelper::combinedFilePath` 拼接。

### `page` — 渲染页面

```php
public function page($viewFile, $viewData, $viewFileDirBaseProject = "Views", $templateId = "page", $viewFileDir = null)
```

设置页面视图文件路径与数据，返回 `$this`。

### `layout` — 渲染布局

```php
public function layout($layout = null, $viewData = [], $fileBaseDir = "Views/Layout", $templateId = "layout")
```

- `$layout`（string）：布局模板
- `$viewData`（array）：布局数据
- `$fileBaseDir`（string）：布局目录，默认 `Views/Layout`
- `$templateId`（string）：模板 ID，默认 `layout`

将当前页面视图路径与数据存入 `$GLOBALS['_STORE']`（`__View_LayoutRenderViewFile` / `__View_LayoutRenderViewData`），供布局内嵌子视图使用，再切换到布局模板。

### `render` — 静态渲染（static）

```php
public static function render($viewFiles, $viewData = [], $returnName = null)
```

- `$viewFiles`（string|array）：视图文件路径
- `$viewData`（array）：渲染数据
- `$returnName`（string|array|null）：若指定，则模板中相应变量作为返回值返回；数组则返回关联数组

**逻辑**

1. 校验视图文件存在（不存在抛 `Exception("模板文件不存在...", 500)`）。
2. 通过 `eval` 构造闭包函数，函数体内 `include_once` 各视图文件。
3. 返回闭包执行结果：无 `$returnName` 时返回 `true`；否则返回指定变量或关联数组。

> 使用 `eval` 动态构建代码，需确保视图文件内容可信。

### `renderAppPage` — 渲染应用页面（static）

```php
static function renderAppPage($viewFiles, $viewFileBaseDir = "", $viewData = [], $templateId = "page", $returnName = null)
```

将视图路径经 `generateTemplatePath` 解析后调用 `render()`。

### `hook` — 渲染钩子视图（static）

```php
static function hook($viewFiles, $viewData, $returnName = "return")
```

以 `Views` 目录、模板 ID `hook` 渲染应用页，用于 Discuz!X 钩子输出。返回钩子模板的 `$return` 变量值。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXView;

// 页面渲染
$view = new DiscuzXView("index", ["title" => "首页"]);
$view->output();

// 布局渲染
$view = new DiscuzXView("body", ["content" => "..."]);
$view->layout("layout_main");

// 静态渲染（拼接视图片段）
$html = DiscuzXView::render(Path::root() . "/Views/header.php", ["title" => "标题"]);
```
