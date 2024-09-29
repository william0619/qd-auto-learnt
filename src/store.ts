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
  studentId: string = "";

  // 重要数据
  recordData: Array<RecordModel> = [];

  // key=vhall_id  总时长
  recordVideoDurationMap: Record<string, number> = {};

  // key=course_id 是否看完
  recordLearntMap: Record<string, boolean> = {};

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

  get recordLearntPath() {
    return path.resolve(
      this.cachePath,
      `./${globalThis.SEMESTER_NAME}-recordLearnt.json`,
    );
  }

  constructor() {
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath);
    }
  }

  getRecord() {
    try {
      return readJSONSync(this.recordPath);
    } catch (e) {
      return null;
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
      let isLearned = this.getRecordLearnt()[item.course_id];
      const totalTime = this.getRecordVideoTotalDuration()[item.vhall_id];

      if (totalTime) {
        if (Number(item.duration) >= Number(totalTime) && !isLearned) {
          isLearned = true;
          this.setRecordLearnt(item.course_id, true);
        }
      }

      return dayjs().isAfter(item.teachDateTime) && !isLearned;
    });
    console.log(`可执行: ${this.recordData.length} 门课程`);
    return this.recordData;
  }

  getRecordVideoTotalDuration() {
    if (Object.keys(this.recordVideoDurationMap).length > 0) {
      return this.recordVideoDurationMap;
    }
    try {
      this.recordVideoDurationMap = this.getJsonFile(
        this.recordVideoDurationPath,
      );
      return this.recordVideoDurationMap;
    } catch (error) {
      return {};
    }
  }

  setRecordVideoTotalDuration(key: string, value: number) {
    this.recordVideoDurationMap = this.setJsonFile(
      this.recordVideoDurationPath,
      { key, value },
    );
    return this.recordVideoDurationMap;
  }

  getRecordLearnt() {
    if (Object.keys(this.recordLearntMap).length > 0) {
      return this.recordLearntMap;
    }
    try {
      this.recordLearntMap = this.getJsonFile(this.recordLearntPath);
      return this.recordLearntMap;
    } catch (error) {
      return {};
    }
  }

  setRecordLearnt(key: string, value: boolean) {
    this.recordLearntMap = this.setJsonFile(this.recordLearntPath, {
      key,
      value,
    });
    return this.recordLearntMap;
  }

  getJsonFile(path: string) {
    try {
      return readJSONSync(path);
    } catch (e) {
      return {};
    }
  }

  setJsonFile(path: string, data: Record<any, any>) {
    const j = this.getJsonFile(path);
    Object.assign(j, data);
    writeJsonSync(path, j);
    return j;
  }
}
