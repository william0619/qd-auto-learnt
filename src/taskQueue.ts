/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/27
 **/
import { sleep } from "./utils";

type ITask = () => Promise<any>;
export class TaskQueue {
  private readonly tasks: Array<ITask>;

  private queue: Generator<ITask>;

  private taskTotal = 0;

  private doneCount = 0;

  private runningCount = 0;

  constructor(tasks: Array<ITask>) {
    this.tasks = [...tasks];
    this.taskTotal = this.tasks.length;
    this.queue = this.createTaskQueue();
  }

  private *createTaskQueue() {
    while (true) {
      const task = this.tasks.shift();
      if (!task) return;
      yield async () => {
        this.runningCount++;
        // console.log("runningCount", this.runningCount);
        await task();
        this.doneCount++;
        this.runningCount--;
      };
    }
  }

  async executeTaskQueue(args: {
    maxTask: number;
    allDone?: () => void;
    stayDuration?: number;
  }) {
    let { maxTask = 1, allDone, stayDuration } = args;
    if (maxTask < 1) {
      throw new Error("maxTask不能小于1");
    }
    if (maxTask > this.tasks.length) {
      maxTask = this.tasks.length;
    }
    // 执行队列中的任务
    const executeNextTask = async () => {
      const { done, value: task } = this.queue.next();
      if (done) {
        if (this.doneCount === this.taskTotal) {
          allDone && allDone();
        }
        return;
      }
      if (task && typeof task === "function") {
        await task();
        executeNextTask(); // 递归调用以执行下一个任务
      }
    };

    for (let i = 0; i < maxTask; i++) {
      if (stayDuration) {
        await sleep(stayDuration);
      }
      executeNextTask(); // 初始执行最大并发数的任务
    }
  }
}
