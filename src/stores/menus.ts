import { defineStore } from 'pinia';
import axios from '../axios';
import showMessage from '../CustomMessage';

export const useMenusStore = defineStore('menus', {
  state: () => {
    return {
      menus: [] as any
    };
  },
  getters: {
    getById: (state) => {
      return (menuId: string): any => {
        return state.menus.find((item: any) => item._id === menuId);
      };
    }
  },
  actions: {
    async fetchMenus() {
      axios
        .get('/menus')
        .then((response: any) => {
          this.menus = response.data;
          showMessage('献立を取得しました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('献立の取得に失敗しました。', 'error');
        });
    },

    async addMenu(addItem: any) {
      axios
        .post('/menus', addItem)
        .then((response: any) => {
          this.menus.push(response.data.menu);
          showMessage('献立が登録されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('献立の登録に失敗しました。', 'error');
        });
    },
    async editMenu(editItem: any) {
      console.log(editItem);
      const menuId = editItem._id;

      axios
        .patch(`/menus/${menuId}`, editItem)
        .then((response: any) => {
          const updateMenu = this.getById(menuId);
          Object.assign(updateMenu, response.data.menu);

          showMessage('献立が更新されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('献立の更新に失敗しました。', 'error');
        });
    },
    async deleteMenu(menuId: string) {
      axios
        .delete(`/menus/${menuId}`)
        .then((response: any) => {
          const indexToDelete = this.menus.findIndex((item: any) => item._id === menuId);

          if (indexToDelete !== -1) {
            this.menus.splice(indexToDelete, 1);
          }

          showMessage('献立が削除されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('献立の削除に失敗しました。', 'error');
        });
    }
  }
});
