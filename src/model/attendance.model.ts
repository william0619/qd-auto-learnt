/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/19
 **/
import dayjs from "dayjs";
import { start } from "node:repl";

export interface Record {
  attendance_id: string;
  course_code: string;
  course_name: string;
  course_scheme_id: string;
  course_id: string;
  res_folder_names: string;
  student_id: string;
  teacher_id: string;
  teach_date: string;
  teach_time: string;
  teach_time_text: string;
  semester_name: string;
  learning_duration: string;
  duration: string;
  vhall_id: string;
  vhall_company: string;
  sub_account: string;
  limit_user_top: string;
}
export class RecordModel implements Record {
  constructor(data: Record) {
    this.attendance_id = data.attendance_id;
    this.course_code = data.course_code;
    this.course_name = data.course_name;
    this.course_scheme_id = data.course_scheme_id;
    this.course_id = data.course_id;
    this.limit_user_top = data.limit_user_top;
    this.res_folder_names = data.res_folder_names;
    this.semester_name = data.semester_name;
    this.student_id = data.student_id;
    this.sub_account = data.sub_account;
    this.teach_date = data.teach_date;
    this.teach_time = data.teach_time;
    this.teach_time_text = data.teach_time_text;
    this.teacher_id = data.teacher_id;
    this.vhall_company = data.vhall_company;
    this.vhall_id = data.vhall_id;
    this.duration = data.duration;
    this.learning_duration = data.learning_duration;
  }

  get totalDurationMinutes(): number {
    const [start, end] = this.teach_time_text.split("~");
    const [sh, sm] = start.split(":");
    const [eh, em] = end.split(":");
    const a = dayjs.duration({ hours: +sh, minutes: +sm }).asMinutes();
    const b = dayjs.duration({ hours: +eh, minutes: +em }).asMinutes();
    return b - a;
  }

  get teachDateTime() {
    const [start] = this.teach_time_text.split("~");
    const [h, m] = start.split(":");
    return dayjs(this.teach_date).set("hours", +h).set("minutes", +m);
  }

  get teachDateTimeText() {
    return this.teachDateTime.format("YYYY-MM-DD HH:mm:ss");
  }

  isLearned() {
    return Number(this.learning_duration) >= this.totalDurationMinutes;
  }

  getSignReqParams() {
    return {
      teach_date: this.teach_date.substring(0, 10),
      teach_time: this.teach_time,
      sub_account: this.sub_account,
      limit_user_top: this.limit_user_top,
      vhallid: this.vhall_id,
      attendance_id: this.attendance_id,
    };
  }

  signReqParamsFormData() {
    const formData = new FormData();
    const params = this.getSignReqParams();
    for (const key in params) {
      // @ts-ignore
      formData.append(key, params[key]);
    }
    return formData;
  }

  attendance_id: string;
  course_code: string;
  course_id: string;
  course_name: string;
  course_scheme_id: string;
  duration: string;
  learning_duration: string;
  limit_user_top: string;
  res_folder_names: string;
  semester_name: string;
  student_id: string;
  sub_account: string;
  teach_date: string;
  teach_time: string;
  teach_time_text: string;
  teacher_id: string;
  vhall_company: string;
  vhall_id: string;
}
