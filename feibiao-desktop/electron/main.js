"use strict";
/**
 * 飞标桌面版 v1.0 —— Electron 主进程
 * 职责：
 *  - 拉起主窗口（渲染层 UI 空壳）。
 *  - 注册全部 IPC handler，作为“渲染层 ⇄ Swift 边车 / Trae Bridge”的唯一编排层。
 *  - 系统权限相关调用全部转发给 Swift 边车（本进程不直接触碰 TCC API）。
 */
const { app, BrowserWindow, ipcMain, shell, screen } = require("electron");
const path = require("path");
const { CHANNELS, SIDECAR_METHODS, ERROR_CODES, ok, fail } = require("../shared/ipc-contract");
const { createSidecar } = require("./sidecar-bridge");
const { makeClient } = require("./bridge-client");

const sidecar = createSidecar();
const bridge = makeClient();
let mainWindow = null;

// —— 方案 B：框选由 Electron 透明全屏窗口承担（可见、可控），边车只负责纯截图 ——
let overlayWin = null;      // 当前框选浮层窗口
let overlayResolve = null;  // overlay.enter 的挂起 Promise resolver
let overlayDisplay = null;  // 本次框选覆盖的显示器（用于选区坐标换算）

function settleOverlay(result) {
  const r = overlayResolve;
  overlayResolve = null;
  overlayDisplay = null;
  // 浮层收敛后恢复主控制面板窗口（进入浮层时被隐藏，避免遮挡下方软件的元素命中）。
  if (mainWindow && !mainWindow.isDestroyed()) {
    try { mainWindow.show(); } catch (_) {}
  }
  if (r) r(result);
}

function closeOverlayWin() {
  if (overlayWin) {
    const w = overlayWin;
    overlayWin = null;
    try { w.close(); } catch (_) {}
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 460,
    height: 640,
    title: "飞标桌面版 v1.0",
    backgroundColor: "#0f1214",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
}

// ---- IPC 注册（与 shared/ipc-contract.js 严格对齐）----
function registerIpc() {
  // 边车握手
  ipcMain.handle(CHANNELS.SIDECAR_HANDSHAKE, async () => {
    return sidecar.call(SIDECAR_METHODS.handshake, {}, 4000);
  });

  // 进入框选浮层（方案 B）：主进程创建透明全屏 BrowserWindow 覆盖目标屏，
  // 用户在其中拖拽画选区；浮层将结果经 overlay.submit / overlay.cancel 回传，
  // 本 handler 挂起 Promise 直到选区提交/取消/超时，全程可见可控，不依赖边车 GUI。
  ipcMain.handle(CHANNELS.OVERLAY_ENTER, async (_e, params) => {
    // 允许非交互模式（自动化/无头）显式跳过 GUI。
    if (params && params.interactive === false) {
      return ok({ entered: true, interactive: false });
    }
    // 复用中：若已有浮层未结束，先收敛旧的，避免叠加。
    if (overlayResolve) settleOverlay(ok({ entered: true, cancelled: true, reason: "superseded" }));
    closeOverlayWin();

    // 隐藏主控制面板窗口：它 460×640 常驻屏幕中央，会遮挡下方软件，
    // 导致「元素选择」模式的 AX 命中打到本面板自身。隐藏后浮层结束再由 settleOverlay 恢复。
    if (mainWindow && !mainWindow.isDestroyed()) {
      try { mainWindow.hide(); } catch (_) {}
    }

    // 选定承载框选的显示器：默认主屏，可由 params.displayId 指定。
    const displays = screen.getAllDisplays();
    overlayDisplay =
      (params && params.displayId && displays.find((d) => d.id === params.displayId)) ||
      screen.getPrimaryDisplay();
    const b = overlayDisplay.bounds;

    overlayWin = new BrowserWindow({
      x: b.x, y: b.y, width: b.width, height: b.height,
      frame: false,
      transparent: true,
      hasShadow: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      enableLargerThanScreen: true,
      backgroundColor: "#00000000",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });
    overlayWin.setAlwaysOnTop(true, "screen-saver");
    overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreenScreens: true });
    overlayWin.loadFile(path.join(__dirname, "..", "renderer", "overlay.html"));
    overlayWin.once("ready-to-show", () => {
      if (overlayWin) { overlayWin.show(); overlayWin.focus(); }
    });
    // 浮层被意外关闭（例如失焦策略/用户强关）时，视为取消，避免 Promise 永挂。
    overlayWin.on("closed", () => {
      if (overlayResolve) settleOverlay(ok({ entered: true, cancelled: true, reason: "closed" }));
    });

    return new Promise((resolve) => {
      overlayResolve = resolve;
      // 安全阀：60s 无提交自动取消（人工框选留足时间，但绝不无限挂起）。
      const t = setTimeout(() => {
        if (overlayResolve) { closeOverlayWin(); settleOverlay(ok({ entered: true, cancelled: true, reason: "timeout" })); }
      }, 60000);
      // resolve 包一层以清理定时器
      const orig = overlayResolve;
      overlayResolve = (v) => { clearTimeout(t); orig(v); };
    });
  });

  // 框选浮层内部回传：提交选区（overlay.html → preload → 此处）。
  // 矩形模式：传窗口内 rect；元素模式：传窗口内 rect + meta（角色/文本等元素信息）。
  ipcMain.handle(CHANNELS.OVERLAY_SUBMIT, async (_e, params) => {
    const sel = params && params.rect;
    if (!sel || !(sel.width >= 1) || !(sel.height >= 1)) {
      return fail(ERROR_CODES.BAD_REQUEST, "选区非法");
    }
    // 浮层内坐标（相对该窗口/显示器左上，CSS px）→ 契约全局坐标（主屏左上原点 points）。
    const d = overlayDisplay || screen.getPrimaryDisplay();
    const rect = {
      x: Math.round(d.bounds.x + sel.x),
      y: Math.round(d.bounds.y + sel.y),
      width: Math.round(sel.width),
      height: Math.round(sel.height),
      displayId: d.id
    };
    closeOverlayWin();
    settleOverlay(ok({
      entered: true,
      cancelled: false,
      mode: (params && params.mode) || "region",
      rect,
      element: (params && params.meta) || null
    }));
    return ok({ accepted: true });
  });

  // 框选浮层内部回传：取消（Esc / 空点）。
  ipcMain.handle(CHANNELS.OVERLAY_CANCEL, async () => {
    closeOverlayWin();
    settleOverlay(ok({ entered: true, cancelled: true, reason: "user_cancel" }));
    return ok({ accepted: true });
  });

  // 框选完成（v1.0：主进程原样回执坐标，后续版本触发截图/取文本编排）
  ipcMain.handle(CHANNELS.SELECTION_DONE, async (_e, params) => {
    if (!params || !params.rect) return fail(ERROR_CODES.BAD_REQUEST, "缺少 rect");
    return ok({ rect: params.rect });
  });

  // 元素命中（v1.1）：浮层「元素选择」模式悬停时高频调用。
  // 入参 { x, y } 为浮层窗口内 CSS 坐标；叠加当前显示器 bounds → 全局坐标 → 边车 AX 命中；
  // 命中元素的全局 frame 再换算回浮层窗口内坐标，交由浮层绘制高亮框。
  ipcMain.handle(CHANNELS.ELEMENT_AT, async (_e, params) => {
    const px = params && params.x;
    const py = params && params.y;
    if (typeof px !== "number" || typeof py !== "number") {
      return fail(ERROR_CODES.BAD_REQUEST, "缺少坐标 x/y");
    }
    const d = overlayDisplay || screen.getPrimaryDisplay();
    const globalX = d.bounds.x + px;
    const globalY = d.bounds.y + py;
    // 穿透名单：飞标浮层是全屏透明窗口且置顶，system-wide 命中会先打到它自己。
    // 把飞标相关进程 pid 传给边车，令其跳过浮层、命中下方真实软件。
    const ignorePids = [process.pid];
    try {
      if (overlayWin && !overlayWin.isDestroyed()) {
        const osPid = overlayWin.webContents.getOSProcessId();
        if (osPid && !ignorePids.includes(osPid)) ignorePids.push(osPid);
      }
    } catch (_) {}
    const res = await sidecar.call(SIDECAR_METHODS.elementAt, { x: globalX, y: globalY, ignorePids }, 2500);
    // 诊断日志（走 stderr，不污染协议）：浮层局部 → 全局 → 边车命中结果。
    if (process.env.FEIBIAO_DEBUG_ELEMENT) {
      const dd = (res && res.data) || {};
      process.stderr.write(
        `[element.at] local(${px},${py}) global(${globalX},${globalY}) ` +
        `ok=${res && res.ok} hit=${dd.hit} role=${dd.role || "-"} ` +
        `rect=${dd.rect ? dd.rect.width + "x" + dd.rect.height + "@" + dd.rect.x + "," + dd.rect.y : "-"} ` +
        `text="${(dd.text || "").slice(0, 24)}"\n`
      );
    }
    if (!res.ok) return res;
    const data = res.data || {};
    // 把命中元素的全局 rect 换算成浮层窗口内坐标，供高亮绘制；同时保留全局 rect 供后续截图。
    if (data.hasFrame && data.rect) {
      data.localRect = {
        x: Math.round(data.rect.x - d.bounds.x),
        y: Math.round(data.rect.y - d.bounds.y),
        width: Math.round(data.rect.width),
        height: Math.round(data.rect.height)
      };
      // rect 附上 displayId，锁定后可直接用于 capture / text.arbitrate。
      data.rect = {
        x: Math.round(data.rect.x),
        y: Math.round(data.rect.y),
        width: Math.round(data.rect.width),
        height: Math.round(data.rect.height),
        displayId: d.id
      };
    }
    return ok(data);
  });

  // 截图
  ipcMain.handle(CHANNELS.CAPTURE, async (_e, params) => {
    if (!params || !params.rect) return fail(ERROR_CODES.BAD_REQUEST, "缺少 rect");
    return sidecar.call(SIDECAR_METHODS.capture, params, 8000);
  });

  // 文本仲裁（辅助功能优先 + OCR 兜底）
  ipcMain.handle(CHANNELS.TEXT_ARBITRATE, async (_e, params) => {
    if (!params || !params.rect) return fail(ERROR_CODES.BAD_REQUEST, "缺少 rect");
    return sidecar.call(SIDECAR_METHODS.textArbitrate, params, 8000);
  });

  // 权限状态
  ipcMain.handle(CHANNELS.PERM_STATUS, async () => {
    return sidecar.call(SIDECAR_METHODS.permStatus, {}, 4000);
  });

  // 打开「系统设置」对应隐私页，引导用户授权（纯 UI 跳转，不碰 TCC API）
  ipcMain.handle(CHANNELS.PERM_OPEN_SETTINGS, async (_e, params) => {
    const key = (params && params.key) || "screenCapture";
    const anchors = {
      screenCapture: "Privacy_ScreenCapture",
      accessibility: "Privacy_Accessibility",
      inputMonitoring: "Privacy_ListenEvent"
    };
    const anchor = anchors[key];
    if (!anchor) return fail(ERROR_CODES.BAD_REQUEST, `未知权限键: ${key}`);
    try {
      await shell.openExternal(`x-apple.systempreferences:com.apple.preference.security?${anchor}`);
      return ok({ opened: true, key });
    } catch (err) {
      return fail(ERROR_CODES.INTERNAL, `打开系统设置失败: ${err && err.message}`);
    }
  });

  // 交付到 Trae Bridge
  ipcMain.handle(CHANNELS.DELIVER, async (_e, payload) => {
    return bridge.deliver(payload || {});
  });
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  sidecar.stop();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => sidecar.stop());
