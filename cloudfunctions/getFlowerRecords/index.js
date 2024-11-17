const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();
// 云函数示例（index.js）
exports.main = async (event, context) => {
  const { openId, type } = event; 
  let query;

  if (type === 'received') {
    query = db.collection('flowers').where({
      recipient_id: openId
    });
  } else if (type === 'sent') {
    query = db.collection('flowers').where({
      send_id: openId
    });
  }

  try {
    const res = await query.orderBy('date', 'desc').get();
    return { success: true, data: res.data }; 
  } catch (err) {
    return { success: false, error: err };
  }
};
