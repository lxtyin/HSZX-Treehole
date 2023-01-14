// pages/hole/hole.js

const app = getApp();
const util = require("../../utils/util")

const search_step = 5; // 每次搜到的数量

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    search_text: "",
    show_line2: false,
    options: {
      mine_only: false,
      star_only: false,
      method: "time",
    },
    current_count: 0,
  },

  input_search(e) {
    this.setData({
      search_text: e.detail.value
    })
  },
  show_line2() {
    this.setData({show_line2: true});
  },
  hide_line2() {
    this.setData({show_line2: false});
  },
  switch_option_mine() {
    this.setData({
      'options.mine_only': !this.data.options.mine_only
    })
    this.search();
  },
  switch_option_star() {
    this.setData({
      'options.star_only': !this.data.options.star_only
    })
    this.search();
  },
  switch_method() {
    if(this.data.options.method == 'time') this.setData({
       'options.method': 'fever'
    });
    else this.setData({ 
      'options.method': 'time'
    });
    this.search();
  },

  into_post(e) {
    wx.navigateTo({
      url: `../post/post?pid=${e.currentTarget.dataset.id}`,
    })
  },

  async search() {
    wx.showLoading();
    var ls = await util.request('/search/posts', {
      user_id: app.global_data.user_id,
      start: 0,
      count: search_step,
      search_text: this.data.search_text,
      options: this.data.options,
    })
    for(let i = 0; i < ls.length; i++){
      ls[i].post_time = new Date(ls[i].post_time);
      ls[i].time_statement = util.time_statement(ls[i].post_time);
    };
    this.setData({
      list: ls,
      current_count: search_step,
    });
    wx.hideLoading();
  },
  // 增量搜索
  async search_more() {
    wx.showLoading();
    var ls = await util.request('/search/posts', {
      user_id: app.global_data.user_id,
      start: this.data.current_count,
      count: search_step,
      search_text: this.data.search_text,
      options: this.data.options,
    })
    for(let i = 0; i < ls.length; i++){
      ls[i].post_time = new Date(ls[i].post_time);
      ls[i].time_statement = util.time_statement(ls[i].post_time);
    };
    this.setData({
      list: this.data.list.concat(ls),
      current_count: this.data.current_count + search_step,
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
    var options = app.global_data.switch_option ? app.global_data.switch_option : {};
    this.setData({
      search_text: '',
      options: {
        mine_only: options.mine_only ? options.mine_only : false,
        star_only: options.star_only ? options.star_only : false,
        method: options.method ? options.method : 'time',
      }
    });
    this.search();
    util.refresh_message();
    app.global_data.switch_option = {};
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
  async onPullDownRefresh() {
    await this.search();
    util.refresh_message();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.search_more();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})