"use strict";
/**
 * 飞标桌面版 v1.0 集成测试（比 smoke.js 更深）
 * 覆盖三类骨架高风险点，均不依赖 Electron GUI、不打扰 Trae 会话：
 *   A. 契约一致性：ipc-contract.js 自洽性（频道↔方法↔形状↔错误码）。
 *   B. 边车协议健壮性：直接 spawn 边车，注入畸形/空/未知/并发请求，验证不崩溃且响应正确。
 *   C. Bridge 探活（只读 /ping，不投递）。
 */
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");
const contract = require("../shared/ipc-contract");
const { resolveBinPath } = require("../electron/sidecar-bridge");
const { makeClient } = require("../electron/bridge-client");

const C = { ok: "\x1b[32m", bad: "\x1b[31m", dim: "\x1b[90m", rst: "\x1b[0m" };
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`${C.ok}✓${C.rst} ${name} ${C.dim}${detail || ""}${C.rst}`); }
  else { fail++; console.log(`${C.bad}✗${C.rst} ${name} ${C.dim}${detail || ""}${C.rst}`); }
}

// ---- A. 契约一致性 ----
function testContract() {
  console.log(`\n${C.dim}—— A. 契约一致性 ——${C.rst}`);
  const { CHANNELS, SIDECAR_METHODS, SHAPES, ERROR_CODES, BRIDGE_DEFAULTS, ok, fail: cfail } = contract;

  check("CHANNELS 全为非空字符串",
    Object.values(CHANNELS).every((v) => typeof v === "string" && v.length > 0));

  // 需要边车执行的方法必须能在 SIDECAR_METHODS 找到对应值
  const sidecarVals = new Set(Object.values(SIDECAR_METHODS));
  const mustHaveSidecar = ["sidecar.handshake", "capture", "text.arbitrate", "perm.status"];
  check("边车方法名齐全", mustHaveSidecar.every((m) => sidecarVals.has(m)),
    [...sidecarVals].join(","));

  // 方案 B 架构守卫：框选由 Electron 主进程独立承担，overlay.enter 绝不再走边车
  check("overlay.enter 不在边车方法集（方案 B）", !sidecarVals.has("overlay.enter"),
    "框选由 Electron 透明全屏窗口承担");

  // 每个渲染层频道都应有 SHAPES 定义（deliver/handshake 等）
  const shapeKeys = Object.keys(SHAPES);
  const channelVals = Object.values(CHANNELS).filter((c) => c !== CHANNELS.SELECTION_DONE || true);
  check("SHAPES 覆盖全部频道",
    channelVals.every((c) => shapeKeys.includes(c)),
    `shapes=${shapeKeys.length} channels=${channelVals.length}`);

  check("统一信封 ok() 结构正确", (() => { const r = ok({ a: 1 }); return r.ok === true && r.data.a === 1; })());
  check("统一信封 fail() 结构正确", (() => {
    const r = cfail(ERROR_CODES.BAD_REQUEST, "x");
    return r.ok === false && r.error.code === "BAD_REQUEST" && r.error.message === "x";
  })());

  check("Bridge 默认参数对齐插件", BRIDGE_DEFAULTS.port === 51799 &&
    BRIDGE_DEFAULTS.host === "127.0.0.1" && BRIDGE_DEFAULTS.tokenHeader === "X-Feibiao-Token",
    `${BRIDGE_DEFAULTS.host}:${BRIDGE_DEFAULTS.port}`);
}

// ---- 直接 spawn 边车，逐行喂原始 JSON 文本 ----
function rawSidecarSession(binPath) {
  const child = spawn(binPath, [], { stdio: ["pipe", "pipe", "pipe"] });
  const rl = readline.createInterface({ input: child.stdout });
  const responses = [];
  let consumed = 0;          // 已被 nextResponse 取走的响应数
  const waiters = [];
  rl.on("line", (line) => {
    const t = line.trim();
    if (!t) return;
    let msg = null;
    try { msg = JSON.parse(t); } catch (_) { return; }
    responses.push(msg);
    const w = waiters.shift();
    if (w) { consumed++; w(msg); }   // 有等待者，直接交付并前移消费指针
  });
  return {
    child,
    writeRaw: (text) => child.stdin.write(text),
    nextResponse: (timeoutMs) => new Promise((resolve) => {
      // 先消费早到但尚未取走的缓冲响应，避免连发时丢配对
      if (consumed < responses.length) {
        resolve(responses[consumed++]);
        return;
      }
      const timer = setTimeout(() => resolve(null), timeoutMs || 4000);
      waiters.push((m) => { clearTimeout(timer); resolve(m); });
    }),
    stop: () => { try { child.kill(); } catch (_) {} rl.close(); },
    alive: () => child.exitCode === null
  };
}

async function testSidecarRobustness() {
  console.log(`\n${C.dim}—— B. 边车协议健壮性 ——${C.rst}`);
  const binPath = resolveBinPath();
  if (!binPath) { check("边车二进制存在", false, "请先 npm run sidecar:build:debug"); return; }
  check("边车二进制存在", true, path.basename(binPath));

  const s = rawSidecarSession(binPath);

  // 1) 畸形 JSON 行：边车应跳过且不崩溃
  s.writeRaw("这不是JSON{{{\n");
  s.writeRaw("\n");           // 空行
  s.writeRaw("   \n");        // 纯空白行
  // 紧接一个合法请求，验证进程仍存活且能正常响应
  s.writeRaw(JSON.stringify({ id: 1, method: "sidecar.handshake", params: {} }) + "\n");
  const r1 = await s.nextResponse(4000);
  check("畸形/空行后仍能响应", r1 && r1.id === 1 && r1.ok === true && r1.data.ready === true,
    r1 ? `v${r1.data && r1.data.version}` : "无响应");

  // 2) 未知 method → NOT_IMPLEMENTED
  s.writeRaw(JSON.stringify({ id: 2, method: "no.such.method", params: {} }) + "\n");
  const r2 = await s.nextResponse(4000);
  check("未知 method 返回 NOT_IMPLEMENTED",
    r2 && r2.id === 2 && r2.ok === false && r2.error.code === "NOT_IMPLEMENTED",
    r2 ? JSON.stringify(r2.error) : "无响应");

  // 3) capture 缺 rect → BAD_REQUEST
  s.writeRaw(JSON.stringify({ id: 3, method: "capture", params: {} }) + "\n");
  const r3 = await s.nextResponse(4000);
  check("capture 缺参 → BAD_REQUEST",
    r3 && r3.id === 3 && r3.ok === false && r3.error.code === "BAD_REQUEST",
    r3 ? JSON.stringify(r3.error) : "无响应");

  // 4) text.arbitrate 三态之一
  const rect = { x: 10, y: 10, width: 200, height: 80, displayId: 0 };
  s.writeRaw(JSON.stringify({ id: 4, method: "text.arbitrate", params: { rect } }) + "\n");
  const r4 = await s.nextResponse(6000);
  check("text.arbitrate source 合法且 editable",
    r4 && r4.ok && ["accessibility", "ocr", "empty"].includes(r4.data.source) && r4.data.editable === true,
    r4 ? `source=${r4.data.source}` : "无响应");

  // 5) 并发/连发多请求：id 必须正确配对回来
  const ids = [11, 12, 13, 14];
  ids.forEach((id) => s.writeRaw(JSON.stringify({ id, method: "perm.status", params: {} }) + "\n"));
  const got = [];
  for (let i = 0; i < ids.length; i++) {
    const r = await s.nextResponse(4000);
    if (r) got.push(r.id);
  }
  check("连发请求 id 全部正确回配",
    ids.every((id) => got.includes(id)) && got.length === ids.length,
    `期望[${ids}] 实得[${got}]`);

  check("批量请求后边车进程仍存活", s.alive());
  s.stop();
}

// ---- C. Bridge 只读探活 ----
async function testBridge() {
  console.log(`\n${C.dim}—— C. Trae Bridge 探活（只读）——${C.rst}`);
  const ping = await makeClient().ping();
  check("bridge /ping", ping.ok,
    ping.ok ? `${ping.data.service} v${ping.data.version}` : `${ping.error.code}: ${ping.error.message}`);
  if (!ping.ok) console.log(`${C.dim}  （Trae 未运行或未装桥接扩展时属预期，不计为骨架缺陷）${C.rst}`);
}

(async () => {
  console.log("飞标桌面版 v1.0 集成测试");
  testContract();
  await testSidecarRobustness();
  await testBridge();
  console.log(`\n结果：${C.ok}${pass} 通过${C.rst}，${fail ? C.bad : C.dim}${fail} 失败${C.rst}`);
  process.exit(fail ? 1 : 0);
})();
