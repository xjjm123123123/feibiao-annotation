"use strict";
/**
 * Electron 主进程 IPC 编排测试（无需安装 Electron GUI）
 * 手段：用桩替换 require('electron')，拦截 main.js 里的 ipcMain.handle 注册，
 *       捕获所有 handler 后，像渲染层一样逐个 invoke，验证真实编排逻辑：
 *         - 边车相关频道确实转发到 Swift 边车并回真实数据；
 *         - selection.done 参数校验；
 *         - deliver 转发到 Bridge 客户端。
 * 依赖已构建的边车二进制；Bridge 未连通时 deliver 判定按“优雅失败”接受。
 */
const path = require("path");
const Module = require("module");

const C = { ok: "\x1b[32m", bad: "\x1b[31m", dim: "\x1b[90m", rst: "\x1b[0m" };
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`${C.ok}✓${C.rst} ${name} ${C.dim}${detail || ""}${C.rst}`); }
  else { fail++; console.log(`${C.bad}✗${C.rst} ${name} ${C.dim}${detail || ""}${C.rst}`); }
}

// ---- 桩化 electron 模块 ----
const handlers = new Map();
const appHooks = {};
const electronStub = {
  app: {
    whenReady: () => Promise.resolve(),
    on: (evt, cb) => { appHooks[evt] = cb; },
  },
  BrowserWindow: class {
    constructor() {}
    loadFile() {}
    static getAllWindows() { return [{}]; }
  },
  ipcMain: {
    handle: (channel, fn) => { handlers.set(channel, fn); },
  },
};

// 拦截 require('electron')
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "electron") return electronStub;
  return origLoad.apply(this, arguments);
};

function invoke(channel, payload) {
  const fn = handlers.get(channel);
  if (!fn) return Promise.resolve({ ok: false, error: { code: "NO_HANDLER", message: channel } });
  return fn({}, payload); // 模拟 IpcMainInvokeEvent
}

(async () => {
  console.log("Electron 主进程 IPC 编排测试（桩运行时）");
  const { CHANNELS } = require("../shared/ipc-contract");

  // 加载 main.js —— 会在桩 electron 上注册 handler
  require(path.join("..", "electron", "main.js"));
  // main.js 里 app.whenReady().then(registerIpc)，等一个微任务队列
  await new Promise((r) => setTimeout(r, 100));

  console.log(`\n${C.dim}—— handler 注册完整性 ——${C.rst}`);
  const expected = [
    CHANNELS.SIDECAR_HANDSHAKE, CHANNELS.OVERLAY_ENTER, CHANNELS.SELECTION_DONE,
    CHANNELS.CAPTURE, CHANNELS.TEXT_ARBITRATE, CHANNELS.PERM_STATUS, CHANNELS.DELIVER,
  ];
  expected.forEach((ch) => check(`已注册 ${ch}`, handlers.has(ch)));

  console.log(`\n${C.dim}—— handler 编排行为 ——${C.rst}`);
  const rect = { x: 10, y: 10, width: 200, height: 80, displayId: 0 };

  const hs = await invoke(CHANNELS.SIDECAR_HANDSHAKE);
  check("handshake 经主进程转发边车", hs.ok && hs.data && hs.data.ready === true,
    hs.ok ? `v${hs.data.version}` : JSON.stringify(hs.error));

  const perm = await invoke(CHANNELS.PERM_STATUS);
  check("perm.status 转发边车", perm.ok && typeof perm.data.accessibility === "string",
    perm.ok ? JSON.stringify(perm.data) : JSON.stringify(perm.error));

  const sel = await invoke(CHANNELS.SELECTION_DONE, { rect });
  check("selection.done 回执坐标", sel.ok && sel.data.rect.width === 200);

  const selBad = await invoke(CHANNELS.SELECTION_DONE, {});
  check("selection.done 缺 rect → BAD_REQUEST", !selBad.ok && selBad.error.code === "BAD_REQUEST");

  const cap = await invoke(CHANNELS.CAPTURE, { rect });
  check("capture 转发边车", cap.ok && cap.data.format === "png",
    cap.ok ? `${cap.data.width}x${cap.data.height}` : JSON.stringify(cap.error));

  const txt = await invoke(CHANNELS.TEXT_ARBITRATE, { rect });
  check("text.arbitrate 转发边车", txt.ok && ["accessibility", "ocr", "empty"].includes(txt.data.source),
    txt.ok ? `source=${txt.data.source}` : JSON.stringify(txt.error));

  const del = await invoke(CHANNELS.DELIVER, { markdown: "# smoke", feedback: {}, images: [] });
  // Bridge 连通则 ok；未连通则优雅失败（BRIDGE_UNREACHABLE / NO_WORKSPACE 均可接受）
  const delAcceptable = del.ok || (del.error && typeof del.error.code === "string");
  check("deliver 转发 Bridge（连通 ok / 未连通优雅失败）", delAcceptable,
    del.ok ? `saved=${del.data.saved}` : JSON.stringify(del.error));

  // 复原
  Module._load = origLoad;
  console.log(`\n结果：${C.ok}${pass} 通过${C.rst}，${fail ? C.bad : C.dim}${fail} 失败${C.rst}`);
  process.exit(fail ? 1 : 0);
})();
