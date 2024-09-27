/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/18
 **/
import { Browser, HTTPResponse, Page } from "puppeteer-core";
import { Store } from "./store";
import { sleep } from "./utils";

export class DataHandler {
  constructor(
    private browser: Browser,
    private store: Store,
  ) {}

  private myCourseUrl =
    "https://www.qiaoda.com.cn/edu/service/pc/my/myCourse.ftl?red=2&in=0";

  async setStudentId() {
    // 获取
    const page = await this.browser.newPage();
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
                return item.school_name === process.env.SCHOOL_NAME;
              });
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
    await page.goto(this.myCourseUrl);
    await sleep(1000);
    // await page.close();
    return page;
  }

  async getCourseData(page?: Page) {
    if (this.store.studentId) {
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
        process.env.SEMESTER_NAME,
        this.store.studentId,
      );

      this.store.subjectData = subjectData;

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
        process.env.SEMESTER_NAME,
      );
      this.store.setRecord(curseRes);
      return this.store.recordData;
    }
    return [];
  }
}
