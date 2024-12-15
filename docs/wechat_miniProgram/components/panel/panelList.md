# 面板列表

把多个面板组合成一个列表，统一配置属性

```html
<panel-list storage size="small">
  <panel title="面板 1">
    面板 1 内容
  </panel>
  <panel title="面板 2">
    面板 2 内容
  </panel>
  <inner-panel title="面板 3">
    面板 3 内容
  </inner-panel>
  <inner-panel title="面板 4">
    面板 4 内容
  </inner-panel>
</panel-list>
```

## API
### Props
|名称|类型|默认值|说明|版本|
|-|-|-|-|-|
|bordered|`boolean`|`false`|多个面板之间加入分割线|-|
|size|`small \| medium \| large`|`medium`|面板尺寸|-|
|storage|`boolean`|`false`|面板的部分文字加粗|-|