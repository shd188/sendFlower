Page({
  data: {
    activeTab: 'received', // 当前激活的 Tab
    receivedFlowers: [], // 存储收到的花的数据
    sentFlowers: [], // 存储送出的花的数据
    loading: false // 新增 loading 状态
  },

  onLoad: function () {
    // 初始化时加载数据
    this.loadFlowers('received');
    this.loadFlowers('sent');
  },

  // 切换 Tab
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadFlowers(tab); // 切换 Tab 时加载相应的数据
  },

  // 根据当前 Tab 加载花的数
  loadFlowers: function (type) {
    this.setData({ loading: true }); // 设置 loading 状态为 true
    const userInfo = wx.getStorageSync('userInfo'); 
    const openId = userInfo.openId;

    wx.cloud.callFunction({
      name: 'getFlowerRecords',
      data: {
        openId: openId,
        type: type // 传递当前 Tab 的类型
      },
      success: res => {
        console.log("云函数返回的数据:", res.result.data); // 确认返回的数据

        if (res.result.success) {
          const data = res.result.data;

          if (Array.isArray(data)) {
            // 按时间倒序排列
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // 格式化时间并添加到每个 item 中
            data.forEach(item => {
              item.formattedDate = new Date(item.timestamp).toISOString().slice(0, 10);
            });

            if (type === 'received') {
              this.setData({ receivedFlowers: data });
            } else {
              this.setData({ sentFlowers: data });
            }
          } else {
            console.error('返回的数据不是数组:', data);
          }
        } else {
          console.error('查询失败：', res.result.error);
        }
      },
      fail: err => {
        console.error('调用云函数失败：', err);
      },
      complete: () => {
        this.setData({ loading: false }); // 设置 loading 状态为 false
      }
    });
  },

  // 进入分享花的页面
  navigateToShareFlower: function (event) {
    const flowerId = event.currentTarget.dataset.flowerId; // 获取花的ID
    const recipientId = event.currentTarget.dataset.recipient_id; // 获取花的ID
    const recipientName = event.currentTarget.dataset.recipient_name; // 获取收花人的名字
    const sendId = event.currentTarget.dataset.send_id; // 获取送花人的ID
    const sendName = event.currentTarget.dataset.send_name; // 获取送花人的名字
    const giftQuantity = event.currentTarget.dataset.quantity; // 获取花的数量
    const giftWords = event.currentTarget.dataset.giftwords; // 获取花的祝福语

    console.log("传递的参数:", {
      flowerId,
      recipientId,
      recipientName,
      sendId,
      sendName,
      giftQuantity,
      giftWords
    });
    
    wx.navigateTo({
      url: `/pages/shareFlower/shareFlower?recipientId=${recipientId}&recipientName=${recipientName}&sendId=${sendId}&sendName=${sendName}&giftQuantity=${giftQuantity}&giftWords=${giftWords}&fromPage=record`
    });
  }
});
