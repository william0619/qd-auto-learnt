/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/12
 **/
import puppeteer from "puppeteer-core";
import { getChromePath, setConfig } from "./utils";
import { Login } from "./login";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import path from "node:path";
import { DataHandler } from "./dataHandler";
import { Store } from "./store";
// import { DB } from "./db";
async function main() {
  console.log("cmd path:", process.cwd());
  console.log("execPath:", path.dirname(process.execPath));
  console.log("date:", dayjs().format("YYYY-MM-DD"));
  await setConfig();
  // const browser = await puppeteer.launch({
  //   executablePath: getChromePath(),
  //   headless: false,
  //   devtools: true,
  //   defaultViewport: {
  //     width: 0,
  //     height: 0,
  //   },
  //   // args: ["--mute-audio"],
  // });
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "ws://localhost:9222/devtools/browser/053c8ed3-f13b-46d6-b3aa-1e47ee2a2ceb",
    defaultViewport: {
      width: 0,
      height: 0,
    },
  });
  // const loginPage = new Login(browser);
  // const bool = await loginPage.run();
  const bool = true;
  console.log("登录成功 =》", bool);
  if (bool) {
    const store = new Store();
    const dataHandler = new DataHandler(browser, store);
    await dataHandler.setStudentId();
    await dataHandler.getCourseData();
    console.log("获取课程1");
  }

  // const init = new Init(browser);
  // await init.getCourse();
  // await browser.close();
}
process.on("uncaughtException", (err) => {
  console.error("error", err?.message);
});

// DB.init();
main().catch((err) => {
  console.error("error", err);
});
