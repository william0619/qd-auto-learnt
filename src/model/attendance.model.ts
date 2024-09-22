/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/19
 **/
import dayjs from "dayjs";

export interface AttendanceRecord {
  attendance_id: string;
  course_scheme_id: string;
  student_id: string;
  res_folder_names: string;
  vhall_id: string;
  evaluate_id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  semester_name: string;
  teach_date: string; // 假设日期格式为 ISO 字符串，你也可以使用 Date 类型
  teach_time: string;
  sub_account: string;
  teach_time_text: string;
  teacher_name: string;
  room_type: string;
  attendance_type: string;
  sign_result: string;
  teacher_id: string;
  limit_user_top: string;
  vhall_company: string;
}
export class AttendanceModel implements AttendanceRecord {
  constructor(data: AttendanceRecord) {
    this.attendance_id = data.attendance_id;
    this.attendance_type = data.attendance_type;
    this.course_code = data.course_code;
    this.course_id = data.course_id;
    this.course_name = data.course_name;
    this.course_scheme_id = data.course_scheme_id;
    this.evaluate_id = data.evaluate_id;
    this.limit_user_top = data.limit_user_top;
    this.res_folder_names = data.res_folder_names;
    this.room_type = data.room_type;
    this.semester_name = data.semester_name;
    this.sign_result = data.sign_result;
    this.student_id = data.student_id;
    this.sub_account = data.sub_account;
    this.teach_date = data.teach_date;
    this.teach_time = data.teach_time;
    this.teach_time_text = data.teach_time_text;
    this.teacher_id = data.teacher_id;
    this.teacher_name = data.teacher_name;
    this.vhall_company = data.vhall_company;
    this.vhall_id = data.vhall_id;
  }

  attendance_id: string;
  attendance_type: string;
  course_code: string;
  course_id: string;
  course_name: string;
  course_scheme_id: string;
  evaluate_id: string;
  limit_user_top: string;
  res_folder_names: string;
  room_type: string;
  semester_name: string;
  sign_result: string;
  student_id: string;
  sub_account: string;
  teach_date: string;
  teach_time: string;
  teach_time_text: string;
  teacher_id: string;
  teacher_name: string;
  vhall_company: string;
  vhall_id: string;

  get durationTime() {
    const [start, end] = this.teach_time.split("~");
    const startTime = dayjs(start, "HH:mm");
    const endTime = dayjs(end, "HH:mm");
    return dayjs.duration(endTime.diff(startTime), "minutes");
  }

  get teachDateTime() {
    const [start] = this.teach_time.split("~");
    const [h, m] = start.split(":");
    return dayjs(this.teach_date).set("hours", +h).set("minutes", +m);
  }
}
