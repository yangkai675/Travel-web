/**
 * 微信登录工具
 * 使用 wx.login 获取 code 发送给后端解析 openid 和 unionid
 */

const request = require('./request');
const { SERVER_IP } = require('../conf/s');

/**
 * 微信登录
 * 使用 wx.login 获取 code，后端解析获取 openid 和 unionid
 * @returns {Promise} 登录结果
 */
function login() {
  return new Promise((resolve, reject) => {
    console.log('=== 开始登录流程 ===');

    // 显示加载提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    // 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        console.log('wx.login 成功，code:', loginRes.code);

        if (loginRes.code) {
          // 调用后端登录接口
          console.log('准备调用后端接口:', SERVER_IP + '/user/login');
          console.log('请求参数:', { code: loginRes.code });

          request.post('/user/login', {
            code: loginRes.code    // wx.login 获取的 code
          })
          .then(data => {
            wx.hideLoading();

            // 存储 token 和用户信息
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('userInfo', data.userInfo);

            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500
            });

            resolve(data);
          })
          .catch(err => {
            wx.hideLoading();
            wx.showModal({
              title: '登录失败',
              content: err.message || '登录失败，请重试',
              showCancel: false
            });
            reject(err);
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '获取登录凭证失败',
            icon: 'none'
          });
          reject(new Error('获取登录凭证失败'));
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '获取登录凭证失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
function checkLogin() {
  const token = wx.getStorageSync('token');
  return !!token;
}

/**
 * 要求用户登录
 * 如果未登录，跳转到登录页
 * @returns {boolean} 是否已登录
 */
function requireLogin() {
  if (!checkLogin()) {
    wx.showModal({
      title: '提示',
      content: '此功能需要登录后使用',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return false;
  }
  return true;
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息
 */
function getUserInfo() {
  return wx.getStorageSync('userInfo') || null;
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');

  wx.showToast({
    title: '已退出登录',
    icon: 'success',
    duration: 1500
  });

  // 跳转到首页
  setTimeout(() => {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }, 1500);
}

/**
 * 检查 token 有效性
 * @returns {Promise<boolean>} token 是否有效
 */
function checkTokenValid() {
  return new Promise((resolve) => {
    const token = wx.getStorageSync('token');

    if (!token) {
      resolve(false);
      return;
    }

    request.post('/user/checkToken')
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        // Token 失效，清除本地存储
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        resolve(false);
      });
  });
}

module.exports = {
  SERVER_IP,
  login,
  checkLogin,
  requireLogin,
  getUserInfo,
  logout,
  checkTokenValid
};
