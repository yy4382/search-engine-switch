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
 * @returns {Promise<SearchEngine|null>}
 */
async function getSelectedEngine() {
  const localStorageKey = "search-engine-switch-last-use";
  const lastUse =
    localStorage.getItem(localStorageKey) ?? searchEngines[0].name;

  let cleaner;
  const promise = new Promise((resolve, reject) => {
    cleaner = drawSelectDialog(searchEngines, lastUse, { resolve, reject });
  });
  try {
    const selectedEngine = await promise;
    localStorage.setItem(localStorageKey, selectedEngine.name);
    return selectedEngine;
  } catch (error) {
    if (error === null) {
      // 用户取消选择
      return null;
    }
    alert(`出现错误，使用默认 ${searchEngines[0].name} 引擎：` + error.message);
    return searchEngines[0];
  } finally {
    // @ts-ignore
    cleaner();
  }
}

/**
 *
 * @param {SearchEngine[]} searchEngines
 * @param {string} lastUse name of last used search engine
 * @param {{ resolve: (engine: SearchEngine) => void, reject: (reason: Error|null) => void }} completePromise
 * @returns {()=>void} clean up function
 */
function drawSelectDialog(searchEngines, lastUse, completePromise) {
  const dialogAlreadyExist = document.querySelector(".ses-dialog");
  if (dialogAlreadyExist) {
    completePromise.reject(null);
    return () => {};
  }

  const dialog = document.createElement("dialog");
  let style = document.querySelector("#ses-dialog-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "ses-dialog-style";
  }
  const dialogRemover = () => {
    dialog.remove();
    style.remove();
  };
  dialog.classList.add("ses-dialog");
  style.innerHTML = `
    .ses-dialog {
      width: 300px;
      max-width: 90%;
      border-radius: 8px;
      border: none;
      padding: 16px;
      font-family: system-ui, sans-serif;
      color: white;
      background-color: black;
    }
    .ses-title {
      font-size: 1.5em;
      font-weight: bold;
    }
    #ses-engines-list {
      margin-top: 16px;
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr;
      label {
        display: flex;
        align-items: center;
        input[type="radio"] {
          margin-right: 8px;
        }
      }
    }
    .ses-button-group {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .cancel-btn {
        background-color:rgba(248, 249, 250, 0.27);
      }
      .submit-btn {
        background-color: #007bff;
        color: white;
      }
    }

  `;
  dialog.innerHTML = `
    <form method="dialog">
      <p class="ses-title">选择搜索引擎</p>
      <div id="ses-engines-list"></div>
      <div class="ses-button-group">
        <button type="button" class="cancel-btn" id="ses-cancelBtn">取消</button>
        <button type="submit" class="submit-btn">确认提交</button>
      </div>
    </form>
  `;
  const enginesDiv = dialog.querySelector("#ses-engines-list");
  if (!enginesDiv) {
    completePromise.reject(new Error("未找到搜索引擎选择框"));
    return dialogRemover;
  }
  searchEngines.forEach((engine) => {
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "engine";
    radio.value = engine.name;
    radio.id = `engine-${engine.name}`;
    if (engine.name === lastUse) {
      radio.checked = true;
    }
    const label = document.createElement("label");
    label.htmlFor = `engine-${engine.name}`;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(engine.name));
    enginesDiv.appendChild(label);
  });

  const form = dialog.querySelector("form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selectedEngineName = formData.get("engine");
    if (!selectedEngineName) {
      completePromise.reject(new Error("未选择搜索引擎"));
      return;
    }
    const selectedEngine = searchEngines.find(
      (engine) => engine.name === selectedEngineName
    );
    if (!selectedEngine) {
      completePromise.reject(new Error("未找到匹配的搜索引擎"));
      return;
    }
    completePromise.resolve(selectedEngine);
    dialog.close();
  });

  const cancelBtn = dialog.querySelector("#ses-cancelBtn");
  cancelBtn?.addEventListener("click", () => {
    completePromise.reject(null);
    dialog.close();
  });

  const fragment = document.createDocumentFragment();
  fragment.appendChild(dialog);
  fragment.appendChild(style);
  document.body.appendChild(fragment);
  dialog.showModal();
  return dialogRemover;
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
async function main() {
  const query = getSearchQuery();
  if (!query) {
    throw new Error("未找到搜索关键词");
  }
  const engine = await getSelectedEngine();
  if (!engine) {
    return;
  }
  createEngineSelector(query, engine);
}

main().catch((error) => {
  alert("Search Engine Switch Error: " + error.message);
});
