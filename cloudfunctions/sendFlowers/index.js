// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();

exports.main = async (event, context) => {
    const { toUserId, quantity, message } = event;

    // 添加赠送记录
    await db.collection('flowers').add({
        data: {
            toUserId,
            quantity,
            message,
            timestamp: new Date()
        }
    });

    // 更新接受者的花花数量
    await db.collection('users').doc(toUserId).update({
        data: {
            flowerCount: db.command.inc(quantity) // 增加花花数量
        }
    });

    // 可以选择发送通知给被选中的人
    // 这里可以使用云开发的消息推送功能
};