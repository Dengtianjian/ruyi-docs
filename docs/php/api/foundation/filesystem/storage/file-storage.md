# FileStorage — 文件存储统一入口

- **文件位置**: `kernel/Foundation/FileSystem/Storage/FileStorage.php`
- **命名空间**: `kernel\Foundation\FileSystem\Storage`
- **继承**: 继承 `kernel\Foundation\Object\AbilityBaseObject`（实例级错误状态机）
- **是否可继承**: 是
- **静态门面**: `kernel\Facades\Storage`

FileStorage 是存储层对外的**统一入口**，本身不直接读写磁盘，而是把三件事聚合到一起：

1. **多磁盘**：聚合一组 [`AbstractStorage`](./abstract-storage.md) 磁盘实例（本地 / 腾讯云 COS / 阿里云 OSS 等），通过 [`disk()`](#磁盘管理) / [`use()`](#磁盘管理) 切换当前磁盘；
2. **签名鉴权**：借助 [`StorageSignature`](./storage-signature.md) 给文件访问 URL 附加时效与防篡改签名（`createAuthParams` / `verifySignature` / `verifyRequestSignature`）；
3. **访问控制**：启用数据存储后，借助 `FilesModel` 落库文件元信息，并按 ACL 标签（`PRIVATE` / `PUBLIC_READ` …）做读写授权（`authorizeOperation` / `checkAccessControl`）。

::: tip 构造即注册门面
FileStorage 构造时会自动调用 `kernel\Facades\Storage::setInstance($this)`，即 **new 出来的实例会立即成为门面 `Storage` 的静态调用目标**。因此只要先 `new FileStorage([...])` 完成装配，之后就能用门面静态访问：`Storage::put(...)`。

> 门面 `kernel\Facades\Storage` 转发到的底层即本类 `kernel\Foundation\FileSystem\Storage\FileStorage`（存储聚合类）。
:::

## 快速上手

```php
use kernel\Foundation\FileSystem\Storage\FileStorage;
use kernel\Foundation\FileSystem\Storage\LocalStorage;

// 1. 实例化并注入磁盘（array 的第一块即默认「当前使用磁盘」）
new FileStorage([
  "local" => new LocalStorage(),
  // "cos"   => new QCloudCOSStorage(...),   // 云磁盘按需追加
]);

// 2. 之后用门面静态调用（也可持有实例调用）
use kernel\Facades\Storage;

// 上传（返回 StorageFile 对象）
$file = Storage::put($_FILES['file'], "images/a.png");

// 生成带签名的访问 URL
$url = Storage::url("images/a.png");
```

## 构造

### `__construct($disks, $model = null)`

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$disks` | `array<string,AbstractStorage>` | 无 | 磁盘驱动表（磁盘名 => 磁盘实例） |
| `$model` | `FilesModel\|null` | `null` | 文件数据模型；传 `null` 表示暂不启用数据存储 |

构造时：以 `App::id()` 初始化签名器、取 `URL::baseURL()` 作为基础地址、把 `$disks` 的**第一块**设为当前使用磁盘，并调用 `Facade::setInstance($this)` 注册门面实例。

## 磁盘管理

| 方法 | 返回 | 说明 |
|------|------|------|
| `disks()` | `array<string,AbstractStorage>` | 获取全部磁盘（磁盘名 => 实例） |
| `disk($name = null)` | `AbstractStorage\|null` | 传名取对应磁盘；不传取当前使用磁盘（无则回退默认磁盘） |
| `use($name = null)` | `AbstractStorage` | 切换当前使用磁盘（`$name` 必须是已注册磁盘） |

```php
FileStorage::disks();          // ["local" => LocalStorage, "cos" => ...]
FileStorage::disk();           // 当前磁盘
FileStorage::disk("cos");      // 指定磁盘
FileStorage::use("cos");       // 切换当前磁盘，后续操作走 cos
```

## 开关（读写一体）

以下方法**传值即设置并返回 `$this`（可链式），不传即读取当前值**：

| 方法 | 说明 |
|------|------|
| `auth($val = null)` | 是否校验请求签名。开启后 `put` / `save` 会先走 `verifyRequestSignature` |
| `accessControl($val = null)` | 是否按 ACL 标签校验操作权限（`checkAccessControl` 依赖） |
| `accessControlAuthId($val = null)` | 访问控制当前认证身份（通常为当前用户 ID），用于判定文件归属 |
| `enableDataSave($model = null)` | 启用文件元信息落库；不传 `$model` 时用默认 `FilesModel` |
| `model($model = null)` | 读取 / 注入文件数据模型 |

```php
$storage = (new FileStorage(["local" => new LocalStorage()]))
  ->enableDataSave()          // 元信息落库（save/add/delete/exists 依赖）
  ->auth(true)                // 开启请求签名校验
  ->accessControl(true)       // 开启 ACL 访问控制
  ->accessControlAuthId(1001); // 当前认证用户

$storage->auth();             // 读取当前开关值
```

## 文件操作

| 方法 | 依赖数据存储 | 返回 |
|------|--------------|------|
| `get($fileKey)` | 否 | `array\|false` 文件信息 |
| `put($file, $saveFileName = null)` | 否 | `StorageFile\|false` |
| `save($file, $fileKeyOrSavePath = null, $ownerId = null, $ref = null, $type = null, $accessControl = FileStorage::AUTHENTICATED_READ)` | 是 | `StorageFile\|false` |
| `add($key, $sourceFileName = null, ...)` | 是 | `int\|false` 记录 ID |
| `update($key, $data)` | 是 | `mixed`（模型 update 结果） |
| `updateAccessControl($key, $val)` | 是 | `mixed` |
| `delete($key)` | 否 | `bool` |
| `exists($key)` | 否 | `bool` |

要点：

- **`put`**：把上传文件写入当前磁盘，返回 `StorageFile`；**不落库**。启用 `auth` / `accessControl` 时先校验上传权限。
- **`save`**：需要先 `enableDataSave()`。会自动生成/解析文件键、写磁盘（复用 `put`）、并把元信息写库（同 key 先删后插，幂等）。
- **`add`**：仅登记元信息、不上传文件内容（文件已在外部落盘时用）。
- **`delete`**：启用数据存储时先删库记录，再删当前磁盘上的实际文件。
- **`exists`**：启用数据存储时先查库，库中不存在直接 `false`，否则再向磁盘确认。

```php
// 上传但不落库
$file = FileStorage::put($_FILES['avatar'], "avatars/u1001.jpg");
echo $file->key;   // 文件键

// 上传并落库（需 enableDataSave）
$saved = FileStorage::save($_FILES['avatar'], "avatars/", 1001, "user", "avatar");

// 仅登记元信息
$id = FileStorage::add("exports/report.csv", "report.csv", "report.csv", "exports", 10240, "csv", "text/csv");

// 更新 ACL
FileStorage::updateAccessControl("avatars/u1001.jpg", FileStorage::PRIVATE);

// 删除 / 判断
FileStorage::delete("avatars/u1001.jpg");
FileStorage::exists("avatars/u1001.jpg");
```

## URL 与签名

| 方法 | 说明 |
|------|------|
| `url($fileKey, $urlParams = [], $expires = 1800, $withSignature = true)` | 生成文件访问 URL（`{baseURL}/{prefix}/{fileKey}`，按需追加签名参数） |
| `createAuthParams($key, $expires = 600, $urlParams = [], $headers = [], $httpMethod = "get")` | 生成签名授权参数字典；`$key` 为空时抛 `Error`(400) |
| `verifySignature($fileKey, $rawURLParams, $rawHeaders = [], $httpMethod = "get")` | 解析并校验签名参数，通过返回 `true`，否则 `break` 错误态 |
| `verifyRequestSignature($key, $silent = false)` | 从当前请求（query/header/method）提取参数并校验；未开启 `auth` 时直接放行。`$silent=true` 时把非数字错误码归一为 `errorStatusCode` |

```php
// 生成带签名 URL（默认 1800s 有效）
$url = FileStorage::url("avatars/u1001.jpg");

// 不带签名的公开 URL
$publicUrl = FileStorage::url("avatars/u1001.jpg", [], 1800, false);
```

## 访问控制

| 方法 | 说明 |
|------|------|
| `authorizeOperation($fileKey, $operation = "read")` | 授权编排入口：启用数据存储时取文件归属者与 ACL 判定；否则退化为仅验签名。通过返回 `true`，否则 `break` 错误态 |
| `checkAccessControl($fileKey, $authTag, $ownerId, $action = "read")` | 按 ACL 标签判定读写是否允许；**仅当启用数据存储且 `accessControl(true)` 时生效**，否则一律放行 |

判定规则（`checkAccessControl`）：

- 访问者与文件归属者相同 → 放行；
- 归属者不同：`PRIVATE` → 拒绝；`AUTHENTICATED_READ(_WRITE)` → 认证用户允许、只读标签写操作拒绝、其余校验签名；`PUBLIC_READ(_WRITE)` → 公开，只读标签写操作拒绝。

## 常量（ACL 标签）

| 常量 | 值 | 含义 |
|------|----|------|
| `FileStorage::PRIVATE` | `private` | 仅创作者与管理员具备全部权限 |
| `FileStorage::PUBLIC_READ` | `public-read` | 匿名可读，创作者与管理员全部权限 |
| `FileStorage::PUBLIC_READ_WRITE` | `public-read-write` | 公开读写（通常不建议） |
| `FileStorage::AUTHENTICATED_READ` | `authenticated-read` | 认证用户可读，创作者与管理员全部权限 |
| `FileStorage::AUTHENTICATED_READ_WRITE` | `authenticated-read-write` | 认证用户读写（通常不建议） |

## 错误处理

FileStorage 继承 `AbilityBaseObject`，失败时通过 `break()` / `return()` 返回**错误态**，而非抛异常（`save()` / `update()` 等在「未启用数据存储」时会抛 `Error`）。调用后可用：

```php
$result = FileStorage::get("avatars/u1001.jpg");
if (FileStorage::isError()) {
  $error = FileStorage::getError();   // ["code"=>..,"message"=>..,"statusCode"=>..,"details"=>..,"data"=>..]
}
```

## 完整示例

```php
use kernel\Foundation\FileSystem\Storage\FileStorage;
use kernel\Foundation\FileSystem\Storage\LocalStorage;
use kernel\Facades\Storage;

// 装配：本地磁盘 + 落库 + 开启鉴权/访问控制
new FileStorage(["local" => new LocalStorage()]);
Storage::enableDataSave()
  ->auth(true)
  ->accessControl(true);

// 上传并落库（归属用户 1001）
$file = Storage::save($_FILES['file'], "images/", 1001, "user", "avatar", FileStorage::AUTHENTICATED_READ);
if (Storage::isError()) {
  return Storage::getError();
}

// 访问 URL（带签名）
$url = Storage::url($file->key);
echo $url;
```

## 相关

- 磁盘抽象基类：[AbstractStorage](./abstract-storage.md)
- 本地磁盘：[LocalStorage](./local-storage.md)
- 签名实现：[StorageSignature](./storage-signature.md)
- 文件信息结构：[StorageFileInfoData](./storage-file-info-data.md)
- 文件模型：[FilesModel](../../../model/files-model.md)
- 门面基类：[Facade](../../facade.md)
