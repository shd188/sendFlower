// pages/index/index.js
Page({
    data: {
        isFirstVisit: false, // 默认不是第一次访问
        userInfo:[],
        users: [],
        showAuthorizedView: false,
        showAuthorizationPrompt: false, // 控制是否显示授权提示
        noFlowerData: false, // 控制是否显示空数据文案
    },

    onLoad: async function () {
        const isFirstVisit = wx.getStorageSync('isFirstVisit') || false; // 获取存储的值，默认是 false

        // 判断用户是否第一次访问
        if (!isFirstVisit) {
            this.setData({ 
                isFirstVisit: true,
                showAuthorizationPrompt: true // 显示授权提示
            });
        } else {
            this.setData({ isFirstVisit: false });
            await this.getFlowerData(); // 获取花花数据
        }
    },

    async authorizeUser() {
        try {
            const userProfile = await wx.getUserProfile({
                desc: '获取用户信息', // 授权描述
            });

            const { nickName, avatarUrl,acceptFlowerCount,flowerCount } = userProfile.userInfo;

            // 获取当前用户的 openId
            const res = await wx.cloud.callFunction({
                name: 'login'
            });

            const openId = res.result.openid;
            // 获取数据库实例
            const db = wx.cloud.database();

            // 检查用户是否已经存在
            const userRecord = await db.collection('users').doc(openId).get().catch(() => null);

            // 用户数据
            const userData = {
                 _id: openId,
                name: nickName,
                avatar: avatarUrl,
                acceptFlowerCount:0,
                flowerCount:5,
                createdAt: new Date() // 添加创建时间戳
            };
            
            if (!userRecord) {
                // 如果用户不存在，则新增
                await db.collection('users').add({
                    data: userData
                });
            }

            // 标记为已访问
            wx.setStorageSync('isFirstVisit', true); // 如果授权成功，设置为 true
            wx.setStorageSync('userInfo', userData);
            this.setData({ 
                showAuthorizedView: true,
                showAuthorizationPrompt: false // 隐藏授权提示
            });

            wx.showToast({
                title: '用户信息已保存',
                icon: 'success'
            });

            // 刷新数据
            await this.getFlowerData();
        } catch (error) {
            wx.showToast({
                title: '授权失败，请重试',
                icon: 'none'
            });
        }
    },

    async getFlowerData() {
    try {
        const res = await wx.cloud.callFunction({
            name: 'getFlowerData'
        });

        // 检查 res 是否存在
        if (res && res.result) {
            if (res.result.success) {
                const users = res.result.data;

                if (users.length === 0) {
                    this.setData({
                        noFlowerData: true,
                        showAuthorizedView: true
                    });
                } else {
                    this.setData({
                        users: users,
                        showAuthorizedView: true,
                        noFlowerData: false
                    });
                }
            } else {
                wx.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                });
            }
        } else {
            wx.showToast({
                title: '请求返回无效',
                icon: 'none'
            });
        }
    } catch (error) {
        console.error("云函数调用失败:", error);
        wx.showToast({
            title: '请求失败',
            icon: 'none'
        });
    }
},
 

    sendFlower() {
        // 假设获取了用户数据
          const users = this.data.users; // 假设 users 是你要传递的数据

          wx.navigateTo({
              url: `/pages/sendFlower/sendFlower?users=${JSON.stringify(users)}`
          });
    }
});
