const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
    const { sendUserOpenId,sendUserName, recipientUserOpenId,recipientUserName, quantity, giftwords } = event;
console.log("sendUserOpenId:"+ sendUserOpenId);
console.log("sendUserName:"+ sendUserName);
console.log("recipientUserOpenId:"+ recipientUserOpenId);
console.log("recipientUserName:"+ recipientUserName);
console.log("quantity:"+ Number(quantity));
console.log("giftwords:"+ giftwords);
    try {
        // 1. 添加到 flowers 表
        const flowerAddRes = await db.collection('flowers').add({
            data: {
                send_id: sendUserOpenId,
                send_name:sendUserName,
                recipient_id: recipientUserOpenId,
                recipient_name:recipientUserName,
                quantity: Number(quantity),
                giftwords: giftwords,
                timestamp: new Date() // 添加时间戳
            }
        });

        // 2. 更新发送用户的 flowerCount
        
        const sendUserUpdateRes = await db.collection('users').where({
            _openid: sendUserOpenId // 根据 _opid 字段进行匹配
        }).update({
            data: {
                flowerCount: db.command.inc(-quantity) ,// 递减赠送的数量
                totalSendCount:db.command.inc(quantity)
            }
        });

        // 3. 更新接收用户的 acceptFlowerCount
        const recipientUserUpdateRes = await db.collection('users').where({_openid:recipientUserOpenId}).update({
            data: {
                acceptFlowerCount: db.command.inc(quantity),
                totalAcceptCount:db.command.inc(quantity)
            }
        });

        return {
            success: true,
            flowerAddRes,
            sendUserUpdateRes,
            recipientUserUpdateRes
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
};
