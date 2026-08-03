import Foundation

/// 飞标边车 v1.0 入口 —— stdin/stdout 行分隔 JSON-RPC 循环。
/// 所有需要 macOS TCC 权限的系统调用集中在本进程（见方案文档 ADR-001）。

let sidecarVersion = "1.0.0"

// stdout 必须只输出协议 JSON；诊断信息一律走 stderr。
func emit(_ resp: RpcResponse) {
    let encoder = JSONEncoder()
    guard let data = try? encoder.encode(resp),
          let line = String(data: data, encoding: .utf8) else { return }
    FileHandle.standardOutput.write(Data((line + "\n").utf8))
}

func logErr(_ msg: String) {
    FileHandle.standardError.write(Data((msg + "\n").utf8))
}

func dispatch(_ req: RpcRequest) -> RpcResponse {
    switch req.method {
    case "sidecar.handshake":
        return .success(id: req.id, data: [
            "name": "feibiao-sidecar",
            "version": sidecarVersion,
            "pid": Int(ProcessInfo.processInfo.processIdentifier),
            "ready": true
        ])

    case "perm.status":
        return .success(id: req.id, data: Permission.status())

    case "element.at":
        // 元素命中（v1.1）：给全局点（左上原点 points），返回命中元素的角色/文本/边界。
        func num(_ k: String) -> Double? {
            if let v = req.params?[k]?.value as? Double { return v }
            if let v = req.params?[k]?.value as? Int { return Double(v) }
            return nil
        }
        guard let px = num("x"), let py = num("y") else {
            return .failure(id: req.id, code: ErrorCode.badRequest, message: "缺少或非法坐标 x/y")
        }
        // 需穿透跳过的进程 pid（飞标浮层自身），使命中落到下方目标软件而非浮层。
        var ignore = Set<pid_t>()
        if let arr = req.params?["ignorePids"]?.value as? [Any] {
            for v in arr {
                if let i = v as? Int { ignore.insert(pid_t(i)) }
                else if let d = v as? Double { ignore.insert(pid_t(d)) }
            }
        }
        return .success(id: req.id, data: ElementInspector.at(x: px, y: py, ignorePids: ignore))

    case "capture":
        guard let rect = SelectionRect(from: req.params) else {
            return .failure(id: req.id, code: ErrorCode.badRequest, message: "缺少或非法 rect")
        }
        return .success(id: req.id, data: CaptureEngine.capture(rect: rect))

    case "text.arbitrate":
        guard let rect = SelectionRect(from: req.params) else {
            return .failure(id: req.id, code: ErrorCode.badRequest, message: "缺少或非法 rect")
        }
        return .success(id: req.id, data: TextArbiter.arbitrate(rect: rect))

    default:
        return .failure(id: req.id, code: ErrorCode.notImplemented, message: "未知 method: \(req.method)")
    }
}

logErr("[feibiao-sidecar] v\(sidecarVersion) 启动，等待 stdin JSON-RPC…")

let decoder = JSONDecoder()
while let line = readLine(strippingNewline: true) {
    let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty { continue }
    guard let data = trimmed.data(using: .utf8) else { continue }
    do {
        let req = try decoder.decode(RpcRequest.self, from: data)
        emit(dispatch(req))
    } catch {
        logErr("[feibiao-sidecar] 解析请求失败: \(error)")
    }
}

logErr("[feibiao-sidecar] stdin 关闭，退出。")
