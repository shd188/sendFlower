Page({
    data: {
        isRecipient: false,
        recipientName: '',
        senderName: '',
        giftQuantity: 0,
        giftWords: '',
        myId:''
    },

    onLoad(options) {
       const {
            recipientId,
            recipientName,
            senderId,
            senderName,
            giftQuantity,
            giftWords
        } = options;

        const userInfo = wx.getStorageSync('userInfo');
         console.log("myId--"+userInfo.openId);
          // 打印获取到的参数
        console.log("Recipient ID:", recipientId);
        console.log("Recipient Name:", recipientName);
        console.log("Sender ID:", senderId);
        console.log("Sender Name:", senderName);
        console.log("Gift Quantity:", giftQuantity);
        console.log("Gift Words:", giftWords);
        // 判断当前用户是否是接收人
        this.setData({
            myId : userInfo.openId,
            isRecipient: recipientId === userInfo.openId,
            recipientName: decodeURIComponent(recipientName),
            senderName: decodeURIComponent(senderName),
            giftQuantity: parseInt(giftQuantity, 10),
            giftWords: decodeURIComponent(giftWords),
        }); 
    },

    goToIndex() {
        wx.redirectTo({
            url: '/pages/index/index', // 跳转到 index 页面
        });
    },
});
