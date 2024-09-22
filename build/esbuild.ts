/**
 author: william   email:362661044@qq.com
 create_at: 2024/8/26
 **/

import esbuild from "esbuild";
import path from "node:path";

const result = await esbuild.build({
  // nodePaths: [path.resolve("./src")],
  entryPoints: [path.resolve("../src/main.ts")],
  outdir: "../dist",
  // outfile: '[name].mjs',
  target: ["node18"],
  format: "esm",
  bundle: true,
  lineLimit: 100,
  platform: "node",
  treeShaking: true,
  // sourcemap: true,
  packages: "external",
  outExtension: { ".js": ".mjs" },
  minify: false,
  metafile: true,
  allowOverwrite: true,
  plugins: [],
});
const text = await esbuild.analyzeMetafile(result.metafile);
console.log(text);
