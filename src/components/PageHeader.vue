<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  headerName: string;
  isTop: boolean;
}>();

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div v-if="isTop" class="margin-bottom">
    <span>{{ headerName }}</span>
  </div>
  <div v-else class="margin-bottom margin-top">
    <el-page-header @back="goBack">
      <template #content>
        <span>{{ headerName }}</span>
      </template>
    </el-page-header>
  </div>
</template>

<style scoped>
.margin-top {
  margin-top: 10px;
}

.margin-bottom {
  margin-bottom: 20px;
}

span {
  font-size: 24px;
  color: var(--vt-c-white);
}
</style>
