// components/addtag/addtag.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    diytag: "",
    taglist: ["新闻", "情感", "学业", "卷", "其他", "其他", "其他", "其他", "其他", "其他", "其他"]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    input_tag(e) {
      this.setData({
        diytag: e.detail.value
      });
    },
    add_tag(event){
      var name = event.currentTarget.dataset.tagname;
      this.triggerEvent("get_tag", {tagname: name});
    },
    donothing(){}
  }
})
