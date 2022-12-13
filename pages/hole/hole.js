// pages/hole/hole.js

const app = getApp();
const time = require("../../utils/time")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {
        title: "2022 年卡塔尔世界杯半决赛阿根廷 vs 克罗地亚，本场比赛有哪些看点？",
        post_time: new Date(),
        time_statement: "",
        content: "内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容",
        tags: ["新闻"]
      },
      {
        title: "标题",
        post_time: new Date(),
        time_statement: "",
        content: "内容 yeah yeah yeah",
        tags: ["情感"]
      },
      {
        title: "标题",
        post_time: new Date(""),
        time_statement: "",
        content: "内容 yeah yeah yeah",
        tags: []
      }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    for(let i = 0; i < this.data.list.length; i++){
      this.setData({
        ['list[' + i + '].post_time']: new Date()
      });
      this.setData({
        ['list[' + i + '].time_statement']: time.time_statement(this.data.list[i].post_time)
      });
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