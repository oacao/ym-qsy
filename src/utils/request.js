import axios from 'axios';

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权,清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          window.$message.error('登录已过期,请重新登录');
          break;
        case 404:
          window.$message.error('请求的资源不存在');
          break;
        case 500:
          window.$message.error('服务器错误');
          break;
        default:
          window.$message.error(error.response.data.message || '请求失败');
      }
    } else {
      window.$message.error('网络错误,请稍后重试');
    }
    return Promise.reject(error);
  }
);

export default instance;
