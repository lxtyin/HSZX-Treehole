// pages/post/post.js

const app = getApp();
const db = wx.cloud.database();
const util = require("../../utils/util")

Page({

  /**
   * 页面的初始数据
   * 结构：comment_1: [
   *  {
   *    comment info..
   *    user: {}
   *    comment_23 [
   *      {
   *        comment info..
   *        user: {}
   *        reply_user: {}
   *      }
   *    ]
   *  },
   *  {...}
   * ]
   */
  data: {
    fold_comment: true,
    comment_1: [],
    // 当前回复状态
    reply: {
      level: "",
      content: "",
      father_id: "",
      reply_id: "",
      holder: "和平讨论，不带节奏"
    },

    focus_reply: false,
  },

  input_reply(e) {
    this.setData({
      "reply.content": e.detail.value
    })
  },
  //设置回复主贴
  set_reply_post() {
    this.setData({
      reply: {
        level: 1,
        content: "",
        father_id: this.data._id,
        reply_id: "",
        holder: "和平讨论，不带节奏"
      }
    })
  },
  // 设置回复状态（23）
  set_reply(e) {
    if(this.data.focus_reply) return; //已经在输入，此次跳过
    this.focus();

    // target应为回复的comment对象，fid为相应层主
    var target = e.currentTarget.dataset.target;
    this.setData({
      reply: {
        level: Math.min(3, target.level + 1),
        content: "",
        father_id: e.currentTarget.dataset.fid,
        reply_id: target.user._id,
        holder: "回复 " + target.user.name + "：",
      }
    })
  },

  // 聚焦输入框
  focus() {
    this.setData({
      focus_reply: true
    })
  },
  unfocus() {
    this.setData({
      focus_reply: false
    })
    if(this.data.reply.content.length <= 0) this.set_reply_post();
  },

  // 折叠评论
  fold_1() { 
    this.setData({ fold_comment: true });
  },
  async unfold_1() {  
    this.setData({ fold_comment: false })
    wx.showLoading();
    var res = (await wx.cloud.callFunction({
      name: 'get_post_commentlist',
      data: {
        post_id: this.data._id,
        user_id: app.global_data._id,
      }
    })).result
    for(let i = 0;i < res.length;i++){
      res[i].comment_time = new Date(res[i].comment_time);
      res[i].time_statement = util.time_statement(res[i].comment_time);
      res[i].fold_comment = true;
      res[i].comment_23 = [];
    }
    this.setData({
      comment_1: res
    })
    wx.hideLoading();
    this.set_reply_post();
  },
  fold_23(e) {
    var idx = e.currentTarget.dataset.idx;  // comment_1 index
    this.setData({
      ["comment_1["+idx+"].fold_comment"]: true
    })
  },
  async unfold_23(e) {
    wx.showLoading();
    var idx = e.currentTarget.dataset.idx;  // comment_1 index
    this.setData({
      ["comment_1["+idx+"].fold_comment"]: false
    })
    var res = (await wx.cloud.callFunction({
      name: "get_comment_commentlist",
      data: {
        comment_id: this.data.comment_1[idx]._id,
        user_id: app.global_data._id,
      }
    })).result;
    for(let i = 0;i < res.length;i++){
      res[i].comment_time = new Date(res[i].comment_time);
      res[i].time_statement = util.time_statement(res[i].comment_time);
    }
    this.setData({
      ["comment_1["+idx+"].comment_23"]: res
    })
    wx.hideLoading();
  },

  // 点赞，收藏
  async upvote_post() {
    await db.collection('upvote').add({
      data: {
        user_id: app.global_data._id,
        target_id: this.data._id,
        type: 'post',
      }
    })
    this.setData({
      upvoted: true,
      upvote_num: this.data.upvote_num + 1,
    })
  },
  async de_upvote_post() {
    var res = await db.collection('upvote').doc("048381bc63a852e1000fc3493a872dd7").remove();
    console.log(res)
    this.setData({
      upvoted: false,
      upvote_num: this.data.upvote_num - 1,
    })
  },

  // 发送评论
  async send_comment() {
    if(this.data.reply.content.length <= 0){
      wx.showToast({
        title: '不能发送空评论！',
        icon: 'error'
      })
      return
    }
    var reply = this.data.reply; // 补全信息
    reply.post_id = this.data._id;
    reply.user_id = app.global_data._id;
    reply.comment_time = new Date();
    var res = (await db.collection('comment').add({
      data: reply
    }).catch(e => {
      wx.showToast({
        title: '发送失败！',
        icon: 'error'
      });
      throw e;
    }))._id;
    wx.showToast({
      title: '发送成功',
    });
    // 本地更新
    this.setData({
      comment_num: this.data.comment_num + 1
    })
    if(reply.level == 1){
      this.unfold_1();
    } else { // 找到并重新展开
      for(let i = 0;i < this.data.comment_1.length;i++){
        if(this.data.comment_1[i]._id == reply.father_id){
          this.setData({
            ["comment_1["+i+"].comment_num"]: this.data.comment_1[i].comment_num + 1,
          })
          this.unfold_23( {currentTarget: {dataset: {idx: i}}} );
          break;
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   * options.id: post_id
   */
  async onLoad(options) {
    var res = (await wx.cloud.callFunction({
      name: "get_post",
      data: {
        post_id: options.id,
        user_id: app.global_data._id,
      }
    })).result;
    res.post_time = new Date(res.post_time);
    res.time_statement = util.time_statement(res.post_time);
    this.setData(res);
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