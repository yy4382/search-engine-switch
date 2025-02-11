// @ts-check

import * as esbuild from "esbuild";
import clipboardy from "clipboardy";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

async function minifyCode({ inputFile, outputFile, write = true }) {
  /** @type {import('esbuild').Plugin} */
  const bookmarkletPlugin = {
    name: "bookmarklet",
    setup(build) {
      // 禁用 esbuild 的自动写入
      build.initialOptions.write = false;

      build.initialOptions.minify = true;
      build.initialOptions.supported = {
        ...build.initialOptions.supported,
        "template-literal": false,
      };

      build.onEnd(async ({ outputFiles }) => {
        if (outputFiles?.length) {
          outputFiles.forEach((file) => {
            // 修改输出内容
            const newContent = `javascript:(function(){${file.text.trimEnd()}})()`;
            // 使用新的内容更新
            file.contents = new TextEncoder().encode(newContent);

            // 手动写入文件
            if (write) {
              fs.mkdirSync(path.dirname(file.path), { recursive: true });
              fs.writeFileSync(file.path, file.contents);
            }
          });
        }
      });
    },
  };

  const result = await esbuild.build({
    entryPoints: [inputFile],
    outfile: outputFile,
    bundle: true,
    plugins: [bookmarkletPlugin],
  });

  return (result.outputFiles ?? [null])[0]?.text;
}

async function build() {
  const {
    values: { copy, inputFile, outputFile, write },
  } = parseArgs({
    options: {
      copy: {
        type: "boolean",
        short: "c",
      },
      inputFile: {
        type: "string",
        short: "i",
        default: "search-engine-switch.js",
      },
      outputFile: {
        type: "string",
        short: "o",
        default: "bookmarklet",
      },
      write: {
        type: "boolean",
        short: "w",
      },
    },
  });

  if (!write && !copy) {
    console.warn("No output method specified, do nothing");
    return;
  }

  const minified = await minifyCode({ inputFile, outputFile, write });
  if (!minified) {
    console.error("Failed to minify code");
    return;
  }
  if (copy) {
    clipboardy.writeSync(minified);
    console.log("Bookmarklet copied to clipboard");
  }
}

build();
