
function time_statement(date) {
  var sec = (new Date() - date) / 1000;
  if (sec < 60) {
      return "刚刚"
  } else if (sec < 3600) {
      return Math.round(sec / 60) + "分钟前";
  } else if (sec < 3600 * 24) {
      return Math.round(sec / 3600) + "小时前";
  } else {
      return date.toLocaleString();
  }
}

module.exports.time_statement = time_statement
