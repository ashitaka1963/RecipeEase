<script setup lang="ts">
// TODO:保存して閉じるは編集モードではないときだけクリックできるようにする。

import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

import { Check, Sunny, Moon, Edit, Close } from '@element-plus/icons-vue';
import { ref, reactive, computed } from 'vue';

import { useRecipesStore } from '@/stores/recipes';
import { useMenusStore } from '@/stores/menus';
import { usePurchasesStore } from '@/stores/purchases';

import PageHeader from '../components/parts/PageHeader.vue';
import ConfirmDialog from '../components/parts/ConfirmDialog.vue';
import loadingUtils from '../CustomLoading';

const router = useRouter();
const recipesStore = useRecipesStore();
const menusStore = useMenusStore();
const purchasesStore = usePurchasesStore();

const isMenuListDialogVisible = ref(false);
const isAddMenuDialogVisible = ref(false);
const value = ref(new Date());

const form = reactive<any>({
  _id: null,
  menuDate: dayjs().format('YYYY/MM/DD')
});

const selectedMenu = reactive<any>({
  _id: null,
  mealTime: '',
  main: {},
  sub: {},
  soup: {}
});

const newMainRecipe: any = ref({ main: {}, sub: {}, soup: {} });
const isMainEdit: any = ref({ main: false, sub: false, soup: false });

init();

// ========================================
// Computed
// ========================================

const menus = computed((): any => {
  const menus = menusStore.menus;

  for (let menu of menus) {
    const targetDate = dayjs(menu.date);

    menu['years'] = targetDate.year();
    menu['months'] = targetDate.format('MM');
    menu['days'] = targetDate.format('DD');

    menu['lunchMainDishName'] = menu.lunchMenu[0].name;
    menu['dinnerMainDishName'] = menu.dinnerMenu[0].name;
  }

  return menus;
});

const recipeOptions = computed((): any => {
  const categorizedData: any = {};

  recipesStore.recipes.forEach((item: any) => {
    const genre = item.genre;
    if (!categorizedData[genre]) {
      categorizedData[genre] = [];
    }
    categorizedData[genre].push({
      id: item._id,
      value: item.name,
      label: item.name,
      genre: item.category
    });
  });

  const categorizedArray = Object.keys(categorizedData).map((genre) => ({
    label: genre,
    options: categorizedData[genre]
  }));

  return categorizedArray;
});

// ========================================
// Methods
// ========================================
async function init() {
  loadingUtils.startLoading();

  await getRecipes();
  await getMenus();

  loadingUtils.closeLoading();
}

async function getRecipes() {
  recipesStore.fetchRecipes();
}

async function getMenus() {
  await menusStore.fetchMenus();
}

async function addMenu(date: any) {
  loadingUtils.startLoading();
  const targetDate = dayjs(date);

  // const year = targetDate.year();
  // const month = targetDate.format('MM');
  // const day = targetDate.format('DD');

  const [lunchMenu, dinnerMenu] = selectRandomRecipe();

  await menusStore.addMenu({ date: targetDate, lunchMenu: lunchMenu, dinnerMenu: dinnerMenu });

  await addPurchases(targetDate, 'lunch', lunchMenu);
  await addPurchases(targetDate, 'dinner', dinnerMenu);

  isAddMenuDialogVisible.value = false;
  loadingUtils.closeLoading();
}

async function addPurchases(menuDate: any, mealTime: string, menu: any) {
  const purchases: any = [];

  console.log(menu);

  menu.forEach((recipe: any) => {
    recipe.ingredients.forEach((ingredient: any) => {
      purchases.push({
        name: ingredient.name,
        category: ingredient.category,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        isPurchased: false
      });
    });
  });

  await purchasesStore.addPurchase({
    date: menuDate,
    mealTime: mealTime,
    purchases: purchases
  });
}

async function updateMenu() {
  loadingUtils.startLoading();

  console.log(selectedMenu);

  await menusStore.editMenu({
    _id: selectedMenu._id,
    [selectedMenu.mealTime]: [selectedMenu.main, selectedMenu.sub, selectedMenu.soup]
  });

  isMenuListDialogVisible.value = false;
  loadingUtils.closeLoading();
}

function getRecipeOption(targetType: string) {
  const categorizedData: any = {};

  recipesStore.recipes.forEach((item: any) => {
    if (item.type !== targetType) return;

    const genre = item.genre;
    if (!categorizedData[genre]) {
      categorizedData[genre] = [];
    }
    categorizedData[genre].push({
      id: item._id,
      value: item.name,
      label: item.name,
      genre: item.category
    });
  });

  const categorizedArray = Object.keys(categorizedData).map((genre) => ({
    label: genre,
    options: categorizedData[genre]
  }));

  return categorizedArray;
}

function selectRandomRecipe() {
  const selectedLunchMenu = selectRecipe('lunch');
  const selectedDinnerMenu = selectRecipe('dinner');

  return [selectedLunchMenu, selectedDinnerMenu];
}

function selectRecipe(mealTime: string) {
  // TODO:条件追加（おやすみ、頻度など）
  // const isNotLevelHigh = mealTime === 'lunch' ? true : false;
  const isNotLevelHigh = false;

  // 主菜
  const filterdMainRecipes = filterRecipe(recipesStore.recipes, '主菜', isNotLevelHigh);
  let randomIndex = Math.floor(Math.random() * filterdMainRecipes.length);
  console.log(filterdMainRecipes.length);
  console.log(randomIndex);
  const selectedMainDish = filterdMainRecipes[randomIndex];

  // 副菜
  const filterdSideRecipes = filterRecipe(recipesStore.recipes, '副菜');
  randomIndex = Math.floor(Math.random() * filterdSideRecipes.length);
  const selectedSideDish = filterdSideRecipes[randomIndex];

  // 汁物
  const filterdSoupRecipes = filterRecipe(recipesStore.recipes, '汁物');
  randomIndex = Math.floor(Math.random() * filterdSoupRecipes.length);
  const selectedSoup = filterdSoupRecipes[randomIndex];

  if (selectedSoup === void 0) {
    return [selectedMainDish, selectedSideDish];
  } else {
    return [selectedMainDish, selectedSideDish, selectedSoup];
  }
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
    } else if (recipe == void 0) {
      return recipe;
    } else {
      return recipe.type == filterType;
    }
  });
}

function dialogOpen(menuId: string, mealTime: string, menu: any) {
  isMenuListDialogVisible.value = true;

  const mainDish = findRecipe(menu, '主菜');
  const sideDish = findRecipe(menu, '副菜');
  const soup = findRecipe(menu, '汁物');

  const tmpObj = {
    _id: menuId,
    mealTime: mealTime,
    main: mainDish,
    sub: sideDish,
    soup: soup
  };

  Object.assign(selectedMenu, tmpObj);
}

function updateSelectedMenu(targetType: string) {
  if (newMainRecipe.value[targetType].id == undefined) return;
  const recipeId = newMainRecipe.value[targetType].id;
  const recipe = recipesStore.getById(recipeId);

  selectedMenu[targetType] = recipe;

  isMainEdit.value[targetType] = false;
}

function goToRecipeDetailView(recipeId: string) {
  router.push({ name: 'RecipeDetailView', params: { id: recipeId } });
}
</script>

<template>
  <main>
    <PageHeader headerName="献立カレンダー" />

    <div class="container">
      <el-row>
        <el-col :span="24">
          <el-button class="main-button" color="#ff8e3c" @click="isAddMenuDialogVisible = true"
            >予定を追加</el-button
          ></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-calendar v-model="value">
            <template #date-cell="{ data }">
              {{ data.day.split('-').slice(2).join('-') }}

              <div v-for="(item, key) in menus" :key="key">
                <div v-if="item.months.indexOf(data.day.split('-').slice(1)[0]) != -1">
                  <div v-if="item.days.indexOf(data.day.split('-').slice(2).join('-')) != -1">
                    <div>
                      <el-link @click="dialogOpen(item._id, 'lunchMenu', item.lunchMenu)">
                        <el-icon color="#F7A410" :size="14"><Sunny /></el-icon
                        >{{ item.lunchMainDishName }}</el-link
                      >
                    </div>
                    <div>
                      <el-link @click="dialogOpen(item._id, 'dinnerMenu', item.dinnerMenu)">
                        <el-icon color="#11068B" :size="14"><Moon /></el-icon
                        >{{ item.dinnerMainDishName }}</el-link
                      >
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
          <el-button class="main-button" color="#ff8e3c" @click="addMenu(form.menuDate)"
            >登録</el-button
          >
          <!-- <el-button type="info" @click="cancelForm">Cancel</el-button> -->
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- メニュー一覧 -->
    <el-dialog v-model="isMenuListDialogVisible" title="献立" width="35%" align-center>
      <div class="container">
        <el-row>
          <el-col :span="6"> 主菜 </el-col>

          <template v-if="!isMainEdit.main">
            <el-col :span="14">
              <el-link @click="goToRecipeDetailView(selectedMenu.main._id)">
                {{ selectedMenu.main.name }}
              </el-link>
            </el-col>
            <el-col :span="4">
              <el-button
                class="main-icon-button"
                @click="isMainEdit.main = true"
                :icon="Edit"
                size="small"
                circle
              ></el-button>
            </el-col>
          </template>

          <template v-else>
            <el-col :span="13">
              <el-select v-model="newMainRecipe.main" value-key="id" placeholder="Select">
                <el-option-group
                  v-for="group in getRecipeOption('主菜')"
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
            <el-col :span="2" style="margin-left: 5px">
              <el-button
                class="main-icon-button"
                @click="updateSelectedMenu('main')"
                :icon="Check"
                size="small"
                circle
              ></el-button>
            </el-col>
            <el-col :span="2" style="margin-left: 3px">
              <el-button
                @click="isMainEdit.main = false"
                :icon="Close"
                size="small"
                circle
              ></el-button>
            </el-col>
          </template>
        </el-row>
        <el-row>
          <el-col :span="6"> 副菜 </el-col>

          <template v-if="!isMainEdit.sub">
            <el-col :span="14">
              <el-link @click="goToRecipeDetailView(selectedMenu.sub._id)">
                {{ selectedMenu.sub.name }}
              </el-link>
            </el-col>
            <el-col :span="4">
              <el-button
                class="main-icon-button"
                @click="isMainEdit.sub = true"
                :icon="Edit"
                size="small"
                circle
              ></el-button>
            </el-col>
          </template>

          <template v-else>
            <el-col :span="13">
              <el-select v-model="newMainRecipe.sub" value-key="id" placeholder="Select">
                <el-option-group
                  v-for="group in getRecipeOption('副菜')"
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
            <el-col :span="2" style="margin-left: 5px">
              <el-button
                class="main-icon-button"
                @click="updateSelectedMenu('sub')"
                :icon="Check"
                size="small"
                circle
              ></el-button>
            </el-col>
            <el-col :span="2" style="margin-left: 3px">
              <el-button
                @click="isMainEdit.sub = false"
                :icon="Close"
                size="small"
                circle
              ></el-button>
            </el-col>
          </template>
        </el-row>
        <el-row v-if="selectedMenu.soup">
          <el-col :span="6"> 汁物 </el-col>

          <template v-if="!isMainEdit.soup">
            <el-col :span="14">
              <el-link @click="goToRecipeDetailView(selectedMenu.soup._id)">
                {{ selectedMenu.soup.name }}
              </el-link>
            </el-col>
            <el-col :span="4">
              <el-button
                class="main-icon-button"
                @click="isMainEdit.soup = true"
                :icon="Edit"
                size="small"
                circle
              ></el-button>
            </el-col>
          </template>

          <template v-else>
            <el-col :span="13">
              <el-select v-model="newMainRecipe.soup" value-key="id" placeholder="Select">
                <el-option-group
                  v-for="group in getRecipeOption('汁物')"
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
            <el-col :span="2" style="margin-left: 5px">
              <el-button
                class="main-icon-button"
                @click="updateSelectedMenu('soup')"
                :icon="Check"
                size="small"
                circle
              ></el-button>
            </el-col>
            <el-col :span="2" style="margin-left: 3px">
              <el-button
                @click="isMainEdit.soup = false"
                :icon="Close"
                size="small"
                circle
              ></el-button>
            </el-col>
          </template>
        </el-row>

        <el-row style="margin-top: 30px" justify="center">
          <el-col :span="16">
            <el-button class="main-button" color="#ff8e3c" @click="updateMenu"
              >保存して閉じる</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button type="info" @click="isMenuListDialogVisible = false">中止</el-button>
          </el-col>
        </el-row>
      </div></el-dialog
    >
  </main>
</template>
