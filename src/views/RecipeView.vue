<script setup lang="ts">
import PageHeader from '../components/parts/PageHeader.vue';

import { Search, Delete, Edit } from '@element-plus/icons-vue';
import { ref } from 'vue';

import recipeList from '../temp/recipe-list.json';

const tempDate = recipeList;

const ingredient = ref(tempDate);
</script>

<template>
  <main>
    <PageHeader headerName="レシピ" />
    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-table :data="ingredient" style="width: 100%">
            <el-table-column prop="name" label="レシピ名" />
            <el-table-column prop="type" label="タイプ">
              <template #default="scope">
                <el-tag class="ml-2" type="info">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="genre" label="ジャンル">
              <template #default="scope">
                <el-tag class="ml-2" type="info">{{ scope.row.genre }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="難易度">
              <template #default="scope">
                <el-tag class="ml-2" type="info">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column width="160">
              <template #header>
                <el-button color="#ff8e3c">レシピを追加</el-button>
              </template>
              <template #default="scope">
                <el-button class="normal-icon-button" :icon="Search" circle></el-button>
                <el-button class="main-icon-button" :icon="Edit" circle></el-button>
                <el-button class="sub-icon-button" :icon="Delete" circle></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>
  </main>
</template>
