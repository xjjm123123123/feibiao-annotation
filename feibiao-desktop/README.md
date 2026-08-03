# 飞标桌面版 v1.0 骨架

将飞标从浏览器插件演进为 macOS 桌面应用的 **v1.0 项目骨架**。本仓库对应《飞标桌面版 v1 改造方案》，落地其中的架构分层、IPC 契约与模块边界；系统能力目前为**结构合法的占位实现（桩）**，可跑通端到端主链路，后续版本逐步替换为真实实现。

## 架构分层（见方案文档 ADR-001）

```
渲染层(renderer) ──contextBridge──> preload ──ipcMain.invoke──> Electron 主进程(main)
                                                                     │
                                          ┌──────────────────────────┼───────────────────────┐
                                          ▼                          ▼                        ▼
                             Swift 边车(sidecar, stdio JSON-RPC)   Trae Bridge 客户端      IPC 契约(shared)
                             唯一持有 macOS TCC 权限的进程          127.0.0.1:51799         唯一协议真相源
```

- **所有需要 TCC 权限的系统调用只在 Swift 边车执行**，Electron 永不直接触碰系统 API。
- Electron 与边车通过子进程 **stdin/stdout 行分隔 JSON-RPC** 通信。
- 交付出口复用现有 `trae-feibiao-bridge` 扩展的本地固定端口 `51799`。

## 目录结构

```
feibiao-desktop/
├── package.json              # npm 脚本入口
├── shared/
│   └── ipc-contract.js       # IPC 契约（频道/方法/形状/错误码）——唯一真相源
├── electron/
│   ├── main.js               # 主进程：注册全部 IPC handler，编排边车与 Bridge
│   ├── preload.js            # contextBridge 白名单暴露 window.feibiao.*
│   ├── sidecar-bridge.js     # 拉起 Swift 边车，stdio JSON-RPC 客户端
│   └── bridge-client.js      # Trae Bridge HTTP 客户端（ping / deliver）
├── renderer/
│   ├── index.html            # 冒烟调试面板 UI 空壳
│   └── renderer.js           # 六步链路手动触发
├── sidecar/                  # Swift 边车（SwiftPM 可执行）
│   ├── Package.swift
│   └── Sources/feibiao-sidecar/
│       ├── main.swift            # stdio JSON-RPC 主循环 + method 分发
│       ├── Protocol.swift        # 协议类型（镜像 ipc-contract.js）
│       ├── Permission.swift      # 权限探测（M-Perm）
│       ├── CaptureEngine.swift   # 截图引擎（M2，ScreenCaptureKit 目标）
│       ├── AccessibilityReader.swift # 辅助功能文本（M3，AXUIElement 目标）
│       ├── OcrEngine.swift       # OCR 兜底（M4，Vision 目标）
│       └── TextArbiter.swift     # 文本仲裁器（M5，规则已实现）
└── scripts/
    └── smoke.js              # 冒烟自检（边车 + Bridge）
```

## 快速开始

```bash
# 1. 构建 Swift 边车（生成 sidecar/.build/debug/feibiao-sidecar）
npm run sidecar:build:debug     # 或 npm run sidecar:build（release）

# 2. 冒烟自检（无需 Electron）
npm run smoke                   # 边车 + Bridge 全量
npm run smoke:sidecar           # 仅边车
npm run smoke:bridge            # 仅 Bridge（需 Trae 已装桥接扩展）
node scripts/smoke.js --deliver # Bridge 段附带真实 /deliver 投递

# 3. 运行桌面应用（需先 npm i 安装 electron）
npm i
npm start
```

## IPC 契约一览（`shared/ipc-contract.js`）

| 频道 | 用途 | 归属模块 | v1.0 状态 |
|---|---|---|---|
| `sidecar.handshake` | 边车握手/健康检查 | 边车 | 真实 |
| `perm.status` | 查询三项权限状态 | M-Perm | 辅助功能真实，其余占位 |
| `overlay.enter` | 进入框选浮层 | M1 | 占位 |
| `selection.done` | 提交框选坐标 | M1 | 真实回执 |
| `capture` | 选区截图 | M2 | 占位（1x1 PNG） |
| `text.arbitrate` | 文本仲裁（辅助功能优先+OCR 兜底） | M3/M4/M5 | 仲裁规则真实，读取占位 |
| `deliver` | 打包发送到 Trae Bridge | M7 | 真实 |

统一响应信封：`{ ok:true, data }` 或 `{ ok:false, error:{code,message} }`。

## 桩 → 真实的替换点（后续里程碑）

各源码文件内已用 `TODO vX.X` 标注：
- **v1.0-late**：`CaptureEngine` 接 `SCScreenshotManager`；`main.swift` 的 `overlay.enter` 拉起 `NSWindow(.floating)` + `CGEventTap`。
- **v1.1**：`AccessibilityReader` 接 `AXUIElementCopyElementAtPosition`；`Permission.screenCapture` 接 `CGPreflightScreenCaptureAccess`。
- **v1.2**：`OcrEngine` 接 `VNRecognizeTextRequest`。
- **v1.3**：`Permission.inputMonitoring` 接 `IOHIDCheckAccess`。

## 冒烟基线（本机已验证）

- Node v26 / Swift 6.2 / macOS 26：`swift build` 通过，边车段 6/6 通过，Bridge `/ping` 连通。
