/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/12
 **/
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

export function isPkg() {
  // @ts-ignore
  return typeof process.pkg !== "undefined";
}

export function executableDir() {
  return isPkg()
    ? path.dirname(process.execPath)
    : path.resolve(process.cwd(), "./");
}

export async function setConfig() {
  const dir = executableDir();
  try {
    const filePath = path.resolve(dir, "./config.json");
    console.log("config path:", filePath);
    const json = await fs.readFile(filePath, { encoding: "utf-8" });
    const data = JSON.parse(json);
    console.log("set config =>", data);
    globalThis.CHROME_PATH = data.CHROME_PATH;
    globalThis.MAX_TASK = data.MAX_TASK;
    globalThis.USER_NAME = data.USER_NAME;
    globalThis.PASSWORD = data.PASSWORD;
    globalThis.SCHOOL_NAME = data.SCHOOL_NAME;
    globalThis.SEMESTER_NAME = data.SEMESTER_NAME;
    globalThis.HEADLESS = data?.HEADLESS ? Boolean(data.HEADLESS) : false;
  } catch (e) {
    console.error("配置文件有误");
    process.exit();
  }
}

export const getChromePath = () => {
  const _os = os.platform();
  const defPath = {
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  }[_os.toString()];
  if (globalThis?.CHROME_PATH) return globalThis.CHROME_PATH;
  return defPath;
};

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
// 随机2~10秒
export function randomTime() {
  return Math.round(Math.random() * 10 + 3) * 1000;
}

// export async function connectInfo() {
//   try {
//     const res = await nodeFetch("http://localhost:9222/json/version", {
//       method: "get",
//     });
//     const data = await res.json();
//     console.log("browser config", data);
//     return data;
//   } catch (error) {
//     console.log("error: 无法连接 http://localhost:9222/json/version");
//     return {};
//   }
// }
