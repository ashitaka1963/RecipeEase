<script setup lang="ts">
import dayjs from 'dayjs';
import PageHeader from '../components/parts/PageHeader.vue';
import { Search, Sunny, Moon } from '@element-plus/icons-vue';
import { ref, reactive } from 'vue';

import recipeList from '../temp/recipe-list.json';

const isMenuListDialogVisible = ref(false);
const isAddMenuDialogVisible = ref(false);
const value = ref(new Date());
const tempDate = recipeList;

const form = reactive<any>({
  _id: null,
  menuDate: dayjs().format('YYYY/MM/DD')
});

let calendarDataArray = [];

const calendarData = ref(calendarDataArray);

const selectedMenu = reactive<any>({
  _id: null,
  main: {},
  sub: {},
  soup: {}
});

addSchedule(new Date());

// ========================================
// Methods
// ========================================
function addSchedule(date: any) {
  const targetDate = dayjs(date);

  const year = targetDate.year();
  const month = targetDate.format('MM');
  const day = targetDate.format('DD');

  const [lunchMenu, dinnerMenu] = selectRandomRecipe();

  pushRecipeToSchedule(year, month, day, 'lunch', lunchMenu);
  pushRecipeToSchedule(year, month, day, 'dinner', dinnerMenu);

  isAddMenuDialogVisible.value = false;
}

function pushRecipeToSchedule(year: number, month: string, day: string, mealTime: string, menu) {
  // for (const recipe of menu) {
  //   calendarData.value.push({
  //     years: year,
  //     months: [month],
  //     days: [day],
  //     recipe: recipe.name,
  //     mealTime: mealTime
  //   });
  // }

  calendarData.value.push({
    years: year,
    months: [month],
    days: [day],
    recipe: menu[0].name,
    mealTime: mealTime,
    menu: menu
  });
}

function selectRandomRecipe() {
  const selectedLunchMenu = selectRecipe('lunch');
  const selectedDinnerMenu = selectRecipe('dinner');

  return [selectedLunchMenu, selectedDinnerMenu];
}

function selectRecipe(mealTime: string) {
  const isNotLevelHigh = mealTime === 'lunch' ? true : false;

  const filterdMainRecipes = filterRecipe(tempDate, '主菜', isNotLevelHigh);
  let randomIndex = Math.floor(Math.random() * filterdMainRecipes.length);
  const selectedMainDish = filterdMainRecipes[randomIndex];

  const filterdSideRecipes = filterRecipe(tempDate, '副菜');
  randomIndex = Math.floor(Math.random() * filterdSideRecipes.length);
  const selectedSideDish = filterdSideRecipes[randomIndex];

  const filterdSoupRecipes = filterRecipe(tempDate, '汁物');
  randomIndex = Math.floor(Math.random() * filterdSoupRecipes.length);
  const selectedSoup = filterdSoupRecipes[randomIndex];

  return [selectedMainDish, selectedSideDish, selectedSoup];
}

function filterRecipe(recipeList: any, filterType: string, isNotLevelHigh: boolean = false) {
  return recipeList.filter((recipe: any) => {
    if (isNotLevelHigh) {
      return recipe.type == filterType && recipe.level != '高';
    } else {
      return recipe.type == filterType;
    }
  });
}

function findRecipe(menu: any, filterType: string, isNotLevelHigh: boolean = false) {
  return menu.find((recipe: any) => {
    if (isNotLevelHigh) {
      return recipe.type == filterType && recipe.level != '高';
    } else {
      return recipe.type == filterType;
    }
  });
}

function dialogOpen(menu: any) {
  isMenuListDialogVisible.value = true;
  console.log(menu);

  const mainDish = findRecipe(menu, '主菜');
  const sideDish = findRecipe(menu, '副菜');
  const soup = findRecipe(menu, '汁物');

  const tmpObj = {
    main: mainDish,
    sub: sideDish,
    soup: soup
  };

  Object.assign(selectedMenu, tmpObj);
}
</script>

<template>
  <main>
    <PageHeader headerName="献立カレンダー" />

    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-button color="#ff8e3c" @click="isAddMenuDialogVisible = true"
            >予定を追加</el-button
          ></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-calendar v-model="value">
            <template #date-cell="{ data }">
              {{ data.day.split('-').slice(2).join('-') }}

              <div v-for="(item, key) in calendarData" :key="key">
                <div v-if="item.months.indexOf(data.day.split('-').slice(1)[0]) != -1">
                  <div v-if="item.days.indexOf(data.day.split('-').slice(2).join('-')) != -1">
                    <div>
                      <template v-if="item.mealTime == 'lunch'"
                        ><el-icon color="#F7A410" :size="14"><Sunny /></el-icon
                      ></template>
                      <template v-else
                        ><el-icon color="#11068B" :size="14"><Moon /></el-icon
                      ></template>

                      <el-link @click="dialogOpen(item.menu)">{{ item.recipe }}</el-link>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-calendar>
        </el-col>
      </el-row>
    </div>

    <!-- メニュー追加 -->
    <el-dialog v-model="isAddMenuDialogVisible" title="メニュー登録" width="30%" align-center>
      <el-form :model="form" label-width="80px" status-icon>
        <el-form-item label="日付" prop="menuDate">
          <el-date-picker
            v-model="form.menuDate"
            placeholder="Pick a date"
            style="width: 100%"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button color="#ff8e3c" @click="addSchedule(form.menuDate)">登録</el-button>
          <!-- <el-button type="info" @click="cancelForm">Cancel</el-button> -->
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- メニュー一覧 -->
    <el-dialog v-model="isMenuListDialogVisible" title="献立" width="30%" align-center>
      <div class="container">
        <el-row>
          <el-col :span="8"> 主菜 </el-col>
          <el-col :span="16">{{ selectedMenu.main.name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="8"> 副菜 </el-col>
          <el-col :span="16">{{ selectedMenu.sub.name }}</el-col>
        </el-row>
        <el-row v-if="selectedMenu.soup">
          <el-col :span="8"> 汁物 </el-col>
          <el-col :span="16">{{ selectedMenu.soup.name }}</el-col>
        </el-row>
      </div></el-dialog
    >
  </main>
</template>
