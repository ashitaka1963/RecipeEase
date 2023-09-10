<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

import { Delete, Edit, DocumentAdd, Download } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useIngredientsStore } from '@/stores/ingredients';
import { useRecipesStore } from '@/stores/recipes';

import loadingUtils from '../../CustomLoading';
import showMessage from '../../CustomMessage';

interface Props {
  target: string;
}

const props = defineProps<Props>();
const ingredientsStore = useIngredientsStore();
const recipesStore = useRecipesStore();

let ingredients = ref<any>([]);
let recipes = ref<any>([]);
let fileName = ref<string>('');

function fileChange(e: any) {
  const file = e.target.files[0];

  if (file.type !== 'text/csv') {
    showMessage('ファイル形式でcsvではありません。', 'error');
    return;
  }

  fileName.value = file.name;
  const reader = new FileReader();
  const readsData: any[] = [];

  const loadFunc = () => {
    const lines = reader.result.replace(/\r/g, '').split('\n');
    lines.forEach((line: any) => {
      const read = line.split(',');
      let worker = {};

      if (props.target === '食材') {
        if (read.length !== 3 && read.length !== 2) {
          showMessage('ファイルフォーマットが正しくありません。', 'error');
          return;
        }

        Object.assign(worker, {
          name: read[0],
          category: read[1],
          unit: read[2] ? read[2] : ''
        });
      } else if (props.target === 'レシピ') {
        Object.assign(worker, {
          name: read[0],
          type: read[1],
          genre: read[2],
          level: read[3]
        });
      }

      readsData.push(worker);
    });

    if (props.target === '食材') {
      ingredients.value = readsData;
    } else if (props.target === 'レシピ') {
      recipes.value = readsData;
    }
  };

  reader.onload = loadFunc;
  reader.readAsText(file, 'UTF-8');

  e.target.value = '';
}

async function saveIngredient() {
  if (ingredients.value.length === 0 && recipes.value.length === 0) {
    showMessage('登録するデータがありません。', 'error');
    return;
  }

  loadingUtils.startLoading();

  if (props.target === '食材') {
    await ingredientsStore.addIngredient(ingredients);
  } else if (props.target === 'レシピ') {
    await recipesStore.addRecipe(recipes);
  }
  loadingUtils.closeLoading();

  fileName.value = '';
  //   ingredients.value = [];
  //   recipes.value = [];
}
</script>

<template>
  <el-row style="margin-top: 40px">
    <el-col :span="24">
      <el-text tag="p" class="sub-title">{{ props.target }}</el-text></el-col
    >
  </el-row>

  <el-row>
    <el-col :span="24">
      <el-space>
        <label class="el-button el-button--info">
          <el-icon><DocumentAdd /></el-icon>
          <input @change="fileChange" type="file" />ファイルを選択
        </label>
        <span v-if="!fileName">選択されていません</span>
        <span v-else>{{ fileName }}</span>
      </el-space>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-link type="primary"
        ><el-icon><Download /></el-icon>テンプレートダウンロード</el-link
      >
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <template v-if="props.target === '食材'">
        <el-table :data="ingredients" style="width: 100%">
          <el-table-column prop="name" label="名前" />
          <el-table-column prop="category" label="カテゴリ">
            <template #default="scope">
              <el-tag class="ml-2" type="info">{{ scope.row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="単位" />
        </el-table>
      </template>
      <template v-else-if="props.target === 'レシピ'">
        <el-table :data="recipes" style="width: 100%">
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
        </el-table></template
      >
    </el-col>
  </el-row>
  <el-row justify="end">
    <el-col :span="6">
      <el-button class="main-button" color="#ff8e3c" @click="saveIngredient"
        >一括登録</el-button
      ></el-col
    >
  </el-row>
</template>

<style scoped>
input[type='file'] {
  display: none;
}

label {
  /* padding: 10px 40px; */
  color: #ffffff;
  cursor: pointer;
}

.el-row {
  margin-bottom: 10px;
}

.el-row:last-child {
  margin-bottom: 0;
}
</style>
