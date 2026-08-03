"use strict";
/**
 * Trae Bridge 客户端
 * 复用现有 trae-feibiao-bridge 扩展开的固定端口本地服务（127.0.0.1:51799）。
 * 仅走回环地址，用 X-Feibiao-Token 头做简单校验。
 * 接口：ping() 探活；deliver(payload) 发送交付包。
 */
const http = require("http");
const { BRIDGE_DEFAULTS, ERROR_CODES, ok, fail } = require("../shared/ipc-contract");

function request(opts, bodyObj, timeoutMs) {
  return new Promise((resolve) => {
    const payload = bodyObj == null ? null : Buffer.from(JSON.stringify(bodyObj), "utf8");
    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch (_) { json = { raw: text }; }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on("error", (err) => resolve({ status: 0, error: err }));
    req.setTimeout(timeoutMs || 4000, () => {
      req.destroy();
      resolve({ status: 0, error: new Error("TIMEOUT") });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function makeClient(config) {
  const cfg = Object.assign({}, BRIDGE_DEFAULTS, config || {});

  async function ping() {
    const r = await request(
      { host: cfg.host, port: cfg.port, path: cfg.pingPath, method: "GET" },
      null,
      2500
    );
    if (r.status === 200 && r.json && r.json.ok) {
      return ok({ service: r.json.service, version: r.json.version });
    }
    return fail(ERROR_CODES.BRIDGE_UNREACHABLE,
      r.error ? String(r.error.message || r.error) : `HTTP ${r.status}`);
  }

  async function deliver(payload) {
    const r = await request(
      {
        host: cfg.host, port: cfg.port, path: cfg.deliverPath, method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          [cfg.tokenHeader]: cfg.token
        }
      },
      payload || {},
      8000
    );
    if (r.status === 200 && r.json && r.json.ok) {
      return ok({ delivered: r.json.delivered, saved: r.json.saved, inject: r.json.inject });
    }
    if (r.status === 401) return fail(ERROR_CODES.BRIDGE_TOKEN_MISMATCH, "令牌不匹配");
    if (r.status === 409) return fail(ERROR_CODES.BRIDGE_NO_WORKSPACE, "请先在 Trae 打开工作区文件夹");
    return fail(ERROR_CODES.BRIDGE_UNREACHABLE,
      r.error ? String(r.error.message || r.error) : `HTTP ${r.status}`);
  }

  return { ping, deliver, config: cfg };
}

module.exports = { makeClient };
