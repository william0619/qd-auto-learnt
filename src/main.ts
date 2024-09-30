/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/12
 **/
import puppeteer, { ElementHandle } from "puppeteer-core";
import { getChromePath, retryFn, setConfig, sleep } from "./utils";
import { Login } from "./login";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import path from "node:path";
import { DataHandler } from "./dataHandler";
import { Store } from "./store";
import { TaskQueue } from "./taskQueue";
import { setInterval } from "node:timers/promises";
dayjs.extend(duration);
// globalThis.taskLock = false;

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
  //   browserWSEndpoint: await connectWs(),
  //   defaultViewport: {
  //     width: 0,
  //     height: 0,
  //   },
  // });
  const loginPage = new Login(browser);
  const bool = await loginPage.run();
  console.log("登录成功");
  // const bool = true;
  if (bool) {
    // await sleep(1000);
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

        const getVideoEle = async () => {
          await sleep(5000);
          const video = await videoPage.waitForSelector("#video video");
          if (!video) {
            throw new Error("获取视频失败");
          }
          return video;
        };

        const getVideoDuration = async (
          video: ElementHandle<HTMLVideoElement>,
        ) => {
          // 获取视频时长
          let totalDuration = store.getRecordVideoTotalDuration(model);
          if (!totalDuration) {
            totalDuration = await retryFn(
              async () => {
                await videoPage.bringToFront();
                await sleep(1000);
                const d = await videoPage.evaluate(
                  (video) => video?.duration,
                  video,
                );
                // console.warn(model.resCourseName + "获取时长", d);
                if (d && d > 0) {
                  return Math.ceil(d / 60);
                }
                throw new Error();
              },
              {
                delay: 2000,
                retry: 5,
                errorMsg: model.resCourseName + "获取视频时长失败",
              },
            );
            if (totalDuration) {
              store.setRecordVideoTotalDuration(model, totalDuration);
              return totalDuration;
            }
          }
          throw new Error("获取视频时长失败");
        };

        const playVideo = async () => {
          const clickBtn = async (selector: string) => {
            const btn = await videoPage.waitForSelector(selector, {
              timeout: 30 * 1000,
            });
            btn?.click();
          };
          await videoPage.bringToFront();
          await sleep(1000);
          // 这里有坑先播放才能静音
          await clickBtn(".vhallPlayer-playBtn.play");
          await clickBtn(".vhallPlayer-volume-btn");
        };

        let retry = 0;
        while (retry < 5) {
          try {
            console.log("获取视频... =>", model.resCourseName);
            const video = await getVideoEle();
            const totalDuration = await getVideoDuration(video);
            console.log(
              "准备播放视频 =>",
              model.resCourseName,
              totalDuration,
              "分钟",
            );
            await retryFn(playVideo, { retry: 5, delay: 2000 });
            let curTime = Number(model.duration ?? 0);
            if (curTime >= totalDuration) {
              console.log("该课程已完成 =>", model.resCourseName);
              await sleep(1000);
              await videoPage.close();
              store.setRecordLearnt(model, true);
              return;
            }

            console.log("播放中... =>", model.resCourseName);
            for await (const totalTime of setInterval(
              1000 * 60,
              totalDuration,
            )) {
              curTime++;
              if (totalTime && curTime >= totalTime + 1) {
                console.log("学习课程完成 =>", model.resCourseName);
                store.setRecordLearnt(model, true);
                break;
              }
            }
            await videoPage.close();
            return;
          } catch (e: Error | any) {
            retry++;
            console.warn(
              e?.message,
              "=>",
              model.resCourseName,
              "【重试】:",
              retry,
            );
            await videoPage.reload();
          }
        }
        // 播放失败
        console.log("播放失败=>", model.resCourseName);
        await videoPage.close();
        return;
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
      delay: 3000,
      allDone: async () => {
        console.log("本次任务执行完毕,正关闭进程");
        await sleep(3000);
        await browser.close();
        await browser.disconnect();
        process.exit();
      },
    });
  }
}
process.on("uncaughtException", (err) => {
  console.error("process error", err?.message);
});

main().catch((err) => {
  console.error("main error", err);
});
