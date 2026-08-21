# StorageSignature — 文件存储签名

- **文件位置**: `kernel/Foundation/FileSystem/Storage/StorageSignature.php`
- **命名空间**: `kernel\Foundation\FileSystem\Storage`
- **继承**: 继承 `kernel\Foundation\Object\BaseObject`
- **是否可继承**: 是

文件访问签名生成与验证。通过 HMAC-SHA1 对"HTTP 方法 + 文件键 + URL 参数 + 请求头 + 有效期"生成签名，用于文件授权访问控制（类似云厂商 COS/OSS 签名方案）。

签名结构：
- `sign-algorithm`：签名算法（`sha1`）
- `sign-time` / `key-time`：有效期起止（Unix 时间戳，`start;end`）
- `header-list`：参与签名的请求头键名（`;` 分隔）
- `url-param-list`：参与签名的 URL 参数键名（`;` 分隔）
- `signature`：最终签名串

签名构造：`SignKey = HMAC-SHA1(KeyTime, SignatureKey)`；`StringToSign = SHA1(HMAC 算法 + KeyTime + SHA1(HTTP 方法/文件键/URL参数/请求头拼接串))`；`Signature = HMAC-SHA1(StringToSign, SignKey)`。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$SignatureKey` | `string\|null` | `null` | protected | 签名秘钥（加盐用） |
| `$SignAlgorithm` | `string` | `"sha1"` | static protected | 签名加密方式 |
| `$SignHeader` | `array` | 见源码 `SignHeader` | protected | 允许参与签名的头部键名白名单 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($SignatureKey)` | 构造：设置签名秘钥 |
| `getSignAlgorithm()` | 获取签名算法 |
| `createAuthorization($FileKey, $URLParams, $Headers, $Expires, $HTTPMethod)` | 生成授权签名参数 |
| `verifyAuthorization($Signature, $FileKey, $StartTime, $EndTime, $URLParams, $Headers, $HTTPMethod)` | 验证签名是否正确 |
| `getObjectKeys($object)` | 获取对象键名列表（protected） |
| `object2String($Object, $SkipKeys, $keyEnCode)` | 对象转 `&` 连接字符串（protected） |
| `object2List($Object, $SkipKeys)` | 对象转按键排序列表（protected） |
| `generateSignature(...)` | 生成签名（protected） |

## 方法

### `__construct($SignatureKey)` — 构造

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$SignatureKey` | `string` | 无 | 签名秘钥 |

**返回值**

- 无。

### `getSignAlgorithm()` — 获取签名算法

**参数**

- 无。

**返回值**

- `string`：签名算法（`"sha1"`）。

### `createAuthorization($FileKey, $URLParams = [], $Headers = [], $Expires = 600, $HTTPMethod = "get")` — 生成授权签名参数

基于当前时间生成有效期，计算签名并返回一组带签名的查询参数。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | 无 | 文件键（文件名称） |
| `$URLParams` | `array` | `[]` | 请求参数 |
| `$Headers` | `array` | `[]` | 请求头 |
| `$Expires` | `int` | `600` | 有效期（秒） |
| `$HTTPMethod` | `string` | `"get"` | 请求方法 |

**返回值**

- `array`：签名参数，含 `sign-algorithm` / `sign-time` / `key-time` / `header-list` / `signature` / `url-param-list`。

### `verifyAuthorization($Signature, $FileKey, $StartTime, $EndTime, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 验证签名

用相同规则重新计算签名并与传入签名比对。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Signature` | `string` | 无 | 被验证的签名 |
| `$FileKey` | `string` | 无 | 文件键 |
| `$StartTime` | `int` | 无 | 签名有效期起始时间 |
| `$EndTime` | `int` | 无 | 签名有效期结束时间 |
| `$URLParams` | `array` | `[]` | 请求参数 |
| `$Headers` | `array` | `[]` | 请求头 |
| `$HTTPMethod` | `string` | `"get"` | 请求方式 |

**返回值**

- `bool`：签名一致返回 `true`。

### `getObjectKeys($object)` — 获取对象键名列表

> protected。索引数组取元素值，关联数组取键名。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$object` | `array` | 无 | 数组 |

**返回值**

- `array`：键名列表。

### `object2String($Object, $SkipKeys = [], $keyEnCode = true)` — 对象转字符串

> protected。`["a"=>1,"b"=>2]` → `"a=1&b=2"`。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Object` | `array` | 无 | 转换的数组 |
| `$SkipKeys` | `array` | `[]` | 跳过的键名 |
| `$keyEnCode` | `bool` | `true` | 是否对键名做 URL 编码 |

**返回值**

- `string`：`&` 连接的键值对字符串。

### `object2List($Object, $SkipKeys = [])` — 对象转排序列表

> protected。`["a"=>1,"b"=>2]` → `["a"=>"a=1","b"=>"b=2"]`，键名小写化并按键排序。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$Object` | `array` | 无 | 对象数组 |
| `$SkipKeys` | `array` | `[]` | 跳过的键名 |

**返回值**

- `array`：按键排序的列表。

### `generateSignature($FileKey, $StartTime, $EndTime, $URLParams = [], $Headers = [], $HTTPMethod = "get")` — 生成签名

> protected。核心签名算法，见类顶部说明。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$FileKey` | `string` | 无 | 文件键 |
| `$StartTime` | `int` | 无 | 有效期起始时间 |
| `$EndTime` | `int` | 无 | 有效期结束时间 |
| `$URLParams` | `array` | `[]` | 请求参数 |
| `$Headers` | `array` | `[]` | 请求头 |
| `$HTTPMethod` | `string` | `"get"` | 请求方式 |

**返回值**

- `string`：签名串。
