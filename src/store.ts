import dayjs from "dayjs";
import { AttendanceModel } from "./model/attendance.model";

/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/19
 **/

export class Store {
  recordData: Array<AttendanceModel> = [];

  subjectData: Array<any> = [];

  studentId: string = "";

  constructor() {}

  setSubjectData(data: Array<any>) {
    this.subjectData = data;
  }

  setRecord(data: Array<AttendanceModel>) {
    this.recordData = data;
  }

  groupByRecordSubject(): Array<AttendanceModel> {
    const map = this.recordData.reduce((map, item) => {
      const course_code = item.course_code;
      if (!map.has(course_code)) {
        map.set(course_code, item);
      }
      return map;
    }, new Map<string, AttendanceModel>());

    return Array.from(map.values());
  }

  getUsableCourse() {
    this.recordData.filter((item) => {
      return dayjs(item.teach_date);
    });
  }
}

export const store = new Store();
