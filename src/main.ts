/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/12
 **/
import puppeteer from "puppeteer-core";
import { getChromePath, setConfig, sleep } from "./utils";
import { Login } from "./login";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import path from "node:path";
import { DataHandler } from "./dataHandler";
import { Store } from "./store";
import { TaskQueue } from "./taskQueue";
import { createSecretKey } from "node:crypto";
// import { DB } from "./db";
async function main() {
  console.log("cmd path:", process.cwd());
  console.log("execPath:", path.dirname(process.execPath));
  console.log("date:", dayjs().format("YYYY-MM-DD"));
  await setConfig();
  const cPath = getChromePath();
  console.log("launch path", cPath);
  const browser = await puppeteer.launch({
    executablePath: cPath,
    headless: globalThis.HEADLESS,
    devtools: false,
    defaultViewport: {
      width: 0,
      height: 0,
    },
    // args: ["--mute-audio"],
  });
  // const browser = await puppeteer.connect({
  //   browserWSEndpoint:
  //     "ws://localhost:9222/devtools/browser/18045d1a-d4c7-4c1f-9196-3519319ef292",
  //   defaultViewport: {
  //     width: 0,
  //     height: 0,
  //   },
  // });
  const loginPage = new Login(browser);
  const bool = await loginPage.run();
  console.log("登录成功");
  if (bool) {
    await sleep(2000);
    const store = new Store();
    const dataHandler = new DataHandler(browser, store);
    const page = await dataHandler.setStudentId();
    const recordData = await dataHandler.getCourseData(page);
    const tasks = recordData.map((model) => {
      return async () => {
        const signData = await page.evaluate(
          async (m) => {
            const buildForm = (obj: Record<any, any>) => {
              const form = new FormData();
              for (const key in obj) {
                form.append(key, obj[key]);
              }
              return form;
            };
            const res = await window.fetch(
              "https://www.qiaoda.com.cn/api/service/Attendance/signCourse.json",
              {
                method: "POST",
                mode: "cors",
                credentials: "include",
                body: buildForm(m.signReqParamsData),
              },
            );

            await window.fetch(
              `https://www.qiaoda.com.cn/api/service/StudentRewards/addStudentRewards.json?bust=${Date.now()}`,
              {
                method: "POST",
                mode: "cors",
                credentials: "include",
                body: buildForm(m.addStudentRewardsParams),
              },
            );
            const json = await res.json();
            return json.Data[0];
          },
          {
            signReqParamsData: model.signReqParamsData(),
            addStudentRewardsParams: model.addStudentRewardsParams(),
          },
        );
        const configObj = JSON.parse(signData.config_json);
        let _videoPalyPath =
          "https://www.qiaoda.com.cn/edu/service/videoplay/v2/index.html";
        _videoPalyPath += "?app_key=" + configObj.app_key;
        _videoPalyPath += "&signedat=" + configObj.signedat;
        _videoPalyPath += "&sign=" + configObj.sign;
        _videoPalyPath += "&id=" + configObj.roomid;
        _videoPalyPath += "&account=" + configObj.account;
        _videoPalyPath += "&userid=" + store.studentId;
        _videoPalyPath +=
          "&username=" + encodeURI(encodeURI(configObj.username));
        //_videoPalyPath += "&username="+configObj.username;
        _videoPalyPath += "&email=" + configObj.email;
        _videoPalyPath += "&cid=" + model.course_id;
        _videoPalyPath += "&eid=" + model.evaluate_id;
        _videoPalyPath += "&rid=" + model.res_folder_ids;
        _videoPalyPath += "&aid=" + model.attendance_id;
        _videoPalyPath += "&csid=" + model.course_scheme_id;
        _videoPalyPath += "&vtype=" + model.vhall_type;
        _videoPalyPath += "&k=" + signData.key_id;
        const _page = await browser.newPage();
        await _page.goto(_videoPalyPath);
        console.log("签到成功 =>", model.resCourseName);
        await sleep(2000);
        let retry = 0;

        const playVideo = async () => {
          try {
            console.log("播放视频 =>", model.resCourseName);
            await _page.click(".vhallPlayer-volume-btn");
            await _page.click(".vhallPlayer-playBtn");
          } catch (e) {
            if (retry < 5) {
              console.log("重试播放视频 =>", model.resCourseName);
              retry++;
              await _page.reload();
              await sleep(5000);
              await playVideo();
            } else {
              console.error(
                "播放视频 =>",
                model.resCourseName,
                `超出重试次数${retry}, 请手动观看`,
              );
            }
          }
        };
        await playVideo();
        console.log("等待看完视频 =>", model.resCourseName);

        let curTime = Number(model.learning_duration ?? 0);
        while (true) {
          await sleep(60 * 1000);
          curTime += 1;
          if (curTime >= model.totalDurationMinutes) {
            console.log("看完了 =>", model.resCourseName);
            await _page.close();
            return;
          }
        }
      };
    });
    console.log("检查执行任务:", tasks.length, " 个");
    if (tasks.length === 0) {
      console.log("没有需要签到的课程: 执行关闭");
      await sleep(2000);
      await browser.close();
      await browser.disconnect();
      process.exit();
    }

    console.log("开始执行任务: 并发数", globalThis.MAX_TASK);
    const taskQueue = new TaskQueue(tasks);
    taskQueue.executeTaskQueue({
      maxTask: +globalThis.MAX_TASK,
      allDone: async () => {
        console.log("本次任务执行完毕,正关闭进程");
        await browser.close();
        await browser.disconnect();
        process.exit();
      },
    });
  }
}
process.on("uncaughtException", (err) => {
  console.error("error", err?.message);
});

// DB.init();
main().catch((err) => {
  console.error("error", err);
});
