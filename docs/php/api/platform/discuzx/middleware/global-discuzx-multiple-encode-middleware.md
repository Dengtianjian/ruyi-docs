# GlobalDiscuzXMultipleEncodeMiddleware — Discuz!X 多编码响应中间件

- **文件位置**: `kernel/Platform/DiscuzX/Middleware/GlobalDiscuzXMultipleEncodeMiddleware.php`
- **命名空间**: `kernel\Platform\DiscuzX\Middleware`
- **继承**: `extends MiddlewareBase`
- **是否可继承**: 是

Discuz!X 多编码（GBK/UTF-8）响应中间件。当配置开启 `multipleEncode` 时，在响应后追加一段内联 `<script>`，将语言包 `__App.langs` 以当前站点字符集（GBK 用 `serialize`，UTF-8 用 JSON）注入到全局变量 `GLANG`，供前端页面使用。

## 方法

### `handle` — 中间件处理

```php
public function handle($next)
```

**逻辑**

1. 调用 `$next()` 得到响应结果。
2. 若 `Config::get("multipleEncode")` 为真：
   - 取 `$GLOBALS['_STORE']['__App.langs']` 语言包。
   - `CHARSET === "gbk"`：`serialize()` 语言包，输出 `<script src='source/plugin/kernel/Assets/js/unserialize.js'>` + `const GLANG=unserialize('...')`。
   - 否则：`json_encode()` 语言包，输出 `const GLANG=JSON.parse('...')`。
   - 开发模式（`Config::get("mode")==="development"`）额外输出 `console.log(GLANG)`。
3. `print_r` 输出脚本。
4. 返回 `$res`。

## 使用

```php
$app->set([
  "middleware" => (new Middleware)->set(GlobalDiscuzXMultipleEncodeMiddleware::class)
]);
```

需在配置中开启 `multipleEncode`：
```php
// Config
"multipleEncode" => true,
```
