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
import { TaskQueue } from "./taskQueue";
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
      "ws://localhost:9222/devtools/browser/8cd2446e-e5ec-4551-9f35-0de6fe19e5ee",
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
    const page = await dataHandler.setStudentId();
    const recordData = await dataHandler.getCourseData(page);
    const tasks = recordData.map((model) => {
      return async () => {
        await page.evaluate(async (m) => {
          const res = await window.fetch(
            "https://www.qiaoda.com.cn/api/service/Attendance/signCourse.json",
            {
              method: "POST",
              mode: "cors",
              credentials: "include",
              body: m.signReqParamsFormData(),
            },
          );
          const json = await res.json();
          // https://www.qiaoda.com.cn/edu/service/videoplay/v2/index.html?app_key=9e20bf73779b6627e21b8f0f7a9dce77&signedat=1727429348&sign=0abcdf6c54815ee68e98e4bc11170c85&id=503832594&account=b84582d1ed5&userid=2c92e4518c9fe9bd018cab84582d1ed5&username=%25E8%258E%25AB%25E7%2582%25B3%25E9%2591%25AB&email=20240823151500713707@qq.com&cid=2c9201c58d5dab2a018d5ec0df1223f9&eid=&rid=&aid=20240823151500713707&csid=2c9201c5917927df01917e16aa3a21ce&vtype=2&k=2c9201c59230b683019232d00b1434e7
          return json;
        }, model);
      };
    });
    const taskQueue = new TaskQueue(tasks);
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
