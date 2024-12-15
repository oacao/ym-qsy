<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-item">
        <input
          v-model="form.username"
          type="text"
          placeholder="用户名"
          required
          @input="validateUsername"
        />
        <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
      </div>
      <div class="form-item">
        <input
          v-model="form.password"
          type="password"
          placeholder="密码"
          required
          @input="validatePassword"
        />
        <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
      </div>
      <button type="submit" :disabled="loading || hasErrors">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>


<script setup>import { ref, computed } from 'vue'; // 确保导入 computed
import { authApi } from '@/api/auth';

const emit = defineEmits(['close', 'loginSuccess']);
const loading = ref(false);
const form = ref({
  username: '',
  password: ''
});
const errors = ref({
  username: '',
  password: ''
});

const hasErrors = computed(() => {
  return Object.values(errors.value).some(error => error !== '') ||
    !form.value.username ||
    !form.value.password;
});

const validateUsername = () => {
  const username = form.value.username;
  if (username.length < 2 || username.length > 16) {
    errors.value.username = '用户名长度必须在2-16位之间';
  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(username)) {
    errors.value.username = '用户名只能包含字母、数字和中文';
  } else {
    errors.value.username = '';
  }
};


const validatePassword = () => {
  const password = form.value.password;
  if (password.length < 6 || password.length > 20) {
    errors.value.password = '密码长度必须在6-20位之间';
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password)) {
    errors.value.password = '密码必须包含字母和数字';
  } else {
    errors.value.password = '';
  }
};

const handleSubmit = async () => {
  if (hasErrors.value) return;

  loading.value = true;
  try {
    const response = await authApi.login(form.value.username, form.value.password);
    if (response.success) {
      emit('loginSuccess', response); // 传递完整响应
      emit('close'); // 登录成功后关闭弹窗
    } else {
      window.$message.error(response.message || '登录失败');
    }
  } catch (error) {
    window.$message.error('登录失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

</script>

<style lang="scss" scoped>
.login-container {
  padding: 30px;
  width: 300px;
  background: var(--main-background-light-color);
  border-radius: 12px;
  backdrop-filter: blur(20px);

  // 添加弹性布局使内容居中
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    color: var(--main-text-color);
    text-align: center;
    margin-bottom: 24px;
  }

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.form-item {
  margin-bottom: 20px;
  width: 80%; // 使用百分比宽度
  margin-right: 25px;

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    color: #000;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      background: #fff;
    }

    &::placeholder {
      color: #999;
    }
  }
}

button {
  width: 89%; // 与输入框保持相同宽度
  padding: 10px;
  margin-right: 2px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(20px);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>



<style lang="scss" scoped>
.login-container {
  padding: 30px;
  width: 300px;
  background: var(--main-background-light-color);
  border-radius: 12px;
  backdrop-filter: blur(20px);

  // 添加弹性布局使内容居中
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    color: var(--main-text-color);
    text-align: center;
    margin-bottom: 24px;
  }

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.form-item {
  margin-bottom: 20px;
  width: 80%; // 使用百分比宽度
  margin-right: 25px;

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    color: #000;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      background: #fff;
    }

    &::placeholder {
      color: #999;
    }
  }
}

button {
  width: 89%; // 与输入框保持相同宽度
  padding: 10px;
  margin-right: 2px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(20px);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>

