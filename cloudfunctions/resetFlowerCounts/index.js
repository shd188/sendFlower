// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前环境
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 首先获取所有用户信息
    const allUsers = await db.collection('users').get();
    
    // 遍历所有用户并更新
    const updatePromises = allUsers.data.map(user => {
      return db.collection('users').doc(user._id).update({
        data: {
          acceptFlowerCount: 0,
          flowerCount: 5
        }
      });
    });

    // 等待所有更新完成
    await Promise.all(updatePromises);

    return {
      success: true,
      updated: allUsers.data.length // 返回更新的记录数量
    };
  } catch (error) {
    console.error("Error updating user counts:", error);
    return {
      success: false,
      error: error
    };
  }
};
