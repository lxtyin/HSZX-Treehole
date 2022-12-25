// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();

/**
 * 获取一个post的所有一级评论，并补充user信息
 * @param {post_id} event 要获取的post的id 
 */
exports.main = async (event, context) => {
  var res = (await db.collection("comment").aggregate()
    .match({
      level: 1,
      post_id: event.post_id
    }).sort({
      comment_time: -1,
    }).lookup({
      from: 'user',
      localField: 'secret_id',
      foreignField: 'secret_id',
      as: 'user',
  }).end()).list;
  for(let i = 0;i < res.length;i++){
    res[i].user = {
      avatar: res[i].user[0].avatar,
      name: res[i].user[0].name,
    }
  }
  return res;
}