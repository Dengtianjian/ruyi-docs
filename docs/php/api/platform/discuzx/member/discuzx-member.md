# DiscuzXMember — Discuz!X 会员服务

- **文件位置**: `kernel/Platform/DiscuzX/Member/DiscuzXMember.php`
- **命名空间**: `kernel\Platform\DiscuzX\Member`
- **继承**: 无（静态工具类）
- **是否可继承**: 否

Discuz!X 会员服务封装，提供账号登录、注册、头像、积分、用户组、提示消息、会员详情查询等能力。基于 Discuz!X 的 `userlogin`、`setloginstatus`、`uc_user_*` 等核心函数与数据表。

## 方法

### `login` — 账号密码登录（static）

```php
static function login($username, $password, $cookieTime = 1296000)
```

- `$username`（string）：会员账号
- `$password`（string）：会员密码
- `$cookieTime`（int）：cookie 有效期（秒），默认 1296000（15 天）

**逻辑**

1. 通过 `common_failedlogin` 检查该 IP 的失败登录次数，超过限制返回 `Result(403, 403001, "密码错误次数过多...")`。
2. `userlogin()` 校验账号密码；失败则记录失败次数并返回 `Result(400, 400001, "登录失败，您还可以尝试 N 次")`。
3. 成功则 `setloginstatus()` 设置登录态、更新 `common_member_status` 的 IP/时间、`uc_user_synlogin()` 同步 UC 登录。
4. 返回 `Result(会员信息)`。

### `register` — 注册用户（static）

```php
public static function register($username, $password, $email = null, $invationCode = null)
```

- `$username`（string）：用户名
- `$password`（string）：密码
- `$email`（string，可选）：邮箱
- `$invationCode`（string，可选）：邀请码

**逻辑（核心校验链）**

1. 站点是否关闭注册（`regstatus`）。
2. 同 IP 注册间隔与 24 小时内注册次数限制。
3. 邀请码有效性（`regstatus==2` 时必须有效邀请码）。
4. 邮箱格式、域名黑白名单、唯一性校验。
5. 用户名长度（3~15）、保留关键字、重复检测。
6. 密码长度、强度（数字/大小写/特殊字符）、非法字符检测。
7. 新用户验证策略（`regverify`：0 无 / 1 邮箱验证 / 2 人工审核）。
8. `uc_user_register()` 在 UC 注册，处理返回码（敏感字符/屏蔽/重复等）。
9. 设置初始用户组（验证通过用 `newusergroupid`，否则等待验证组）。
10. 插入 `common_member`、更新统计缓存、记录注册 IP、绑定邀请关系、发欢迎消息。
11. 成功后 `setloginstatus()` 自动登录。

返回 `Result(新用户信息)`；任一步骤失败返回对应错误 `Result`。

### `avatar` — 获取头像（static）

```php
public static function avatar($memberId, $size = 'middle', $returnsrc = 1, $real = FALSE, $static = FALSE, $ucenterurl = '', $class = '', $extra = '', $random = 0)
```

直接委托 Discuz!X 全局 `avatar()` 函数，参数一致。

### `credit` — 获取积分（static）

```php
public static function credit($memberId = null)
```

- `$memberId`（int|array，可选）：默认当前登录用户

查询 `common_member_count`（若开启 `membersplit` 合并归档表），返回积分数据；数组 ID 返回按 `uid` 索引的关联数组。

### `group` — 获取用户组（static）

```php
public static function group($groupId = null, $simple = false)
```

- `$groupId`（int|array，可选）：默认当前用户组
- `$simple`（bool）：仅返回基本字段（`groupid`/`grouptitle`/`icon`/`color`）

查询 `common_usergroup` 并补全组图标（`get_groupimg`）。数组返回按 `groupid` 索引。

### `newPrompt` — 获取新提示（static）

```php
public static function newPrompt($memberId = null)
```

查询 `common_member_newprompt`，反序列化 `data` 字段合并，返回提示数据（数组 ID 返回分组）。

### `get` — 获取会员详情（static）

```php
public static function get($memberId = null, $detailed = true, $dataConversionRules = null)
```

- `$memberId`（int|array，可选）：默认当前用户
- `$detailed`（bool）：是否附带详情（积分/提示/论坛扩展字段）
- `$dataConversionRules`（array，可选）：`Mutator` 数据转换规则

**逻辑**

1. 查询 `common_member`（合并归档表）。
2. `detailed` 时补充：积分（`credit`）、提示（`newPrompt`）、论坛字段（`common_member_field_forum`，过滤签名 HTML）。
3. 每个会员补充 `avatar`、`group`、`count`、`prompts`、`forum_field`。
4. `dataConversionRules` 时用 `Mutator` 转换数据。
5. 返回单个会员或按 `uid` 索引的数组。

### `getAll` — 分页查询会员列表（static）

```php
public static function getAll($page = 1, $limit = 15, $query = null, $accurateQuery = false)
```

- `$page`（int）：页码
- `$limit`（int）：每页数量，默认 15
- `$query`（string，可选）：用户名关键词（默认 `LIKE`）
- `$accurateQuery`（bool）：是否精确匹配（`=`）

返回 `["list" => 会员列表(含avatar), "total" => 总数]`。

### `exist` — 判断用户是否存在（static）

```php
public static function exist($UserId)
```

- `$UserId`（int）：用户 ID

查询 `common_member` 判断是否存在，返回布尔值。

## 使用

```php
use kernel\Platform\DiscuzX\Member\DiscuzXMember;

// 登录
$result = DiscuzXMember::login("admin", "password");

// 注册
$result = DiscuzXMember::register("newuser", "pass1234", "u@mail.com");

// 会员详情
$member = DiscuzXMember::get(1, true);
echo $member['username'], $member['avatar'], $member['group']['grouptitle'];

// 分页列表
$list = DiscuzXMember::getAll(1, 15, "关键词");
```
