/**
 author: william   email:362661044@qq.com
 create_at: 2024/9/30
 **/

import { mkdirsSync, mkdirSync, writeJsonSync } from "fs-extra";
import path from "node:path";
import { globSync } from "node:fs";
import fs from "node:fs/promises";

const main = async () => {
  const sourcePath = path.resolve(__dirname, "../");
  console.log("sourcePath", sourcePath);
  const outPath = path.resolve(sourcePath, "./out");
  const dirs = {
    win: path.resolve(outPath, "/win64"),
    mac: path.resolve(outPath, "/macos-x64"),
    macArm: path.resolve(outPath, "/macos-arm64"),
  };
  const name = "auto-learnt";
  const fileNames = {
    win: name + "-win-x64.exe",
    mac: name + "-macos-x64",
    macArm: name + "-macos-arm64",
  };
  for (const key in dirs) {
    // @ts-ignore
    const dir = dirs[key];
    const newPath = path.join(outPath, dir);
    mkdirsSync(newPath);
    // @ts-ignore
    const fName = fileNames[key];
    await fs.copyFile(path.join(outPath, fName), path.join(newPath, fName));
    await fs.copyFile(
      path.join(sourcePath, "config.example.json"),
      path.join(newPath, "config.json"),
    );
    await fs.copyFile(
      path.join(sourcePath, "eng.traineddata"),
      path.join(newPath, "eng.traineddata"),
    );
    // 压缩
  }
};
main();
