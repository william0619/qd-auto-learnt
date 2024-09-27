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

// var reqParam = {student_id:qry_student_id,source_id:_info.course_scheme_id};
// 			reqParam.rewards_content = "参加课程学习:"+_info.course_name+","+_info.res_folder_names;
// 			reqParam.sys_name = "service";
// 			reqParam.opr_id   = "learning";
// 			reqParam.actions_name  = "learningCourse";
// BaseService.post(curl('/api/service/StudentRewards/addStudentRewards.json'),reqParam).then(function(data){
// var configObj = JSON.parse(_configJson);
// 					var _videoPalyPath = "/edu/service/videoplay/v2/index.html";
// 					_videoPalyPath += "?app_key="+configObj.app_key;
// 					_videoPalyPath += "&signedat="+configObj.signedat;
// 					_videoPalyPath += "&sign="+configObj.sign;
// 					_videoPalyPath += "&id="+configObj.roomid;
// 					_videoPalyPath += "&account="+configObj.account;
//                     _videoPalyPath += "&userid="+JrafSession.get("userid");
// 					_videoPalyPath += "&username="+encodeURI(encodeURI(configObj.username));
// 					//_videoPalyPath += "&username="+configObj.username;
// 					_videoPalyPath += "&email="+configObj.email;
// 					_videoPalyPath += "&cid="+_info.course_id;
// 					_videoPalyPath += "&eid="+_info.evaluate_id;
// 					_videoPalyPath += "&rid="+_info.res_folder_ids;
// 					_videoPalyPath += "&aid="+_info.attendance_id;
// 					_videoPalyPath += "&csid="+_info.course_scheme_id;
// 					_videoPalyPath += "&vtype="+_info.vhall_type;
// 					_videoPalyPath += "&k="+$scope.key_id;
// 					// window.location.href=_videoPalyPath;
// 					window.open(_videoPalyPath);

// 	BaseService.post('api/service/Attendance/signCourse.json',reqInfo).then(function(data){
// 			   var keyVal = data.Data[0].key_id;
// 			   $scope.key_id = data.Data[0].key_id;
// 			   _urlPath = data.Data[0].url;
// 			   var _configJson = data.Data[0].config_json;
// 			   $scope.addStudentRewards(info,_urlPath,_configJson);
// 			},function(err){
// 			  toaster.pop("error", "", "签到失败信息:"+err);
// 			});
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
