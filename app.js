
App({
  global_data: {
    // 相当于user表中一条记录
    secret_id: "visit",
    upvote_post: [],
    upvote_comment: [],
    star_post : [],
  },
  onLaunch(){
    wx.cloud.init();
    const l = wx.getStorageSync('loin')
    var that = this;
    if(l.secret_id){
      wx.cloud.database().collection("user").where({
        secret_id: l.secret_id,
      }).get({
        success(res) {
          that.global_data = res.data[0];
        }, 
        fail() {
          wx.redirectTo({
            url: '/pages/loin/loin',
          })
        }
      });
    } else {
      wx.redirectTo({
        url: '/pages/loin/loin',
      })
    }
  }
})