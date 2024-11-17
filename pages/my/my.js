Page({
    data: {
        userInfo: {
            avatar: '/assets/default-avatar.jpg', // 默认头像
            name: '用户昵称',
            totalSendCount: 0,
            totalAcceptCount: 0
        }
    },

    onLoad: function () {
        this.loadUserData();
    },

    loadUserData: function () {
        const openId = wx.getStorageSync("userInfo").openId;

        wx.cloud.callFunction({
            name: 'getUserData',
            data: { openId: openId },
            success: res => {
                if (res.result) {
                    const userData = res.result;
                    this.setData({
                        userInfo: {
                            avatar: userData.avatar || '/assets/default-avatar.png', // 使用 avatar 字段
                            name: userData.name || '用户昵称', // 使用 name 字段
                            totalSendCount: userData.totalSendCount || 0, // 使用 totalSendCount 字段
                            totalAcceptCount: userData.totalAcceptCount || 0 // 使用 totalAcceptCount 字段
                        }
                    });
                }
            },
            fail: err => {
                console.error(err);
            }
        });
    },

    goToSendFlowers: function () {
        // 跳转到送花页面的逻辑
    },

    goToReceivedFlowers: function () {
        // 跳转到收到花页面的逻辑
    }
});
