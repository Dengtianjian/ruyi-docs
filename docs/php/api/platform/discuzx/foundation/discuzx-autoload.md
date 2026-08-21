# DiscuzXAutoload — Discuz!X 自动加载脚本

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXAutoload.php`
- **命名空间**: 无（全局脚本文件）
- **是否可继承**: 否（非类，为可执行的自动加载脚本）

Discuz!X 平台的类自动加载脚本。该文件**不是类定义**，而是直接注册了一个名为 `loader` 的全局自动加载函数，用于将框架的 `kernel\` 命名空间映射到 Discuz!X 插件的 `source/plugin/gstudio_kernel/` 目录下。

> 该脚本由 Discuz!X 插件入口在 bootstrap 阶段 `require` 引入，用于解决插件目录下命名空间与 Discuz!X 路径的映射问题。

## 全局函数

### `loader` — 自动加载器

```php
function loader($className)
```

- `$className`（string）：待加载的类名

**逻辑**

1. 将类名中的 `\` 替换为 `/`。
2. 若类名含 `kernel` 且不含 `gstudio_kernel`，则把 `kernel` 替换为 `gstudio_kernel`（映射内核目录）。
3. 拼接路径 `DISCUZ_ROOT . "/source/plugin/{$className}.php"`。
4. 文件存在则 `include_once`；不存在且在开发模式下（含 `gstudio`）则输出 `debug` 信息。

### 注册

```php
spl_autoload_register("loader", true, true);
```

以 prepend（`true`）方式注册，使该加载器优先于其他加载器执行。
