// 请完善以下信息
// 重要提醒：请在上报前确保信息与真实情况相符，否则可能构成违法行为！！

const config = {
  secretKey: "", // 用于“掩耳盗铃”地混淆密码的密文，可自定义
  username: "", // 哈工大（深圳）统一身份认证系统的用户名
  maskedPassword: "", // 用 AES-256 和 secretKey 加密过的哈工大（深圳）统一身份认证系统的密码
  checkedList: [
    { item: "国内" },
    { item: "低风险" },
    { item: "否" },
    { title: "48", item: "否" },
    { item: "正常" },
    { item: "接种全部" },
    { item: "以下" },
  ], // 需要选择的选项中的关键词匹配，忽略键值 title 可通配，精确匹配会覆盖通配的效果
  enableAutoGeolocation: true, // 是否通过默认方式设置 “所在地点”

  // 以下选项为高级功能，请谨慎使用
  enableSetCurrentStatus: false, // 是否设置 “当前状况”，关闭后 “当前状况” 与上次上报一致
  enableSetGeolocation: false, // 是否人工设置 “所在地点”，该选项会被 enableAutoGeolocation 覆盖效果
  statusCode: "99", // “当前状况” 对应的代码，参见 main.js 中的 statusMap
  geolocation: {
    // 需要上报的地理位置信息
    // 请通过此网页获取经纬度：https://lbs.amap.com/tools/picker
    // 请通过此网页获取准确的地理位置表述：https://lbs.amap.com/demo/Javascript-api/example/district-search/city-drop-down-list
    latitude: "23.13072",
    longitude: "113.27287",
    province: "广东省", // 省市区（省级行政区）
    city: "深圳市", // 地级市（地级行政区）
    district: "南山区", // 区县（县级行政区）
    street: "夏青路", // 最后一级，最好精确到门牌号
  },
  isHeadless: false, // 是否开启 Headless 模式
};

module.exports = config;
