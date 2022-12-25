// pages/loin.js

const app = getApp();
const md5 = require("../../utils/md5.js")
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    email: "",
    code: "",
    t_code: "",
    sended: false
  },
  that: this,

  input_email(e) {
    this.setData({
      email: e.detail.value
    })
  },
  input_code(e) {
    this.setData({
      code: e.detail.value
    })
  },
  send() {
    // var pat = /\.edu\.cn$/
    // if(!this.data.email.match(pat)){
    //   wx.showToast({
    //     title: '需要学生邮箱！',
    //     icon: 'error'
    //   })
    //   return
    // }

    var that = this;
    wx.showLoading({
      title: '正在发送',
    })
    var t_code = Math.round(Math.random() * 900000 + 100000).toString();
    wx.cloud.callFunction({
      name: "send_email",
      data: {
        email: this.data.email,
        subject: 'Hszx Hole 验证码',
        content: "【HSZX-HOLE】您的验证码为：" + t_code
      },
      success(res) {
        wx.showToast({
          title: '发送成功',
        })
        that.setData({
          sended: true,
          t_code: md5.hexMD5(t_code)
        })
      },
      fail() {
        wx.showToast({
          title: '发送失败',
          icon: 'error'
        })
      },
      complete: () => wx.hideLoading()
    })
  },
  async loin() {
    if(md5.hexMD5(this.data.code) == this.data.t_code) {
      wx.showLoading()
      var id = md5.hexMD5(this.data.email);
      var res = await db.collection("user").where({
        secret_id: id
      }).get(); // 寻找该用户
      if(res.data.length == 0){
        wx.showLoading({
          title: '正在创建用户',
        })
        res = {
          secret_id: id,
          avatar: "../../img/mine.png",
          name: "默认马甲",
          star_post : [],
          upvote_post: [],
          upvote_comment: [],
          confirm_time: new Date()
        }
        await db.collection("user").add({ data: res })
      } else res = res.data[0]
      wx.hideLoading();
      wx.setStorageSync('loin', {secret_id: res.secret_id});
      app.global_data = res;
      wx.showToast({
        title: '登录成功',
        duration: 1000
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/hole/hole',
        })
      }, 1000);
    } else {
      wx.showToast({
        title: '验证码不对！',
        icon: 'error'
      })
    }
  },
  visit() {
    app.global_data.secret_id = "visit"
    wx.switchTab({
      url: '/pages/hole/hole',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideHomeButton();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})