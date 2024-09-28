import dayjs from "dayjs";
import { RecordModel } from "./model/attendance.model";
import path from "node:path";
import fs from "node:fs";
import { readJSONSync, writeJsonSync } from "fs-extra";
import { executableDir } from "./utils";

/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/19
 **/

export class Store {
  recordData: Array<RecordModel> = [];

  subjectData: Array<any> = [];

  studentId: string = "";

  recordVideoDurationMap: Record<string, number> = {};

  get cachePath() {
    return path.resolve(executableDir(), "./cache");
  }

  get recordPath() {
    return path.resolve(
      this.cachePath,
      `./${globalThis.SEMESTER_NAME}-record.json`,
    );
  }

  get recordVideoDurationPath() {
    return path.resolve(
      this.cachePath,
      `./${globalThis.SEMESTER_NAME}-recordVideoDuration.json`,
    );
  }

  constructor() {
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath);
    }
  }

  setRecord(data: Array<any>) {
    writeJsonSync(this.recordPath, data);
    this.recordData = data.map((item) => {
      return new RecordModel(item);
    });
    const sourceLen = this.recordData.length;
    console.log(`获取课程: 一共获取到 ${sourceLen} 门课程`);
    // 过滤 未开始的 和 已经学习完毕的
    this.recordData = this.recordData.filter((item) => {
      let isLearned = false;
      const curDuration = this.getRecordVideoDuration()[item.vhall_id];
      if (curDuration) {
        if (item.learning_duration >= curDuration) {
          isLearned = true;
        }
      }
      return dayjs().isAfter(item.teachDateTime) && !isLearned;
    });
    console.log(`可执行: ${this.recordData.length} 门课程`);
    return this.recordData;
  }

  getRecordVideoDuration() {
    if (Object.keys(this.recordVideoDurationMap).length > 0) {
      return this.recordVideoDurationMap;
    }
    try {
      const json = readJSONSync(this.recordVideoDurationPath);
      this.recordVideoDurationMap = json;
      return json;
    } catch (error) {
      return {};
    }
  }

  setRecordVideoDuration(key: string, value: number) {
    const json = this.getRecordVideoDuration() ?? {};
    json[key] = value;
    this.recordVideoDurationMap = json;
    writeJsonSync(this.recordVideoDurationPath, json);
    return this.recordVideoDurationMap;
  }
}
