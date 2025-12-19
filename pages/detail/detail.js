// pages/detail/detail.js
Page({
  data: {
    planId: '',
    fromCity: '',
    toCity: '',
    days: 0,
    people: 0,
    transport: '',
    budget: 0,
    specialNeeds: '',
    planContent: '', // 后端返回的完整攻略内容
    tripDays: []
  },

  onLoad(options) {
    const { planId } = options;

    // 从本地存储读取后端返回的攻略数据
    const planData = wx.getStorageSync('currentPlan');

    console.log('详情页接收到的数据:', planData);

    if (planData) {
      // 解析后端返回的数据并设置到页面
      this.parsePlanData(planData);
    } else {
      wx.showToast({
        title: '获取攻略失败',
        icon: 'none'
      });
    }
  },

  // 解析后端返回的攻略数据
  parsePlanData(planData) {
    // 根据后端实际返回的数据结构进行解析
    // 这里需要根据你的后端返回格式调整
    this.setData({
      planId: planData.id || '',
      fromCity: planData.fromCity || '',
      toCity: planData.toCity || '',
      days: planData.days || 0,
      people: planData.people || 0,
      transport: planData.transport || '',
      budget: planData.budget || 0,
      specialNeeds: planData.specialNeeds || '',
      planContent: planData.planContent || planData.content || '', // 攻略内容
    });

    // 如果后端返回的是结构化的每日行程数据
    if (planData.dailyPlans && Array.isArray(planData.dailyPlans)) {
      this.setData({
        tripDays: planData.dailyPlans
      });
    } else if (planData.itinerary && Array.isArray(planData.itinerary)) {
      this.setData({
        tripDays: planData.itinerary
      });
    } else {
      // 如果后端返回的是纯文本，尝试解析或直接显示
      console.log('后端返回的攻略内容:', this.data.planContent);

      // 可以尝试将文本内容按天分割
      this.parseTextContent(this.data.planContent);
    }
  },

  // 解析文本格式的攻略内容
  parseTextContent(content) {
    if (!content) return;

    // 简单的文本解析示例，根据实际格式调整
    const lines = content.split('\n');
    const tripDays = [];
    let currentDay = null;

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // 检测是否是新的一天（例如：第1天、Day 1等）
      const dayMatch = line.match(/第(\d+)天|Day\s*(\d+)/i);
      if (dayMatch) {
        if (currentDay) {
          tripDays.push(currentDay);
        }
        currentDay = {
          day: parseInt(dayMatch[1] || dayMatch[2]),
          items: [],
          content: '' // 存储原始文本
        };
      } else if (currentDay) {
        // 将内容添加到当前天
        currentDay.content += line + '\n';
      }
    });

    if (currentDay) {
      tripDays.push(currentDay);
    }

    if (tripDays.length > 0) {
      this.setData({ tripDays });
    }
  }
});