Page({
    data: {
        users: [],                // 从 index 页面传过来的用户数据
        userNames: [],            // 用于显示在第一个选择器中的用户名称
        flowerCount: 0,           // 当前用户的花花数量
        quantityOptions: [],      // 递减的数量列表
        selectedUser: '',         // 选择的用户索引
        selectedQuantity: -1,      // 默认选择的数量索引
        giftwords: '',            // 输入的留言
        canSend: false,           // 按钮是否可用
        // 下个页面传的参数
        recipientId: '',          // 接收人的 ID
        recipientName: '',        // 接收人的名字
        senderId: '',             // 发送人的 ID
        senderName: '',           // 发送人的名字
        giftQuantity: 0,          // 赠送的小红花数量
        giftWords: '',            // 赠送的语句
        myId: '',                 // 当前用户的 ID，可能是用户的 OpenID
        showShareDialog: false,   // 控制分享对话框的显示
    },

    onLoad(options) {
        wx.showShareMenu({
            withShareTicket: true // 可以选择是否需要分享的票据
        });

        if (options.users) {
            try {
                const users = JSON.parse(options.users);
                this.setData({
                    users: users,
                    userNames: users.map(user => user.name), // 提取用户名称
                });

                // 获取当前用户的 openid
                const userInfo = wx.getStorageSync('userInfo'); // 假设 
                const currentUserOpenId = userInfo.openId;

                console.log("currentUserOpenId----" + currentUserOpenId);
                // openid 存储在本地
                const currentUser = users.find(user => user.openId === currentUserOpenId);
                console.log("currentUser----" + currentUser.name);
                if (currentUser) {
                    this.setData({
                        flowerCount: currentUser.flowerCount,
                        quantityOptions: Array.from({ length: currentUser.flowerCount }, (_, i) => i + 1)
                    });
                }
            } catch (error) {
                console.error("解析用户数据失败:", error);
            }
        }

        this.updateButtonState();
    },

    onUserChange(event) {
        console.log("onUser------" + event.detail.value);
        this.setData({
            selectedUser: event.detail.value
        });
        this.updateButtonState();
    },

    onQuantityChange(event) {
        this.setData({
            selectedQuantity: event.detail.value
        });
        this.updateButtonState();
    },

    onInputChange(event) {
        this.setData({
            giftwords: event.detail.value
        });
        this.updateButtonState();
    },

    updateButtonState() {
        console.log("----" + this.data.selectedUser + "--" + this.data.selectedQuantity + "--" + this.data.giftwords);

        const { selectedUser, quantityOptions, selectedQuantity, giftwords } = this.data;
        this.setData({
            canSend: selectedUser !== '' && quantityOptions[selectedQuantity] !== '' && giftwords.trim() !== ''
        });
    },

    async sendFlower() {
        const { users, selectedUser, selectedQuantity, giftwords, quantityOptions } = this.data;
        const quantity = quantityOptions[selectedQuantity];
        const sendUserOpenId = wx.getStorageSync('userInfo').openId; // 当前用户的 openid
        const sendUser = users.find(user => user.openId === sendUserOpenId); // 送花人
        const recipientUser = users[selectedUser]; // 收花人

        if (!sendUser || !sendUser.openId) {
            wx.showToast({
                title: "送花人信息无效",
                icon: "none"
            });
            return;
        }

        if (!recipientUser || !recipientUser.openId) {
            wx.showToast({
                title: "接收人信息无效",
                icon: "none"
            });
            return;
        }

        if (Number(sendUser.flowerCount) < Number(quantity)) {
            wx.showToast({
                title: "花花数量不足",
                icon: "none"
            });
            return;
        }
        // 显示 loading 提示
        wx.showLoading({
            title: '正在发送...',
            mask: true // 遮罩层，防止用户操作
        });
        try {
            // 1. 调用云函数添加记录并更新用户信息
            const cloudFunctionRes = await wx.cloud.callFunction({
                name: 'sendFlowers',
                data: {
                    sendUserOpenId: sendUserOpenId,              // 发送用户的 ID
                    recipientUserOpenId: recipientUser.openId,   // 接收用户的 ID
                    quantity: Number(quantity),                     // 赠送的花花数量
                    giftwords: giftwords                           // 赠送的留言
                }
            });

            if (!cloudFunctionRes.result.success) {
                throw new Error("更新用户花花数量失败");
            }

            // 2. 数据库操作成功后，更新 currentUser.flowerCount,设置分享内容

            sendUser.flowerCount -= quantity; // 从发送用户的花花数量中减去
            this.setData({
                flowerCount: sendUser.flowerCount,
                quantityOptions: Array.from({ length: sendUser.flowerCount }, (_, i) => i + 1) ,// 更新数量选项
                recipientId: recipientUser.openId,      // 接收人的 ID
                recipientName: recipientUser.name,       // 接收人的名字
                senderId: sendUserOpenId,                // 发送人的 ID
                senderName: sendUser.name,               // 发送人的名字
                giftQuantity: quantity,                   // 赠送的小红花数量
                giftWords: giftwords,                     // 赠送的语句
                showShareDialog:true,
            });
        } catch (error) {
            console.error("数据库操作失败:", error);
            wx.showToast({
                title: "赠送失败，请重试",
                icon: "none"
            });
        } finally {
            // 无论成功或失败，都要隐藏 loading 提示
            wx.hideLoading();
        }
    },

    onShareAppMessage() {
    
        const { recipientId, recipientName, senderId, senderName, giftQuantity, giftWords, myId } = this.data;
        
        return {
            title: `我赠送给 ${recipientName} ${giftQuantity} 朵小红花！`,
            path: `/pages/shareFlower/shareFlower?recipientId=${recipientId}&recipientName=${encodeURIComponent(recipientName)}&senderId=${senderId}&senderName=${encodeURIComponent(senderName)}&giftQuantity=${giftQuantity}&giftWords=${encodeURIComponent(giftWords)}`,
            imageUrl: '/asset/flower.png', // 自定义分享的图片
        };
        hideShareDialog();
    },

    hideShareDialog() {
        this.setData({
            showShareDialog: false,
        });
        this.resetPageState();
        this.updateButtonState();
    },

    resetPageState() {
        this.setData({
            selectedUser: '',
            selectedQuantity: -1,
            giftWords: '',
        });

        // 刷新页面，重新调用 onLoad
        // wx.reLaunch({
        //     url: '/pages/sendFlower/sendFlower', // 跳转到 sendFlower 页
        // });
    },
    showShareModel(){
      wx.showModal({
                title: '快去告诉你的朋友吧！',
                content: '',
                showCancel: true,
                cancelText: '取消',
                confirmText: '分享',
                success: (res) => {
                    if (res.confirm) {
                        // 用户点击了分享按钮
                        wx.showToast({
                            title: '分享成功',
                            icon: 'success',
                            duration: 2000
                        });
                        this.onShareAppMessage();
                    } else if (res.cancel) {
                        // 用户点击了取消按钮
                        this.hideShareDialog();
                    }
                }
            });
    }

});
