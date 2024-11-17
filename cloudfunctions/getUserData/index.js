// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
    const { openId } = event;

    try {
        const res = await db.collection('users').where({
            openId: openId
        }).get();

        if (res.data.length > 0) {
            return res.data[0]; // 返回用户数据
        } else {
            return {};
        }
    } catch (err) {
        console.error(err);
        return {};
    }
};
