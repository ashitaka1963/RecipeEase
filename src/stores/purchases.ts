import { defineStore } from 'pinia';
import axios from '../axios';
import showMessage from '../CustomMessage';

export const usePurchasesStore = defineStore('purchases', {
  state: () => {
    return {
      purchases: [] as any
    };
  },
  getters: {
    getById: (state) => {
      return (purchaseId: string): any => {
        return state.purchases.find((item: any) => item._id === purchaseId);
      };
    }
  },
  actions: {
    async fetchPurchases(startDate: string, endDate: string) {
      const queryParams = {
        startDate: startDate,
        endDate: endDate
      };

      axios
        .get('/purchases', {
          params: queryParams // paramsオブジェクトにクエリパラメータを指定
        })
        .then((response: any) => {
          this.purchases = response.data;
          showMessage('買い物リストを取得しました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('買い物リストの取得に失敗しました。', 'error');
        });
    },

    async addPurchase(addItem: any) {
      axios
        .post('/purchases', addItem)
        .then((response: any) => {
          this.purchases.push(response.data.purchase);
          showMessage('買い物リストが登録されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('買い物リストの登録に失敗しました。', 'error');
        });
    },
    // async editPurchase(editItem: any) {
    //   console.log(editItem);
    //   const purchaseId = editItem._id;

    //   axios
    //     .patch(`/purchases/${purchaseId}`, editItem)
    //     .then((response: any) => {
    //       const updatePurchase = this.getById(purchaseId);
    //       Object.assign(updatePurchase, response.data.purchase);

    //       showMessage('買い物リストが更新されました。', 'success');
    //     })
    //     .catch((error: any) => {
    //       console.error('Error:', error);
    //       showMessage('買い物リストの更新に失敗しました。', 'error');
    //     });
    // },
    async changeIsPurchased(purchaseId: string, purchaseIndex: number) {
      axios
        .patch(`/purchases/${purchaseId}`, { index: purchaseIndex })
        .then((response: any) => {
          const updatePurchase = this.getById(purchaseId);

          updatePurchase.purchases[purchaseIndex].isPurchased =
            !updatePurchase.purchases[purchaseIndex].isPurchased;

          // Object.assign(updatePurchase, response.data.purchase);
          showMessage(
            `${updatePurchase.purchases[purchaseIndex].name}を購入済みに移動しました。`,
            'success'
          );
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('買い物リストの更新に失敗しました。', 'error');
        });
    },
    async deletePurchase(purchaseId: string) {
      axios
        .delete(`/purchases/${purchaseId}`)
        .then((response: any) => {
          const indexToDelete = this.purchases.findIndex((item: any) => item._id === purchaseId);

          if (indexToDelete !== -1) {
            this.purchases.splice(indexToDelete, 1);
          }

          showMessage('買い物リストが削除されました。', 'success');
        })
        .catch((error: any) => {
          console.error('Error:', error);
          showMessage('買い物リストの削除に失敗しました。', 'error');
        });
    }
  }
});
