"use strict";

const vscode = require("vscode");
const http = require("http");
const path = require("path");

// ---- 常量 ----
const OUTPUT_NAME = "飞标 Bridge";

let server = null;
let output = null;
let statusBar = null;

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  if (output) {
    output.appendLine(line);
  }
  console.log(`[feibiao-bridge] ${message}`);
}

function config() {
  const c = vscode.workspace.getConfiguration("feibiao.bridge");
  return {
    port: c.get("port", 51799),
    token: c.get("token", "feibiao-local"),
    deliverDir: c.get("deliverDir", ".feibiao/deliveries"),
    autoOpen: c.get("autoOpen", true),
    injectChatCommands: c.get("injectChatCommands", []),
    autoPasteAfterFocus: c.get("autoPasteAfterFocus", true),
    autoSubmit: c.get("autoSubmit", true),
    injectDelayMs: c.get("injectDelayMs", 350)
  };
}

function workspaceRoot() {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length) {
    return folders[0].uri;
  }
  return null;
}

function safeName(value, fallback) {
  const text = String(value || "").trim();
  if (!text) {
    return fallback;
  }
  return text.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").slice(0, 80);
}

function timestampDir() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

// ---- A 方案:把交付包写入工作区并打开 ----
async function persistDelivery(payload) {
  const root = workspaceRoot();
  if (!root) {
    throw new Error("NO_WORKSPACE");
  }
  const cfg = config();
  const dirName = timestampDir();
  const baseUri = vscode.Uri.joinPath(root, ...cfg.deliverDir.split("/").filter(Boolean), dirName);
  await vscode.workspace.fs.createDirectory(baseUri);

  const written = [];
  const encoder = new TextEncoder();

  const markdown = String(payload.markdown || "");
  if (markdown) {
    const mdUri = vscode.Uri.joinPath(baseUri, "feedback.md");
    await vscode.workspace.fs.writeFile(mdUri, encoder.encode(markdown));
    written.push(mdUri);
  }

  if (payload.feedback) {
    const jsonUri = vscode.Uri.joinPath(baseUri, "feedback.json");
    const jsonText = typeof payload.feedback === "string"
      ? payload.feedback
      : JSON.stringify(payload.feedback, null, 2);
    await vscode.workspace.fs.writeFile(jsonUri, encoder.encode(jsonText));
  }

  const images = Array.isArray(payload.images) ? payload.images : [];
  if (images.length) {
    const imagesUri = vscode.Uri.joinPath(baseUri, "images");
    await vscode.workspace.fs.createDirectory(imagesUri);
    for (const image of images) {
      const name = safeName(image.name, `image-${Math.random().toString(36).slice(2, 8)}.jpg`);
      const bytes = base64ToBytes(image.base64 || "");
      if (bytes.length) {
        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(imagesUri, name), bytes);
      }
    }
  }

  return { baseUri, primary: written[0] || null, relDir: `${cfg.deliverDir}/${dirName}` };
}

function base64ToBytes(base64) {
  const clean = String(base64 || "").replace(/^data:[^,]*,/, "");
  try {
    return Uint8Array.from(Buffer.from(clean, "base64"));
  } catch (_) {
    return new Uint8Array(0);
  }
}

// ---- B 方案:把内容真正发进 Trae 的 AI 会话 ----
// 依据实测 all-commands.txt,Trae(icube 内核)暴露了完整的 chat 命令。
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryInjectChat(text) {
  const result = { clipboard: false, method: null, focusedCommand: null, submitted: false, triedCommands: [] };
  try {
    await vscode.env.clipboard.writeText(text);
    result.clipboard = true;
  } catch (error) {
    log(`写入剪贴板失败: ${error && error.message}`);
  }

  const cfg = config();
  const available = new Set(await vscode.commands.getCommands(true));
  const has = (id) => available.has(id);
  const run = async (id, ...args) => {
    result.triedCommands.push(id);
    await vscode.commands.executeCommand(id, ...args);
  };

  // 0) 用户在设置里显式指定的命令,最高优先
  const configured = Array.isArray(cfg.injectChatCommands) ? cfg.injectChatCommands.filter(Boolean) : [];
  for (const cmd of configured) {
    if (!has(cmd)) continue;
    try {
      await run(cmd, text);
      result.method = "configured";
      result.focusedCommand = cmd;
      result.submitted = true;
      log(`已通过自定义命令发送: ${cmd}`);
      return result;
    } catch (error) {
      log(`自定义命令失败 ${cmd}: ${error && error.message}`);
    }
  }

  // 1) 首选:Trae 原生"发送给 Agent 且不阻塞",尝试多种传参形态
  if (has("icube.chat.sendToAgentNonBlocking")) {
    const variants = [
      [text],
      [{ text }],
      [{ message: text }],
      [{ prompt: text }],
      [{ content: text }]
    ];
    for (const args of variants) {
      try {
        await run("icube.chat.sendToAgentNonBlocking", ...args);
        result.method = "sendToAgentNonBlocking";
        result.focusedCommand = "icube.chat.sendToAgentNonBlocking";
        result.submitted = true;
        log(`已通过 icube.chat.sendToAgentNonBlocking 发送(参数形态 ${JSON.stringify(args)})`);
        return result;
      } catch (error) {
        log(`sendToAgentNonBlocking 传参失败 ${JSON.stringify(args)}: ${error && error.message}`);
      }
    }
  }

  // 2) 兜底:打开 icube 聊天面板 → 填入(带参/粘贴) → 提交
  const openCandidates = [
    "workbench.action.chat.icube.open",
    "workbench.action.chat.openInSidebar",
    "workbench.action.chat.newChat"
  ];
  let opened = null;
  for (const cmd of openCandidates) {
    if (!has(cmd)) continue;
    try {
      await run(cmd, text); // 带参无害,支持则直接填入
      opened = cmd;
      result.focusedCommand = cmd;
      log(`已打开 AI 会话面板: ${cmd}`);
      break;
    } catch (error) {
      log(`打开面板失败 ${cmd}: ${error && error.message}`);
    }
  }

  if (opened) {
    result.method = "open+submit";
    await delay(cfg.injectDelayMs || 350);

    // 若开面板命令未必已带入文本,则模拟粘贴把剪贴板内容落进输入框
    if (cfg.autoPasteAfterFocus && result.clipboard) {
      for (const pasteCmd of ["editor.action.clipboardPasteAction", "execPaste"]) {
        if (!has(pasteCmd)) continue;
        try {
          await run(pasteCmd);
          log(`已尝试模拟粘贴: ${pasteCmd}`);
          break;
        } catch (error) {
          log(`粘贴命令失败 ${pasteCmd}: ${error && error.message}`);
        }
      }
      await delay(150);
    }

    // 提交
    if (cfg.autoSubmit) {
      for (const submitCmd of ["workbench.action.chat.submit", "workbench.action.chat.sendToNewChat"]) {
        if (!has(submitCmd)) continue;
        try {
          await run(submitCmd);
          result.submitted = true;
          log(`已提交: ${submitCmd}`);
          break;
        } catch (error) {
          log(`提交失败 ${submitCmd}: ${error && error.message}`);
        }
      }
    }
  }

  return result;
}

// ---- HTTP 服务 ----
function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Feibiao-Token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(text);
}

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleDeliver(req, res) {
  const cfg = config();
  const token = req.headers["x-feibiao-token"];
  if (cfg.token && token !== cfg.token) {
    sendJson(res, 401, { ok: false, error: "TOKEN_MISMATCH" });
    return;
  }
  let payload;
  try {
    const raw = await readBody(req, 64 * 1024 * 1024);
    payload = JSON.parse(raw || "{}");
  } catch (error) {
    sendJson(res, 400, { ok: false, error: `BAD_PAYLOAD:${error && error.message}` });
    return;
  }

  const summary = { delivered: false, saved: null, inject: null };

  // A:落盘并打开(稳)
  try {
    const saved = await persistDelivery(payload);
    summary.saved = saved.relDir;
    summary.delivered = true;
    if (cfg.autoOpen && saved.primary) {
      const doc = await vscode.workspace.openTextDocument(saved.primary);
      await vscode.window.showTextDocument(doc, { preview: false });
    }
  } catch (error) {
    log(`落盘失败: ${error && error.message}`);
    if (String(error && error.message) === "NO_WORKSPACE") {
      sendJson(res, 409, { ok: false, error: "NO_WORKSPACE", hint: "请先在 Trae 打开一个工作区文件夹。" });
      return;
    }
  }

  // B:尝试注入 AI 对话框(能则最佳,不能则剪贴板兜底)
  try {
    summary.inject = await tryInjectChat(String(payload.markdown || ""));
  } catch (error) {
    log(`注入尝试失败: ${error && error.message}`);
  }

  const count = Array.isArray(payload?.feedback?.feedback) ? payload.feedback.feedback.length : undefined;
  const inj = summary.inject || {};
  vscode.window.showInformationMessage(
    `飞标已接收批注交付${count ? `(${count} 条)` : ""}。` +
    (inj.submitted
      ? "已自动发送到 AI 会话。"
      : inj.focusedCommand
        ? "已打开 AI 会话并填入内容,请回车发送(内容也在剪贴板)。"
        : "内容已在剪贴板,可粘贴到 AI 对话框。")
  );

  sendJson(res, 200, { ok: true, ...summary });
}

function startServer() {
  stopServer();
  const cfg = config();
  server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }
    const url = new URL(req.url, `http://127.0.0.1:${cfg.port}`);
    if (req.method === "GET" && url.pathname === "/ping") {
      sendJson(res, 200, { ok: true, service: "feibiao-bridge", version: "1.0.0" });
      return;
    }
    if (req.method === "POST" && url.pathname === "/deliver") {
      handleDeliver(req, res).catch((error) => {
        log(`处理 /deliver 异常: ${error && error.message}`);
        sendJson(res, 500, { ok: false, error: String(error && error.message) });
      });
      return;
    }
    sendJson(res, 404, { ok: false, error: "NOT_FOUND" });
  });

  server.on("error", (error) => {
    log(`服务启动失败(端口 ${cfg.port}): ${error && error.message}`);
    vscode.window.showErrorMessage(`飞标 Bridge 端口 ${cfg.port} 启动失败: ${error && error.message}`);
    updateStatus(false);
  });

  // 仅绑定回环地址,不对外网暴露
  server.listen(cfg.port, "127.0.0.1", () => {
    log(`飞标 Bridge 正在监听 http://127.0.0.1:${cfg.port}`);
    updateStatus(true);
  });
}

function stopServer() {
  if (server) {
    try {
      server.close();
    } catch (_) {
      // ignore
    }
    server = null;
  }
}

function updateStatus(running) {
  if (!statusBar) {
    return;
  }
  const cfg = config();
  statusBar.text = running ? `$(radio-tower) 飞标:${cfg.port}` : "$(error) 飞标:未运行";
  statusBar.tooltip = running
    ? `飞标 Bridge 正在监听 127.0.0.1:${cfg.port}`
    : "飞标 Bridge 未运行,点击查看状态";
  statusBar.show();
}

function activate(context) {
  output = vscode.window.createOutputChannel(OUTPUT_NAME);
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
  statusBar.command = "feibiao.bridge.showStatus";
  context.subscriptions.push(output, statusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand("feibiao.bridge.showStatus", () => {
      const cfg = config();
      output.show(true);
      log(`状态:端口=${cfg.port} 运行=${Boolean(server)} 落盘目录=${cfg.deliverDir}`);
    }),
    vscode.commands.registerCommand("feibiao.bridge.restart", () => {
      startServer();
      vscode.window.showInformationMessage("飞标 Bridge 已重启。");
    }),
    vscode.commands.registerCommand("feibiao.bridge.probeChatCommands", async () => {
      const all = (await vscode.commands.getCommands(true)).sort();
      // 放宽匹配词:覆盖 Trae/icube/marscode/solo 等国产 AI IDE 常见命名
      const re = /chat|\bai\b|copilot|assistant|prompt|ask|agent|icube|marscode|trae|solo|conversation|inline|compose|send|submit/i;
      const hits = all.filter((c) => re.test(c));
      output.show(true);
      log(`命令总数:${all.length},疑似 AI/会话相关:${hits.length} 个`);
      hits.forEach((c) => log(`  - ${c}`));

      // 导出全量命令,便于全文搜索
      try {
        const root = workspaceRoot();
        if (root) {
          const outUri = vscode.Uri.joinPath(root, ".feibiao", "all-commands.txt");
          await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(root, ".feibiao"));
          await vscode.workspace.fs.writeFile(outUri, new TextEncoder().encode(all.join("\n")));
          log(`已导出全部 ${all.length} 条命令到 .feibiao/all-commands.txt,可全文搜索。`);
          const doc = await vscode.workspace.openTextDocument(outUri);
          await vscode.window.showTextDocument(doc, { preview: false });
        } else {
          log("未打开工作区,无法导出全量命令文件;请打开一个文件夹后重试。");
        }
      } catch (error) {
        log(`导出全量命令失败:${error && error.message}`);
      }
      log("找到能填入/发送的命令后,填入设置 feibiao.bridge.injectChatCommands。");
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("feibiao.bridge.port") || event.affectsConfiguration("feibiao.bridge.token")) {
        startServer();
      }
    })
  );

  startServer();
}

function deactivate() {
  stopServer();
}

module.exports = { activate, deactivate };
