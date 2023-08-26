import { ElMessage } from 'element-plus';

const showMessage = (message: any, type: any) => {
  ElMessage({
    message: message,
    type: type
  });
};

export default showMessage;
