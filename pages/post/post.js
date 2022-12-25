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
   *    user: {
   *      name
   *      avatar
   *    }
   *    time_statement
   *    fold_comment
   *    upvoted(null)
   *    comment_23 []
   *  },
   *  {
   *  },...
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
        reply_id: target._id,
        holder: "回复 " + target.user.name + "：",
      }
    })
  },

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

  fold_1() { 
    this.setData({ fold_comment: true });
  },
  async unfold_1() {  
    this.setData({ fold_comment: false })
    wx.showLoading();
    var res = (await wx.cloud.callFunction({
      name: 'get_post_commentlist',
      data: {
        post_id: this.data._id
      }
    })).result
    for(let i = 0;i < res.length;i++){
      res[i].comment_time = new Date(res[i].comment_time);
      res[i].time_statement = util.time_statement(res[i].comment_time);
      res[i].fold_comment = true;
      res[i].comment_23 = [];
      res[i].upvoted = res[i]._id in app.global_data.upvote_comment;
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
        father_id: this.data.comment_1[idx]._id
      }
    })).result;
    for(let i = 0;i < res.length;i++){
      res[i].comment_time = new Date(res[i].comment_time);
      res[i].time_statement = util.time_statement(res[i].comment_time);
      res[i].upvoted = res[i]._id in app.global_data.upvote_comment;
      res[i].reply_name = "已删除";
      for(let j = 0;j < res.length;j++){  // 根据reply_id寻找对应reply_name
        if(res[j]._id == res[i].reply_id){
          res[i].reply_name = res[j].user.name;
          break;
        }
      }
    }
    
    this.setData({
      ["comment_1["+idx+"].comment_23"]: res
    })
    wx.hideLoading();
  },

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
    reply.secret_id = app.global_data.secret_id;
    reply.comment_time = new Date();
    reply.comment_num = 0;
    reply.upvote_num = 0;
    var _id = await util.send_comment(reply).catch(e => {
      wx.showToast({
        title: '发送失败！',
        icon: 'error'
      });
      throw e;
    });
    wx.showToast({
      title: '发送成功',
    });
    // 不改变评论状态，本地更新
    this.setData({
      comment_num: this.data.comment_num + 1
    })
    if(reply.level == 1){ // 前面增加一条
      reply._id = _id;
      reply.user = {
        avatar: app.global_data.avatar,
        name: app.global_data.name,
      }
      reply.time_statement = util.time_statement(reply.comment_time);
      reply.upvoted = false;
      var tmp = this.data.comment_1;
      tmp.unshift(reply);
      this.setData({  comment_1: tmp  })
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

  async upvote_post() {
    // await util.upvote_post(this.data._id);
    // this.setData({
    //   upvote_num: this.data.upvote_num + 1,
    //   upvoted: true,
    // })
  },
  async upvote_comment_1(e) {
    // var _id = e.currentTarget.dataset._id;
    // var idx = e.currentTarget.dataset.idx;
    // await util.upvote_comment(_id);
    // this.setData({
    //   ["comment_1[" + idx + "].comment_num"]: this.data.comment_1[idx].upvote_num + 1,
    // })
  },
  async upvote_comment_23(e) {
    // var _id = e.currentTarget.dataset._id;
    // var idx = e.currentTarget.dataset.idx;
    // var idx2 = e.currentTarget.dataset.idx2;
    // await util.upvote_comment(_id);
    // this.setData({
    //   ["comment_1[" + idx + "].comment23[" + idx2 + "].comment_num"]: this.data.comment_1[idx].comment_23[idx2].upvote_num + 1,
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   * options.id: post_id
   */
  onLoad(options) {
    wx.showLoading();
    var that = this;
    db.collection('post').doc(options.id).get({
      async success(res) {
        wx.hideLoading();
        that.setData(res.data)
        that.setData({
          time_statement: util.time_statement(that.data.post_time),
          upvoted: options.id in app.global_data.upvote_post,
          starred: options.id in app.global_data.star_post,
        })
      }
    })
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
    onload({id: this.data._id})
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