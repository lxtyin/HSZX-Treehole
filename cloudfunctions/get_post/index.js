// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 获取一个post
 * @param {*} event {post_id, user_id}
 */
exports.main = async (event) => {
  var res = await db.collection('post')
    .aggregate().match({
      _id: event.post_id,
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
    }).lookup({  // 得到starers列表
      from: 'star',
      let: {
        id: '$_id'
      },
      pipeline: $.pipeline().match(
        _.expr($.eq(['$$id', '$post_id']))
      ).project({
        _id: 0,
        is_self: $.eq(['$user_id', event.user_id]),
      }).done(),
      as: 'starers',
    }).lookup({     // 得到评论列表
      from: 'comment',
      localField: '_id',
      foreignField: 'post_id',
      as: 'comments',
    }).lookup({     // 补充user信息
      from: 'user',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user'
    }).addFields({      // 添加需要的字段
      upvote_num: $.size('$upvoters'),
      star_num: $.size('$starers'),
      comment_num: $.size('$comments'),
      upvoted: $.in([{is_self: true}, '$upvoters']),
      starred: $.in([{is_self: true}, '$starers']),
      user: $.arrayElemAt(['$user', 0]),
    }).project({    // 删除中间字段
      upvoters: 0,
      starers: 0,
    }).end();
  return res.list[0];
}