import { TaskQueue } from "../src/taskQueue";
import { setInterval, scheduler } from "node:timers/promises";

async function main() {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const tasks = list.map((i) => {
    return async () => {
      console.log("任务开始", i);
      const fn = async () => {
        // 返回 0~10 随机数
        return Math.floor(Math.random() * 10);
      };

      // A
      while (true) {
        await scheduler.wait(1000);
        const t = await fn();
        console.log("任务执行中", i, t);
        if (t > 5) {
          console.log("任务执结束", i);
          break;
        }
      }

      // B
      for await (const time of setInterval(1000, fn)) {
        const t = await time();
        console.log("任务执行中", i, t);
        if (t > 8) {
          console.log("任务执结束", i);
          break;
        }
      }
    };
  });
  const taskQueue = new TaskQueue(tasks);
  await taskQueue.executeTaskQueue({
    maxTask: 3,
    allDone: async () => {
      console.log("本次任务执行完毕,正关闭进程");
    },
  });
}
main();
