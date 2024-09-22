/**
 author: william   email:362661044@qq.com
 create_at:2024/7/17
 **/
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import filesize from "rollup-plugin-filesize";
import { nodeExternals } from "rollup-plugin-node-externals";

export default {
  input: "./src/main.ts",
  output: {
    // file: "./dist/main.js",
    format: "cjs",
    dir: "dist",
    sourcemap: true,
  },
  moduleContext: {},
  plugins: [
    babel({
      babelHelpers: "bundled",
      // skipPreflightCheck: true,
      exclude: "node_modules/**",
    }),
    typescript(),
    // json(),
    nodeExternals(),
    // nodeResolve(),
    // nodeResolve({
    //   resolveOnly: ["puppeteer-core", "dayjs", "node-fetch"],
    // }),
    commonjs(),
    filesize(),
    // terser(),
  ],
};
