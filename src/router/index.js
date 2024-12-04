import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/Login.vue'; // 导入登录组件
import Register from '@/components/Register.vue'; // 导入注册组件

const routes = [
  { path: '/login', component: Login }, // 登录路由
  { path: '/register', component: Register }, // 注册路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; // 导出路由实例
