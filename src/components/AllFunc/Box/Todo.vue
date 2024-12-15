<template>
  <div class="todo-container">
    <div class="stats-container">
      <n-card size="small" class="stats-card">
        <!-- 第一行：完成率和统计 -->
        <n-space align="center" justify="space-between" class="stats-wrapper">
          <div class="stat-item progress-item">
            <span>完成率:</span>
            <n-progress type="line"
                        :percentage="completionRate"
                        :color="progressColor"
                        :show-indicator="true"
                        style="width: 730px"/>
          </div>
          <div class="stat-counts">
            <div class="stat-item">
              <span>待办任务:</span>
              <span>{{ pendingTasksCount }}</span>
            </div>
            <div class="stat-item">
              <span>已完成:</span>
              <span>{{ completedTasksCount }}</span>
            </div>
          </div>
        </n-space>

        <!-- 第二行：搜索、排序、优先级过滤和添加按钮 -->
        <div class="controls-section">
          <div class="search-sort">
            <n-input-group>
              <n-input v-model:value="searchQuery" placeholder="搜索任务..."/>
              <n-select v-model:value="sortBy"
                        :options="sortOptions"
                        placeholder="排序方式"
                        class="sort-select"/>
              <n-button type="primary" @click="searchTasks">搜索</n-button>
            </n-input-group>
          </div>
          <div class="priority-filters">
            <n-tag v-for="p in priorities"
                   :key="p.value"
                   :type="p.type"
                   :bordered="false"
                   @click="filterByPriority(p.value)">
              {{ p.label }}
            </n-tag>
          </div>
          <n-button type="primary" @click="showAddTask">添加任务</n-button>
        </div>
      </n-card>
    </div>

    <div class="tasks-list" ref="tasksList">
      <div class="tasks-grid">
        <div v-for="task in sortedAndFilteredTasks"
             :key="task.id"
             class="task-item"
             :class="{'task-completed': task.completed, 'task-expired': isTaskExpired(task)}">
          <div class="task-header">
            <n-checkbox v-model:checked="task.completed"
                        @update:checked="updateTask(task)"/>
            <n-tag :type="getPriorityType(task.priority)" size="small">
              {{ getPriorityLabel(task.priority) }}
            </n-tag>
          </div>

          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-description" v-if="task.description">
              {{ task.description }}
            </div>
            <div class="task-info">
              <span class="task-due-date">截止: {{ formatDate(task.due_date) }}</span>
              <div class="task-tags" v-if="task.tags">
                <n-tag v-for="tag in parseTaskTags(task.tags)"
                       :key="tag"
                       size="small"
                       :bordered="false">
                  {{ tag }}
                </n-tag>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <n-button size="small" type="info" @click="editTask(task)">
              编辑
            </n-button>
            <n-button size="small" type="error" @click="removeTask(task.id)">
              删除
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showModal">
      <n-card :title="isEditing ? '编辑任务' : '添加任务'"
              :bordered="false"
              size="huge"
              style="width: 500px">
        <n-form ref="formRef" :model="taskForm">
          <n-form-item label="任务标题" path="title">
            <n-input v-model:value="taskForm.title" placeholder="请输入任务标题"/>
          </n-form-item>

          <n-form-item label="优先级" path="priority">
            <n-select v-model:value="taskForm.priority" :options="priorityOptions"/>
          </n-form-item>

          <n-form-item label="截止日期" path="dueDate">
            <n-date-picker
              v-model:value="taskForm.dueDate"
              type="datetime"
              clearable
              :is-date-disabled="false"
              :time-picker-props="{
                format: 'HH:mm',
                minuteStep: 1
              }"
            />
          </n-form-item>

          <n-form-item label="标签" path="tags">
            <n-dynamic-tags
              :value="Array.isArray(taskForm.tags) ? taskForm.tags : []"
              @update:value="val => taskForm.tags = val"
            />
          </n-form-item>

          <n-form-item label="描述" path="description">
            <n-input type="textarea"
                     v-model:value="taskForm.description"
                     placeholder="任务描述..."/>
          </n-form-item>
        </n-form>

        <template #footer>
          <n-button type="primary" @click="isEditing ? updateTaskDetails() : submitTask()">
            {{ isEditing ? '更新' : '确认' }}
          </n-button>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  NButton, NTag, NCheckbox, NModal, NCard, NForm, NFormItem,
  NInput, NSelect, NDatePicker, NSpace, NProgress, NInputGroup,
  NDynamicTags
} from 'naive-ui';
import { addTodo, getTodos, updateTodo, deleteTodo } from '@/api/index';

// 响应式状态
const tasks = ref([]);
const filteredTasks = ref([]);
const currentFilter = ref(0);
const showModal = ref(false);
const tasksList = ref(null);
const isEditing = ref(false);
const searchQuery = ref('');
const sortBy = ref('created_at');
const editingTask = ref(null);

// 表单状态
const taskForm = ref({
  title: '',
  priority: 3,
  dueDate: null,
  tags: [],
  description: ''
});

// 选项配置
const priorities = [
  { label: '全部', value: 0, type: 'default' },
  { label: '高优先级', value: 1, type: 'error' },
  { label: '中优先级', value: 2, type: 'warning' },
  { label: '低优先级', value: 3, type: 'success' }
];

const priorityOptions = [
  { label: '高优先级', value: 1 },
  { label: '中优先级', value: 2 },
  { label: '低优先级', value: 3 }
];

const sortOptions = [
  { label: '创建时间', value: 'created_at' },
  { label: '截止日期', value: 'due_date' },
  { label: '优先级', value: 'priority' }
];

// 计算属性
const currentUser = computed(() => {
  const savedUser = localStorage.getItem('user');
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch (e) {
    console.error('用户数据解析错误:', e);
    return null;
  }
});

const completionRate = computed(() => {
  if (!tasks.value.length) return 0;
  const completed = tasks.value.filter(t => t.completed).length;
  return Math.round((completed / tasks.value.length) * 100);
});

const pendingTasksCount = computed(() =>
  tasks.value.filter(t => !t.completed).length
);

const completedTasksCount = computed(() =>
  tasks.value.filter(t => t.completed).length
);

const progressColor = computed(() => {
  if (completionRate.value < 30) return '#ff4d4f';
  if (completionRate.value < 70) return '#faad14';
  return '#52c41a';
});

const sortedAndFilteredTasks = computed(() => {
  return [...filteredTasks.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'due_date':
        return new Date(a.due_date || 0) - new Date(b.due_date || 0);
      case 'priority':
        return a.priority - b.priority;
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });
});

// 方法
const getPriorityType = (priority) => {
  switch(priority) {
    case 1: return 'error';
    case 2: return 'warning';
    case 3: return 'success';
    default: return 'default';
  }
};

const getPriorityLabel = (priority) => {
  switch(priority) {
    case 1: return '高';
    case 2: return '中';
    case 3: return '低';
    default: return '无';
  }
};

const parseTaskTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsedTags = JSON.parse(tags);
    return Array.isArray(parsedTags) ? parsedTags : [parsedTags];
  } catch (e) {
    return typeof tags === 'string' ? [tags] : [];
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isTaskExpired = (task) => {
  if (!task.due_date || task.completed) return false;
  return new Date(task.due_date) < new Date();
};

const filterByPriority = (priority) => {
  currentFilter.value = priority;
  if (priority === 0) {
    filteredTasks.value = tasks.value;
  } else {
    filteredTasks.value = tasks.value.filter(task => task.priority === priority);
  }
};

const searchTasks = () => {
  if (!searchQuery.value.trim()) {
    filteredTasks.value = tasks.value;
    return;
  }
  filteredTasks.value = tasks.value.filter(task =>
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
};

const showAddTask = () => {
  isEditing.value = false;
  resetForm();
  showModal.value = true;
};

const editTask = (task) => {
  isEditing.value = true;
  editingTask.value = task;
  taskForm.value = {
    title: task.title,
    priority: task.priority,
    dueDate: task.due_date ? new Date(task.due_date).getTime() : null,
    tags: parseTaskTags(task.tags),
    description: task.description || ''
  };
  showModal.value = true;
};

const updateTaskDetails = async () => {
  if (!taskForm.value.title.trim()) {
    window.$message.error('请输入任务标题');
    return;
  }

  try {
    const response = await updateTodo(editingTask.value.id, {
      title: taskForm.value.title,
      priority: taskForm.value.priority,
      dueDate: taskForm.value.dueDate,
      tags: taskForm.value.tags,
      description: taskForm.value.description,
      completed: editingTask.value.completed
    });

    if (response.success) {
      await refreshTasks();
      showModal.value = false;
      window.$message.success('更新成功');
    }
  } catch (error) {
    window.$message.error('更新失败');
  }
};

const submitTask = async () => {
  if (!taskForm.value.title.trim()) {
    window.$message.error('请输入任务标题');
    return;
  }

  try {
    const response = await addTodo(
      currentUser.value.id,
      taskForm.value.title,
      taskForm.value.priority,
      taskForm.value.dueDate,
      taskForm.value.tags,
      taskForm.value.description
    );

    if (response.data) {
      await refreshTasks();
      showModal.value = false;
      window.$message.success('添加任务成功');
      resetForm();
    }
  } catch (error) {
    window.$message.error('添加任务失败');
  }
};

const resetForm = () => {
  taskForm.value = {
    title: '',
    priority: 3,
    dueDate: null,
    tags: [],
    description: ''
  };
};

const updateTask = async (task) => {
  try {
    const response = await updateTodo(task.id, {
      title: task.title,
      priority: task.priority,
      dueDate: task.due_date,
      completed: task.completed,
      tags: task.tags,
      description: task.description
    });

    if (response.success) {
      window.$message.success('更新成功');
      await refreshTasks();
    }
  } catch (error) {
    window.$message.error('更新失败');
    task.completed = !task.completed;
  }
};

const refreshTasks = async () => {
  if (currentUser.value) {
    const response = await getTodos(currentUser.value.id);
    if (response?.success) {
      tasks.value = response.data || [];
      filterByPriority(currentFilter.value);
    }
  }
};

const removeTask = async (taskId) => {
  try {
    const response = await deleteTodo(taskId);
    if (response.success) {
      tasks.value = tasks.value.filter(task => task.id !== taskId);
      filterByPriority(currentFilter.value);
      window.$message.success('删除成功');
    }
  } catch (error) {
    window.$message.error('删除失败');
  }
};

const setTasksListHeight = () => {
  if (tasksList.value) {
    const headerHeight = document.querySelector('.stats-container').offsetHeight;
    const containerPadding = 48;
    tasksList.value.style.maxHeight = `calc(100vh - ${headerHeight + containerPadding}px)`;
  }
};

onMounted(async () => {
  setTasksListHeight();
  window.addEventListener('resize', setTasksListHeight);

  if (currentUser.value) {
    try {
      const response = await getTodos(currentUser.value.id);
      if (response?.success) {
        tasks.value = response.data || [];
        filteredTasks.value = [...tasks.value];
      }
    } catch (error) {
      window.$message?.error?.('获取任务列表失败');
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', setTasksListHeight);
});
</script>
<style scoped>
.todo-container {
  padding: 16px 24px;
  height: calc(100vh - 400px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.stats-container {
  margin-bottom: 16px;
}

.stats-card {
  background: var(--main-background-light-color);
}

.stats-wrapper {
  margin-bottom: 12px;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--main-background-hover-color);
}

.search-sort {
  flex: 1;
}

.sort-select {
  width: 120px;
}

.priority-filters {
  display: flex;
  gap: 8px;
}

.stat-counts {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.progress-item {
  flex: 1;
  margin-right: 32px;
  min-width: 400px;
}


.tasks-list {
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tasks-list::-webkit-scrollbar {
  display: none;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 16px;
}

.task-item {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--main-background-light-color);
  border-radius: 12px;
  box-shadow: var(--main-box-shadow);
  transition: all 0.3s ease;
}

.task-item:hover {
  transform: translateY(-2px);
  background: var(--main-background-hover-color);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-content {
  flex: 1;
  padding: 12px 0;
  color: var(--main-text-color);
}

.task-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
}

.task-description {
  font-size: 14px;
  color: var(--main-text-grey-color);
  margin-bottom: 12px;
  line-height: 1.5;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-due-date {
  font-size: 12px;
  color: var(--main-text-grey-color);
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--main-background-hover-color);
}

.task-completed {
  opacity: 0.6;
}

.task-completed .task-title {
  text-decoration: line-through;
}

.task-expired:not(.task-completed) {
  border: 1px solid var(--error-color);
}

.task-expired:not(.task-completed) .task-due-date {
  color: var(--error-color);
}
</style>
