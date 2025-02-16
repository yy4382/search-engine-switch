# Search Engine Switch Bookmarklet

A bookmarklet that allows you to switch between search engines on the fly.

Simple problem, simple solution. I don't like having a browser extension or Tampermonkey script to do such a simple task. So I made a bookmarklet.

## Supported Search Engines

- Google
- Bing
- Baidu
- Perplexity

## Usage

1. Create a new bookmark in your browser.
2. Name the bookmark whatever you want.
3. Copy the contents of [bookmarklet](./bookmarklet) and paste it into the URL field, or drag [this link][bookmarklet] to your bookmarks bar.
4. Save the bookmark.
5. Visit a search engine and click the bookmark to switch between search engines. You may need to allow popup windows for the bookmarklet to work.

[bookmarklet]: javascript:(function(){(()=>{var s=[{name:"Google",url:"https://www.google.com/search?q=%s",identifier:"google.com",queryGetter:()=>new URLSearchParams(window.location.search).get("q")},{name:"Perplexity",url:"https://www.perplexity.ai/?q=%s",identifier:"perplexity.ai",queryGetter:()=>document.querySelector("h1")?.innerText??null},{name:"Bing",url:"https://www.bing.com/search?q=%s",identifier:"bing.com",queryGetter:()=>new URLSearchParams(window.location.search).get("q")},{name:"Baidu",url:"https://www.baidu.com/s?wd=%s",identifier:"baidu.com",queryGetter:()=>new URLSearchParams(window.location.search).get("wd")}];function h(){let n=window.location.href,r=s.find(l=>n.includes(l.identifier));if(!r)throw new Error("No matching search engine found");return r.queryGetter()}async function w(){let n="search-engine-switch-last-use",r=localStorage.getItem(n)??s[0].name,t,l=new Promise((e,o)=>{t=y(s,r,{resolve:e,reject:o})});try{let e=await l;return localStorage.setItem(n,e.name),e}catch(e){return e===null?null:(alert("Error occurred, using default ".concat(s[0].name," engine: ")+e.message),s[0])}finally{t()}}function y(n,r,t){if(document.querySelector(".ses-dialog"))return t.reject(null),()=>{};let e=document.createElement("dialog"),o=document.querySelector("#ses-dialog-style");o||(o=document.createElement("style"),o.id="ses-dialog-style");let u=()=>{e.remove(),o.remove()};e.classList.add("ses-dialog"),o.innerHTML='\n    .ses-dialog {\n      width: 300px;\n      max-width: 90%;\n      border-radius: 8px;\n      border: none;\n      padding: 16px;\n      font-family: system-ui, sans-serif;\n      color: white;\n      background-color: black;\n    }\n    .ses-title {\n      font-size: 1.5em;\n      font-weight: bold;\n    }\n    #ses-engines-list {\n      margin-top: 16px;\n      display: grid;\n      gap: 8px;\n      grid-template-columns: 1fr;\n      label {\n        display: flex;\n        align-items: center;\n        input[type="radio"] {\n          margin-right: 8px;\n        }\n      }\n    }\n    .ses-button-group {\n      margin-top: 16px;\n      display: flex;\n      gap: 8px;\n      justify-content: flex-end;\n      button {\n        padding: 8px 16px;\n        border: none;\n        border-radius: 4px;\n        cursor: pointer;\n      }\n      .cancel-btn {\n        background-color:rgba(248, 249, 250, 0.27);\n      }\n      .submit-btn {\n        background-color: #007bff;\n        color: white;\n      }\n    }\n\n  ',e.innerHTML='\n    <form method="dialog">\n      <p class="ses-title">Select Search Engine</p>\n      <div id="ses-engines-list"></div>\n      <div class="ses-button-group">\n        <button type="button" class="cancel-btn" id="ses-cancelBtn">Cancel</button>\n        <button type="submit" class="submit-btn">Confirm</button>\n      </div>\n    </form>\n  ';let g=e.querySelector("#ses-engines-list");if(!g)return t.reject(new Error("Search engine selection box not found")),u;n.forEach(a=>{let i=document.createElement("input");i.type="radio",i.name="engine",i.value=a.name,i.id="engine-".concat(a.name),a.name===r&&(i.checked=!0);let c=document.createElement("label");c.htmlFor="engine-".concat(a.name),c.appendChild(i),c.appendChild(document.createTextNode(a.name)),g.appendChild(c)});let m=e.querySelector("form");m?.addEventListener("submit",a=>{a.preventDefault();let c=new FormData(m).get("engine");if(!c){t.reject(new Error("No search engine selected"));return}let p=n.find(f=>f.name===c);if(!p){t.reject(new Error("No matching search engine found"));return}t.resolve(p),e.close()}),e.querySelector("#ses-cancelBtn")?.addEventListener("click",()=>{t.reject(null),e.close()});let d=document.createDocumentFragment();return d.appendChild(e),d.appendChild(o),document.body.appendChild(d),e.showModal(),u}function b(n,r){let t=r.url.replace("%s",encodeURIComponent(n));window.open(t,"_blank")}async function x(){let n=h();if(!n)throw new Error("No search keyword found");let r=await w();r&&b(n,r)}x().catch(n=>{alert("Search Engine Switch Error: "+n.message)});})();})()