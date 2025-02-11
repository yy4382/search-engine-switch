const { exec } = await import("node:child_process");
const esbuild = await import("esbuild");

function copyToClipboard(text) {
  const command =
    process.platform === "darwin"
      ? `echo "${text}" | pbcopy` // macOS
      : process.platform === "win32"
      ? `echo ${text} | clip` // Windows
      : `echo "${text}" | xclip -selection clipboard`; // Linux with xclip

  exec(command, (error) => {
    if (error) {
      console.error("复制失败:", error);
      return;
    }
    console.log("内容已复制到剪贴板");
  });
}
async function minifyCode(code) {
  const result = await esbuild.transform(code, {
    minify: true,
  });

  return result.code;
}

async function build(code) {
  const minified = await minifyCode(code);
  copyToClipboard(minified);
}

async function getCode(
  url = "https://gist.githubusercontent.com/yy4382/dfd17cdadb5c6c61bafbd277869fd713/raw/search-engine-switch.js"
) {
  const response = await fetch(url);
  const code = await response.text();
  return code;
}

build(await getCode());
