
### chrome浏览器默认路径
```shell
# macos
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

# windows
"C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### 使用说明
- 第一步：准备chrome最新版本浏览器 https://www.google.cn/intl/en_uk/chrome/
- 第二步：先编辑 config.json 文件，修改账户和密码
```shell       
{
  "CHROME_PATH": "你的浏览器路径" // 默认会根据平台获取路径, 除非自己修改了,否则不需要
  "MAX_TASK": "10", // 最大并发数 上线30
  "USER_NAME": "你的身份证",
  "PASSWORD": "你的密码",
  "SCHOOL_NAME": "广州大学", 
  "SEMESTER_NAME": "202409"
}

````
- 第三步：双击执行文件 auto-learnt 即可

### 支持的平台
· macOS apple arch       
· macOS Intel arch       
· Windows10
```shell
 "targets": [
      "node18-macos-arm64",
      "node18-macos-x64",
      "node18-win-x64"
    ],
```

### debug 启动
```shell
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```
