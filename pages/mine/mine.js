
const app = getApp();
const util = require("../../utils/util")
const db = wx.cloud.database()

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
    });
    this.setData({
      avatar: res.tempFiles[0].tempFilePath,
      changed_avatar: true
    })
  },
  async confirm() {
    if(this.data.name.length <= 0){
      wx.showToast({
        title: '马甲不能为空！',
        icon: 'error'
      })
      return;
    }
    wx.showLoading();
    if(this.data.changed_avatar) {
      // 上传头像
      var res = await util.upload_file(this.data.avatar).catch(e => {
        wx.showToast({
          title: '头像上传失败！',
          icon: 'error'
        })
        throw e;
      });
      this.setData({
        avatar: res
      })
    }
    await db.collection('user').where({
      user_id: app.global_data.user_id
    }).update({
      data: {
        name: this.data.name,
        avatar: this.data.avatar,
      }
    }).catch(e => {
      wx.showToast({
        title: '更新失败！',
        icon: 'error'
      })
      throw e;
    });
    wx.showToast({ title: '修改成功' })
    app.global_data.avatar = this.data.avatar;
    app.global_data.name = this.data.name;
    this.setData({
      origin_name: this.data.name,
      changed_avatar: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading();
    var res = await db.collection('user').doc(app.global_data._id).get();
    wx.hideLoading();
    this.setData(res.data)
    this.setData({
      origin_name: res.data.name,
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