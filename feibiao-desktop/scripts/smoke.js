"use strict";
/**
 * 飞标桌面版 v1.0 冒烟自检
 * 不依赖 Electron 运行时，直接在 Node 里验证两条主链路：
 *   1. Swift 边车：spawn 二进制 → 逐个 method 走 stdio JSON-RPC → 校验响应结构。
 *   2. Trae Bridge：GET /ping 探活；可选 POST /deliver。
 *
 * 用法：
 *   node scripts/smoke.js                 全部
 *   node scripts/smoke.js --only=sidecar  仅边车
 *   node scripts/smoke.js --only=bridge   仅 Bridge
 *   node scripts/smoke.js --deliver       Bridge 段附带真实 /deliver 投递
 */
const path = require("path");
const { createSidecar } = require("../electron/sidecar-bridge");
const { makeClient } = require("../electron/bridge-client");
const { SIDECAR_METHODS } = require("../shared/ipc-contract");

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1] || "all";
const withDeliver = args.includes("--deliver");

const C = { ok: "\x1b[32m", bad: "\x1b[31m", dim: "\x1b[90m", rst: "\x1b[0m" };
let pass = 0, failCount = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`${C.ok}✓${C.rst} ${name} ${C.dim}${detail || ""}${C.rst}`); }
  else { failCount++; console.log(`${C.bad}✗${C.rst} ${name} ${C.dim}${detail || ""}${C.rst}`); }
}

const RECT = { x: 100, y: 100, width: 300, height: 120, displayId: 0 };

async function smokeSidecar() {
  console.log(`\n${C.dim}—— 边车 stdio JSON-RPC ——${C.rst}`);
  const sc = createSidecar();
  if (!sc.isAvailable()) {
    check("边车二进制存在", false, "未构建，请先 npm run sidecar:build");
    return;
  }
  check("边车二进制存在", true, sc.binPath);

  const hs = await sc.call(SIDECAR_METHODS.handshake, {}, 5000);
  check("sidecar.handshake", hs.ok && hs.data && hs.data.ready === true,
    hs.ok ? `v${hs.data.version} pid=${hs.data.pid}` : JSON.stringify(hs.error));

  const perm = await sc.call(SIDECAR_METHODS.permStatus, {}, 5000);
  check("perm.status", perm.ok && typeof perm.data.accessibility === "string",
    perm.ok ? JSON.stringify(perm.data) : JSON.stringify(perm.error));

  const cap = await sc.call(SIDECAR_METHODS.capture, { rect: RECT }, 8000);
  check("capture", cap.ok && cap.data.format === "png" && typeof cap.data.base64 === "string",
    cap.ok ? `${cap.data.width}x${cap.data.height} b64(${cap.data.base64.length})` : JSON.stringify(cap.error));

  const txt = await sc.call(SIDECAR_METHODS.textArbitrate, { rect: RECT }, 8000);
  check("text.arbitrate", txt.ok && ["accessibility", "ocr", "empty"].includes(txt.data.source),
    txt.ok ? `source=${txt.data.source}` : JSON.stringify(txt.error));

  const bad = await sc.call(SIDECAR_METHODS.capture, {}, 5000); // 缺 rect，应报错
  check("capture 参数校验(应失败)", !bad.ok && bad.error.code === "BAD_REQUEST",
    JSON.stringify(bad.error || bad.data));

  sc.stop();
}

async function smokeBridge() {
  console.log(`\n${C.dim}—— Trae Bridge 连通 ——${C.rst}`);
  const client = makeClient();
  const ping = await client.ping();
  check("bridge /ping", ping.ok,
    ping.ok ? `${ping.data.service} v${ping.data.version}` : `${ping.error.code}: ${ping.error.message}`);

  if (!ping.ok) {
    console.log(`${C.dim}  （Bridge 未连通：请确认 Trae 已装 trae-feibiao-bridge 扩展并监听 51799）${C.rst}`);
    return;
  }
  if (withDeliver) {
    const d = await client.deliver({
      markdown: "# 飞标桌面版 v1.0 冒烟投递\n\n来自 smoke.js 的测试交付。",
      feedback: { format: "vfs-agent-feedback-package", feedback: [{ note: "smoke" }] },
      images: []
    });
    check("bridge /deliver", d.ok,
      d.ok ? `saved=${d.data.saved}` : `${d.error.code}: ${d.error.message}`);
  } else {
    console.log(`${C.dim}  （加 --deliver 可执行真实 /deliver 投递）${C.rst}`);
  }
}

(async () => {
  console.log("飞标桌面版 v1.0 冒烟自检");
  if (only === "all" || only === "sidecar") await smokeSidecar();
  if (only === "all" || only === "bridge") await smokeBridge();
  console.log(`\n结果：${C.ok}${pass} 通过${C.rst}，${failCount ? C.bad : C.dim}${failCount} 失败${C.rst}`);
  process.exit(failCount ? 1 : 0);
})();
