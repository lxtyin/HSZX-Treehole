
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

/**
 * 将Date类型转为一个描述（'刚刚', '1小时前'等)
 * @param date 
 */
function time_statement(date) {
  var nd = new Date();
  var sec = (nd - date) / 1000;
  if (sec < 60) {
      return "刚刚"
  } else if (sec < 3600) {
      return Math.round(sec / 60) + "分钟前";
  } else if (sec < 3600 * 24) {
      return Math.round(sec / 3600) + "小时前";
  } else if (nd.getFullYear() == date.getFullYear()){
      return (date.getMonth() + 1) + '-' + date.getDate();
  } else {
    return date.getFullYear() + (date.getMonth() + 1) + '-' + date.getDate();
  }
}

/**
 * 上传文件
 */
function randname() {
  let str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 17; i > 0; --i) {
    randomStr += str[Math.floor(Math.random() * str.length)];
  }
  var date = new Date();
  return randomStr + (date.getMonth() + 1) + '-' + date.getDate();
}

// 以下为各种增删查改方法
// 都使用async await方式，异常直接抛出，不作处理
// 暂不使用事务（wx的事务有点逆天） 都采用先更改数据，再更新num值的办法，最多只有num值错。

/**
 * 上传文件
 * @param path 临时文件路径
 * @returns fileID
 */
async function upload_file(path) {
  wx.showLoading()
  let suffix = /\.\w+$/.exec(path)[0];
  var res = await wx.cloud.uploadFile({
    cloudPath: "hszxhole-photos/" + randname() + suffix,
    filePath: path,
  });
  wx.hideLoading();
  return res.fileID;
}

/**
 * 发送一条评论
 * @param reply 除了_id外，一条完整的comment记录
 * @returns _id
 */
async function send_comment(reply) {
  wx.showLoading()
  var res = (await db.collection('comment').add({
    data: reply
  }))._id;
  await db.collection('post').doc(reply.post_id).update({
    data: {
      comment_num: _.inc(1)
    }
  })
  if(reply.level > 1) {
    await db.collection('comment').doc(reply.father_id).update({
      data: {
        comment_num: _.inc(1)
      }
    })
  }
  wx.hideLoading();
  return res;
}

/**
 * 点赞post
 * @param id 
 */
async function upvote_post(id) {
  await db.collection('user').where({
    secret_id: app.global_data.secret_id
  }).update({
    data: {
      upvote_post: _.push(id)
    }
  })
  app.global_data.upvote_post.push(id);
  await db.collection('post').doc(id).update({
    data: {
      upvote_num: _.inc(1)
    }
  })
}

/**
 * 收藏post
 * @param id 
 */
async function star_post(id) {
  await db.collection('user').where({
    secret_id: app.global_data.secret_id
  }).update({
    data: {
      star_post: _.push(id)
    }
  })
  app.global_data.star_post.push(id);
  await db.collection('post').doc(id).update({
    data: {
      star_num: _.inc(1)
    }
  })
}

/**
 * 点赞comment
 * @param id 
 */
async function upvote_comment(id) {
  await db.collection('user').where({
    secret_id: app.global_data.secret_id
  }).update({
    data: {
      upvote_comment: _.push(id)
    }
  })
  app.global_data.upvote_comment.push(id);
  await db.collection('comment').doc(id).update({
    data: {
      upvote_num: _.inc(1)
    }
  })
}

module.exports.time_statement = time_statement
module.exports.upload_file = upload_file
module.exports.send_comment = send_comment
module.exports.upvote_post = upvote_post
module.exports.star_post = star_post
module.exports.upvote_comment = upvote_comment
