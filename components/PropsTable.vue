<template>
  <n-table style="display:table;">
    <thead>
      <tr>
        <th>名称</th>
        <th>类型</th>
        <th>默认值</th>
        <th>说明</th>
        <th>版本</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>放弃</td>
        <td>反常的</td>
        <td>彻底废除</td>
        <td>...</td>
        <td>干！我刚才背的是啥</td>
      </tr>
      <tr>
        <td>{{ tag }}</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
      </tr>
    </tbody>
  </n-table>
</template>

<script lang="ts" setup>
import { NTable } from "naive-ui"

const tag = "`html`";
</script>

<style scoped>
.vp-doc table {
  margin: 0px;
}

.vp-doc tr {
  border-top: none;
  background-color: none;
}

.n-table th {
  font-weight: var(--n-th-font-weight);
  color: var(--n-th-text-color);
}

.vp-doc th,
.vp-doc td {
  padding: var(--n-td-padding);
  border: 0px solid var(--n-merged-border-color);
  border-bottom: 1px solid var(--n-merged-border-color);
}
</style>