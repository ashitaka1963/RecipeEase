<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';

import PageHeader from '../components/PageHeader.vue';

import { useUsersStore } from '@/stores/users';
import { Delete, Edit } from '@element-plus/icons-vue';

import ConfirmDialog from '../components/parts/ConfirmDialog.vue';

import loadingUtils from '../CustomLoading';
import type { FormInstance, FormRules } from 'element-plus';

const usersStore = useUsersStore();
const ruleFormRef = ref<FormInstance>();

const isTop = ref(true);
const isDialogVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const deleteUserId = ref('');
const deleteUserName = ref('');
const isEdit = ref(true);

interface User {
  _id: string | null;
  userName: string;
  password: string;
  email: string;
  role: string;
  color: string;
}

const form = reactive<User>({
  _id: null,
  userName: '',
  password: '',
  email: '',
  role: 'USER',
  color: '#c7a780'
});

const defaultForm: User = {
  _id: null,
  userName: '',
  password: '',
  email: '',
  role: 'USER',
  color: '#c7a780'
};

const rules = reactive<FormRules<User>>({
  userName: [
    { required: true, message: 'ユーザ名を入力してください。', trigger: 'blur' },
    { min: 1, max: 15, message: '15文字以内で入力してください。', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'パスワードを入力してください。', trigger: 'blur' },
    { min: 8, max: 20, message: '8文字以上20文字以内で入力してください。', trigger: 'change' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/,
      message: '小文字、大文字、数字を含んでください。',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '有効なメールアドレスを入力してください。',
      trigger: 'change'
    }
  ],
  role: [
    {
      required: true,
      message: 'ロールを選択してください。',
      trigger: 'blur'
    }
  ],
  color: [
    {
      required: true,
      message: 'カラーを選択してください。',
      trigger: 'change'
    }
  ]
});

const roleOptions = [
  {
    value: 'USER',
    label: 'USER'
  },
  {
    value: 'ADMIN',
    label: 'ADMIN'
  }
];

init();

// ========================================
// Computed
// ========================================

const dialogTitle = computed((): any => {
  return isEdit.value ? 'Edit' : 'New';
});

const dialogButtonName = computed((): any => {
  return isEdit.value ? 'Update' : 'Create';
});

// ========================================
// Methods
// ========================================
async function init() {
  loadingUtils.startLoading();

  await getUsers();

  loadingUtils.closeLoading();
}

function getUsers() {
  usersStore.fetchUsers();
}

function editDialogOpen(userId: string) {
  isDialogVisible.value = true;
  isEdit.value = true;

  Object.assign(form, usersStore.getById(userId));
}

async function deleteUser(userId: string) {
  loadingUtils.startLoading();

  await usersStore.deleteUser(userId);

  loadingUtils.closeLoading();
}

async function saveUser() {
  loadingUtils.startLoading();

  if (isEdit.value) {
    await usersStore.editUser({ ...form });
  } else {
    await usersStore.addUser({ ...form });
  }
  isDialogVisible.value = false;
  loadingUtils.closeLoading();
}

async function submitForm() {
  const formEl = ruleFormRef.value;
  if (!formEl) return;

  await formEl.validate((valid, fields) => {
    if (valid) {
      saveUser();
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
  deleteUser(deleteUserId.value);
  onCancelButtonClick();
}

function onCancelButtonClick() {
  isConfirmDialogVisible.value = false;
  deleteUserName.value = '';
  deleteUserId.value = '';
}
</script>

<template>
  <main>
    <PageHeader headerName="Users" :isTop="isTop" />
    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-table :data="usersStore.users" style="width: 100%">
            <el-table-column prop="userName" label="Name" />
            <el-table-column prop="email" label="E-mail" />
            <el-table-column prop="role" label="Role" />
            <el-table-column prop="color" label="Color">
              <template #default="scope">
                <el-color-picker v-model="scope.row.color" disabled />
                <span>{{ scope.row.color }}</span>
              </template>
            </el-table-column>
            <el-table-column width="120">
              <template #header>
                <el-button
                  color="#c7a780"
                  @click="
                    isDialogVisible = true;
                    isEdit = false;
                  "
                  >Add User</el-button
                >
              </template>
              <template #default="scope">
                <el-button
                  class="main-icon-button"
                  color="#30343d"
                  @click="editDialogOpen(scope.row._id)"
                  :icon="Edit"
                  circle
                ></el-button>
                <el-button
                  class="sub-icon-button"
                  color="#30343d"
                  @click="
                    isConfirmDialogVisible = true;
                    deleteUserId = scope.row._id;
                    deleteUserName = scope.row.userName;
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
        <el-form-item label="Name" prop="userName">
          <el-input v-model="form.userName" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="E-mail" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="form.role" placeholder="Select">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Color" prop="color">
          <el-color-picker v-model="form.color" />
          <span>{{ form.color }}</span>
        </el-form-item>

        <el-form-item>
          <el-button color="#c7a780" @click="submitForm">{{ dialogButtonName }}</el-button>
          <el-button type="info" @click="cancelForm">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <ConfirmDialog
      :isDialogVisible="isConfirmDialogVisible"
      :message="`ユーザ(${deleteUserName})を削除しますか？`"
      @clickConfirmed="onConfirmButtonClick"
      @clickCanceled="onCancelButtonClick"
    />
  </main>
</template>

<style scoped>
* {
  color: #fefefe;
}
.el-color-picker + span {
  margin-left: 8px;
}
</style>
