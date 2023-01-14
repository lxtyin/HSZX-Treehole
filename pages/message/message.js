// pages/message/message.js

const app = getApp();
const util = require("../../utils/util")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },

  click_link(e) {
    util.request('/message/read', {
      message_id: e.currentTarget.dataset.mid
    })
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  async del_message(e) {
    await util.request('/message/del', {
      message_id: e.currentTarget.dataset.mid
    });
    wx.showToast({
      title: '删除成功',
    })
    this.onShow();
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
  async onShow() {
    var ls = await util.request('/message/list', {
      user_id: app.global_data.user_id,
    }).catch(e => {
      util.hint(e.message);
      throw e;
    });
    for(let i = 0; i < ls.length; i++){
      ls[i].message_time = new Date(ls[i].message_time);
      ls[i].time_statement = util.time_statement(ls[i].message_time);
    };
    this.setData({
      list: ls
    });
    util.refresh_message();
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