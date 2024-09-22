import dayjs from "dayjs";
import { RecordModel } from "./model/attendance.model";

/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/19
 **/

export class Store {
  recordData: Array<RecordModel> = [];

  subjectData: Array<any> = [];

  studentId: string = "";

  constructor() {}

  setRecord(data: Array<any>) {
    this.recordData = data.map((item) => {
      return new RecordModel(item);
    });
    this.recordData = this.recordData.filter((item) => {
      return dayjs().isAfter(item.teachDateTime);
    });
    console.log("this.recordData", this.recordData);
  }

  groupByRecordSubject(): Array<RecordModel> {
    const map = this.recordData.reduce((map, item) => {
      const course_code = item.course_code;
      if (!map.has(course_code)) {
        map.set(course_code, item);
      }
      return map;
    }, new Map<string, RecordModel>());

    return Array.from(map.values());
  }
}

export const store = new Store();
