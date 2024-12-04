const BASE_URL = 'http://localhost:3000';

export const authApi = {
  register: async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      return await response.json();
    } catch (error) {
      console.error('注册请求失败:', error);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      return await response.json();
    } catch (error) {
      console.error('登录请求失败:', error);
      throw error;
    }
  }
};
