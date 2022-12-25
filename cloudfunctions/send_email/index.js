// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const nodemailer = require('nodemailer')
const config = {
  host: 'smtp.qq.com', // 邮箱smtp服务，不同厂家地址不一样
  port: 465, // 邮箱端口，不同厂家可能不一样
  auth: {
    user: 'lx_tyin@qq.com', // 邮箱账号
    pass: 'fatfczhzqeqpfcig' // 邮箱授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);

// 云函数入口函数
exports.main = async (event, context) => {
  // 创建一个邮件对象
  var mail = {
    from: '来自 <lx_tyin@qq.com>',
    subject: event.subject,
    to: event.email,
    text: event.content
  }; 
  let res = await transporter.sendMail(mail);
  return res;
}
