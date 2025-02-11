import * as esbuild from "esbuild";
import clipboardy from "clipboardy";
import { readFileSync } from "fs";

async function minifyCode(inputFile) {
  const minifiedCode = (
    await esbuild.transform(readFileSync(inputFile, "utf8"), {
      minify: true,
    })
  ).code;

  // for unknown reasons, if minified, the \n in string will be real line break
  return minifiedCode.slice(0, -1).replaceAll("\n", "\\n");
}

async function build() {
  const minified = await minifyCode("search-engine-switch.js");
  const bookmarklet = `javascript:(function(){${minified}})()`;
  clipboardy.writeSync(bookmarklet);
  console.log("Bookmarklet copied to clipboard");
}

build();
