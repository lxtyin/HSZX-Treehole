
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

module.exports.time_statement = time_statement
module.exports.upload_file = upload_file
