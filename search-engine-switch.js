// @ts-check

/**
 * @typedef {Object} SearchEngine
 * @property {string} name
 * @property {string} url
 * @property {string} identifier
 * @property {() => string|null} queryGetter
 */

/** @type {SearchEngine[]} */
const searchEngines = [
  {
    name: "Google",
    url: "https://www.google.com/search?q=%s",
    identifier: "google.com",
    queryGetter: () => new URLSearchParams(window.location.search).get("q"),
  },
  {
    name: "Perplexity",
    url: "https://www.perplexity.ai/?q=%s",
    identifier: "perplexity.ai",
    queryGetter: () => document.querySelector("h1")?.innerText ?? null,
  },
  {
    name: "必应",
    url: "https://www.bing.com/search?q=%s",
    identifier: "bing.com",
    queryGetter: () => new URLSearchParams(window.location.search).get("q"),
  },
  {
    name: "百度",
    url: "https://www.baidu.com/s?wd=%s",
    identifier: "baidu.com",
    queryGetter: () => new URLSearchParams(window.location.search).get("wd"),
  },
];

/**
 * 获取当前搜索关键词
 * @returns {string|null}
 */
function getSearchQuery() {
  const url = window.location.href;
  const engine = searchEngines.find((engine) =>
    url.includes(engine.identifier)
  );
  if (!engine) {
    throw new Error("未找到匹配的搜索引擎");
  }
  const query = engine.queryGetter();
  return query;
}

/**
 * 获取用户选择的搜索引擎
 * @returns {SearchEngine|null}
 */
function getSelectedEngine() {
  const localStorageKey = "search-engine-switch-last-use";
  
  let lastUse = searchEngines.findIndex(
    (engine) => engine.name === localStorage.getItem(localStorageKey)
  );
  if (lastUse === -1) lastUse = 1;
  else lastUse += 1;

  const selectedEngineIndex = prompt(
    "请选择搜索引擎(输入数字):\n" +
      searchEngines
        .map((engine, index) => `${index + 1}. ${engine.name}`)
        .join("\n"),
    lastUse.toString()
  );
  if (selectedEngineIndex === null) return null;

  const index = parseInt(selectedEngineIndex) - 1;
  if (isNaN(index) || !Number.isInteger(index)) {
    throw new Error("Invalid input: please enter a valid number");
  }
  if (index < 0 || index >= searchEngines.length) {
    throw new Error(
      `Please enter a number between 1 and ${searchEngines.length}`
    );
  }
  const selectedEngine = searchEngines[index];
  localStorage.setItem(localStorageKey, selectedEngine.name);
  return selectedEngine;
}

/**
 * 创建搜索引擎选择窗口
 * @param {string} query
 * @param {SearchEngine} searchEngine
 */
function createEngineSelector(query, searchEngine) {
  const searchUrl = searchEngine.url.replace("%s", encodeURIComponent(query));
  window.open(searchUrl, "_blank");
}

// 主函数
function main() {
  const query = getSearchQuery();
  if (!query) {
    throw new Error("未找到搜索关键词");
  }
  const engine = getSelectedEngine();
  if (!engine) {
    return;
  }
  createEngineSelector(query, engine);
}

try {
  main();
} catch (error) {
  alert(error.message);
}
