/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/12
 **/
import puppeteer, { HTTPResponse } from "puppeteer-core";
import { getChromePath, setConfig, sleep } from "./utils";
import { Login } from "./login";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import path from "node:path";
import { DataHandler } from "./dataHandler";
import { Store } from "./store";
import { TaskQueue } from "./taskQueue";
import { setInterval } from "node:timers/promises";

dayjs.extend(duration);

globalThis.taskLock = false;
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
    slowMo: 10,
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
    await sleep(1000);
    const store = new Store();
    const dataHandler = new DataHandler(browser, store);
    const page = await browser.newPage();
    await dataHandler.setStudentId(page);
    const recordData = await dataHandler.getCourseData(page);

    // 创建任务
    const tasks = recordData.map((model) => {
      return async () => {
        const { sourceData, configObj } = await dataHandler.sign(page, {
          signReqParamsData: model.signReqParamsData(),
          addStudentRewardsParams: model.addStudentRewardsParams(),
        });
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
        _videoPalyPath += "&k=" + sourceData.key_id;
        const videoPage = await browser.newPage();
        await videoPage.goto(_videoPalyPath);

        let totalDuration = null;
        totalDuration = store.getRecordVideoTotalDuration(model);
        if (!totalDuration) {
          totalDuration = await dataHandler.getVideoDuration(videoPage);
          store.setRecordVideoTotalDuration(model, totalDuration);
        }
        // console.log("签到成功 =>", model.resCourseName);
        let retry = 0;
        const playVideo = async () => {
          await sleep(3000);

          const clickBtn = async (selector: string) => {
            const btn = await videoPage.waitForSelector(selector, {
              timeout: 10 * 1000,
            });
            btn?.hover();
            btn?.focus();
            btn?.click();
          };
          try {
            console.log("准备播放视频 =>", model.resCourseName);
            await videoPage.bringToFront();
            await clickBtn(".vhallPlayer-volume-btn");
            // await clickBtn(".vhallPlayer-playBtn");
            await clickBtn(".play");
          } catch (e) {
            // console.log("error", e);
            if (retry < 6) {
              retry++;
              await videoPage.reload();
              await playVideo();
            } else {
              console.error(
                "播放视频失败 =>",
                model.resCourseName,
                `超出重试次数${retry}, 请手动观看`,
              );
            }
          }
        };
        await playVideo();
        console.log("播放中... =>", model.resCourseName);

        let curTime = Number(model.duration ?? 0);
        for await (const totalTime of setInterval(1000 * 60, totalDuration)) {
          curTime++;
          if (totalTime && curTime >= totalTime) {
            console.log("学习课程完成 =>", model.resCourseName);
            store.setRecordLearnt(model, true);
            await videoPage.close();
            break;
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
    await taskQueue.executeTaskQueue({
      maxTask: +globalThis.MAX_TASK,
      stayDuration: 2000,
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
