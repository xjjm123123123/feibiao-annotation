const CONTENT_SOURCE = "vfs-content";
const POPUP_SOURCE = "vfs-popup";
const STARTUP_SOURCE = "vfs-startup";
const FEISHU_SESSION_STORAGE_KEY = "vf-feishu:session";
const FEISHU_SYNC_URL_STORAGE_KEY = "vf-feishu:sync-url";
const COLLAB_API_URL_STORAGE_KEY = "vf-collab:api-url";
const loginReturnTargets = new Map();
const pendingDeepLinks = new Map();
const activeTabs = new Set();
const deepLinkActivations = new Set();

chrome.tabs.onRemoved?.addListener((tabId) => {
  loginReturnTargets.delete(tabId);
  pendingDeepLinks.delete(tabId);
  activeTabs.delete(tabId);
  deepLinkActivations.delete(tabId);
});

chrome.webNavigation.onBeforeNavigate?.addListener((details) => {
  if (!details?.tabId || details.frameId !== 0) {
    return;
  }
  if (isAnnotationDeepLink(details.url)) {
    void captureAnnotationDeepLink(details.tabId, details.url);
    return;
  }
  if (!pendingDeepLinks.has(details.tabId)) {
    activeTabs.delete(details.tabId);
  }
});

chrome.webNavigation.onCompleted?.addListener((details) => {
  if (!details?.tabId) {
    return;
  }
  if (details.frameId === 0 && pendingDeepLinks.has(details.tabId)) {
    void activatePendingDeepLink(details.tabId);
    return;
  }
  if (details.frameId !== 0 && activeTabs.has(details.tabId)) {
    void injectIntoFrame(details.tabId, details.frameId);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.source === STARTUP_SOURCE && message.type === "VFS_STARTUP_RETRY") {
    if (!sender.tab?.id) {
      sendResponse({ ok: false, error: "当前网页不可用。" });
      return undefined;
    }
    activateTab(sender.tab, { source: "startup-retry" })
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
    return true;
  }
  if (!message || message.source !== CONTENT_SOURCE) {
    return undefined;
  }

  if (message.type === "VFS_PANEL_STATE_CHANGED") {
    const tabId = sender.tab?.id;
    if (tabId) {
      if (message.state?.mode === "off" && !message.state?.sidebarOpen) {
        activeTabs.delete(tabId);
      } else {
        activeTabs.add(tabId);
      }
    }
    chrome.runtime.sendMessage({
      source: CONTENT_SOURCE,
      type: "VFS_PANEL_STATE_CHANGED",
      tab: sender.tab ? tabSummary(sender.tab) : null,
      state: message.state || null
    }, () => {
      void chrome.runtime.lastError;
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "VFS_PANEL_RECORD_COMMITTED") {
    chrome.runtime.sendMessage({
      source: CONTENT_SOURCE,
      type: "VFS_PANEL_RECORD_COMMITTED",
      tab: sender.tab ? tabSummary(sender.tab) : null,
      storageKey: message.storageKey || "",
      record: message.record || null,
      count: Number.isFinite(message.count) ? message.count : 0
    }, () => {
      void chrome.runtime.lastError;
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "VFS_CAPTURE_VISIBLE_TAB") {
    const windowId = sender.tab?.windowId || chrome.windows.WINDOW_ID_CURRENT;
    captureVisibleTabWithFallback(windowId)
      .then((image) => sendResponse({ ok: true, image }))
      .catch((error) => sendResponse({ ok: false, error: error?.message || "截图失败，请重试。" }));
    return true;
  }

  if (message.type === "VFS_RELAY_ALL_FRAMES") {
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse({ ok: false, error: "TAB_MISSING" });
      return undefined;
    }
    sendToAllFrames(tabId, {
      ...(message.payload || {}),
      source: POPUP_SOURCE
    }, {
      excludeFrameIds: [Number.isFinite(sender.frameId) ? sender.frameId : 0]
    }).then(() => {
      sendResponse({ ok: true });
    }).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message.type === "VFS_MAGIC_LOGIN_SUCCESS") {
    const loginTabId = sender.tab?.id || 0;
    const returnTarget = loginReturnTargets.get(loginTabId) || (sender.tab?.openerTabId
      ? { tabId: sender.tab.openerTabId, windowId: sender.tab.windowId }
      : null);
    const sessionUpdate = {
      [FEISHU_SESSION_STORAGE_KEY]: {
        token: message.sessionToken || "",
        user: message.user || null,
        expiresAt: message.expiresAt || null,
        savedAt: Date.now(),
        source: "magic"
      },
      [FEISHU_SYNC_URL_STORAGE_KEY]: message.syncUrl || ""
    };
    if (message.collabUrl) {
      sessionUpdate[COLLAB_API_URL_STORAGE_KEY] = message.collabUrl;
    }
    chrome.storage.local.set(sessionUpdate, () => {
      if (chrome.runtime.lastError) {
        sendResponse({
          ok: false,
          error: chrome.runtime.lastError.message || "保存登录状态失败。"
        });
        return;
      }
      sendResponse({ ok: true, autoClose: Boolean(returnTarget) });
      if (returnTarget) {
        focusReturnTargetAndCloseLogin(returnTarget, loginTabId);
      }
    });
    return true;
  }

  if (message.type === "VFS_OPEN_URL") {
    const createOptions = {
      url: message.url,
      active: true
    };
    if (message.returnToOpener && sender.tab?.id) {
      createOptions.openerTabId = sender.tab.id;
    }
    chrome.tabs.create(createOptions, (createdTab) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          ok: false,
          error: chrome.runtime.lastError.message || "打开页面失败。"
        });
        return;
      }
      if (message.returnToOpener && sender.tab?.id && createdTab?.id) {
        loginReturnTargets.set(createdTab.id, {
          tabId: sender.tab.id,
          windowId: sender.tab.windowId
        });
      }
      sendResponse({ ok: true, tabId: createdTab?.id || 0 });
    });
    return true;
  }

  if (message.type === "VFS_CONSUME_DEEP_LINK") {
    sendResponse({ ok: true, deepLink: pendingDeepLinks.get(sender.tab?.id) || null });
    return true;
  }

  if (message.type === "VFS_DEEP_LINK_CONSUMED") {
    const tabId = sender.tab?.id;
    const current = pendingDeepLinks.get(tabId);
    if (current && (!message.threadId || current.threadId === message.threadId)) {
      pendingDeepLinks.delete(tabId);
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "VFS_DELIVER_TO_TRAE") {
    deliverToTrae(message.payload || {}, message.options || {})
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
    return true;
  }

  return undefined;
});

const TRAE_BRIDGE_DEFAULT_PORT = 51799;
const TRAE_BRIDGE_DEFAULT_TOKEN = "feibiao-local";

async function getTraeBridgeConfig() {
  try {
    const stored = await chrome.storage.local.get(["vf-trae-bridge:port", "vf-trae-bridge:token"]);
    return {
      port: Number(stored["vf-trae-bridge:port"]) || TRAE_BRIDGE_DEFAULT_PORT,
      token: stored["vf-trae-bridge:token"] || TRAE_BRIDGE_DEFAULT_TOKEN
    };
  } catch {
    return { port: TRAE_BRIDGE_DEFAULT_PORT, token: TRAE_BRIDGE_DEFAULT_TOKEN };
  }
}

// 由 service worker 发起本地回环请求,规避 https 页面的混合内容限制,且扩展请求不受 CORS 约束。
async function deliverToTrae(payload, options) {
  const config = await getTraeBridgeConfig();
  const port = Number(options?.port) || config.port;
  const token = options?.token || config.token;
  const base = `http://127.0.0.1:${port}`;

  // 先探活,给出更友好的失败提示
  try {
    const ping = await fetchWithTimeout(`${base}/ping`, { method: "GET" }, 1500);
    if (!ping.ok) {
      return { ok: false, error: "BRIDGE_UNREACHABLE", stage: "ping" };
    }
  } catch (error) {
    return { ok: false, error: "BRIDGE_UNREACHABLE", stage: "ping", detail: error?.message || String(error) };
  }

  try {
    const response = await fetchWithTimeout(`${base}/deliver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Feibiao-Token": token
      },
      body: JSON.stringify(payload)
    }, 15000);
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      return { ok: false, error: result.error || `HTTP_${response.status}`, result };
    }
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error: "DELIVER_FAILED", detail: error?.message || String(error) };
  }
}

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || 10000);
  return fetch(url, { ...options, cache: "no-store", signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

function isAnnotationDeepLink(value) {
  try {
    const url = new URL(String(value || ""));
    const action = url.searchParams.get("action");
    return url.protocol === "https:" &&
      url.hostname === "magic.solutionsuite.cn" &&
      url.pathname.startsWith("/api/faas/") &&
      (action === "open-annotation" || action === "open-page") &&
      Boolean(url.searchParams.get("token"));
  } catch {
    return false;
  }
}

async function captureAnnotationDeepLink(tabId, value) {
  try {
    const url = new URL(value);
    url.searchParams.set("format", "json");
    const response = await fetch(url.toString(), { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || !result.url || !result.chatId) {
      return;
    }
    const target = new URL(result.url);
    if (!/^https?:$/.test(target.protocol)) {
      return;
    }
    pendingDeepLinks.set(tabId, {
      url: target.href,
      chatId: String(result.chatId),
      threadId: String(result.threadId || ""),
      kind: result.threadId ? "annotation" : "page",
      pageKey: String(result.pageKey || "")
    });
    await chrome.tabs.update(tabId, { url: target.href });
  } catch (error) {
    console.warn("[VFS] 批注定位链接解析失败", error);
  }
}

function captureVisibleTabWithFallback(windowId) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let lastError = "";
    let retryTimer = 0;
    let timeoutTimer = 0;
    const finish = (image) => {
      const runtimeError = chrome.runtime.lastError?.message || "";
      if (runtimeError) {
        lastError = runtimeError;
      }
      if (!settled && image) {
        settled = true;
        clearTimeout(retryTimer);
        clearTimeout(timeoutTimer);
        resolve(image);
      }
    };
    chrome.tabs.captureVisibleTab(windowId, { format: "png" }, finish);
    retryTimer = setTimeout(() => {
      if (!settled) {
        chrome.tabs.captureVisibleTab({ format: "png" }, finish);
      }
    }, 1200);
    timeoutTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(lastError || "截图请求超时，请重试。"));
      }
    }, 5000);
  });
}

chrome.action.onClicked.addListener((tab) => {
  void activateTab(tab, { source: "browser-action" });
});

async function activateTab(tab, options = {}) {
  if (!tab?.id) {
    return { ok: false, error: "TAB_MISSING" };
  }

  await setActionLoading(tab.id);
  const expectedBuildId = chrome.runtime.getManifest().version;
  let ready = await sendToTopFrame(tab.id, { type: "VFS_PING" });
  const staleBuild = Boolean(ready?.ok && ready.state?.buildId && ready.state.buildId !== expectedBuildId);
  if (!ready?.ok || staleBuild) {
    const injected = await injectIntoTab(tab.id);
    if (!injected.ok) {
      await showStartupFailure(tab.id, injected.error);
      await setActionError(tab.id, injected.error);
      return injected;
    }
    ready = await sendToTopFrame(tab.id, { type: "VFS_PING" });
  }
  const response = ready?.ok ? await runInTopFrame(tab, { type: "VFS_ACTION_OPEN" }) : ready;
  if (response?.ok) {
    activeTabs.add(tab.id);
    await setActionIdle(tab.id);
    void sendToAllFrames(tab.id, {
      source: POPUP_SOURCE,
      type: "VFS_EXTERNAL_SYNC",
      mode: response.state?.mode || "read",
      sidebarOpen: true
    });
    void injectChildFrames(tab.id).then(() => sendToAllFrames(tab.id, {
      source: POPUP_SOURCE,
      type: "VFS_EXTERNAL_SYNC",
      mode: response.state?.mode || "read",
      sidebarOpen: true
    }));
    return { ...response, source: options.source || "" };
  }
  const error = response?.error || "飞标加载失败，请重试。";
  await showStartupFailure(tab.id, error);
  await setActionError(tab.id, error);
  return { ...(response || {}), ok: false, error };
}

function tabSummary(tab) {
  return {
    id: tab.id,
    title: tab.title || "",
    url: tab.url || ""
  };
}

async function focusReturnTargetAndCloseLogin(returnTarget, loginTabId) {
  try {
    if (returnTarget.windowId) {
      await chrome.windows.update(returnTarget.windowId, { focused: true });
    }
    await chrome.tabs.update(returnTarget.tabId, { active: true });
  } catch {
    // Returning focus is a convenience; login state has already been saved.
  }
  if (loginTabId) {
    setTimeout(() => {
      chrome.tabs.remove(loginTabId).catch(() => {});
      loginReturnTargets.delete(loginTabId);
    }, 300);
  }
}

async function injectIntoTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      files: ["startup.js"]
    });
    await Promise.all([
      chrome.scripting.insertCSS({
        target: { tabId, frameIds: [0] },
        files: ["content.css", "workbench.css"]
      }).catch(() => {}),
      chrome.scripting.executeScript({
        target: { tabId, frameIds: [0] },
        files: ["content.js"]
      })
    ]);
    return { ok: true };
  } catch (error) {
    console.warn("视觉评价侧栏版注入失败", error);
    return { ok: false, error: error?.message || String(error) };
  }
}

async function injectChildFrames(tabId) {
  let frames = [];
  try {
    frames = await chrome.webNavigation.getAllFrames({ tabId }) || [];
  } catch {
    return;
  }
  await Promise.allSettled(frames
    .filter((frame) => frame.frameId !== 0)
    .map((frame) => injectIntoFrame(tabId, frame.frameId)));
}

async function injectIntoFrame(tabId, frameId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId, frameIds: [frameId] },
      files: ["content.css", "workbench.css"]
    }).catch(() => {});
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      files: ["content.js"]
    });
  } catch {
    // Restricted or short-lived frames are not annotation targets.
  }
}

async function activatePendingDeepLink(tabId) {
  if (deepLinkActivations.has(tabId)) {
    return;
  }
  deepLinkActivations.add(tabId);
  try {
    const tab = await chrome.tabs.get(tabId);
    await activateTab(tab, { source: "deep-link" });
  } catch (error) {
    console.warn("[VFS] 批注深链激活失败", error);
  } finally {
    deepLinkActivations.delete(tabId);
  }
}

async function setActionLoading(tabId) {
  await Promise.allSettled([
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#3370ff" }),
    chrome.action.setBadgeText({ tabId, text: "..." }),
    chrome.action.setTitle({ tabId, title: "飞标正在打开" })
  ]);
}

async function setActionIdle(tabId) {
  await Promise.allSettled([
    chrome.action.setBadgeText({ tabId, text: "" }),
    chrome.action.setTitle({ tabId, title: "打开飞标" })
  ]);
}

async function setActionError(tabId, message) {
  await Promise.allSettled([
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#f54a45" }),
    chrome.action.setBadgeText({ tabId, text: "!" }),
    chrome.action.setTitle({ tabId, title: message || "飞标加载失败" })
  ]);
}

async function showStartupFailure(tabId, message) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      func: (errorMessage) => window.__VFS_STARTUP_LOADER__?.fail?.(errorMessage),
      args: [message || "请重试本次加载。"]
    });
  } catch {
    // Restricted pages cannot render in-page status; the action badge still reports failure.
  }
}

async function sendToAllFrames(tabId, message, options = {}) {
  let frames = [];
  try {
    frames = await chrome.webNavigation.getAllFrames({ tabId }) || [];
  } catch {
    frames = [{ frameId: 0 }];
  }

  const excluded = new Set(options.excludeFrameIds || []);
  await Promise.allSettled(frames.filter((frame) => !excluded.has(frame.frameId)).map((frame) => chrome.tabs.sendMessage(tabId, message, {
    frameId: frame.frameId
  })));
}

async function runInTopFrame(tab, payload) {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { ...payload, source: POPUP_SOURCE }, {
      frameId: 0
    });
    if (response) {
      return response;
    }
  } catch {
    // Fall back to a direct page-world bridge below. Some freshly injected pages
    // need one extra tick before their runtime listener is ready.
  }
  await delay(60);
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { ...payload, source: POPUP_SOURCE }, {
      frameId: 0
    });
    if (response) {
      return response;
    }
  } catch {
    // Continue to the legacy bridge for older installs/pages.
  }
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [0] },
      func: async (message, pageContext) => {
        const api = window.__VFS_SIDEBAR_REVIEW__;
        if (!api) {
          return { ok: false, error: "VFS_API_MISSING", needsInjection: true };
        }
        return api.handle(message, pageContext);
      },
      args: [
        { ...payload, source: POPUP_SOURCE },
        { title: tab.title || "", url: tab.url || "" }
      ]
    });
    return result?.result || { ok: false, error: "VFS_API_MISSING", needsInjection: true };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

async function sendToTopFrame(tabId, payload) {
  try {
    return await chrome.tabs.sendMessage(tabId, { ...payload, source: POPUP_SOURCE }, { frameId: 0 });
  } catch {
    return { ok: false, error: "VFS_API_MISSING", needsInjection: true };
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
