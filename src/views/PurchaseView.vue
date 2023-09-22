<script setup lang="ts">
// TODO:調味料は重複させない？

import { ref, computed } from 'vue';
import { usePurchasesStore } from '@/stores/purchases';

import dayjs from 'dayjs';

import PageHeader from '../components/parts/PageHeader.vue';
import ConfirmDialog from '../components/parts/ConfirmDialog.vue';
import loadingUtils from '../CustomLoading';

const purchasesStore = usePurchasesStore();

const categoryOptions = [
  {
    value: '野菜',
    label: '野菜',
    type: 'success',
    sortOrder: 1
  },
  {
    value: '肉',
    label: '肉',
    type: 'danger',
    sortOrder: 5
  },
  {
    value: '魚',
    label: '魚',
    type: '',
    sortOrder: 4
  },
  {
    value: '卵・乳製品',
    label: '卵・乳製品',
    type: 'yellow',
    sortOrder: 3
  },
  {
    value: '穀物',
    label: '穀物',
    type: 'yellow',
    sortOrder: 6
  },
  {
    value: '果物',
    label: '果物',
    type: 'warning',
    sortOrder: 2
  },
  {
    value: '調味料',
    label: '調味料',
    type: 'info',
    sortOrder: 7
  }
];

const target = ref('nextWeek');
const purchased = ref(null);
const startDate = ref('');
const endDate = ref('');

const targetOptions = [
  {
    value: 'thisWeek',
    label: '今週'
  },
  {
    value: 'nextWeek',
    label: '来週'
  }
];

init();

// ========================================
// Computed
// ========================================

const selectedIntervalLabel = computed((): any => {
  const targetOption = targetOptions.find((option) => option.value === target.value);
  if (targetOption) {
    return targetOption.label;
  } else {
    return '未定義'; // 該当するvalueが見つからなかった場合のデフォルト値
  }
});

const purchaseItems = computed((): any => {
  // "purchases" プロパティだけを結合した新しい配列と情報を持つ配列を作成
  const combinedPurchasesWithInfo = [];

  purchasesStore.purchases.forEach((item, index) => {
    const purchases = item.purchases.map((purchase, purchaseIndex) => ({
      ...purchase,
      _id: item._id,
      purchaseIndex: purchaseIndex
    }));
    combinedPurchasesWithInfo.push(...purchases);
  });

  combinedPurchasesWithInfo.sort((a, b) => {
    {
      let targetOption = categoryOptions.find((option) => option.value === a.category);
      const aSortOrder = targetOption?.sortOrder;

      targetOption = categoryOptions.find((option) => option.value === b.category);
      const bSortOrder = targetOption?.sortOrder;

      if (aSortOrder === bSortOrder) {
        return a.name.localeCompare(b.name);
      } else {
        return aSortOrder - bSortOrder;
      }
    }
  });

  const filteredObjects = combinedPurchasesWithInfo.filter((obj) => obj.isPurchased === false);

  purchased.value = combinedPurchasesWithInfo.filter((obj) => obj.isPurchased === true);

  return filteredObjects;
});

// ========================================
// Methods
// ========================================
async function init() {
  loadingUtils.startLoading();

  await getPurchases();

  loadingUtils.closeLoading();
}

function getPurchases() {
  // 現在の日付を取得
  const currentDate = dayjs();

  // 現在の曜日を取得 (0: 日曜日, 1: 月曜日, 2: 火曜日, など)
  const currentDayOfWeek = currentDate.day();

  if (target.value === 'nextWeek') {
    startDate.value = currentDate.add(7 - currentDayOfWeek, 'day');
    endDate.value = startDate.value.add(6, 'day');
  } else if (target.value === 'thisWeek') {
    startDate.value = currentDate.day(0);
    endDate.value = currentDate.day(6);
  }

  purchasesStore.fetchPurchases(
    startDate.value.format('YYYY-MM-DD'),
    endDate.value.format('YYYY-MM-DD')
  );
}

function selectedType(name: string) {
  const category = categoryOptions.find((categories: any) => categories.label === name);
  return category ? category.type : '';
}

const moveToPurchased = (index: number) => {
  const purchasedtem = purchaseItems.value[index];

  purchasesStore.changeIsPurchased(purchasedtem._id, purchasedtem.purchaseIndex);
};
</script>

<template>
  <main>
    <PageHeader headerName="買い物リスト" />
    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-text tag="p">期間</el-text>
          <el-select v-model="target" class="m-2" placeholder="Select" @change="init()">
            <el-option
              v-for="item in targetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-row style="margin-top: 40px">
        <el-col :span="24">
          <el-text tag="p" class="sub-title">{{ selectedIntervalLabel }}</el-text>
          <el-text tag="span"
            >{{ startDate.format('M/D(ddd)') }} ~ {{ endDate.format('M/D(ddd)') }}</el-text
          >
        </el-col>
      </el-row>
      <!-- 買い物リスト -->
      <el-row>
        <el-col :span="24">
          <el-table :data="purchaseItems" style="width: 80%">
            <el-table-column width="55">
              <template #default="scope">
                <el-checkbox @click.prevent="moveToPurchased(scope.$index)" />
              </template>
            </el-table-column>
            <el-table-column prop="category" label="カテゴリ">
              <template #default="scope">
                <el-tag :type="selectedType(scope.row.category)">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="材料" />

            <el-table-column prop="quantity" label="分量">
              <template #default="scope">
                {{ scope.row.quantity }}
                {{ scope.row.unit }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <!-- 購入済みリスト -->
      <!-- TODO:購入済みリスト -->
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

.el-tag.el-tag--yellow {
  --el-tag-text-color: #e6db3c;
}
.el-tag.el-tag--yellow {
  --el-tag-bg-color: #fdfbec;
  --el-tag-border-color: #faf9d8;
  --el-tag-hover-color: #e6db3c;
}
</style>
