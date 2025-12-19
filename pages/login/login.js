// pages/login/login.js
const auth = require('../../utils/auth');

Page({
  data: {
    // 可以添加一些状态数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查是否已经登录
    this.checkIfLoggedIn();
  },

  /**
   * 检查是否已登录
   */
  checkIfLoggedIn() {
    if (auth.checkLogin()) {
      // 已登录，验证 token 是否有效
      auth.checkTokenValid().then(valid => {
        if (valid) {
          // Token 有效，直接返回上一页或跳转首页
          wx.showToast({
            title: '您已登录',
            icon: 'success',
            duration: 1500
          });

          setTimeout(() => {
            const pages = getCurrentPages();
            if (pages.length > 1) {
              wx.navigateBack();
            } else {
              wx.reLaunch({
                url: '/pages/index/index'
              });
            }
          }, 1500);
        }
      });
    }
  },

  /**
   * 微信授权登录
   */
  handleWxLogin() {
    console.log('开始微信授权登录');

    // 获取用户信息授权
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功:', res.userInfo);

        // 调用登录方法
        auth.login()
          .then(data => {
            console.log('登录成功，返回数据:', data);

            // 验证 token 是否已保存
            const savedToken = wx.getStorageSync('token');
            console.log('保存的 token:', savedToken);
            console.log('登录状态检查:', auth.checkLogin());

            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
              // 检查是否有待处理的生成请求
              const pendingGenerate = wx.getStorageSync('pendingGenerate');
              console.log('待处理的生成请求:', pendingGenerate);

              if (pendingGenerate) {
                // 清除待处理的请求
                wx.removeStorageSync('pendingGenerate');

                // 直接跳转到详情页
                const {
                  startProvince,
                  startCity,
                  destProvince,
                  destCity,
                  days,
                  people,
                  transport,
                  budget,
                  remarks
                } = pendingGenerate;

                const params = `startProvince=${startProvince}&startCity=${startCity}&destProvince=${destProvince}&destCity=${destCity}&days=${days}&people=${people}&transport=${transport}&budget=${budget}&remarks=${encodeURIComponent(remarks || '')}`;
                wx.redirectTo({
                  url: `/pages/detail/detail?${params}`
                });
              } else {
                // 没有待处理的请求，返回上一页或首页
                this.navigateBack();
              }
            }, 1500);
          })
          .catch(err => {
            console.error('登录失败:', err);
          });
      },
      fail: (err) => {
        console.log('用户取消授权:', err);

        if (err.errMsg.includes('deny')) {
          wx.showModal({
            title: '提示',
            content: '需要授权才能登录使用完整功能哦',
            showCancel: false,
            confirmText: '我知道了'
          });
        } else {
          wx.showToast({
            title: '授权失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 登录成功后跳转
   */
  navigateBack() {
    const pages = getCurrentPages();

    // 如果是从其他页面进入的，返回上一页
    if (pages.length > 1) {
      wx.navigateBack({
        success: () => {
          // 返回上一页后，可以通知页面刷新数据
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.onShow) {
            prevPage.onShow();
          }
        }
      });
    }
    // 如果是直接打开的登录页，跳转到首页
    else {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 查看用户协议
   */
  viewAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里应该显示用户协议内容。\n\n实际项目中，您可以创建一个单独的页面来展示详细的用户协议。',
      showCancel: false,
      confirmText: '知道了'
    });

    // 如果有单独的协议页面，可以这样跳转：
    // wx.navigateTo({
    //   url: '/pages/agreement/agreement'
    // });
  },

  /**
   * 查看隐私政策
   */
  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里应该显示隐私政策内容。\n\n我们将严格保护您的个人信息安全，手机号仅用于账号登录和身份验证。',
      showCancel: false,
      confirmText: '知道了'
    });

    // 如果有单独的隐私页面，可以这样跳转：
    // wx.navigateTo({
    //   url: '/pages/privacy/privacy'
    // });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时可以做一些处理
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '智行攻略 - AI 智能旅行规划',
      path: '/pages/index/index'
    };
  }
});
