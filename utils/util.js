
const app = getApp();
// const server_url = "http://localhost:7788"
const server_url = "https://lxtyin.ac.cn:7788"

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
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }
}

/**
 * 检查消息量，进行红点提示
 */
async function refresh_message() {
  var res = await request('/message/urnum', {
    user_id: app.global_data.user_id
  });
  if(res.count == 0){
    wx.removeTabBarBadge({
      index: 2,
    });
  } else {
    wx.setTabBarBadge({
      index: 2,
      text: `${res.count}`
    });
  }
}

/**
 * 给出提示
 * @param {*} msg 
 */
function hint(msg) {
  // 暂定
  wx.showToast({
    title: msg,
    icon: 'error'
  })
}

/**
 * 上传文件
 * @param tmppath 临时文件路径
 * @returns 永久文件路径
 */
async function upload_file(tmppath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      filePath: tmppath,
      name: 'file',
      url: server_url + '/upload',
      success(res) {
        if(res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.data));
        }
      },
      fail: e => { reject(e) }
    })
  })
}

/**
 * 执行post请求，传递json格式数据
 * @param {*} way url, start with /
 * @param {*} data json data
 * @returns {*} 返回json格式数据，若错误则返回err
 */
function request(way, data){
  if(!data.secret_id) data.secret_id = app.global_data.secret_id;
  return new Promise((resolve, reject) => {
    wx.request({
      url: server_url + way,
      data: data,
      method: 'POST',
      success(res) {
        if(res.statusCode == 200){
          resolve(res.data);
        } else if(res.statusCode == 500) {
          reject(new Error("服务端错误"));
        } else {
          reject(new Error(res.data));
        }
      },
      fail: e => { reject(e) }
    })
  })
}

module.exports.time_statement = time_statement
module.exports.upload_file = upload_file
module.exports.refresh_message = refresh_message;
module.exports.request = request
module.exports.hint = hint;
