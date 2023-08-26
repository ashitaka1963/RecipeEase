import { defineStore } from 'pinia';
import axios from '../axios';
import showMessage from '../CustomMessage';

export const useIngredientsStore = defineStore('ingredients', {
  state: () => {
    return {
      ingredients: [] as any
    };
  },
  getters: {
    getById: (state) => {
      return (ingredientId: string): any => {
        return state.ingredients.find((item: any) => item._id === ingredientId);
      };
    }
  },
  actions: {
    async fetchIngredients() {
      axios
        .get('/ingredients')
        .then((response: any) => {
          this.ingredients = response.data;
          showMessage('材料を取得しました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('材料の取得に失敗しました。', 'error');
        });
    },

    async addIngredient(addItem: any) {
      axios
        .post('/ingredients', addItem)
        .then((response: any) => {
          this.ingredients.push(response.data.ingredient);
          showMessage('材料が登録されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('材料の登録に失敗しました。', 'error');
        });
    },
    async editIngredient(editItem: any) {
      const ingredientId = editItem._id;

      axios
        .patch(`/ingredients/${ingredientId}`, editItem)
        .then((response: any) => {
          const updateIngredient = this.getById(ingredientId);
          Object.assign(updateIngredient, response.data.ingredient);

          showMessage('材料が更新されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('材料の更新に失敗しました。', 'error');
        });
    },
    async deleteIngredient(ingredientId: string) {
      axios
        .delete(`/ingredients/${ingredientId}`)
        .then((response: any) => {
          const indexToDelete = this.ingredients.findIndex(
            (item: any) => item._id === ingredientId
          );

          if (indexToDelete !== -1) {
            this.ingredients.splice(indexToDelete, 1);
          }

          showMessage('材料が削除されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('材料の削除に失敗しました。', 'error');
        });
    }
  }
});
