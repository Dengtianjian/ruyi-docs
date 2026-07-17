# 内嵌面板

一般用于普通面板内，当做二级面板使用

```html
<panel title="面板标题" useFooterSlot>
  面板内容
  <view slot="footer">
    <button>操作</button>
  </view>
</panel>
```

## API
### Props
|名称|类型|默认值|说明|版本|
|-|-|-|-|-|
|useHederSlot|`boolean`|`false`|使用 `header` 插槽|-|
|title|`string`|`null`|标题|-|
|useTitleSlot|`boolean`|`false`|使用 `title` 插槽|-|
|headerExtra|`string`|`null`|头部扩展内容|-|
|useHeaderExtraSlot|`boolean`|`false`|使用 `header-extra` 插槽|-|
|footer|`string`|`null`|底部内容|-|
|useFooterSlot|`boolean`|`false`|使用 `footer` 插槽|-|
|size|`small \| medium \| large`|`medium`|面板尺寸|-|
|storage|`boolean`|`false`|面板的部分文字加粗|-|
|backgrounded|`boolean`|`true`|显示背景颜色|-|