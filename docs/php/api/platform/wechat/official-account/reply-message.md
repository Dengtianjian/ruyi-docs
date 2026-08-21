# ReplyMessage — 公众号被动回复

- **文件位置**: `kernel/Platform/Wechat/OfficialAccount/ReplyMessage.php`
- **命名空间**: `kernel\Platform\Wechat\OfficialAccount`
- **继承**: `extends WechatOfficialAccount`

公众号被动回复消息（文本/图片/语音/视频/音乐/图文），用于服务器响应微信消息事件。

## 构造

```php
new ReplyMessage($accessToken = null, $appId = null, $secret = null)
```

## 方法

| 方法 | 说明 |
|------|------|
| `text($fromUsername, $toUsername, $text)` | 回复文本消息 |
| `image($fromUsername, $toUsername, $mediaId)` | 回复图片消息 |
| `voice($fromUsername, $toUsername, $mediaId)` | 回复语音消息 |
| `video($fromUsername, $toUsername, $mediaId, $title = null, $description = null)` | 回复视频消息 |
| `music(...)` | 回复音乐消息 |
| `news($fromUsername, $toUsername, $articles)` | 回复图文消息 |
| `parse($xml)` | 解析用户发来的 XML 消息 |
| `buildXML($toUser, $fromUser, $msgType, $content)` | 构建回复 XML |

## 使用

```php
use kernel\Platform\Wechat\OfficialAccount\ReplyMessage;

$reply = new ReplyMessage();
// 响应文本消息
echo $reply->text($fromOpenId, $toOpenId, "你好！");
```
