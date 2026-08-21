# SecretCheck — 小程序内容安全检测

- **文件位置**: `kernel/Platform/Wechat/Miniprogram/SecretCheck.php`
- **命名空间**: `kernel\Platform\Wechat\Miniprogram`
- **继承**: `extends WechatMiniProgram`
- **是否可继承**: 是

小程序内容安全检测能力：文本/音视频违规检测、用户安全等级查询，以及违规标签码转中文说明。

## 方法速查表

| 方法 | 作用 |
|------|------|
| `getLabelText($label)` | 违规标签码转文字说明 |
| `msgSecCheck($content, $openId, $scene)` | 文本内容安全识别 |
| `mediaCheckAsync($mediaUrl, $openId, $scene, $mediaType)` | 音视频内容安全识别（异步） |
| `getUserRiskRank($openid, $scene)` | 获取用户安全等级 |

## 属性

继承自 `Wechat`：`$AppId`、`$AppSecret`、`$AccessToken`、`$ApiUrl`、`$CURL`。构造时传入 `$appId`、`$secret` 后即可调用检测接口。

## 方法

### `getLabelText($label)` — 违规标签码转文字

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$label` | `integer` | - | 违规标签码，如 10001、20001 等 |

内置映射：`10001`→广告、`20001`→时政、`20002`→色情、`20003`→辱骂、`20006`→违法犯罪、`20008`→欺诈、`20012`→低俗、`20013`→涉及版权、`21000`→其它违规；`100`→空；未知标签返回 `"违规"`。

**返回值**

- `string`：对应违规类型的文字说明。

### `msgSecCheck($content, $openId, $scene = 2)` — 文本内容安全识别

调用 `wxa/msg_sec_check` 接口检测文本。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$content` | `string` | - | 需检测的文本内容，上限 2500 字，UTF-8 编码 |
| `$openId` | `string` | - | 用户 openid（用户需在近两小时访问过小程序） |
| `$scene` | `integer` | `2` | 场景枚举：1 资料；2 评论；3 论坛；4 社交日志 |

**返回值**

- `array`：检测结果。

**示例**

```php
$check = new SecretCheck(null, "wx_appid", "wx_secret");
$res = $check->msgSecCheck("文本内容", "o_openid", 2);
$text = $check->getLabelText($res["result"]["label"] ?? 0);
```

### `mediaCheckAsync($mediaUrl, $openId, $scene = 2, $mediaType = 2)` — 音视频内容安全识别

调用 `wxa/media_check_async` 接口，异步通知检测结果。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$mediaUrl` | `string` | - | 要检测的图片或音频 URL；图片支持 jpg、jepg、png、bmp、gif（取首帧），音频支持 mp3、aac、ac3、wma、flac、vorbis、opus、wav |
| `$openId` | `string` | - | 用户 openid（用户需在近两小时访问过小程序） |
| `$scene` | `integer` | `2` | 场景枚举：1 资料；2 评论；3 论坛；4 社交日志 |
| `$mediaType` | `integer` | `2` | 媒体类型：1 音频；2 图片 |

**返回值**

- `array`：提交结果。

**示例**

```php
$check->mediaCheckAsync("https://example.com/a.png", "o_openid", 2, 2);
```

### `getUserRiskRank($openid, $scene = 1)` — 获取用户安全等级

调用 `wxa/getuserriskrank` 接口，获取用户风险等级（用于营销作弊等场景判断）。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$openid` | `string` | - | 用户 openid |
| `$scene` | `integer` | `1` | 场景值：0 注册；1 营销作弊 |

**返回值**

- `array`：用户风险等级信息。
