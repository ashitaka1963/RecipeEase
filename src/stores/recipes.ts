import { defineStore } from 'pinia';
import axios from '../axios';
import showMessage from '../CustomMessage';

export const useRecipesStore = defineStore('recipes', {
  state: () => {
    return {
      recipes: [] as any
    };
  },
  getters: {
    getById: (state) => {
      return (recipeId: string): any => {
        return state.recipes.find((item: any) => item._id === recipeId);
      };
    }
  },
  actions: {
    async fetchRecipes() {
      axios
        .get('/recipes')
        .then((response: any) => {
          this.recipes = response.data;
          showMessage('レシピを取得しました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('レシピの取得に失敗しました。', 'error');
        });
    },

    async addRecipe(addItem: any) {
      axios
        .post('/recipes', addItem)
        .then((response: any) => {
          this.recipes.push(response.data.recipe);
          showMessage('レシピが登録されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('レシピの登録に失敗しました。', 'error');
        });
    },
    async editRecipe(editItem: any) {
      console.log(editItem);
      const recipeId = editItem._id;

      axios
        .patch(`/recipes/${recipeId}`, editItem)
        .then((response: any) => {
          const updateRecipe = this.getById(recipeId);
          Object.assign(updateRecipe, response.data.recipe);

          showMessage('レシピが更新されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('レシピの更新に失敗しました。', 'error');
        });
    },
    async deleteRecipe(recipeId: string) {
      axios
        .delete(`/recipes/${recipeId}`)
        .then((response: any) => {
          const indexToDelete = this.recipes.findIndex((item: any) => item._id === recipeId);

          if (indexToDelete !== -1) {
            this.recipes.splice(indexToDelete, 1);
          }

          showMessage('レシピが削除されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('レシピの削除に失敗しました。', 'error');
        });
    }
  }
});
