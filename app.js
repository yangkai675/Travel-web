// app.js
App({
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 如果有 token，验证其有效性
      const auth = require('./utils/auth');
      auth.checkTokenValid().then(valid => {
        if (valid) {
          this.globalData.userInfo = auth.getUserInfo();
        }
      });
    }
  },

  globalData: {
    userInfo: null
  }
})
