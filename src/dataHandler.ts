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
              console.log("allData", allData);
            }
          }
          console.log("allData", allData);
          return allData;
        },
        subjectData,
        this.store.studentId,
        process.env.SEMESTER_NAME,
      );
      this.store.setRecord(curseRes);

      console.log("curseRes", curseRes);
    }
  }

  async findCourse(subjectData: Array<{ course_id: string }>) {}

  async getCourse() {
    const page = await this.browser.newPage();
    await page.goto(this.myCourseUrl);
    const resData = await page.evaluate(async () => {
      const form = new FormData();
      form.set("qry_month", "202409");
      // https://www.qiaoda.com.cn/api/service/Attendance/getCurrMonthCourse.json?bust=1726800192583
      const res = await window.fetch(
        `https://www.qiaoda.com.cn/api/service/Attendance/getCurrMonthCourse.json?bust=${Date.now()}`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          body: form,
        },
      );
      const r = await res.json();
      if (r.result === "0") {
        return r.Data;
      }
      return null;
    });
    // console.log("resData", resData);
    if (!resData) {
      await page.close();
      return;
    }

    this.store.setRecord(resData);
    const subject = this.store.groupByRecordSubject();
    const res2 = await page.evaluate(
      async (subject, semesterName) => {
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
        const tasks = subject.map((item) => {
          return getData({
            qry_course_id: item.course_id,
            qry_student_id: item.student_id,
          });
        });
        //
        const resList = await Promise.all(tasks);
        console.log("resList", resList);
        const r = resList.map(async (response) => {
          // @ts-ignore
          return await response.json();
        });
        console.log("r", r);
        return [];
      },
      subject,
      process.env.SEMESTER_NAME,
    );
    console.log("res2", res2);
  }
}
