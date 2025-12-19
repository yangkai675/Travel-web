// index.js
// pages/index/index.js
const auth = require('../../utils/auth');
const request = require('../../utils/request');
const regionData = require('../../utils/region-data');

Page({
  data: {
    // 起始地
    startPlaceColumns: [
      regionData.map(item => item.province),
      regionData[0].cities
    ],
    startPlaceIndex: [0, 0],

    // 目的地
    destPlaceColumns: [
      regionData.map(item => item.province),
      regionData[0].cities
    ],
    destPlaceIndex: [0, 0],

    // 出发日期
    departureDate: '',
    minDate: '',
    maxDate: '',

    // 游玩天数
    selectedDays: 3,

    // 人数选择
    peopleRange: Array.from({length: 50}, (_, i) => i + 1),
    peopleIndex: 1, // 默认2人

    // 出行方式
    transportOptions: ['火车', '高铁', '飞机', '自驾'],
    transportIndex: 1, // 默认高铁

    // 预算
    budget: '5000',

    // 备注
    remarks: ''
  },

  onLoad() {
    // 初始化日期范围
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1); // 最多可选一年后的日期

    this.setData({
      departureDate: this.formatDate(today),  // 默认出发日期为今天
      minDate: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    });
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 出发日期选择
  onDepartureDateChange(e) {
    this.setData({
      departureDate: e.detail.value
    });
  },

  // 起始地省份变化
  onStartColumnChange(e) {
    const { column, value } = e.detail;
    if (column === 0) {
      // 省份变化，更新城市列表
      const cities = regionData[value].cities;

      this.setData({
        'startPlaceColumns[1]': cities,
        'startPlaceIndex[0]': value,
        'startPlaceIndex[1]': 0
      });
    }
  },

  // 起始地确认选择
  onStartPlaceChange(e) {
    this.setData({
      startPlaceIndex: e.detail.value
    });
  },

  // 目的地省份变化
  onDestColumnChange(e) {
    const { column, value } = e.detail;
    if (column === 0) {
      // 省份变化，更新城市列表
      const cities = regionData[value].cities;

      this.setData({
        'destPlaceColumns[1]': cities,
        'destPlaceIndex[0]': value,
        'destPlaceIndex[1]': 0
      });
    }
  },

  // 目的地确认选择
  onDestPlaceChange(e) {
    this.setData({
      destPlaceIndex: e.detail.value
    });
  },

  // 游玩天数变化
  onDaysChange(e) {
    this.setData({
      selectedDays: e.detail.value
    });
  },

  // 人数选择
  onPeopleChange(e) {
    this.setData({
      peopleIndex: e.detail.value
    });
  },

  // 出行方式选择
  onTransportChange(e) {
    this.setData({
      transportIndex: e.detail.value
    });
  },

  // 预算输入
  onBudgetInput(e) {
    this.setData({
      budget: e.detail.value
    });
  },

  // 备注输入
  onRemarksInput(e) {
    this.setData({
      remarks: e.detail.value
    });
  },

  // 生成旅行攻略
  generateTrip() {
    // 获取起始地和目的地
    const startProvince = this.data.startPlaceColumns[0][this.data.startPlaceIndex[0]];
    const startCity = this.data.startPlaceColumns[1][this.data.startPlaceIndex[1]];
    const destProvince = this.data.destPlaceColumns[0][this.data.destPlaceIndex[0]];
    const destCity = this.data.destPlaceColumns[1][this.data.destPlaceIndex[1]];

    const departureDate = this.data.departureDate;
    const days = this.data.selectedDays;
    const people = this.data.peopleRange[this.data.peopleIndex];
    const transport = this.data.transportOptions[this.data.transportIndex];
    const budget = this.data.budget.trim();
    const remarks = this.data.remarks;

    // 验证起始地
    if (!startProvince || !startCity) {
      wx.showToast({ title: '请选择起始地', icon: 'none' });
      return;
    }

    // 验证目的地
    if (!destProvince || !destCity) {
      wx.showToast({ title: '请选择目的地', icon: 'none' });
      return;
    }

    // 验证起始地和目的地不能相同
    if (startProvince === destProvince && startCity === destCity) {
      wx.showToast({ title: '起始地和目的地不能相同', icon: 'none' });
      return;
    }

    // 验证出发日期
    if (!departureDate) {
      wx.showToast({ title: '请选择出发日期', icon: 'none' });
      return;
    }

    // 验证游玩天数
    if (!days || days < 1) {
      wx.showToast({ title: '请选择游玩天数', icon: 'none' });
      return;
    }

    // 验证人数
    if (!people || people < 1) {
      wx.showToast({ title: '请选择出行人数', icon: 'none' });
      return;
    }

    // 验证出行方式
    if (!transport) {
      wx.showToast({ title: '请选择出行方式', icon: 'none' });
      return;
    }

    // 验证预算
    if (!budget) {
      wx.showToast({ title: '请输入总预算', icon: 'none' });
      return;
    }

    const budgetNum = parseInt(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      wx.showToast({ title: '请输入有效的预算金额', icon: 'none' });
      return;
    }

    // 先检查登录状态
    const isLoggedIn = auth.checkLogin();
    const token = wx.getStorageSync('token');
    console.log('generateTrip - 登录状态:', isLoggedIn);
    console.log('generateTrip - token:', token);

    if (!isLoggedIn) {
      // 保存生成参数到本地存储（完整城市格式）
      wx.setStorageSync('pendingGenerate', {
        fromCity: startProvince + startCity,
        toCity: destProvince + destCity,
        startDate: departureDate,
        days,
        people,
        transport,
        budget: budgetNum,
        specialNeeds: remarks || ''
      });

      wx.showModal({
        title: '提示',
        content: '此功能需要登录后使用',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    // 已登录，调用后端接口生成攻略
    wx.showLoading({
      title: '正在生成攻略...',
      mask: true
    });

    // 拼接完整的城市格式：省份+城市
    const fromCityFull = startProvince + startCity;
    const toCityFull = destProvince + destCity;

    console.log('生成攻略参数:', {
      fromCity: fromCityFull,
      toCity: toCityFull,
      days,
      startDate: departureDate,
      people,
      transport,
      budget: budgetNum,
      specialNeeds: remarks || ''
    });

    // 调用生成接口
    request.post('/api/travel/plan/generate', {
      fromCity: fromCityFull,
      toCity: toCityFull,
      days: days,
      startDate: departureDate,
      people: people,
      transport: transport,
      budget: budgetNum,
      specialNeeds: remarks || ''
    })
    .then(planData => {
      wx.hideLoading();

      console.log('生成攻略成功:', planData);

      // 将攻略数据存储到本地，供详情页使用
      wx.setStorageSync('currentPlan', planData);

      // 跳转到详情页
      wx.navigateTo({
        url: `/pages/detail/detail?planId=${planData.id || ''}`
      });
    })
    .catch(error => {
      wx.hideLoading();
      console.error('生成攻略失败:', error);

      // 错误已经在 request.js 中统一处理了
      // 这里可以添加额外的错误处理逻辑
    });
  }
});
