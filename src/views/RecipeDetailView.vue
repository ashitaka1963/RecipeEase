<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

import PageHeader from '../components/parts/PageHeader.vue';
import RecipeDetailInfo from '../components/RecipeDetail/RecipeDetailInfo.vue';
import RecipeDetailIngredients from '../components/RecipeDetail/RecipeDetailIngredients.vue';
import RecipeDetailSteps from '../components/RecipeDetail/RecipeDetailSteps.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const isTop = ref(false);
</script>

<template>
  <main>
    <PageHeader headerName="レシピ詳細" :isTop="isTop" />

    <RecipeDetailInfo :recipeId="props.id" />
    <RecipeDetailIngredients :recipeId="props.id" />
    <RecipeDetailSteps :recipeId="props.id" />
  </main>
</template>
