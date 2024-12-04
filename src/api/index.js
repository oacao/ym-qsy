import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

/**
 * 获取天气
 * https://lbs.amap.com/api/webservice/guide/api/weatherinfo
 */
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
export const login = (username, password) => {
  return axios.post('http://localhost:3000/login', {
    username,
    password
  });
};
export const deleteWallpaper = (id) => {
  return axios.delete(`http://localhost:3000/wallpaper/${id}`);
};



