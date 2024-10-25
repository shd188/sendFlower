Page({
    data: {
        isRecipient: false,
        recipientName: '',
        senderName: '',
        giftQuantity: 0,
        giftWords: '',
    },

    onLoad(options) {
       const {
            recipientId,
            recipientName,
            senderId,
            senderName,
            giftQuantity,
            giftWords,
            myId,
        } = options;

console.log(options);
        // 判断当前用户是否是接收人
        this.setData({
            isRecipient: recipientId === myId,
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
