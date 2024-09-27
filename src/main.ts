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

    const tasks = [recordData[0], recordData[1]].map((model) => {
      return async () => {
        const signData = await page.evaluate(
          async (m) => {
            console.log("m", m);

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

            // student_id: 2c92e4518c9fe9bd018cab84582d1ed5
            // source_id: 2c9201c5917927df01917e16aa3a21ce
            // rewards_content: 参加课程学习:操作系统,第1次课
            // sys_name: service
            // opr_id: learning
            // actions_name: learningCourse
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
            // https://www.qiaoda.com.cn/edu/service/videoplay/v2/index.html?app_key=9e20bf73779b6627e21b8f0f7a9dce77&signedat=1727429348&sign=0abcdf6c54815ee68e98e4bc11170c85&id=503832594&account=b84582d1ed5&userid=2c92e4518c9fe9bd018cab84582d1ed5&username=%25E8%258E%25AB%25E7%2582%25B3%25E9%2591%25AB&email=20240823151500713707@qq.com&cid=2c9201c58d5dab2a018d5ec0df1223f9&eid=&rid=&aid=20240823151500713707&csid=2c9201c5917927df01917e16aa3a21ce&vtype=2&k=2c9201c59230b683019232d00b1434e7
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
        //vhallPlayer-playBtn play
        // vhallPlayer-volume-btn

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
    const taskQueue = new TaskQueue(tasks);
    taskQueue.executeTaskQueue({
      maxTask: 1,
      allDone: () => {
        console.log("123123", 123123);
      },
    });
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
