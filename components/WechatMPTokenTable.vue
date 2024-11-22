<template>
  <n-table striped style="display:table;">
    <thead>
      <tr>
        <th width="200">变量名</th>
        <th width="200">变量值</th>
        <th width="200">CSS变量值</th>
        <th width="200">CSS变量</th>
        <th>描述</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="record in data" :key="record.name">
        <td>
          <div class="token-name">
            <div v-if="type === 'color'" class="token-sample" :style="{
              backgroundColor: dark
                ? record.darkValue ?? record.value
                : record.value,
            }" />
            <div class="token-text">
              {{ type === 'color' && dark ? `dark-${record.name}` : record.name }}
            </div>
          </div>
        </td>
        <td>
          <span class="token-value" @click="copyContent(record.value)">
            {{ dark ? record.darkValue ?? record.value : record.value }}
          </span>
        </td>
        <td>
          {{ type === 'size' && record.cssValue ? record.cssValue : '-' }}
        </td>
        <td>
          <span class="token-value"
            @click="copyContent(record.cssvar ? typeof record.cssvar === 'string' ? record.cssvar : `--${record.name}` : '-')">
            {{ record.cssvar ? typeof record.cssvar === 'string' ? record.cssvar : `--${record.name}` : '-' }}
          </span>
        </td>
        <td>
          {{ record.desc }}
        </td>
      </tr>
    </tbody>
  </n-table>
</template>

<script lang="ts" setup>
import { createDiscreteApi, NTable } from "naive-ui";
import { withDefaults, defineProps } from 'vue';
import clipboard from 'clipboard';

withDefaults(defineProps<{
  data: Array<{
    name: string;
    desc: string;
    descEN: string;
    value: string;
    cssValue?: string,
    darkValue?: string;
    cssvar?: boolean | string;
  }>,
  type?: string,
  dark?: boolean
}>(), {
  data: () => [{
    name: "a",
    desc: "n",
    descEN: "e",
    value: "1",
    cssvar: false
  }],
  type: "color",
  dark: false
});

const { message: NMessage } = createDiscreteApi(["message"]);

function copyContent(value?: string) {
  if (!value) return;
  clipboard.copy(value);
  NMessage.success(`复制内容「 ${value} 」成功`);
}

</script>

<style>
.token-content {
  display: flex;
  align-items: center;
}

.token-name {
  display: flex;
  align-items: center;
}

.token-sample {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.token-value {
  cursor: pointer;
}

.token-value:hover {
  color: rgb(var(--primary-6));
}
</style>