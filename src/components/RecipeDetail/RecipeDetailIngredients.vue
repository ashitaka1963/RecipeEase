<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRecipesStore } from '@/stores/recipes';
import { useIngredientsStore } from '@/stores/ingredients';
import { Plus, Close } from '@element-plus/icons-vue';

import loadingUtils from '../../CustomLoading';

interface Props {
  recipeId: string;
}

const props = defineProps<Props>();
const recipesStore = useRecipesStore();
const ingredientsStore = useIngredientsStore();

const isDialogVisible = ref(false);

let servingSizeForm = ref<any>(2);
let ingredientsForm = reactive<any>([
  {
    name: '',
    category: '',
    quantity: null,
    unit: ''
  }
]);

// ========================================
// Computed
// ========================================
const recipe = computed((): any => {
  // return recipesStore.getById('64e9ebc7f146ca49ddb94c39');
  return recipesStore.getById(props.recipeId);
});

const ingredientOptions = computed((): any => {
  const categorizedData = {};

  ingredientsStore.ingredients.forEach((item) => {
    const category = item.category;
    if (!categorizedData[category]) {
      categorizedData[category] = [];
    }
    categorizedData[category].push({
      id: item._id,
      value: item.name,
      label: item.name,
      unit: item.unit,
      category: item.category
    });
  });

  const categorizedArray = Object.keys(categorizedData).map((category) => ({
    label: category,
    options: categorizedData[category]
  }));

  return categorizedArray;
});

// ========================================
// Methods
// ========================================
init();

function init() {
  getIngredients();
}

function getIngredients() {
  ingredientsStore.fetchIngredients();
}

function openDialog() {
  // ingredientsForm = recipe.value.ingredients;
  Object.assign(ingredientsForm, recipe.value.ingredients);
  servingSizeForm.value = recipe.value.servingSize ? recipe.value.servingSize : 2;

  isDialogVisible.value = true;
}

function addRow() {
  if (!recipe.value.ingredients) {
    recipe.value.ingredients = [];
  }

  ingredientsForm.push({
    name: '',
    category: '',
    quantity: null,
    unit: ''
  });
}

function deleteRow(key) {
  ingredientsForm.splice(key, 1);
}

function changeIngredient(selectedIngredient) {
  selectedIngredient.name = selectedIngredient.value.label;
  selectedIngredient.unit = selectedIngredient.value.unit;
  selectedIngredient.category = selectedIngredient.value.category;

  if (selectedIngredient.category == '調味料' || selectedIngredient.unit == '') {
    selectedIngredient.quantity = null;
  } else if (selectedIngredient.unit == 'g') {
    selectedIngredient.quantity = 300;
  } else {
    selectedIngredient.quantity = 1;
  }
  console.log(selectedIngredient);
}

async function saveIngredients() {
  loadingUtils.startLoading();

  // 材料
  recipe.value.ingredients = ingredientsForm;

  // 人前
  recipe.value.servingSize = servingSizeForm.value;

  // if (isEdit.value) {
  await recipesStore.editRecipe({ ...recipe.value });
  // } else {
  //   await recipesStore.addRecipe({ ...form });
  // }
  isDialogVisible.value = false;
  loadingUtils.closeLoading();
}
</script>

<template>
  <div class="container">
    <el-row>
      <el-col :span="20">
        <el-text tag="p" class="sub-title">材料（{{ recipe.servingSize }}人分）</el-text>
      </el-col>
      <el-col :span="4">
        <el-button class="main-button" color="#ff8e3c" @click="openDialog">編集</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-table :data="recipe.ingredients" style="width: 100%">
          <el-table-column prop="name" label="材料・調味料" />
          <el-table-column prop="quantity" label="分量">
            <template #default="scope">
              <el-space>
                <el-text tag="span"> {{ scope.row.quantity }}</el-text>
                <el-text tag="span"> {{ scope.row.unit }}</el-text>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>

  <!-- dialog -->
  <el-dialog v-model="isDialogVisible" title="材料" width="500px" align-center>
    <el-row>
      <el-col :span="24" :offset="1">
        <el-space>
          <el-input-number v-model="servingSizeForm" :min="1" :max="10" />
          <el-text tag="span">人前</el-text>
        </el-space>
      </el-col>
    </el-row>
    <el-row style="margin-top: 30px">
      <el-col :span="14">
        <el-text tag="p" size="large">材料・調味料</el-text>
      </el-col>
      <el-col :span="10">
        <el-text tag="p" size="large">分量</el-text>
      </el-col>
    </el-row>

    <el-row v-for="(ingredient, key) in ingredientsForm" :key="key">
      <el-col :span="10">
        <el-select
          v-model="ingredient.value"
          value-key="id"
          placeholder="Select"
          @change="changeIngredient(ingredient)"
        >
          <el-option-group
            v-for="group in ingredientOptions"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item"
            />
          </el-option-group>
        </el-select>
      </el-col>

      <el-col :span="6" :offset="1">
        <template v-if="ingredient.category == '調味料' || ingredient.unit == ''">
          <el-input v-model="ingredient.quantity" placeholder="例)大さじ1/2" />
        </template>
        <template v-else>
          <el-space>
            <el-input-number v-model="ingredient.quantity" :min="1" :step="0.5" />
            <el-text tag="span"> {{ ingredient.unit }}</el-text>
          </el-space>
        </template>
      </el-col>
      <el-col :span="3" :offset="4">
        <el-button @click="deleteRow(key)" :icon="Close" text></el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button @click="addRow" :icon="Plus" type="primary" text>食材を追加</el-button>
      </el-col>
    </el-row>
    <el-row style="margin-top: 30px" justify="center">
      <el-col :span="9">
        <el-button class="main-button" color="#ff8e3c" @click="saveIngredients"
          >保存して閉じる</el-button
        >
      </el-col>
      <el-col :span="6">
        <el-button type="info" @click="isDialogVisible = false">中止</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<style scoped>
.el-row {
  margin-bottom: 10px;
}
.el-row:last-child {
  margin-bottom: 0;
}

/* .el-dialog__body {
  padding: 0px !important;
} */
</style>
