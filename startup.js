(() => {
  const HOST_ID = "vfs-startup-host";
  const STARTUP_SOURCE = "vfs-startup";

  if (window.top !== window) {
    return;
  }

  const existing = window.__VFS_STARTUP_LOADER__;
  if (existing?.show) {
    existing.show();
    return;
  }

  const host = document.getElementById(HOST_ID) || document.createElement("div");
  host.id = HOST_ID;
  if (!host.isConnected) {
    (document.documentElement || document.body).append(host);
  }
  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .shell {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 2147483647;
        box-sizing: border-box;
        width: min(320px, calc(100vw - 36px));
        padding: 16px;
        border: 1px solid rgba(31, 35, 41, .12);
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 8px 28px rgba(31, 35, 41, .16);
        color: #1f2329;
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0;
      }
      .row { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .spinner {
        box-sizing: border-box;
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        border: 2px solid #d9e2ff;
        border-top-color: #3370ff;
        border-radius: 50%;
        animation: spin .75s linear infinite;
      }
      .copy { min-width: 0; }
      strong { display: block; margin: 0; color: #1f2329; font-size: 14px; font-weight: 600; }
      p { margin: 2px 0 0; color: #646a73; font-size: 12px; overflow-wrap: anywhere; }
      button {
        display: none;
        margin: 12px 0 0 34px;
        padding: 6px 14px;
        border: 0;
        border-radius: 6px;
        background: #3370ff;
        color: #fff;
        font: 13px/20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
      }
      .shell.is-waiting button, .shell.is-error button { display: inline-flex; }
      .shell.is-error .spinner { border-color: #ffd6d2; border-top-color: #f54a45; animation: none; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (prefers-color-scheme: dark) {
        .shell { border-color: rgba(255,255,255,.14); background: #252629; color: #f5f6f7; box-shadow: 0 8px 28px rgba(0,0,0,.36); }
        strong { color: #f5f6f7; }
        p { color: #bbbfc4; }
      }
      @media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 1.5s; } }
    </style>
    <section class="shell" role="status" aria-live="polite">
      <div class="row">
        <span class="spinner" aria-hidden="true"></span>
        <div class="copy">
          <strong>飞标正在打开</strong>
          <p>正在准备页面标注...</p>
        </div>
      </div>
      <button type="button">重试</button>
    </section>
  `;

  const shell = shadow.querySelector(".shell");
  const title = shadow.querySelector("strong");
  const detail = shadow.querySelector("p");
  const retry = shadow.querySelector("button");
  let slowTimer = 0;
  let waitingTimer = 0;

  function clearTimers() {
    clearTimeout(slowTimer);
    clearTimeout(waitingTimer);
  }

  function setState(state, heading, message) {
    shell.className = `shell${state ? ` is-${state}` : ""}`;
    title.textContent = heading;
    detail.textContent = message;
  }

  function show() {
    clearTimers();
    host.hidden = false;
    setState("", "飞标正在打开", "正在准备页面标注...");
    slowTimer = setTimeout(() => {
      setState("slow", "飞标正在打开", "页面内容较多，仍在加载...");
    }, 3000);
    waitingTimer = setTimeout(() => {
      setState("waiting", "加载时间较长", "可以继续等待，或重试本次加载。");
    }, 8000);
  }

  function fail(message) {
    clearTimers();
    host.hidden = false;
    setState("error", "飞标未能打开", message || "请重试本次加载。");
  }

  function dispose() {
    clearTimers();
    host.remove();
    delete window.__VFS_STARTUP_LOADER__;
  }

  retry.addEventListener("click", () => {
    show();
    chrome.runtime.sendMessage({ source: STARTUP_SOURCE, type: "VFS_STARTUP_RETRY" }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        fail(response?.error || chrome.runtime.lastError?.message || "加载失败，请重试。");
      }
    });
  });

  window.__VFS_STARTUP_LOADER__ = { show, fail, dispose };
  show();
})();
