import { ElMessage } from 'element-plus'

export const $message = {
  success(message) {
    ElMessage.success(message)
  },
  error(message) {
    ElMessage.error(message)
  },
  info(message) {
    ElMessage.info(message)
  }
}
