"use strict";
/**
 * 预加载脚本：经 contextBridge 将白名单 IPC 能力安全暴露给渲染层。
 * 渲染层只能调用 window.feibiao.* 下的固定方法，无法直接触碰 Node/Electron API。
 */
const { contextBridge, ipcRenderer } = require("electron");
const { CHANNELS } = require("../shared/ipc-contract");

const api = {
  handshake: () => ipcRenderer.invoke(CHANNELS.SIDECAR_HANDSHAKE),
  overlayEnter: (params) => ipcRenderer.invoke(CHANNELS.OVERLAY_ENTER, params),
  overlaySubmit: (payload) => ipcRenderer.invoke(CHANNELS.OVERLAY_SUBMIT, payload),
  overlayCancel: () => ipcRenderer.invoke(CHANNELS.OVERLAY_CANCEL),
  elementAt: (x, y) => ipcRenderer.invoke(CHANNELS.ELEMENT_AT, { x, y }),
  selectionDone: (rect) => ipcRenderer.invoke(CHANNELS.SELECTION_DONE, { rect }),
  capture: (rect) => ipcRenderer.invoke(CHANNELS.CAPTURE, { rect }),
  arbitrateText: (rect) => ipcRenderer.invoke(CHANNELS.TEXT_ARBITRATE, { rect }),
  permStatus: () => ipcRenderer.invoke(CHANNELS.PERM_STATUS),
  openSettings: (key) => ipcRenderer.invoke(CHANNELS.PERM_OPEN_SETTINGS, { key }),
  deliver: (payload) => ipcRenderer.invoke(CHANNELS.DELIVER, payload)
};

contextBridge.exposeInMainWorld("feibiao", api);
