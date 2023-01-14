// pages/post/post.js

const app = getApp();
const util = require("../../utils/util")

Page({

  /**
   * 页面的初始数据
   * 结构：comment_1: [
   *  {
   *    comment info..
   *    comment_23 [
   *      {
   *        comment info..
   *        reply_user: {}
   *      }
   *    ]
   *  },
   *  {...}
   * ]
   */
  data: {
    fold_comment: true,
    method: 'time',
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

  switch_method() {
    if(this.data.method == 'time') this.setData({
      method: 'fever'
   });
   else this.setData({ 
     method: 'time'
   });
   this.unfold_1();
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
        father_id: null,
        reply_id: this.data.user_id,
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
        reply_id: target.user_id,
        holder: "回复 " + target.user_name + "：",
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
    var res = await util.request('/search/comments1', {
      user_id: app.global_data.user_id,
      post_id: this.data.post_id,
      method: this.data.method,
    })
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
    var res = await util.request('/search/comments23', {
      user_id: app.global_data.user_id,
      father_id: this.data.comment_1[idx].comment_id,
    })
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
    var data = {
      user_id: app.global_data.user_id,
      target_id: this.data.post_id,
      type: 'post'
    }
    if(this.data.upvoted){
      await util.request('/upvote/del', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({ 
        upvoted: false,
        upvote_num: this.data.upvote_num - 1,
      });
    } else {
      await util.request('/upvote/add', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({ 
        upvoted: true,
        upvote_num: this.data.upvote_num + 1,
      });
    }
  },
  async star_post() {
    var data = {
      user_id: app.global_data.user_id,
      post_id: this.data.post_id,
    }
    if(this.data.starred){
      await util.request('/star/del', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({ 
        starred: false,
        star_num: this.data.star_num - 1,
      });
    } else {
      await util.request('/star/add', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({ 
        starred: true,
        star_num: this.data.star_num + 1,
      });
    }
  },
  async upvote_comment1(e){
    var idx1 = e.currentTarget.dataset.idx1;
    var item = e.currentTarget.dataset.item;
    var data = {
      user_id: app.global_data.user_id,
      target_id: item.comment_id,
      type: 'comment'
    }
    if(item.upvoted){
      await util.request('/upvote/del', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({
        [`comment_1[${idx1}].upvoted`]: false,
        [`comment_1[${idx1}].upvote_num`]: item.upvote_num - 1,
      });
    } else {
      await util.request('/upvote/add', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({ 
        [`comment_1[${idx1}].upvoted`]: true,
        [`comment_1[${idx1}].upvote_num`]: item.upvote_num + 1,
      });
    }
  },
  async upvote_comment23(e){
    var idx1 = e.currentTarget.dataset.idx1;
    var idx2 = e.currentTarget.dataset.idx2;
    var item = e.currentTarget.dataset.item;
    var data = {
      user_id: app.global_data.user_id,
      target_id: item.comment_id,
      type: 'comment'
    }
    if(item.upvoted){
      await util.request('/upvote/del', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({
        [`comment_1[${idx1}].comment_23[${idx2}].upvoted`]: false,
        [`comment_1[${idx1}].comment_23[${idx2}].upvote_num`]: item.upvote_num - 1,
      });
    } else {
      await util.request('/upvote/add', data).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.setData({ 
        [`comment_1[${idx1}].comment_23[${idx2}].upvoted`]: true,
        [`comment_1[${idx1}].comment_23[${idx2}].upvote_num`]: item.upvote_num + 1,
      });
    }
  },

  // 聚焦某评论（翻至顶部）
  async focus_comment_1(cid) {
    await this.unfold_1();
    let ls = this.data.comment_1;
    for(let i = 0;i < ls.length;i++){
      if(ls[i].comment_id == cid){
        var tmp = ls[i];
        ls[i] = ls[0];
        ls[0] = tmp;
        this.setData({
          comment_1: ls,
        })
        break;
      }
    }
    if(this.data.comment_1[0].comment_num > 0){
      this.unfold_23( {currentTarget: {dataset: {idx: 0}}} );
    }
  },

  // 发送评论
  async send_comment() {
    if(this.data.reply.content.length <= 0){
      util.hint('不能发送空评论！');
      return
    }
    wx.showLoading();
    var reply = this.data.reply; // 补全信息
    reply.post_id = this.data.post_id;
    reply.user_id = app.global_data.user_id;
    // 发送
    var res = await util.request('/comment/add', reply).catch(e => {
      util.hint(e.message);
      throw e;
    });
    wx.showToast({
      title: '发送成功',
    });

    // 本地更新
    this.setData({
      comment_num: this.data.comment_num + 1
    })
    if(reply.level == 1){
      // 发送回复消息
      await util.request('/message/add', {
        f_user_id: app.global_data.user_id,
        t_user_id: this.data.user_id,
        title: `在您的帖子【${this.data.title}】中评论`,
        content: reply.content,
        link: `/pages/post/post?pid=${this.data.post_id}&cid=${res.comment_id}`
      }).catch(e => {
        util.hint(e.message);
        throw e;
      });
      this.unfold_1();
    } else { 
      // 发送回复消息
      await util.request('/message/add', {
        f_user_id: app.global_data.user_id,
        t_user_id: reply.reply_id,
        title: `在帖子【${this.data.title}】中回复了您`,
        content: reply.content,
        link: `/pages/post/post?pid=${this.data.post_id}&cid=${reply.father_id}`
      }).catch(e => {
        util.hint(e.message);
        throw e;
      });
      
      // 找到并重新展开
      for(let i = 0;i < this.data.comment_1.length;i++){
        if(this.data.comment_1[i].comment_id == reply.father_id){
          this.setData({
            ["comment_1["+i+"].comment_num"]: this.data.comment_1[i].comment_num + 1,
          })
          this.unfold_23( {currentTarget: {dataset: {idx: i}}} );
          break;
        }
      }
    }
    this.set_reply_post();
  },

  /**
   * 生命周期函数--监听页面加载
   * options: {
   *  pid(post_id, required)
   *  cid(comment_id) // 聚焦评论号（定位）
   * }
   */
  async onLoad(options) {
    var res = await util.request('/post/getfull', {
      user_id: app.global_data.user_id,
      post_id: options.pid,
    }).catch(e => {util.hint(e.message)});
    res.post_time = new Date(res.post_time);
    res.time_statement = util.time_statement(res.post_time);
    this.setData(res);
    await util.request('/post/addread', {
      user_id: app.global_data.user_id,
      post_id: options.pid,
    });

    if(options.cid) { // 定位
      this.focus_comment_1(options.cid);
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