import { createApp } from "vue"; // 导入 Vue 创建应用的函数

// Pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// IconFont
import SvgIcon from "@/components/SvgIcon.vue"; // 导入 SvgIcon 组件
// 主组件
import App from "@/App.vue"; // 导入主组件
// 导入 router
import router from './router'; // 导入路由配置

// 全局样式
import "@/style/global.scss"; // 导入全局样式


import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'



// 根组件
const app = createApp(App); // 创建 Vue 应用实例

// Pinia
const pinia = createPinia(); // 创建 Pinia 实例
pinia.use(piniaPluginPersistedstate); // 使用持久化插件

// 挂载
app.use(pinia); // 使用 Pinia
app.use(router); // 使用 router
app.component("SvgIcon", SvgIcon); // 全局注册 SvgIcon 组件
app.mount("#app"); // 挂载应用
app.use(ElementPlus)
// 添加全局消息提示
window.$message = $message