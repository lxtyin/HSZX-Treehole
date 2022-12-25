// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();

/**
 * 获取一个一级评论下的所有二、三级评论，并补充user信息
 * @param {father_id} event 要获取的一级评论id
 */
exports.main = async (event, context) => {
  const _ = db.command;
  var res = (await db.collection("comment").aggregate()
    .match({
      level: _.gt(1),
      father_id: event.father_id
    }).sort({
      comment_time: -1
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