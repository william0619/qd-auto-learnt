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
    const sourceLen = this.recordData.length;
    console.log(`获取课程: 一共获取到 ${sourceLen} 门课程`);
    // 过滤 未开始的 和 已经学习完毕的
    this.recordData = this.recordData.filter((item) => {
      return dayjs().isAfter(item.teachDateTime) && !item.isLearned();
    });
    console.log(`可执行: ${this.recordData.length} 门课程`);
    return this.recordData;
  }
}
