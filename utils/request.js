/**
 * 网络请求封装
 * 适配微信云后端，统一处理请求和响应
 */

const { SERVER_IP } = require('../conf/s');

// 微信云服务器地址
const BASE_URL = SERVER_IP;

/**
 * 封装的请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 请求结果
 */
function request(options) {
  const token = wx.getStorageSync('token');

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        const data = res.data;

        // 未授权，跳转登录
        if (data.code === 401 || data.code === 403) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');

          wx.showModal({
            title: '提示',
            content: '登录已过期，请重新登录',
            showCancel: false,
            success: () => {
              wx.redirectTo({
                url: '/pages/login/login'
              });
            }
          });
          reject(data);
          return;
        }

        // 请求成功
        if (data.code === 200) {
          resolve(data.data);
        } else {
          // 业务错误
          const errorMsg = data.message || '请求失败';

          // 不自动提示错误的情况
          if (!options.silent) {
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            });
          }

          reject({
            code: data.code,
            message: errorMsg,
            data: data.data
          });
        }
      },
      fail: (err) => {
        // 网络错误
        if (!options.silent) {
          wx.showToast({
            title: '网络错误，请检查网络连接',
            icon: 'none',
            duration: 2000
          });
        }
        reject({
          code: -1,
          message: '网络错误',
          error: err
        });
      }
    });
  });
}

/**
 * GET 请求
 * @param {string} url 接口路径
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} 请求结果
 */
function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST 请求
 * @param {string} url 接口路径
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} 请求结果
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT 请求
 * @param {string} url 接口路径
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} 请求结果
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE 请求
 * @param {string} url 接口路径
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} 请求结果
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 上传文件
 * @param {string} url 接口路径
 * @param {string} filePath 文件路径
 * @param {Object} formData 额外的表单数据
 * @returns {Promise} 上传结果
 */
function uploadFile(url, filePath, formData = {}) {
  const token = wx.getStorageSync('token');

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + url,
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);

          if (data.code === 200) {
            resolve(data.data);
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
            reject(data);
          }
        } catch (err) {
          reject({
            code: -1,
            message: '解析响应失败',
            error: err
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile
};
