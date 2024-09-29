/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/18
 **/
import { Browser, HTTPResponse, Page } from "puppeteer-core";
import { Store } from "./store";
import { sleep } from "./utils";

// https://saas-api.vhall.com/v3/webinars/watch/sdk-init
export class DataHandler {
  constructor(
    private browser: Browser,
    private store: Store,
  ) {}

  private myCourseUrl =
    "https://www.qiaoda.com.cn/edu/service/pc/my/myCourse.ftl?red=2&in=0";

  async setStudentId(page: Page) {
    // 获取
    const getStudentId = async (response: HTTPResponse) => {
      const url = response.url();
      if (
        url.includes(
          "https://www.qiaoda.com.cn/api/edu/Student/queryStudent.json",
        )
      ) {
        //
        if (response.ok()) {
          try {
            const res = await response.json();
            if (res.result === "0") {
              const d = res.Data.find((item: any) => {
                return item.school_name === globalThis.SCHOOL_NAME;
              });
              // console.log("d", d);
              this.store.studentId = d.student_id;
              page.off("response", getStudentId);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
    };
    page.on("response", getStudentId);
    console.log("获取用户信息...");
    await page.goto(this.myCourseUrl);
    await sleep(1000);
    // await page.close();
    return page;
  }

  async getCourseData(page?: Page) {
    if (this.store.studentId) {
      console.log("开始获取课程...");
      if (!page || page?.url() !== this.myCourseUrl) {
        page = await this.browser.newPage();
        await page.goto(this.myCourseUrl);
      }
      const subjectData = await page.evaluate(
        async (semesterName, studentId) => {
          const r = await window.fetch(
            `https://www.qiaoda.com.cn/api/service/Attendance/getCourseScheme.json?PageSize=0&qry_student_id=${studentId}`,
            {
              method: "GET",
              mode: "cors",
              credentials: "include",
            },
          );
          const resData = await r.json();
          if (resData.result === "0") {
            return resData.Data.filter((item: any) => {
              return item.semester_name === semesterName;
            });
          }
          return null;
        },
        globalThis.SEMESTER_NAME,
        this.store.studentId,
      );
      const curseRes = await page.evaluate(
        async (subject, studentId, semesterName) => {
          const getData = (args: {
            qry_course_id: string;
            qry_student_id: string;
          }) => {
            const qry_course_id = args.qry_course_id;
            const qry_student_id = args.qry_student_id;
            return window.fetch(
              `https://www.qiaoda.com.cn/api/edu/CourseScheme/queryCourseListByStudentID.json?PageSize=0&qry_course_id=${qry_course_id}&qry_semester_name=${semesterName}&qry_student_id=${qry_student_id}`,
              {
                method: "GET",
                mode: "cors",
                credentials: "include",
              },
            );
          };
          const tasks = subject.map((item: any) => {
            return getData({
              qry_course_id: item.course_id,
              qry_student_id: studentId,
            });
          });
          //
          const responseList = await Promise.all(tasks);
          let allData: any[] = [];
          for (const response of responseList) {
            const json = await response.json();
            if (json.result === "0") {
              allData = [...allData, ...json.Data];
            }
          }
          return allData;
        },
        subjectData,
        this.store.studentId,
        globalThis.SEMESTER_NAME,
      );
      return this.store.setRecord(curseRes);
    }
    return [];
  }

  async sign(
    page: Page,
    args: { signReqParamsData: any; addStudentRewardsParams: any },
  ) {
    const signData = await page.evaluate(async (m) => {
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
    }, args);
    const configObj = JSON.parse(signData.config_json);
    return { sourceData: signData, configObj: configObj };
  }
}
