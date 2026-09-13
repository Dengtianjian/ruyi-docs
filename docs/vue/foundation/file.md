# file — 文件读取

- **文件位置**: `packages/vue/foundation/file.ts`
- **引入方式**: `import { file } from 'kit/vue'`
- **依赖**: 浏览器 `FileReader`

把本地图片文件读成 base64 dataURL，常用于上传前预览。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`renderImage(file)`](#renderimage-file-图片转-dataurl) | 图片文件转 dataURL |

## 方法

### `renderImage(file)` — 图片转 dataURL

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `file` | `File` | — | 浏览器 `File` 对象（通常来自 `<input type="file">` 或拖拽） |

**返回值**

- `Promise<string>`：`data:image/png;base64,...` 形式的 dataURL。

## 示例

```ts
import { file } from 'kit/vue'

async function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const dataURL = await file.renderImage(input.files[0])
  preview.value = dataURL
}
```

---

> **注意**：模块内部只创建了**一个** `FileReader` 实例（`const fileRender = new FileReader()`），每次调用都会重新设置 `onloadend` 并复用同一个实例，因此**并发调用会互相覆盖**，后一次的结果可能被前一次的 `onloadend` 抢先 resolve。需要并发读取时请自行 `new FileReader()`。
>
> 仅浏览器环境可用，SSR 下会因 `FileReader` 未定义而报错。
>
> 业务工程暂未使用，此处为最小示例。
