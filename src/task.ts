import { Store } from "./store";
import { Page, Browser } from "puppeteer-core";

/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/13
 **/
// $scope.palyVideo = function(info) {
// 			console.log(info)
// 		    var _urlPath = "";
// 		    var reqInfo = {"vhallid":info.vhall_id,"attendance_id":info.attendance_id};
// 			reqInfo.teach_date = info.teach_date.substring(0,10);
// 			reqInfo.teach_time = info.teach_time;
// 			reqInfo.sub_account = info.sub_account;
// 			reqInfo.limit_user_top = info.limit_user_top;
// 			reqInfo.vhall_company = info.vhall_company;
// 			BaseService.post('/api/service/Attendance/signCourse.json',reqInfo).then(function(data){
// 			   var keyVal = data.Data[0].key_id;
// 			   $scope.key_id = data.Data[0].key_id;
// 			   _urlPath = data.Data[0].url;
// 			   var _configJson = data.Data[0].config_json;
// 			   $scope.addStudentRewards(info,_urlPath,_configJson);
// 			},function(err){
// 			  toaster.pop("error", "", "签到失败信息:"+err);
// 			});
// 		}
export class Task {
  get maxTask() {
    const num = Number(process.env.MAX_TASK ?? 10);
    if (num > 30) {
      return 30;
    }
    return num;
  }

  taskNum = 0;

  constructor(
    private browser: Browser,
    private store: Store,
  ) {}

  runTask() {}

  async runSign(page: Page) {
    const url = await page.evaluate(() => {});
  }
}
