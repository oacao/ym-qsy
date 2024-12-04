<template>
  <div class="all-set">
    <n-tabs class="set" size="large" justify-content="space-evenly" animated>
      <n-tab-pane name="main" tab="基础设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 主题与壁纸 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">主题类别</span>
              <span class="tip">切换全站主题类别</span>
            </div>
            <n-select class="set" v-model:value="themeType" :options="themeTypeOptions" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">我的壁纸</span>
              <span class="tip">管理您上传的壁纸</span>
            </div>
            <n-space>
              <n-button strong secondary @click="showWallpaperModal">
                添加壁纸
              </n-button>
              <n-button strong secondary @click="wallpaperListVisible = true">
                查看壁纸
              </n-button>
            </n-space>
          </n-card>
          <n-h6 prefix="bar"> 搜索 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">搜索引擎</span>
              <span class="tip">切换或自定义搜索引擎</span>
            </div>
            <n-button
              strong
              secondary
              @click="
                () => {
                  status.setSiteStatus('focus');
                  status.setEngineChangeStatus(true);
                }
              "
            >
              前往调整
            </n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">搜索建议</span>
              <span class="tip">是否显示搜索建议</span>
            </div>
            <n-switch v-model:value="showSuggestions" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">跳转方式</span>
              <span class="tip">全站链接跳转方式</span>
            </div>
            <n-select class="set" v-model:value="urlJumpType" :options="urlJumpTypeOptions" />
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
      <n-tab-pane name="personalization" tab="个性调整">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 壁纸 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">壁纸遮罩</span>
              <span class="tip">壁纸周围是否显示暗色遮罩</span>
            </div>
            <n-switch v-model:value="showBackgroundGray" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">壁纸模糊</span>
              <span class="tip">调整壁纸高斯模糊的程度</span>
            </div>
            <n-slider
              class="set"
              v-model:value="backgroundBlur"
              :step="0.01"
              :min="0"
              :max="10"
              :tooltip="false"
            />
          </n-card>
          <n-h6 prefix="bar"> 天气与时间 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">天气显示</span>
              <span class="tip">是否在首页时间下展示天气</span>
            </div>
            <n-switch v-model:value="showWeather" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">时钟样式</span>
              <span class="tip">选择一种时钟样式</span>
            </div>
            <n-select class="set" v-model:value="timeStyle" :options="timeStyleOptions" />
          </n-card>
          <n-card v-if="timeStyle === 'one'" class="set-item">
            <div class="name">
              <span class="title">时间显秒</span>
              <span class="tip">是否在分钟后面显示秒数</span>
            </div>
            <n-switch v-model:value="showSeconds" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">时钟显零</span>
              <span class="tip">是否在时钟小于 10 时补 0</span>
            </div>
            <n-switch v-model:value="showZeroTime" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">显示农历</span>
            </div>
            <n-switch v-model:value="showLunar" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">12 小时制</span>
            </div>
            <n-switch v-model:value="use12HourFormat" :round="false" />
          </n-card>
          <n-h6 prefix="bar"> 搜索框 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动收缩</span>
              <span class="tip">是否在非搜索状态时收起搜索框</span>
            </div>
            <n-switch v-model:value="smallInput" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动聚焦</span>
              <span class="tip">打开网站时自动聚焦搜索框</span>
            </div>
            <n-switch v-model:value="autoFocus" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动失焦</span>
              <span class="tip">跳转搜索后搜索框自动失焦</span>
            </div>
            <n-switch v-model:value="autoInputBlur" :round="false" />
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
      <n-tab-pane name="other" tab="其他设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 重置 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">站点重置</span>
              <span class="tip">若站点显示异常或出现问题时可尝试此操作</span>
            </div>
            <n-button strong secondary @click="resetSite"> 重置 </n-button>
          </n-card>
          <n-h6 prefix="bar"> 备份 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">站点备份</span>
              <span class="tip">将站点配置及个性化内容进行备份</span>
            </div>
            <n-button strong secondary @click="backupSite"> 备份 </n-button>
          </n-card>
          <n-h6 prefix="bar"> 恢复 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">数据恢复</span>
              <span class="tip">将备份的站点内容进行恢复</span>
            </div>
            <input
              ref="recoverRef"
              type="file"              style="display: none"
              accept=".json"
              @change="recoverSite"
            />
            <n-button strong secondary @click="recoverRef?.click()"> 恢复 </n-button>
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
    </n-tabs>

    <!-- 添加壁纸弹窗 -->
    <n-modal v-model:show="wallpaperModalVisible">
      <n-card title="添加壁纸">
        <n-form>
          <n-form-item label="壁纸名称">
            <n-input v-model:value="wallpaperName" />
          </n-form-item>
          <n-form-item label="选择图片">
            <n-upload
              action="http://localhost:3000/upload"
              :default-upload="false"
              :max="1"
              @change="handleUploadChange"
            >
              <n-button>选择图片</n-button>
            </n-upload>
          </n-form-item>
          <div v-if="wallpaperUrl" class="preview">
            <img :src="wallpaperUrl" style="max-width: 200px;" />
          </div>
        </n-form>
        <template #footer>
          <n-button @click="submitWallpaper" :disabled="!wallpaperUrl">
            确认添加
          </n-button>
        </template>
      </n-card>
    </n-modal>

    <!-- 壁纸列表展示 -->
    <n-modal v-model:show="wallpaperListVisible" style="width: 80%; max-width: 900px;">
      <n-card title="我的壁纸" :bordered="false" size="huge">
        <n-grid :cols="3" :x-gap="12" :y-gap="8">
          <n-grid-item v-for="paper in wallpapers" :key="paper.id">
            <n-card :bordered="false">
              <template #cover>
                <img :src="paper.url" style="width: 100%; height: 150px; object-fit: cover;" />
              </template>
              <template #footer>
                <n-space justify="space-between">
                  <n-button @click="useWallpaper(paper)" size="small">
                    使用
                  </n-button>
                  <n-button @click="deleteWallpaper(paper.id)" type="error" size="small">
                    删除
                  </n-button>
                </n-space>
              </template>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  NH6,
  NTabs,
  NTabPane,
  NSpace,
  NCard,
  NSwitch,
  NSelect,
  NScrollbar,
  NButton,
  NGrid,
  NGridItem,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSlider,
  NUpload,
  useDialog,
  useMessage
} from "naive-ui";
import { storeToRefs } from "pinia";
import { setStore, statusStore } from "@/stores";
import { addWallpaper, getWallpapers } from '@/api';
const message = useMessage();
const dialog = useDialog();
const set = setStore();
const status = statusStore();


const {
  themeType,
  backgroundType,
  backgroundCustom,
  showBackgroundGray,
  backgroundBlur,
  smallInput,
  autoFocus,
  autoInputBlur,
  showLunar,
  showWeather,
  showSeconds,
  showZeroTime,
  use12HourFormat,
  showSuggestions,
  urlJumpType,
  timeStyle,
} = storeToRefs(set);

const recoverRef = ref(null);
// const customCoverModal = ref(false);
const customCoverUrl = ref("");
const wallpapers = ref([]);
const wallpaperModalVisible = ref(false);
const wallpaperListVisible = ref(false);
const wallpaperName = ref('');
const wallpaperUrl = ref('');


// 主题类别
const themeTypeOptions = [
  {
    label: "浅色模式",
    value: "light",
  },
  {
    label: "深色模式",
    value: "dark",
  },
];


// 链接跳转方式
const urlJumpTypeOptions = [
  {
    label: "新页面打开",
    value: "open",
  },
  {
    label: "当前页打开",
    value: "href",
  },
];

// 时钟样式
const timeStyleOptions = [
  {
    label: "横向排布",
    value: "one",
  },
  {
    label: "竖向排布",
    value: "two",
  },
];

// 显示壁纸添加弹窗
const showWallpaperModal = () => {
  wallpaperModalVisible.value = true;
};


// 获取壁纸列表
const fetchWallpapers = async () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    try {
      const res = await getWallpapers(userId);
      if (res.success) {
        wallpapers.value = res.data;
      } else {
        message.error('获取壁纸列表失败：' + res.message);
      }
    } catch (error) {
      message.error('获取壁纸列表失败：' + error.message);
    }
  }
};

const submitWallpaper = async () => {
  const userId = localStorage.getItem('userId');
  console.log('当前用户ID:', userId);
  console.log('壁纸信息:', {
    url: wallpaperUrl.value,
    name: wallpaperName.value
  });

  if (!userId) {
    message.error('请先登录');
    return;
  }

  if (!wallpaperUrl.value) {
    message.error('请先上传图片');
    return;
  }

  try {
    const response = await addWallpaper(userId, wallpaperUrl.value, wallpaperName.value);
    console.log('服务器响应:', response);

    // 修改这里的判断条件
    if (response.success) {  // 直接检查 response.success
      message.success('添加壁纸成功');
      wallpaperModalVisible.value = false;
      wallpaperName.value = '';
      wallpaperUrl.value = '';
      await fetchWallpapers();
    } else {
      throw new Error(response.message || '添加失败');
    }
  } catch (error) {
    console.error('添加壁纸错误:', error);
    message.error(error.message || '添加失败');
  }
};



// 添加上传完成处理
const handleUploadChange = (options) => {
  const { file } = options;
  if (!file || !file.file) {
    message.error('请选择有效的图片文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', file.file);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        wallpaperUrl.value = data.url;
        message.success('图片上传成功');
      } else {
        message.error('上传失败');
      }
    })
    .catch(() => {
      message.error('上传失败');
    });
};

// 使用选中的壁纸
const useWallpaper = (paper) => {
  backgroundType.value = 4;
  backgroundCustom.value = paper.url;
  wallpaperListVisible.value = false;
  message.success('壁纸设置成功，刷新后生效');
};

// 站点重置
const resetSite = () => {
  dialog.warning({
    title: "站点重置",
    content: "确认重置站点为默认状态？你的全部数据以及自定义设置都将丢失！",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      localStorage.clear();
      message.info("站点重置成功，即将刷新");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
  });
};

// 站点备份
const backupSite = () => {
  try {
    const date = new Date();
    const dateString = date.toISOString().replace(/[:.]/g, "-");
    const fileName = `Snavigation_Backup_${dateString}.json`;
    const jsonData = JSON.stringify(set.$state);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("站点备份成功");
  } catch (error) {
    console.error("站点备份失败：", error);
    message.error("站点备份失败");
  }
};

// 站点恢复
const recoverSite = async () => {
  try {
    const fileInput = recoverRef.value;
    if (!fileInput?.files.length) {
      message.error("请选择要恢复的备份文件");
      return false;
    }
    const file = fileInput.files[0];
    const jsonData = await file.text();
    const data = JSON.parse(jsonData);
    dialog.warning({
      title: "站点恢复",
      content: "确认使用该恢复文件？你现有的数据以及自定义设置都将被覆盖！",
      positiveText: "恢复",
      negativeText: "取消",
      onPositiveClick: async () => {
        const isSuccess = await set.recoverSiteData(data);
        if (isSuccess) {
          message.info("站点恢复成功，即将刷新");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          message.error("站点数据恢复失败，请重试");
        }
      },
      onNegativeClick: () => {
        recoverRef.value.value = null;
      },
    });
  } catch (error) {
    console.error("站点数据恢复失败：", error);
    message.error("站点数据恢复失败，请重试");
  }
};

onMounted(() => {
  if (backgroundCustom.value) customCoverUrl.value = backgroundCustom.value;
  fetchWallpapers();
});

</script>

<style lang="scss">
.preview {
  margin-top: 16px;
  text-align: center;

  img {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.cover-selete {
  margin-top: 12px;
  .item {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: var(--main-background-light-color);
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
    &.check {
      background-color: var(--main-background-hover-color);
      &::before {
        content: "";
        position: absolute;
        border-radius: 12px;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid var(--main-background-hover-color);
        transition: opacity 0.3s;
      }
    }
    &:hover {
      background-color: var(--main-background-hover-color);
      box-shadow: 0 0 0px 2px var(--main-background-hover-color);
      &::before {
        opacity: 0;
      }
    }
    &:active {
      box-shadow: none;
    }
  }
}

</style>
