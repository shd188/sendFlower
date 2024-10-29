// pages/index/index.js
Page({
    data: {
        isFirstVisit: false, // 默认不是第一次访问
        userInfo: [],
        users: [],
        showAuthorizedView: false,
        showAuthorizationPrompt: false, // 控制是否显示授权提示
        noFlowerData: false, // 控制是否显示空数据文案
        nickname: '', // 存储用户输入的昵称
        showNicknameInput: false, // 控制是否显示昵称输入框
        openId:'',
    },

    onLoad: async function () {
        const isFirstVisit = wx.getStorageSync('isFirstVisit') || false; // 获取存储的值，默认是 false
        console.log("isFirst--"+isFirstVisit);

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
            const res = await wx.cloud.callFunction({ name: 'login' }); // 获取当前用户的 openId
            const openId = res.result.openid;
console.log("userOpenId:"+openId);
            const userRecord = await wx.cloud.database().collection('users').where({openId:openId}).get().catch(() => null);
console.log("userRecord--"+userRecord.data+"length--"+userRecord.data.length);
            if (userRecord.data && userRecord.data.length > 0) {
                // 用户已存在，直接设置数据
                this.setData({
                    showAuthorizedView: true,
                    showAuthorizationPrompt: false,
                    userInfo: userRecord.data,
                });
                wx.setStorageSync('isFirstVisit', true); // 设置为已访问
                wx.setStorageSync('userInfo', userRecord.data[0]);
                await this.getFlowerData(); // 刷新数据
            } else {
                // 如果用户不存在，则显示输入框让用户输入昵称
                this.setData({
                    openId:openId,
                    showNicknameInput: true,
                }); 
            }
        } catch (error) {
            wx.showToast({
                title: '获取用户信息失败，请重试',
                icon: 'none'
            });
        }
    },

    // 新增方法：处理昵称输入
    handleNicknameInput(event) {
      // console.log("昵称："+event.detail.value);
        this.setData({
            nickname: event.detail.value,
        });
    },

    async saveUserData() {
        if (!this.data.nickname) {
            wx.showToast({
                title: '昵称不能为空',
                icon: 'none'
            });
            return;
        }

        const { openId, nickname } = this.data;
          console.log("存储----"+openId);
        const userData = {
            openId:openId,
            name: nickname,
            avatar: '', // 可以选择填入默认头像或留空
            acceptFlowerCount: 0,
            flowerCount: 5,
            createdAt: new Date() // 添加创建时间戳
        };

        // 存储用户信息到数据库
        await wx.cloud.database().collection('users').add({
            data: userData
        });

        wx.setStorageSync('isFirstVisit', true); // 设置为已访问
        wx.setStorageSync('userInfo', userData);

        this.setData({
            showAuthorizedView: true,
            showAuthorizationPrompt: false,
            showNicknameInput: false,
            userInfo: userData,
        });

        wx.showToast({
            title: '用户信息已保存',
            icon: 'success'
        });

        await this.getFlowerData(); // 刷新数据
    },

    async getFlowerData() {
        try {
            const res = await wx.cloud.callFunction({
                name: 'getFlowerData'
            });
            console.log("index---"+res);
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
        const users = this.data.users; // 假设 users 是你要传递的数据

        wx.navigateTo({
            url: `/pages/sendFlower/sendFlower?users=${JSON.stringify(users)}`
        });
    }
});
