Page({
    data: {
        isRecipient: false,
        recipientName: '',
        sendName: '',
        giftQuantity: 0,
        giftWords: '',
        myId: ''
    },

    onLoad(options) {
        const {
            recipientId,
            recipientName,
            sendId,
            sendName,
            giftQuantity,
            giftWords,
            fromPage // 新增的参数
        } = options;

        const userInfo = wx.getStorageSync('userInfo');
        console.log("myId--" + userInfo.openId);
        // 打印获取到的参数
        console.log("Recipient ID:", recipientId);
        console.log("Recipient Name:", recipientName);
        console.log("Sender ID:", sendId);
        console.log("Sender Name:", sendName);
        console.log("Gift Quantity:", giftQuantity);
        console.log("Gift Words:", giftWords);

        // 判断当前页面是否是从 'record' 页面跳转来的
        if (fromPage === 'record') {
            // 如果是从 record 页面过来的，不判断接收人
            this.setData({
                myId: userInfo.openId,
                recipientName: decodeURIComponent(recipientName),
                sendName: decodeURIComponent(sendName),
                giftQuantity: parseInt(giftQuantity, 10),
                giftWords: decodeURIComponent(giftWords),
                isRecipient: true // 或设置为任何适当的值
            });
        } else {
            // 如果不是从 record 页面过来的，判断当前用户是否是接收人
            this.setData({
                myId: userInfo.openId,
                isRecipient: recipientId === userInfo.openId,
                recipientName: decodeURIComponent(recipientName),
                sendName: decodeURIComponent(sendName),
                giftQuantity: parseInt(giftQuantity, 10),
                giftWords: decodeURIComponent(giftWords),
            });
        }
    },

    goToIndex() {
      console.log("去首页");
        wx.reLaunch({
            url: '/pages/index/index', // 跳转到 index 页面
        });
    },
});
