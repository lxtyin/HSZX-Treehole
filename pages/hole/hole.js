// pages/hole/hole.js

const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  into_post(e) {
    wx.navigateTo({
      url: `../post/post?id=${e.currentTarget.dataset.id}`,
    })
  },

  async search() {
    wx.showLoading();
    // var res = await db.collection("post").orderBy('post_time', 'desc').limit(10).get();
    var ls = (await wx.cloud.callFunction({
      name: 'get_postlist',
      data: {
        user_id: app.global_data._id
      }
    })).result;
    for(let i = 0; i < ls.length; i++){
      ls[i].post_time = new Date(ls[i].post_time);
      ls[i].time_statement = util.time_statement(ls[i].post_time);
    };
    this.setData({
      list: ls
    });
    wx.hideLoading();
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
    this.search();
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
    this.onLoad();
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