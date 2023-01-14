// pages/loin.js

const app = getApp();
const util = require("../../utils/util");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    email: "",
    code: "",
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
  async send() {
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
    await util.request('/loin/send', {
      email: this.data.email,
    }).catch(e => {
      util.hint('发送失败！');
      throw e;
    });
    wx.showToast({
      title: '发送成功',
    })
    that.setData({
      sended: true
    })
  },
  // 使用邮箱验证码登录
  async login_by_code() {
    wx.showLoading()
    var res = await util.request("/loin/bycode", {
      email: this.data.email,
      code: this.data.code,
    }).catch(e => {
      util.hint(e.message);
      throw e;
    })
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
  },

  // 使用微信登录
  async login_by_wx() {
    wx.login({
      async success(ress) {
        var res = await util.request('/loin/bywx', {
          wxcode: ress.code,
        }).catch(e => {
          util.hint(e.message);
          throw e;
        })
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
      }
    })
  },

  visit() {
    app.global_data = {
      user_id: "visit",
      secret_id: "visit",
      avatar: "../../img/mine.png",
      name: "访客",
    }
    wx.switchTab({
      url: '/pages/hole/hole',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if(options.switch) return; // 切换账号时使用
    // 使用缓冲secret_id登录
    let l = wx.getStorageSync('loin')
    if(l.secret_id){
      var res = await util.request('/loin/bysid', {
        secret_id: l.secret_id,
      });
      app.global_data = res;
      wx.switchTab({
        url: '/pages/hole/hole',
      })
    }
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  async onUnload() {
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