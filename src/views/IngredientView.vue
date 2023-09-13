<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

import { Delete, Edit } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

import { useIngredientsStore } from '@/stores/ingredients';

import PageHeader from '../components/parts/PageHeader.vue';
import ConfirmDialog from '../components/parts/ConfirmDialog.vue';
import loadingUtils from '../CustomLoading';

const ingredientsStore = useIngredientsStore();

const ruleFormRef = ref<FormInstance>();
const isDialogVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const deleteIngredientId = ref('');
const deleteIngredientName = ref('');
const isEdit = ref(true);

interface Ingredient {
  _id: string | null;
  name: string;
  category: string;
  unit: string;
}

const form = reactive<Ingredient>({
  _id: null,
  name: '',
  category: '',
  unit: ''
});

const defaultForm: Ingredient = {
  _id: null,
  name: '',
  category: '',
  unit: ''
};

const rules = reactive<FormRules<Ingredient>>({
  name: [
    { required: true, message: '食材名を入力してください。', trigger: 'blur' },
    { min: 1, max: 15, message: '15文字以内で入力してください。', trigger: 'blur' }
  ],
  category: [
    {
      required: true,
      message: 'カテゴリーを選択してください。',
      trigger: 'blur'
    }
  ]
});

const categoryOptions = [
  {
    value: '野菜',
    label: '野菜',
    type: 'success'
  },
  {
    value: '肉',
    label: '肉',
    type: 'danger'
  },
  {
    value: '魚',
    label: '魚',
    type: ''
  },
  {
    value: '卵・乳製品',
    label: '卵・乳製品',
    type: 'yellow'
  },
  {
    value: '果物',
    label: '果物',
    type: 'warning'
  },
  {
    value: '調味料',
    label: '調味料',
    type: 'info'
  }
];

init();

// ========================================
// Computed
// ========================================

const dialogTitle = computed((): any => {
  return isEdit.value ? '編集' : '新規追加';
});

const dialogButtonName = computed((): any => {
  return isEdit.value ? '更新' : '追加';
});

// ========================================
// Methods
// ========================================
async function init() {
  loadingUtils.startLoading();

  await getIngredients();

  loadingUtils.closeLoading();
}

function getIngredients() {
  ingredientsStore.fetchIngredients();
}

function editDialogOpen(ingredientId: string) {
  isDialogVisible.value = true;
  isEdit.value = true;

  Object.assign(form, ingredientsStore.getById(ingredientId));
}

async function deleteIngredient(ingredientId: string) {
  loadingUtils.startLoading();

  await ingredientsStore.deleteIngredient(ingredientId);

  loadingUtils.closeLoading();
}

async function saveIngredient() {
  loadingUtils.startLoading();

  if (isEdit.value) {
    await ingredientsStore.editIngredient({ ...form });
  } else {
    await ingredientsStore.addIngredient({ ...form });
  }
  isDialogVisible.value = false;
  loadingUtils.closeLoading();
}

async function submitForm() {
  const formEl = ruleFormRef.value;

  console.log(formEl);
  if (!formEl) return;

  await formEl.validate((valid, fields) => {
    if (valid) {
      saveIngredient();
    } else {
      console.log('error submit!', fields);
    }
  });
}

function cancelForm() {
  const formEl = ruleFormRef.value;
  if (!formEl) return;

  formEl.resetFields();

  Object.assign(form, defaultForm);
  isDialogVisible.value = false;
}

function onConfirmButtonClick() {
  deleteIngredient(deleteIngredientId.value);
  onCancelButtonClick();
}

function onCancelButtonClick() {
  isConfirmDialogVisible.value = false;
  deleteIngredientName.value = '';
  deleteIngredientId.value = '';
}

function selectedType(name: string) {
  const category = categoryOptions.find((categories: any) => categories.label === name);
  return category ? category.type : '';
}
</script>

<template>
  <main>
    <PageHeader headerName="食材" />
    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-table :data="ingredientsStore.ingredients" style="width: 100%">
            <el-table-column prop="name" label="名前" />
            <el-table-column prop="category" label="カテゴリ">
              <template #default="scope">
                <el-tag :type="selectedType(scope.row.category)">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="単位" />
            <el-table-column width="130">
              <template #header>
                <el-button
                  class="main-button"
                  color="#ff8e3c"
                  @click="
                    isDialogVisible = true;
                    isEdit = false;
                  "
                  >食材を追加</el-button
                >
              </template>
              <template #default="scope">
                <el-button
                  class="main-icon-button"
                  @click="editDialogOpen(scope.row._id)"
                  :icon="Edit"
                  circle
                ></el-button>
                <el-button
                  class="sub-icon-button"
                  @click="
                    isConfirmDialogVisible = true;
                    deleteIngredientId = scope.row._id;
                    deleteIngredientName = scope.row.name;
                  "
                  :icon="Delete"
                  circle
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>

    <!-- dialog -->
    <el-dialog
      v-model="isDialogVisible"
      :title="dialogTitle"
      width="30%"
      align-center
      :before-close="cancelForm"
    >
      <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="名前" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="カテゴリ" prop="category">
          <el-select v-model="form.category" placeholder="Select" @change="form.unit = ''">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="form.category !== '調味料'">
          <el-form-item label="単位" prop="unit">
            <el-input v-model="form.unit" />
          </el-form-item>
        </template>
        <el-form-item>
          <el-button class="main-button" color="#ff8e3c" @click="submitForm">{{
            dialogButtonName
          }}</el-button>
          <el-button type="info" @click="cancelForm">中止</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <ConfirmDialog
      :isDialogVisible="isConfirmDialogVisible"
      :message="`食材(${deleteIngredientName})を削除しますか？`"
      @clickConfirmed="onConfirmButtonClick"
      @clickCanceled="onCancelButtonClick"
    />
  </main>
</template>

<style scoped>
.el-tag.el-tag--yellow {
  --el-tag-text-color: #e6db3c;
}
.el-tag.el-tag--yellow {
  --el-tag-bg-color: #fdfbec;
  --el-tag-border-color: #faf9d8;
  --el-tag-hover-color: #e6db3c;
}
</style>
