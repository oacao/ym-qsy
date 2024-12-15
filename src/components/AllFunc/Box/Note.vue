<template>
  <div class="note-outer-container">
    <div class="note-container">
      <TransitionGroup name="note-list" tag="div" class="notes-list">
        <div v-for="(note, index) in notes"
             :key="note.id"
             class="note-item"
             :style="{ backgroundColor: getRandomColor() }">
          <textarea
            v-model="note.content"
            @blur="updateNote(index)"
            placeholder="写点什么..."
          ></textarea>
          <div class="delete-btn" @click.stop="removeNote(index)">-</div>
        </div>
      </TransitionGroup>
      <div class="add-note" @click="addNote">
        <span class="plus-icon">+</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { addNote as apiAddNote, getNotes as apiGetNotes, deleteNote as apiDeleteNote, updateNote as apiUpdateNote } from '@/api/index';

const notes = ref([]);
const colors = ['#fff9c4', '#f8bbd0', '#c8e6c9', '#bbdefb', '#e1bee7'];

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const currentUser = computed(() => {
  const savedUser = localStorage.getItem('user');
  return savedUser ? JSON.parse(savedUser) : null;
});

const addNote = async () => {
  if (!currentUser.value) {
    window.$message.success('请先登录');
    return;
  }

  try {
    const response = await apiAddNote(currentUser.value.id, '');
    console.log('添加便签响应:', response);

    if (response && response.data) {
      notes.value.push({
        id: response.data.id,
        content: '',
        user_id: currentUser.value.id
      });
    }
  } catch (error) {
    console.error('添加便签失败:', error);
    window.$message.error('添加便签失败');
  }
};

const updateNote = async (index) => {
  const note = notes.value[index];
  if (!note.content.trim()) return;

  try {
    await apiUpdateNote(note.id, note.content);
  } catch (error) {
    console.error('更新便签失败:', error);
    window.$message.error('保存失败');
  }
};

const removeNote = async (index) => {
  try {
    const noteId = notes.value[index].id;
    await apiDeleteNote(noteId);
    notes.value.splice(index, 1);
    window.$message.success('删除成功');
  } catch (error) {
    console.error('删除便签失败:', error);
    window.$message.error('删除失败');
  }
};

onMounted(async () => {
  if (currentUser.value) {
    try {
      const response = await apiGetNotes(currentUser.value.id);
      console.log('获取便签响应:', response);

      if (Array.isArray(response)) {
        notes.value = response;
      } else {
        notes.value = [];
      }
    } catch (error) {
      console.error('获取便签失败:', error);
      window.$message.error('获取便签失败');
    }
  }
});
</script>

<style scoped>
.note-outer-container {
  height: calc(100vh - 400px); /* 增加顶部预留空间 */
  overflow: hidden;
  padding-bottom: 160px;
}

.note-container {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, 220px);
  gap: 24px;
  justify-content: center;
  margin-bottom: 200px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.note-container::-webkit-scrollbar {
  display: none;
}


.add-note {
  width: 220px;
  height: 320px;
  border: 2px dashed #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8);
}

.plus-icon {
  font-size: 48px;
  color: #666;
  transition: transform 0.3s ease;
}

.add-note:hover {
  border-color: #2196f3;
  background-color: rgba(33, 150, 243, 0.1);
}

.add-note:hover .plus-icon {
  transform: scale(1.2);
}

.notes-list {
  display: contents;
}

.note-item {
  width: 220px;
  height: 320px;
  position: relative;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden; /* 确保内容不溢出 */
}

.note-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

textarea {
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
  resize: none;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background-color: transparent;
  overflow-y: auto;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-break: break-all;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

textarea::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

textarea:focus {
  outline: none;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff5252;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  font-size: 18px;
}

.note-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  transform: scale(1.1);
  background-color: #ff1744;
}


</style>
