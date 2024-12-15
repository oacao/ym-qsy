<template>
  <Provider>
    <!-- 主界面 -->
    <main
      tabindex="0"
      id="main"
      :class="`main-${status.siteStatus}`"
      :style="{
        pointerEvents: mainClickable ? 'auto' : 'none',
      }"
      @click="status.setSiteStatus('normal')"
      @contextmenu="mainContextmenu"
      @keydown="mainPressKeyboard"
    >
      <!-- 新增的壁纸层 -->
      <div class="background-layer"
           :style="{
             backgroundImage: backgroundType === 4 ? `url(${backgroundCustom})` : '',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backdropFilter: showBackgroundGray ? 'brightness(0.1) blur(1000px)' : 'none',
             filter: `blur(${backgroundBlur}px)`,
             backgroundColor: showBackgroundGray ? 'black' : 'transparent'
           }"></div>

      <WeatherTime v-if="!isLoginOrRegisterVisible" />
      <SearchInp v-if="!isLoginOrRegisterVisible" @contextmenu.stop />
      <AllFunc v-if="!isLoginOrRegisterVisible" @contextmenu.stop />
      <Footer v-if="!isLoginOrRegisterVisible" />
      <!-- 状态切换 -->
      <Transition name="fade">
        <div
          class="all-controls"
          v-show="status.siteStatus !== 'focus' && status.siteStatus !== 'normal' && !isLoginOrRegisterVisible"
        >
          <div
            class="change-status"
            :title="status.mainBoxBig ? '收起' : '展开'"
            @click.stop="status.setMainBoxBig(!status.mainBoxBig)"
          >
            <Transition name="fade" mode="out-in">
              <SvgIcon
                :iconName="`icon-${status.mainBoxBig ? 'packup' : 'unfold'}`"
                :key="status.mainBoxBig ? 'packup' : 'unfold'"
              />
            </Transition>
          </div>
          <div
            class="change-status"
            :title="status.siteStatus !== 'set' ? '设置' : '首页'"
            @click.stop="status.setSiteStatus(status.siteStatus !== 'set' ? 'set' : 'normal')"
          >
            <Transition name="fade" mode="out-in">
              <SvgIcon
                :iconName="`icon-${status.siteStatus !== 'set' ? 'setting' : 'home'}`"
                :key="status.siteStatus !== 'set' ? 'setting' : 'home'"
              />
            </Transition>
          </div>
        </div>
      </Transition>
    </main>

    <div v-if="isLoginOrRegisterVisible"
         class="modal-overlay"
         @click="closeModal">
      <div class="modal-content" @click.stop>
        <component :is="currentComponent"
                   @close="closeModal"
                   @login-success="handleLoginSuccess"
                   @register-success="handleLoginSuccess" />
      </div>
    </div>
    <nav class="navbar" v-show="!isLoginOrRegisterVisible && !isLogoutProcessing && status.siteStatus === 'normal' && !status.mainBoxBig">
      <template v-if="!currentUser">
        <a href="#" @click.prevent="showLogin">登录</a>
        <a href="#" @click.prevent="showRegister">注册</a>
      </template>
      <template v-else>
        <span class="username">{{ currentUser.username }}</span>
        <a href="#" @click.prevent="handleLogout">退出</a>
      </template>
    </nav>
  </Provider>
</template>


<script setup>
import { onMounted, watch, ref, computed } from "vue";
import { statusStore, setStore } from "@/stores";
import { getGreeting } from "@/utils/timeTools";
import Provider from "@/components/Provider.vue";
import WeatherTime from "@/components/WeatherTime.vue";
import SearchInp from "@/components/SearchInput/SearchInp.vue";
import AllFunc from "@/components/AllFunc/AllFunc.vue";
import Footer from "@/components/Footer.vue";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import SvgIcon from "@/components/SvgIcon.vue";
import { markRaw } from 'vue'

const set = setStore();
const status = statusStore();
const mainClickable = ref(true);
const isLoginOrRegisterVisible = ref(false);
const currentComponent = ref(null);
const currentUser = ref(null);
const isLogoutProcessing = ref(false);

// 获取配置
const welcomeText = import.meta.env.VITE_WELCOME_TEXT ?? "欢迎访问本站";

// 计算属性来获取背景类型和背景自定义URL
const backgroundType = computed(() => set.backgroundType);
const backgroundCustom = computed(() => set.backgroundCustom);
const showBackgroundGray = computed(() => set.showBackgroundGray);
const backgroundBlur = computed(() => set.backgroundBlur);
// 鼠标右键
const mainContextmenu = (event) => {
  event.preventDefault();
  status.setSiteStatus("box");
};

// 全局键盘事件
const mainPressKeyboard = (event) => {
  const keyCode = event.keyCode;
  if (keyCode === 13) {
    const mainInput = document.getElementById("main-input");
    status.setSiteStatus("focus");
    mainInput?.focus();
  }
};

// 根据主题类别更改
const changeThemeType = (val) => {
  const htmlElement = document.querySelector("html");
  const themeType = val === "light" ? "light" : "dark";
  htmlElement.setAttribute("theme", themeType);
};

// 监听颜色变化
watch(
  () => set.themeType,
  (val) => changeThemeType(val),
);

const handleLoginSuccess = (response) => {
  console.log('登录响应数据:', response);
  const userData = response.data;
  if (userData) {
    console.log('用户数据:', userData)
    currentUser.value = userData;
    localStorage.setItem('userId', userData.id.toString());
    localStorage.setItem('user', JSON.stringify(userData));
    window.$message.success('登录成功');
    isLoginOrRegisterVisible.value = false;
    currentComponent.value = null;
  }
};

onMounted(() => {
  changeThemeType(set.themeType);
  // 显示欢迎信息
  window.$message.info(getGreeting() + "，" + welcomeText, {
    showIcon: false,
    duration: 3000,
  });
  // 初始化状态
  isLoginOrRegisterVisible.value = false;
  // 检查本地存储的登录状态
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser);
  }
});

// 显示登录框
const showLogin = () => {
  isLoginOrRegisterVisible.value = true;
  currentComponent.value = markRaw(Login);
};

// 显示注册框
const showRegister = () => {
  isLoginOrRegisterVisible.value = true;
  currentComponent.value = markRaw(Register);
};

// 关闭模态框
const closeModal = () => {
  isLoginOrRegisterVisible.value = false;
  currentComponent.value = null;
};

// 退出登录处理
const handleLogout = () => {
  isLogoutProcessing.value = true;
  currentUser.value = null;
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  window.$message.success('已退出登录');

  setTimeout(() => {
    isLogoutProcessing.value = false;
  }, 300);
};

</script>

<style lang="scss" scoped>
#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;

  .background-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1; /* 确保背景层在最底层 */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)); /* 透明黑色渐变效果 */
  }


  &.main-normal,
  &.main-focus {
    .main-box {
      opacity: 0;
      margin-top: 0;
      transform: scale(0.35);
      pointer-events: none;
    }
  }

  &.main-box,
  &.main-set {
    .main-box {
      opacity: 1;
      margin-top: 20vh;
      transform: scale(1);
      visibility: visible;
      @media (max-width: 478px) {
        margin-top: 22vh;
      }
    }

    .search-input {
      :deep(.all) {
        opacity: 0;
        width: 0;
        visibility: hidden;
      }
    }
  }

  .all-controls {
    position: fixed;
    width: 100%;
    top: 0;
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    z-index: 10; /* 设置控制栏的 z-index 为 10 */

    .change-status {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      padding: 8px;
      border-radius: 8px;
      color: var(--main-text-color);
      z-index: 1;
      transition: opacity 0.3s,
      background-color 0.3s,
      transform 0.3s;

      &:hover {
        backdrop-filter: blur(20px);
        background-color: var(--main-background-light-color);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

.navbar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10; /* 设置导航栏的 z-index 为 10 */

  .username {
    color: var(--main-text-color);
  }

  a {
    color: var(--main-text-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(85, 85, 85, 0.11);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 设置模态框的 z-index 为 1000 */
}

.modal-content {
  background: transparent;
  padding: 0;
  border-radius: 8px;
  z-index: 1001; /* 设置模态框内容的 z-index 为 1001 */
}

</style>
