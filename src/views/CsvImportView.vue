<script setup lang="ts">
import { ref } from 'vue';

import PageHeader from '../components/parts/PageHeader.vue';
import CsvImportDetail from '../components/CsvImport/CsvImportDetail.vue';

const target = ref('食材');

const targetOptions = [
  {
    value: '食材',
    label: '食材'
  },
  {
    value: 'レシピ',
    label: 'レシピ'
  }
];
</script>

<template>
  <main>
    <PageHeader headerName="一括登録" />
    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-text tag="p">登録対象</el-text>
          <el-select v-model="target" class="m-2" placeholder="Select">
            <el-option
              v-for="item in targetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
      </el-row>
      <CsvImportDetail :target="target" />
    </div>
  </main>
</template>

<style scoped>
el-row {
  margin-bottom: 10px;
}
.el-row:last-child {
  margin-bottom: 0;
}
</style>
