// pages/detail/detail.js
const auth = require('../../utils/auth');

Page({
  data: {
    city: '',
    days: 0,
    budget: 0,
    tripDays: []
  },

  onLoad(options) {
    // 检查登录状态，未登录则跳转到登录页
    if (!auth.requireLogin()) {
      return;
    }

    const { city, days, budget } = options;
    this.setData({ city, days: parseInt(days), budget: parseInt(budget) });

    // 模拟 AI 生成的行程（MVP 阶段）
    const mockTrip = this.generateMockTrip(city, days);

    this.setData({ tripDays: mockTrip });
  },

  generateMockTrip(city, days) {
    const items = [
      { time: '上午', name: '故宫', type: 'attraction', desc: '明清皇家宫殿，世界文化遗产', cost: 60, rating: 4.8 },
      { time: '中午', name: '四季民福', type: 'restaurant', desc: '老北京炸酱面', cost: 80, rating: 4.7 },
      { time: '晚上', name: '如家酒店(王府井)', type: 'hotel', desc: '经济舒适，近地铁', cost: 220, rating: 4.3 }
    ];

    const trip = [];
    for (let i = 0; i < days; i++) {
      trip.push({ day: i + 1, items: items.slice(0, 3) });
    }
    return trip;
  }
});