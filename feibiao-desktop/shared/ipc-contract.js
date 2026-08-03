"use strict";
/**
 * 飞标桌面版 v1.0 —— IPC 契约（唯一真相源）
 *
 * 三方共享此契约：
 *  1. Electron 主进程（electron/main.js）：注册 ipcMain.handle。
 *  2. 预加载脚本（electron/preload.js）：经 contextBridge 暴露给渲染层。
 *  3. Swift 边车（sidecar/）：以同名 method 字符串 + 同结构 JSON 对接（Swift 侧镜像本文件）。
 *
 * 设计原则（见方案文档 ADR-001）：
 *  - 所有需要 macOS TCC 权限的系统调用只经由边车执行，Electron 永不直接触碰系统 API。
 *  - 渲染层 → preload → main（ipcMain）→ 边车（stdio JSON-RPC）→ 原样回传。
 *  - v1.0 骨架阶段：边车各能力返回结构合法的“桩数据”，字段齐全但为占位实现。
 */

/** 渲染层可调用的 IPC 频道名（channel）。 */
const CHANNELS = Object.freeze({
  OVERLAY_ENTER: "overlay.enter",      // 进入框选浮层模式（方案 B：Electron 透明全屏窗口）
  OVERLAY_SUBMIT: "overlay.submit",    // 框选浮层内提交选区（浮层 → 主进程）
  OVERLAY_CANCEL: "overlay.cancel",    // 框选浮层内取消（Esc/空点，浮层 → 主进程）
  ELEMENT_AT: "element.at",            // 元素命中：给全局点，返回命中元素角色/文本/边界
  SELECTION_DONE: "selection.done",    // 框选完成，提交选区坐标
  CAPTURE: "capture",                  // 对选区截图
  TEXT_ARBITRATE: "text.arbitrate",    // 读取选区文本（辅助功能优先 + OCR 兜底 + 仲裁）
  PERM_STATUS: "perm.status",          // 查询各项权限授权状态
  PERM_OPEN_SETTINGS: "perm.openSettings", // 打开 macOS「系统设置」对应隐私页（引导授权）
  DELIVER: "deliver",                  // 打包并发送到 Trae Bridge
  SIDECAR_HANDSHAKE: "sidecar.handshake" // 边车握手/健康检查
});

/** 边车（Swift）识别的 method 名——与 CHANNELS 一一对应，避免两套命名漂移。
 *  注意：方案 B 起，overlay.enter 由 Electron 主进程独立承担（透明全屏窗口），
 *  不再转发边车，故此处不含 overlayEnter。 */
const SIDECAR_METHODS = Object.freeze({
  handshake: "sidecar.handshake",
  capture: "capture",
  textArbitrate: "text.arbitrate",
  permStatus: "perm.status",
  elementAt: "element.at"
});

/** 文本来源标签（仲裁结果 source 字段取值）。 */
const TEXT_SOURCE = Object.freeze({
  ACCESSIBILITY: "accessibility",
  OCR: "ocr",
  EMPTY: "empty"
});

/** 权限键——对应 macOS TCC 服务，与方案文档第 03 章权限清单一致。 */
const PERMISSION_KEYS = Object.freeze({
  ACCESSIBILITY: "accessibility",   // kTCCServiceAccessibility
  SCREEN_CAPTURE: "screenCapture",  // kTCCServiceScreenCapture
  INPUT_MONITORING: "inputMonitoring" // kTCCServiceListenEvent
});

/** 权限状态枚举。 */
const PERMISSION_STATE = Object.freeze({
  GRANTED: "granted",
  DENIED: "denied",
  NOT_DETERMINED: "notDetermined"
});

/**
 * 选区矩形（屏幕坐标，左上原点，points 单位）。
 * @typedef {{x:number,y:number,width:number,height:number,displayId?:number}} SelectionRect
 */

/**
 * 各频道的请求/响应形状（仅作文档与运行期校验依据；v1.0 不引入 TS）。
 * 每个响应都遵循统一信封：{ ok:boolean, data?:any, error?:{code,message} }。
 */
const SHAPES = Object.freeze({
  [CHANNELS.SIDECAR_HANDSHAKE]: {
    request: {},
    response: { ok: true, data: { name: "feibiao-sidecar", version: "string", pid: 0, ready: true } }
  },
  [CHANNELS.OVERLAY_ENTER]: {
    request: { mode: "region" },
    response: { ok: true, data: { entered: true, cancelled: false, rect: {} } }
  },
  [CHANNELS.OVERLAY_SUBMIT]: {
    request: { rect: { x: 0, y: 0, width: 0, height: 0 } },
    response: { ok: true, data: { accepted: true } }
  },
  [CHANNELS.OVERLAY_CANCEL]: {
    request: {},
    response: { ok: true, data: { accepted: true } }
  },
  [CHANNELS.ELEMENT_AT]: {
    request: { x: 0, y: 0, ignorePids: [] },
    response: {
      ok: true,
      data: {
        available: true, hit: true, hasFrame: true,
        role: "string", roleDescription: "string",
        title: "string", description: "string", value: "string", text: "string",
        rect: { x: 0, y: 0, width: 0, height: 0 }
      }
    }
  },
  [CHANNELS.SELECTION_DONE]: {
    request: { rect: { x: 0, y: 0, width: 0, height: 0, displayId: 0 } },
    response: { ok: true, data: { rect: {} } }
  },
  [CHANNELS.CAPTURE]: {
    request: { rect: { x: 0, y: 0, width: 0, height: 0, displayId: 0 } },
    response: { ok: true, data: { format: "png", base64: "string", width: 0, height: 0 } }
  },
  [CHANNELS.TEXT_ARBITRATE]: {
    request: { rect: { x: 0, y: 0, width: 0, height: 0, displayId: 0 } },
    response: { ok: true, data: { text: "string", source: "accessibility|ocr|empty", editable: true } }
  },
  [CHANNELS.PERM_STATUS]: {
    request: {},
    response: {
      ok: true,
      data: { accessibility: "granted", screenCapture: "granted", inputMonitoring: "notDetermined" }
    }
  },
  [CHANNELS.PERM_OPEN_SETTINGS]: {
    request: { key: "screenCapture" }, // accessibility | screenCapture | inputMonitoring
    response: { ok: true, data: { opened: true, key: "screenCapture" } }
  },
  [CHANNELS.DELIVER]: {
    request: { markdown: "string", feedback: {}, images: [{ name: "string", base64: "string" }] },
    response: { ok: true, data: { delivered: true, saved: "string", inject: {} } }
  }
});

/** 统一错误码。 */
const ERROR_CODES = Object.freeze({
  SIDECAR_UNAVAILABLE: "SIDECAR_UNAVAILABLE",
  SIDECAR_TIMEOUT: "SIDECAR_TIMEOUT",
  BAD_REQUEST: "BAD_REQUEST",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  BRIDGE_UNREACHABLE: "BRIDGE_UNREACHABLE",
  BRIDGE_NO_WORKSPACE: "NO_WORKSPACE",
  BRIDGE_TOKEN_MISMATCH: "TOKEN_MISMATCH",
  INTERNAL: "INTERNAL"
});

/** 统一响应信封构造器。 */
function ok(data) {
  return { ok: true, data: data ?? null };
}
function fail(code, message) {
  return { ok: false, error: { code: code || ERROR_CODES.INTERNAL, message: message || "" } };
}

/** Trae Bridge 默认连接参数（与浏览器插件 / trae-feibiao-bridge 对齐）。 */
const BRIDGE_DEFAULTS = Object.freeze({
  host: "127.0.0.1",
  port: 51799,
  token: "feibiao-local",
  pingPath: "/ping",
  deliverPath: "/deliver",
  tokenHeader: "X-Feibiao-Token"
});

module.exports = {
  CHANNELS,
  SIDECAR_METHODS,
  TEXT_SOURCE,
  PERMISSION_KEYS,
  PERMISSION_STATE,
  SHAPES,
  ERROR_CODES,
  BRIDGE_DEFAULTS,
  ok,
  fail
};
