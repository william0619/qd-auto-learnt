/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/18
 **/
import type { Browser, Page } from "puppeteer-core";
import { createWorker } from "tesseract.js";
import { sleep } from "./utils";

export class Login {
  retry = 0;
  readonly maxTry = 3;

  constructor(private browser: Browser) {}

  async run() {
    return new Promise(async (resolve, reject) => {
      const page = await this.browser.newPage();
      await page.goto("https://www.qiaoda.com.cn/edu/service/pc/my/login.ftl");
      await page.type("#usercode", process.env.USER_NAME ?? "", { delay: 50 });
      await page.type("#userpwd", process.env.PASSWORD ?? "", { delay: 50 });

      const successCb = () => {
        setTimeout(() => {
          // console.log("登录成功");
          resolve(true);
          // page.close();
        }, 250);
      };

      page.on("response", async (response) => {
        const url = response.url();
        if (
          url.includes("https://www.qiaoda.com.cn/api/edu/Student/login.json")
        ) {
          if (response.ok()) {
            try {
              const r = await response.json();

              switch (r?.result) {
                // 验证码错误
                case "-1": {
                  this.retry++;
                  if (this.retry > this.maxTry) {
                    await page.evaluate(() => {
                      window.alert("重试次数超过最大次数 请手动登录！");
                    });
                  } else {
                    await sleep(300);
                    await this.login(page);
                  }
                  break;
                }
                case "10": {
                  // 密码错误
                  break;
                }
                default: {
                  // 其他错误
                  if (r?.error_code) {
                    reject(r?.error_description);
                  }
                }
              }
            } catch (e) {
              console.log("e", e);
              // 成功重定向
              successCb();
            }
          }
        }
      });

      await this.login(page);
    });
  }

  private async login(page: Page) {
    const element = await page.waitForSelector("#img_captcha");
    if (element) {
      const arrayBuffer = await element.screenshot();
      let codeBuffer = Buffer.from(arrayBuffer);
      // await sharp(codeBuffer).grayscale().toFile("./2.png");
      try {
        const worker = await createWorker("eng", 2, {
          legacyCore: true,
          legacyLang: true,
        });
        const result = await worker.recognize(codeBuffer);
        // 去除 \n 和 空格
        const code = result?.data.text.trim();
        await worker.terminate();
        console.log("code", code);
        // 清空input
        await page.$eval("#captchaCode", (el: any) => (el.value = ""));
        await page.type("#captchaCode", code, { delay: 50 });
        const btn = await page.$(".deal");
        btn?.click();
      } catch (e) {
        console.log("error", e);
      }
    }
  }

  private async getUserInfo() {}
}
