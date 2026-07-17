<template>
  <link rel="stylesheet" href="/wechat_miniProgram/theme.css" />
  <template v-for="(group, index) of Tokens" :key="index">
    <h2>{{ group.name }}</h2>
    <WechatMPTokenTable :data="group.tokens" :type="group.type" />
  </template>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import WechatMPTokenTable from "../../../components/WechatMPTokenTable.vue";
const Tokens = ref<Array<{
  name: string,
  nameEN: string,
  type: string,
  tokens: Array<{
    name: string;
    desc: string;
    descEN: string;
    value: string;
    darkValue?: string;
    cssvar?: boolean | string;
  }>
}>>([]);

import("./tokens").then(res => {
  // @ts-ignore
  Tokens.value = res.tokens;
})
</script>

<style scoped>
.theme-button {
  display: flex;
  margin: 20px 0;
  justify-content: flex-end;
}
</style>