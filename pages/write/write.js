// pages/write/write.js

const app = getApp();
const util = require("../../utils/util")
const db = wx.cloud.database()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    content: "",
    imgs: [], // {path: , is_tmp: }
    tags: [],

    show_tag_dialog: false,
    submitable: true
  },

  input_title(e) {
    this.setData({
      title: e.detail.value
    })
  },
  input_content(e) {
    this.setData({
      content: e.detail.value
    })
  },

  add_image() {
    var that = this;
    if (that.data.imgs.length == 9) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      });
      return;
    }
    wx.chooseMedia({
      count: 9 - that.data.imgs.length,
      mediaType: ['image'],
      success(res) {
        var tmp = that.data.imgs;
        for (let i = 0; i < res.tempFiles.length; i++) {
          tmp.push({
            path: res.tempFiles[i].tempFilePath,
            is_tmp: true,
          });
        }
        that.setData({
          imgs: tmp
        });
      }
    });
  },
  del_image(e) {
    var src = e.currentTarget.dataset.src;
    var tmp = [];
    for (let i = 0; i < this.data.imgs.length; i++) {
      if (this.data.imgs[i].path != src) {
        tmp.push(this.data.imgs[i]);
      }
    }
    this.setData({
      imgs: tmp
    });
  },
  preview_image(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.src],
    })
  },

  // 调起tag选择界面 
  choose_tag() {
    if (this.data.tags.length >= 8) {
      wx.showToast({
        title: 'tag数量达到上限',
        icon: 'none'
      });
      return;
    }
    this.setData({
      show_tag_dialog: true
    })
  },
  // 从tag选择界面返回，获得tagname
  add_tag(e) {
    var tmp = this.data.tags;
    if (!tmp.includes(e.detail.tagname) && e.detail.tagname != "") {
      tmp.push(e.detail.tagname);
    }
    this.setData({
      tags: tmp,
      show_tag_dialog: false
    });
  },
  del_tag(e) {
    var tagname = e.currentTarget.dataset.tagname;
    var tmp = [];
    for (let i = 0; i < this.data.tags.length; i++) {
      if (this.data.tags[i] != tagname) {
        tmp.push(this.data.tags[i]);
      }
    }
    this.setData({
      tags: tmp
    })
  },

  async submit(e) {
    // 发布检查
    if (this.data.title == "") {
      wx.showToast({
        title: '请输入标题',
        icon: 'error'
      })
      return;
    }

    await this.upload_imgs();
    wx.showLoading({ title: '正在发布..', })
    var img_paths = [];
    for (let i = 0; i < this.data.imgs.length; i++) img_paths.push(this.data.imgs[i].path);
    await db.collection("post").add({
      data: {
        secret_id: app.global_data.secret_id,
        title: this.data.title,
        post_time: new Date(),
        content: this.data.content,
        imgs: img_paths,
        tags: this.data.tags,
        comment_num: 0,
        star_num: 0,
        upvote_num: 0,
      }
    }).catch(e => {
      wx.showToast({
        title: '发布失败',
        icon: 'error'
      });
      throw e;
    })

    wx.showToast({ title: '发布成功' });
    setTimeout(() => {
      this.setData({
        title: "",
        content: "",
        imgs: [],
        tags: [],
        show_tag_dialog: false,
      })
      wx.switchTab({
        url: '/pages/hole/hole',
      });
    }, 1500);
  },

  // 将列表中的临时图片都上传，将临时路径改为fileID
  async upload_imgs() {
    wx.showLoading();
    var res = this.data.imgs;
    for (let i = 0; i < res.length; i++) {
      if (res[i].is_tmp) {
        res[i].is_tmp = false;
        var r = await util.upload_file(res[i].path).catch(e => {
          wx.showToast({
            title: '图片上传失败！',
            icon: 'error'
          })
          throw e;
        });
        res[i].path = r;
      }
    }
    wx.hideLoading();
    this.setData({
      imgs: res
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.global_data.secret_id == "visit") {
      this.setData({
        submitable: false
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