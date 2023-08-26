import { defineStore } from 'pinia';
import axios from '../axios';
import showMessage from '../CustomMessage';

export const useUsersStore = defineStore('users', {
  state: () => {
    return {
      users: [] as any
    };
  },
  getters: {
    getById: (state) => {
      return (userId: string): any => {
        return state.users.find((item: any) => item._id === userId);
      };
    }
  },
  actions: {
    async fetchUsers() {
      axios
        .get('/users')
        .then((response: any) => {
          this.users = response.data;
          showMessage('ユーザを取得しました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('ユーザの取得に失敗しました。', 'error');
        });
    },
    async addUser(addItem: any) {
      axios
        .post('/users', addItem)
        .then((response: any) => {
          this.users.push(response.data.user);
          showMessage('ユーザが登録されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('ユーザの登録に失敗しました。', 'error');
        });
    },
    async editUser(editItem: any) {
      const userId = editItem._id;

      axios
        .patch(`/users/${userId}`, editItem)
        .then((response: any) => {
          const updateUser = this.getById(userId);
          Object.assign(updateUser, response.data.user);

          showMessage('ユーザが更新されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('ユーザの更新に失敗しました。', 'error');
        });
    },
    async deleteUser(userId: string) {
      axios
        .delete(`/users/${userId}`)
        .then((response: any) => {
          const indexToDelete = this.users.findIndex((item: any) => item._id === userId);

          if (indexToDelete !== -1) {
            this.users.splice(indexToDelete, 1);
          }

          showMessage('ユーザが削除されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('ユーザの削除に失敗しました。', 'error');
        });
    }
  }
});
