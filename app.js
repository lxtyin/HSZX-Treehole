
App({
  global_data: {
    // 相当于user表中一条记录
    _id: "visit",
    avatar: "../../img/mine.png",
    name: "访客",
  },
  onLaunch(){
    wx.cloud.init();
    const l = wx.getStorageSync('loin')
    var that = this;
    if(l.user_id){
      wx.cloud.database().collection("user").doc(l.user_id).get({
        success(res) {
          that.global_data = res.data;
          wx.switchTab({
            url: '/pages/hole/hole',
          })
        }
      });
    }
  }
})