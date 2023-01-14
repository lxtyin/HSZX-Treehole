
const app = getApp();
const util = require("../../utils/util")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    origin_name: "",
    changed_avatar: false,
  },

  input_name(e) {
    this.setData({
      name: e.detail.value,
    })
  },
  async choose_avatar() {
    var res = await wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
    }).catch(e => {
      util.hint(e.message);
      throw e;
    });
    console.log(res);
    this.setData({
      avatar: res.tempFiles[0].tempFilePath,
      changed_avatar: true
    })
  },
  async confirm() {
    wx.showLoading();
    if(this.data.name.length <= 0){
      util.hint("马甲不能为空！");
      return;
    }
    if(this.data.changed_avatar) {
      // 上传头像
      var res = await util.upload_file(this.data.avatar).catch(e => {
        util.hint("头像上传失败！");
        throw e;
      });
      this.setData({
        avatar: res
      })
    }
    await util.request("/user/update", {
      user_id: this.data.user_id,
      name: this.data.name,
      avatar: this.data.avatar,
    }).catch(e => {
      util.hint(e.message);
      throw e;
    })
    wx.showToast({ title: '修改成功' })
    app.global_data.avatar = this.data.avatar;
    app.global_data.name = this.data.name;
    this.setData({
      origin_name: this.data.name,
      changed_avatar: false
    })
  },

  to_message() {
    wx.switchTab({
      url: '/pages/message/message',
    })
  },
  to_mine() {
    app.global_data.switch_option = {
      mine_only: true
    }
    wx.switchTab({
      url: '/pages/hole/hole',
    })
  },
  to_star() {
    app.global_data.switch_option = {
      star_only: true
    }
    wx.switchTab({
      url: '/pages/hole/hole',
    })
  },
  to_about() {
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },

  async logout() {
    wx.redirectTo({
      url: '/pages/loin/loin?switch=true',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },
	onTabItemTap () {
    this.setData(app.global_data)
    this.setData({
      origin_name: this.data.name,
      changed_avatar: false,
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
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

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