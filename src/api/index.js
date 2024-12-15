import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";
const API_URL = 'http://localhost:3000';

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  return axios({
    method: "GET",
    url: "https://restapi.amap.com/v3/ip",
    params: { key },
  });
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  return axios({
    method: "GET",
    url: "https://restapi.amap.com/v3/weather/weatherInfo",
    params: { key, city, extensions: "base" },
  });
};

// 获取必应搜索建议
export const getBingSuggestions = async (keyword) => {
  const market = "zh-CN";
  const url = `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodeURIComponent(keyword)}&market=${market}`;
  return fetchJsonp(url, {
    jsonpCallback: 'cb',
    timeout: 3000
  })
    .then(response => response.json())
    .then(data => {
      if (data.AS.Results && data.AS.Results[0]?.Suggests) {
        return data.AS.Results[0].Suggests.map(item => item.Txt);
      }
      return [];
    });
};


// 添加壁纸API
export const addWallpaper = (userId, url, name) => {
  return axios.post('http://localhost:3000/wallpaper', {
    userId,
    url,
    name
  });
};

export const getWallpapers = (userId) => {
  return axios.get(`http://localhost:3000/wallpapers/${userId}`);
};

export const deleteWallpaper = (id) => {
  return axios.delete(`http://localhost:3000/wallpaper/${id}`);
};
export const addNote = async (userId, content) => {
  return axios.post(`${API_URL}/note`, { userId, content });
};

export const updateNote = async (noteId, content) => {
  return axios.put(`${API_URL}/note/${noteId}`, { content });
};

export const getNotes = async (userId) => {
  const response = await axios.get(`${API_URL}/notes/${userId}`);
  return response.data;
};

export const deleteNote = async (noteId) => {
  return axios.delete(`${API_URL}/note/${noteId}`);
};
// 添加任务
export const addTodo = (userId, title, priority, dueDate, tags, description) => {
  const formattedDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;

  return axios.post(`${API_URL}/todo`, {
    userId,
    title,
    priority,
    dueDate: formattedDate,
    tags: JSON.stringify(tags),
    description
  });
};


// 获取任务列表
export const getTodos = (userId) => {
  return axios.get(`${API_URL}/todos/${userId}`);
};

// 更新任务
export const updateTodo = (todoId, data) => {
  const updatedData = {
    ...data,
    tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]'
  };
  return axios.put(`${API_URL}/todo/${todoId}`, updatedData);
};
// 删除任务
export const deleteTodo = (todoId) => {
  return axios.delete(`${API_URL}/todo/${todoId}`);
};

