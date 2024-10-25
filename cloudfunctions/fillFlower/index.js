// 补齐花花数量的云函数
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
    const users = await db.collection('users').get();
    const updatePromises = users.data.map(user => {
        return db.collection('users').doc(user._id).update({
            data: {
                flowerCount: user.flowerCount + 5 // 每人补齐5个花花
            }
        });
    });
    return await Promise.all(updatePromises);
};