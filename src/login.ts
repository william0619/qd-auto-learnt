/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/18
 **/
import type { Browser, Page } from "puppeteer-core";
import { createWorker } from "tesseract.js";
import { sleep } from "./utils";
import path from "node:path";

export class Login {
  retry = 0;
  readonly maxTry = 6;

  constructor(private browser: Browser) {}

  async run() {
    return new Promise(async (resolve, reject) => {
      const page = await this.browser.newPage();
      await page.goto("https://www.qiaoda.com.cn/edu/service/pc/my/login.ftl");
      console.log("登录中...");
      await page.type("#usercode", globalThis.USER_NAME ?? "", { delay: 50 });
      await page.type("#userpwd", globalThis.PASSWORD ?? "", { delay: 50 });

      const successCb = () => {
        setTimeout(() => {
          resolve(true);
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
              // console.log("e", e);
              // 成功重定向
              successCb();
            }
          }
        }
      });
      await this.login(page);
      setTimeout(() => {
        page.close();
      }, 2000);
    });
  }

  private async login(page: Page) {
    const element = await page.waitForSelector("#img_captcha");
    if (element) {
      console.log("获取验证码图片...");
      const arrayBuffer = await element.screenshot();
      let codeBuffer = Buffer.from(arrayBuffer);
      // await sharp(codeBuffer).grayscale().toFile("./2.png");
      try {
        console.log("识别验证码...");
        const worker = await createWorker("eng", 2, {
          // cachePath: path.dirname(process.execPath),
          // cacheMethod: "none",
          legacyCore: true,
          legacyLang: true,
          // logger: (m) => console.log(m),
        });
        const result = await worker.recognize(codeBuffer);
        // 去除 \n 和 空格
        const code = result?.data.text.trim().replaceAll(/\s/g, "");
        // const code = result?.data.text.trim();
        await worker.terminate();
        console.log("识别 code", code);
        // 清空input
        await page.$eval("#captchaCode", (el: any) => (el.value = ""));
        await page.type("#captchaCode", code, { delay: 50 });
        const btn = await page.$(".deal");
        btn?.click();
      } catch (e) {
        // console.log("error", e);
        process.exit();
      }
    }
  }
}
