// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 获取一个一级评论下的所有二、三级评论，并补充num, upvoted, user, reply_user等信息
 * @param { * } event {comment_id, user_id}
 */
exports.main = async (event) => {
  var res = await db.collection("comment").aggregate()
    .match({
      father_id: event.comment_id
    }).sort({
      comment_time: -1,
    }).lookup({  // 得到upvoters列表
      from: 'upvote',
      let: {
        id: '$_id'
      },
      pipeline: $.pipeline().match(
        _.expr($.eq(['$$id', '$target_id']))
      ).project({
        _id: 0,
        is_self: $.eq(['$user_id', event.user_id]),
      }).done(),
      as: 'upvoters',
    }).lookup({ // 补充user信息
      from: 'user',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user',
    }).lookup({
      from: 'user',
      localField: 'reply_id',
      foreignField: '_id',
      as: 'reply_user',
    }).addFields({
      upvote_num: $.size('$upvoters'),
      upvoted: $.in([{is_self: true}, '$upvoters']),
      user: $.arrayElemAt(['$user', 0]),  // user换根
      reply_user: $.arrayElemAt(['$reply_user', 0]),
    }).project({
      upvoters: 0,
    }).end();
  return res.list;
}