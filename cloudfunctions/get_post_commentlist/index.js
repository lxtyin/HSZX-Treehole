// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;
/**
 * 获取一个post的所有一级评论，并补充各种num，upvoted，user信息
 * @param { * } event {post_id, user_id}
 */
exports.main = async (event) => {
  var res = await db.collection("comment").aggregate()
    .match({
      level: 1,
      post_id: event.post_id
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
    }).lookup({ // 得到二三级评论列表
      from: 'comment',
      localField: '_id',
      foreignField: 'father_id',
      as: 'comments'
    }).lookup({ // 补充user信息
      from: 'user',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user',
    }).addFields({
      upvote_num: $.size('$upvoters'),
      comment_num: $.size('$comments'),
      upvoted: $.in([{is_self: true}, '$upvoters']),
      user: $.arrayElemAt(['$user', 0]),  // user换根
    }).project({
      upvoters: 0,
      comments: 0,
    }).end();
  return res.list;
}