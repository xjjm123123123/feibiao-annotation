"use strict";
/**
 * 框选浮层交互（方案 B · 双模式）。
 * 两种模式：
 *   - region ：拖拽画矩形选区（默认）。
 *   - element：悬停实时高亮软件 UI 元素，点击锁定并提交。
 * Tab 键在两种模式间切换。
 * 仅经 window.feibiao.{overlaySubmit,overlayCancel,elementAt} 与主进程通信（见 preload.js）。
 * 坐标口径：提交/上报的都是相对本浮层窗口左上角的 CSS px；
 *          主进程再叠加显示器 bounds 换算成契约全局坐标。
 */
const maskEl = document.getElementById("mask");
const selEl = document.getElementById("sel");
const hlEl = document.getElementById("hl");
const tagEl = document.getElementById("tag");
const hintEl = document.getElementById("hint");

let mode = "region";          // "region" | "element"
let done = false;             // 防止重复提交/取消

// —— 矩形模式状态 ——
let startX = 0, startY = 0;
let dragging = false;
let cur = { x: 0, y: 0, w: 0, h: 0 };

// —— 元素模式状态 ——
let elemThrottle = false;     // 节流闸门
let lastPointer = { x: 0, y: 0 };
let hoverEl = null;           // 当前命中元素（含 localRect / rect / role / text ...）

// ---------- 顶部提示 ----------
function renderHint() {
  if (mode === "region") {
    hintEl.innerHTML =
      '<b>矩形框选</b>：拖拽框选目标区域 · <span class="em">Tab</span> 切换元素选择 · Esc 取消';
  } else {
    hintEl.innerHTML =
      '<span class="em">元素选择</span>：移动鼠标高亮软件元素 · 单击锁定 · <b>Tab</b> 切回矩形 · Esc 取消';
  }
}

// ---------- 矩形选区绘制 ----------
function layoutSel(x, y, w, h) {
  selEl.style.display = "block";
  selEl.style.left = x + "px";
  selEl.style.top = y + "px";
  selEl.style.width = w + "px";
  selEl.style.height = h + "px";

  tagEl.style.display = "block";
  tagEl.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  placeTag(x, y);
}

// ---------- 标签定位（选区/高亮框左上外侧，靠边翻转到内侧）----------
function placeTag(x, y) {
  let tx = x;
  let ty = y - 24;
  if (ty < 4) ty = y + 4;
  if (tx < 4) tx = 4;
  tagEl.style.left = tx + "px";
  tagEl.style.top = ty + "px";
}

// ---------- 元素高亮绘制 ----------
function layoutHighlight(r, label) {
  hlEl.style.display = "block";
  hlEl.style.left = r.x + "px";
  hlEl.style.top = r.y + "px";
  hlEl.style.width = r.width + "px";
  hlEl.style.height = r.height + "px";

  tagEl.style.display = "block";
  tagEl.textContent = label;
  placeTag(r.x, r.y);
}

function clearHighlight() {
  hlEl.style.display = "none";
  tagEl.style.display = "none";
  hoverEl = null;
}

// ---------- 元素信息摘要（用于标签回显）----------
function summarize(data) {
  const role = data.roleDescription || data.role || "元素";
  const txt = (data.text || data.title || data.value || "").trim().replace(/\s+/g, " ");
  const short = txt.length > 42 ? txt.slice(0, 42) + "…" : txt;
  return short ? `${role} · ${short}` : role;
}

// ---------- 模式切换 ----------
function switchMode() {
  if (done) return;
  if (mode === "region") {
    mode = "element";
    // 收起矩形态
    dragging = false;
    selEl.style.display = "none";
    tagEl.style.display = "none";
    // 立即对当前指针做一次命中，给出即时反馈
    queryElementAt(lastPointer.x, lastPointer.y, true);
  } else {
    mode = "region";
    clearHighlight();
  }
  renderHint();
}

// ---------- 取消 ----------
function cancel() {
  if (done) return;
  done = true;
  window.feibiao.overlayCancel();
}

// ---------- 元素命中查询（节流）----------
function queryElementAt(x, y, force) {
  if (done || mode !== "element") return;
  if (elemThrottle && !force) return;
  elemThrottle = true;
  setTimeout(() => { elemThrottle = false; }, 60);

  window.feibiao.elementAt(x, y).then((res) => {
    if (done || mode !== "element") return;
    if (!res || !res.ok) { clearHighlight(); return; }
    const data = res.data || {};
    if (!data.available) {
      hlEl.style.display = "none";
      tagEl.style.display = "block";
      tagEl.textContent = "未授予「辅助功能」权限，无法读取元素";
      placeTag(x + 8, y + 8);
      hoverEl = null;
      return;
    }
    if (data.hit && data.hasFrame && data.localRect) {
      hoverEl = data;
      layoutHighlight(data.localRect, summarize(data));
    } else {
      clearHighlight();
    }
  }).catch(() => {
    if (mode === "element") clearHighlight();
  });
}

// ---------- 提交 ----------
function submitRegion() {
  if (done || cur.w < 2 || cur.h < 2) return cancel();
  done = true;
  window.feibiao.overlaySubmit({
    rect: { x: cur.x, y: cur.y, width: cur.w, height: cur.h },
    mode: "region"
  });
}

function submitElement() {
  if (done || !hoverEl || !hoverEl.localRect) return;
  done = true;
  const r = hoverEl.localRect;
  window.feibiao.overlaySubmit({
    rect: { x: r.x, y: r.y, width: r.width, height: r.height },
    mode: "element",
    meta: {
      role: hoverEl.role || "",
      roleDescription: hoverEl.roleDescription || "",
      title: hoverEl.title || "",
      description: hoverEl.description || "",
      value: hoverEl.value || "",
      text: hoverEl.text || "",
      // 全局 rect（含 displayId）：主进程亦会以浮层坐标换算，这里附带以便直查。
      globalRect: hoverEl.rect || null
    }
  });
}

// ---------- 事件 ----------
window.addEventListener("mousedown", (e) => {
  if (done || e.button !== 0) return;
  if (mode !== "region") return;
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  cur = { x: startX, y: startY, w: 0, h: 0 };
  layoutSel(startX, startY, 0, 0);
});

window.addEventListener("mousemove", (e) => {
  lastPointer = { x: e.clientX, y: e.clientY };
  if (mode === "region") {
    if (!dragging) return;
    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    cur = { x, y, w, h };
    layoutSel(x, y, w, h);
  } else {
    queryElementAt(e.clientX, e.clientY, false);
  }
});

window.addEventListener("mouseup", (e) => {
  if (done || e.button !== 0) return;
  if (mode === "region") {
    if (!dragging) return;
    dragging = false;
    submitRegion();
  }
});

// 元素模式：单击锁定（用 click 以避免与拖拽误判耦合）
window.addEventListener("click", (e) => {
  if (done || e.button !== 0) return;
  if (mode === "element") submitElement();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { cancel(); return; }
  if (e.key === "Tab") { e.preventDefault(); switchMode(); }
});

// 防止右键菜单干扰
window.addEventListener("contextmenu", (e) => e.preventDefault());

// 初始渲染提示
renderHint();
