const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
    try {
        const users = await db.collection('users').get();
        return {
            success: true,
            data: users.data // 返回用户数据
        };
    } catch (error) {
        console.error("获取用户数据失败:", error);
        return {
            success: false,
            data: [] // 发生错误时返回空数组
        };
    }
};
