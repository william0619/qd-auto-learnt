console.log("this", global);
console.log("this", globalThis);
const dayjs = require("dayjs");

// 定义开始时间和结束时间
const startTime = "2024-09-13 18:57:27";
const endTime = "2024-09-13 21:22:17";

// 使用dayjs解析时间
const start = dayjs(startTime);
const end = dayjs(endTime);

// 计算两个时间点之间的差值（以分钟为单位）
const duration = end.diff(start, "minute");

console.log(`持续时间（分钟）: ${duration}`);
