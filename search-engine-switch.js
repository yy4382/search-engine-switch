// 搜索引擎配置
const searchEngines = {
  baidu: {
    name: "百度",
    url: "https://www.baidu.com/s?wd=%s",
    identifier: "baidu.com",
    queryGetter: () => new URLSearchParams(window.location.search).get("wd"),
  },

  google: {
    name: "Google",
    url: "https://www.google.com/search?q=%s",
    identifier: "google.com",
    queryGetter: () => new URLSearchParams(window.location.search).get("q"),
  },
  // 必应: "https://www.bing.com/search?q=%s",
  bing: {
    name: "必应",
    url: "https://www.bing.com/search?q=%s",
    identifier: "bing.com",
    queryGetter: () => new URLSearchParams(window.location.search).get("q"),
  },
  perplexity: {
    name: "Perplexity",
    url: "https://www.perplexity.ai/?q=%s",
    identifier: "perplexity.ai",
    queryGetter: () => document.querySelector("h1").innerText,
  },
};

// 获取当前搜索关键词
function getSearchQuery() {
  const url = window.location.href;
  const engine = Object.keys(searchEngines).find((engine) =>
    url.includes(searchEngines[engine].identifier)
  );
  const query = engine ? searchEngines[engine].queryGetter() : null;
  return query;
}

// 创建搜索引擎选择窗口
function createEngineSelector(query) {
  const engines = Object.values(searchEngines);
  const selectedEngine = prompt(
    "请选择搜索引擎(输入数字):\n" +
      engines.map((engine, index) => `${index + 1}. ${engine.name}`).join("\n"),
    "1"
  );

  if (
    selectedEngine &&
    selectedEngine > 0 &&
    selectedEngine <= engines.length
  ) {
    const engine = engines[selectedEngine - 1];
    const searchUrl = engine.url.replace("%s", encodeURIComponent(query));
    window.open(searchUrl, "_blank");
  }
}

// 主函数
const query = getSearchQuery();
if (query) {
  createEngineSelector(query);
} else {
  alert("未找到搜索关键词");
}
