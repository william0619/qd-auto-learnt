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

export async function setConfig() {
  const executableDir = isPkg()
    ? path.dirname(process.execPath)
    : path.resolve(process.cwd(), "./");
  try {
    const filePath = path.resolve(executableDir, "./config.json");
    console.log("config path:", filePath);
    const json = await fs.readFile(filePath, { encoding: "utf-8" });
    const data = JSON.parse(json);
    console.log("set config =>", data);
    process.env.CHROME_PATH = data.CHROME_PATH;
    process.env.MAX_TASK = data.MAX_TASK;
    process.env.USER_NAME = data.USER_NAME;
    process.env.PASSWORD = data.PASSWORD;
    process.env.SCHOOL_NAME = data.SCHOOL_NAME;
    process.env.SEMESTER_NAME = data.SEMESTER_NAME;
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
  return process.env?.CHROME_PATH ? process.env.CHROME_PATH : (defPath ?? "");
};

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
