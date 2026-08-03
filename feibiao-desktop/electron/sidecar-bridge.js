"use strict";
/**
 * Swift 边车桥接器（主进程侧）
 * 以子进程方式拉起 Swift 边车可执行文件，走 stdin/stdout 的行分隔 JSON-RPC 通信。
 *
 * 协议（每行一个 JSON 对象）：
 *   请求：{ "id": <number>, "method": "<method>", "params": { ... } }
 *   响应：{ "id": <number>, "ok": true, "data": {...} } | { "id": <number>, "ok": false, "error": {code,message} }
 *
 * v1.0 骨架：若边车二进制未构建/缺失，call() 返回 SIDECAR_UNAVAILABLE，不崩溃主进程，
 * 便于在未编译 Swift 的环境下先跑通 Electron + Bridge 主链路。
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { ERROR_CODES, ok, fail } = require("../shared/ipc-contract");

const DEFAULT_BIN = path.join(__dirname, "..", "sidecar", ".build", "release", "feibiao-sidecar");
const DEBUG_BIN = path.join(__dirname, "..", "sidecar", ".build", "debug", "feibiao-sidecar");

function resolveBinPath(custom) {
  if (custom && fs.existsSync(custom)) return custom;
  if (fs.existsSync(DEFAULT_BIN)) return DEFAULT_BIN;
  if (fs.existsSync(DEBUG_BIN)) return DEBUG_BIN;
  return null;
}

function createSidecar(options) {
  const opts = options || {};
  const binPath = resolveBinPath(opts.binPath);
  let child = null;
  let rl = null;
  let seq = 0;
  const pending = new Map();
  let ready = false;

  function start() {
    if (child) return true;
    if (!binPath) return false;
    child = spawn(binPath, [], { stdio: ["pipe", "pipe", "pipe"] });
    ready = true;
    rl = readline.createInterface({ input: child.stdout });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let msg = null;
      try { msg = JSON.parse(trimmed); } catch (_) { return; }
      if (msg && typeof msg.id === "number" && pending.has(msg.id)) {
        const { resolve, timer } = pending.get(msg.id);
        clearTimeout(timer);
        pending.delete(msg.id);
        resolve(msg.ok ? ok(msg.data) : fail(msg.error && msg.error.code, msg.error && msg.error.message));
      }
    });
    child.stderr.on("data", (d) => {
      process.stderr.write(`[sidecar] ${d}`);
    });
    child.on("exit", (code) => {
      ready = false;
      child = null;
      for (const [, p] of pending) {
        clearTimeout(p.timer);
        p.resolve(fail(ERROR_CODES.SIDECAR_UNAVAILABLE, `边车退出 code=${code}`));
      }
      pending.clear();
    });
    return true;
  }

  function call(method, params, timeoutMs) {
    return new Promise((resolve) => {
      if (!start()) {
        resolve(fail(ERROR_CODES.SIDECAR_UNAVAILABLE,
          "Swift 边车未构建，请先运行 npm run sidecar:build"));
        return;
      }
      const id = ++seq;
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          resolve(fail(ERROR_CODES.SIDECAR_TIMEOUT, `method=${method} 超时`));
        }
      }, timeoutMs || 6000);
      pending.set(id, { resolve, timer });
      try {
        child.stdin.write(JSON.stringify({ id, method, params: params || {} }) + "\n");
      } catch (err) {
        clearTimeout(timer);
        pending.delete(id);
        resolve(fail(ERROR_CODES.SIDECAR_UNAVAILABLE, String(err && err.message)));
      }
    });
  }

  function stop() {
    if (child) { try { child.kill(); } catch (_) {} child = null; }
    if (rl) { rl.close(); rl = null; }
  }

  return { start, call, stop, isAvailable: () => Boolean(binPath), binPath, get ready() { return ready; } };
}

module.exports = { createSidecar, resolveBinPath };
