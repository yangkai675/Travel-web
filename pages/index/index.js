// index.js
// pages/index/index.js
Page({
  data: {
    cities: ['北京市', '上海市', '成都市'],
    cityIndex: 0,
    selectedDays: 3,
    budget: '1000'
  },

  onCityChange(e) {
    this.setData({ cityIndex: e.detail.value });
  },

  selectDays(e) {
    this.setData({ selectedDays: e.currentTarget.dataset.days });
  },

  onBudgetInput(e) {
    this.setData({ budget: e.detail.value });
  },

  generateTrip() {
    const city = this.data.cities[this.data.cityIndex];
    const days = this.data.selectedDays;
    const budget = parseInt(this.data.budget) || 1000;

    if (budget <= 0) {
      wx.showToast({ title: '请输入有效预算', icon: 'none' });
      return;
    }

    // 跳转到详情页（MVP 先模拟数据）
    wx.navigateTo({
      url: `/pages/detail/detail?city=${city}&days=${days}&budget=${budget}`
    });
  }
});
