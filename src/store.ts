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
    // 过滤 未开始的 和 已经学习完毕的
    this.recordData = this.recordData.filter((item) => {
      return dayjs().isAfter(item.teachDateTime) && !item.isLearned();
    });
    return this.recordData;
  }
}

export const store = new Store();
