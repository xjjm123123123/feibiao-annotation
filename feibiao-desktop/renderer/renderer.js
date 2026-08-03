"use strict";
/* 渲染层调试逻辑：仅通过 window.feibiao.* 调用（见 preload.js）。 */
const logEl = document.getElementById("log");
const RECT = { x: 100, y: 100, width: 300, height: 120, displayId: 0 }; // v1.0 占位选区

// 最近一次框选/选元素的结果暂存：交付时读取它组装真实内容。
// 结构：{ rect, mode, text, source, element, image:{format,base64,width,height} }
let lastSelection = null;

function log(msg, cls) {
  const t = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  const span = document.createElement("span");
  span.className = cls || "";
  span.textContent = `[${t}] ${msg}\n`;
  logEl.appendChild(span);
  logEl.scrollTop = logEl.scrollHeight;
}

function report(name, res) {
  if (res && res.ok) {
    log(`${name} ✓ ${JSON.stringify(res.data)}`, "ok");
  } else {
    const e = res && res.error ? `${res.error.code}: ${res.error.message}` : "未知错误";
    log(`${name} ✗ ${e}`, "bad");
  }
  return res;
}

async function refreshPerms() {
  const res = await window.feibiao.permStatus();
  report("perm.status", res);
  if (res && res.ok) {
    document.querySelectorAll("#perms .chip").forEach((chip) => {
      const k = chip.getAttribute("data-k");
      const state = res.data[k];
      chip.classList.remove("on", "off");
      if (state === "granted") chip.classList.add("on");
      else if (state === "denied") chip.classList.add("off");
      const label = { accessibility: "辅助功能", screenCapture: "屏幕录制", inputMonitoring: "输入监控" }[k];
      const mark = { granted: "✓", denied: "✗", notDetermined: "?" }[state] || "—";
      chip.textContent = `${label} ${mark}`;
    });
  }
}

document.getElementById("btn-handshake").onclick = async () => {
  log("→ 边车握手…", "dim");
  report("sidecar.handshake", await window.feibiao.handshake());
};
document.getElementById("btn-perm").onclick = refreshPerms;
document.getElementById("btn-overlay").onclick = async () => {
  log("→ 进入框选浮层（拖拽框选 / Tab 切元素选择，Esc 取消）…", "dim");
  const res = report("overlay.enter", await window.feibiao.overlayEnter({ mode: "region" }));
  if (!res || !res.ok) return;
  const d = res.data;
  if (d.cancelled) {
    log(`   已取消（${d.reason || "user_cancel"}）`, "dim");
    return;
  }
  if (!d.rect) return;

  if (d.mode === "element" && d.element) {
    // 元素选择：① 回显元素信息 ② 对元素矩形截图 ③ 提取元素文本
    const el = d.element;
    const roleLabel = el.roleDescription || el.role || "元素";
    log(`   元素命中 · ${roleLabel} @(${d.rect.x},${d.rect.y}) ${d.rect.width}×${d.rect.height} display=${d.rect.displayId}`, "ok");
    if (el.title) log(`   标题：${el.title}`, "dim");
    if (el.value) log(`   值：${el.value}`, "dim");
    if (el.description) log(`   描述：${el.description}`, "dim");
    const img = await doCapture(d.rect);
    // 元素文本：AX 已带回 meta.text 则直接用，否则回退文本仲裁（AX/OCR）。
    let text = (el.text || "").trim();
    let source = "accessibility";
    if (text) {
      log(`   元素文本（辅助功能）："${text}"`, "ok");
    } else {
      log("→ 元素无直读文本，回退文本仲裁…", "dim");
      const tr = report("text.arbitrate", await window.feibiao.arbitrateText(d.rect));
      if (tr && tr.ok) {
        text = tr.data.text || "";
        source = tr.data.source || "empty";
        log(`   来源=${source} 文本="${text}"`, "ok");
      }
    }
    // 暂存本次选中结果，供交付使用
    lastSelection = { rect: d.rect, mode: "element", text, source, element: el, image: img };
    log("   已暂存本次元素选择，可点「交付到 Trae」发送真实内容。", "dim");
    return;
  }

  // 矩形框选：框选后依次截图 + 取文本仲裁（辅助功能优先，OCR 兜底）。
  // 此前此分支只截图不取文，导致矩形框选下「取文本仲裁」不生效；与元素模式对齐。
  log(`   选区 ${d.rect.width}×${d.rect.height} @(${d.rect.x},${d.rect.y}) display=${d.rect.displayId}`, "ok");
  const img = await doCapture(d.rect);
  log("→ 取文本仲裁（辅助功能优先，OCR 兜底）…", "dim");
  let text = "";
  let source = "empty";
  const tr = report("text.arbitrate", await window.feibiao.arbitrateText(d.rect));
  if (tr && tr.ok) {
    text = tr.data.text || "";
    source = tr.data.source || "empty";
    log(`   来源=${source} 文本="${text}"`, "ok");
  }
  // 暂存本次选中结果，供交付使用
  lastSelection = { rect: d.rect, mode: "region", text, source, element: null, image: img };
  log("   已暂存本次框选，可点「交付到 Trae」发送真实内容。", "dim");
};
const bannerEl = document.getElementById("perm-banner");
const previewEl = document.getElementById("preview");
const previewImg = document.getElementById("preview-img");
const previewMeta = document.getElementById("preview-meta");

function showBanner(on) { bannerEl.classList.toggle("show", !!on); }

function showPreview(data) {
  previewImg.src = `data:image/${data.format || "png"};base64,${data.base64}`;
  previewMeta.textContent = `PREVIEW · ${data.width}×${data.height} · ${(data.base64 || "").length}B`;
  previewEl.classList.add("show");
}

// ④ 截图核心逻辑：区分真实截图 / 占位图（未授权）
// rect 可选：④ 按钮用占位 RECT；③ 框选后传入真实选区。
async function doCapture(rect) {
  const r = rect || RECT;
  log(`→ 截图 rect=${JSON.stringify(r)}`, "dim");
  const res = report("capture", await window.feibiao.capture(r));
  if (!res || !res.ok) {
    if (res && res.error && res.error.code === "PERMISSION_DENIED") showBanner(true);
    return null;
  }
  const d = res.data;
  log(`   截图 ${d.width}x${d.height} base64(${(d.base64 || "").length}B) stub=${!!d.stub}`, d.stub ? "bad" : "ok");
  if (d.stub) {
    // 占位图：说明未获屏幕录制授权，弹引导条，不覆盖预览
    showBanner(true);
    return null;
  }
  // 真实截图：隐藏引导条，渲染预览，并返回数据供交付暂存
  showBanner(false);
  if (d.base64) showPreview(d);
  return d;
}

document.getElementById("btn-capture").onclick = () => doCapture();

document.getElementById("btn-open-settings").onclick = async () => {
  log("→ 打开系统设置（屏幕录制隐私页）…", "dim");
  report("perm.openSettings", await window.feibiao.openSettings("screenCapture"));
};

document.getElementById("btn-retry-capture").onclick = async () => {
  log("→ 复查权限并重试截图…", "dim");
  await refreshPerms();
  await doCapture();
};
document.getElementById("btn-text").onclick = async () => {
  log("→ 文本仲裁…", "dim");
  const res = report("text.arbitrate", await window.feibiao.arbitrateText(RECT));
  if (res && res.ok) log(`   来源=${res.data.source} 文本="${res.data.text}"`, "ok");
};
// 把最近一次选中结果组装成交付载荷（markdown + 截图）。
function buildDeliveryPayload() {
  if (!lastSelection) {
    // 无选区：回退占位，并提示先框选
    return {
      empty: true,
      payload: {
        markdown: "# 飞标交付\n\n（尚未框选任何内容，这是占位文本。请先用「进入框选浮层」选取目标后再交付。）",
        feedback: { format: "vfs-agent-feedback-package", feedback: [{ note: "empty-selection" }] },
        images: []
      }
    };
  }

  const s = lastSelection;
  const el = s.element || {};
  const modeLabel = s.mode === "element" ? "元素选择" : "矩形框选";
  const lines = [];
  lines.push(`# 飞标交付 · ${modeLabel}`);
  lines.push("");
  if (s.text) {
    lines.push("## 选中文本");
    lines.push("");
    lines.push(s.text);
    lines.push("");
  }
  lines.push("## 元数据");
  lines.push("");
  lines.push(`- 模式：${modeLabel}`);
  if (s.rect) {
    lines.push(`- 选区：${s.rect.width}×${s.rect.height} @(${s.rect.x},${s.rect.y}) display=${s.rect.displayId}`);
  }
  lines.push(`- 文本来源：${s.source || "empty"}`);
  if (s.mode === "element") {
    if (el.role || el.roleDescription) lines.push(`- 元素角色：${el.roleDescription || el.role}`);
    if (el.title) lines.push(`- 元素标题：${el.title}`);
    if (el.value) lines.push(`- 元素值：${el.value}`);
    if (el.description) lines.push(`- 元素描述：${el.description}`);
  }

  const images = [];
  if (s.image && s.image.base64) {
    const ext = (s.image.format || "png").toLowerCase();
    images.push({ name: `selection-${Date.now()}.${ext}`, base64: s.image.base64 });
    lines.push(`- 截图：已附带（${s.image.width}×${s.image.height}）`);
  }

  return {
    empty: false,
    payload: {
      markdown: lines.join("\n"),
      feedback: {
        format: "vfs-agent-feedback-package",
        feedback: [{
          mode: s.mode,
          text: s.text || "",
          source: s.source || "empty",
          rect: s.rect || null,
          element: s.mode === "element" ? el : null
        }]
      },
      images
    }
  };
}

document.getElementById("btn-deliver").onclick = async () => {
  const built = buildDeliveryPayload();
  if (built.empty) {
    log("⚠ 尚未框选任何内容，将发送占位文本。建议先「进入框选浮层」选取目标。", "bad");
  } else {
    log(`→ 交付到 Trae Bridge（${lastSelection.mode === "element" ? "元素选择" : "矩形框选"}，文本${lastSelection.text ? "已带" : "为空"}，截图${built.payload.images.length ? "已带" : "无"}）…`, "dim");
  }
  report("deliver", await window.feibiao.deliver(built.payload));
};

// 启动即握手 + 查权限
(async () => {
  log("飞标桌面版 v1.0 渲染层就绪。", "dim");
  report("sidecar.handshake", await window.feibiao.handshake());
  await refreshPerms();
})();
