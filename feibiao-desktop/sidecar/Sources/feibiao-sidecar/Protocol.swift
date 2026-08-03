import Foundation

// MARK: - JSON-RPC 协议类型（镜像 shared/ipc-contract.js）
// 每行一个 JSON 对象，经 stdin/stdout 与 Electron 主进程通信。

struct RpcRequest: Decodable {
    let id: Int
    let method: String
    let params: [String: AnyCodable]?
}

struct RpcError: Encodable {
    let code: String
    let message: String
}

/// 统一响应信封：ok=true 带 data；ok=false 带 error。
struct RpcResponse: Encodable {
    let id: Int
    let ok: Bool
    let data: AnyCodable?
    let error: RpcError?

    static func success(id: Int, data: [String: Any]) -> RpcResponse {
        RpcResponse(id: id, ok: true, data: AnyCodable(data), error: nil)
    }
    static func failure(id: Int, code: String, message: String) -> RpcResponse {
        RpcResponse(id: id, ok: false, data: nil, error: RpcError(code: code, message: message))
    }
}

// MARK: - 错误码（与契约 ERROR_CODES 对齐）
enum ErrorCode {
    static let badRequest = "BAD_REQUEST"
    static let permissionDenied = "PERMISSION_DENIED"
    static let notImplemented = "NOT_IMPLEMENTED"
    static let internalError = "INTERNAL"
}

// MARK: - AnyCodable（在 JSON 里承载任意值的最小实现）
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) { self.value = value }

    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let v = try? c.decode(Bool.self) { value = v }
        else if let v = try? c.decode(Int.self) { value = v }
        else if let v = try? c.decode(Double.self) { value = v }
        else if let v = try? c.decode(String.self) { value = v }
        else if let v = try? c.decode([String: AnyCodable].self) {
            value = v.mapValues { $0.value }
        } else if let v = try? c.decode([AnyCodable].self) {
            value = v.map { $0.value }
        } else { value = NSNull() }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch value {
        case let v as Bool: try c.encode(v)
        case let v as Int: try c.encode(v)
        case let v as Double: try c.encode(v)
        case let v as String: try c.encode(v)
        case let v as [String: Any]: try c.encode(v.mapValues { AnyCodable($0) })
        case let v as [Any]: try c.encode(v.map { AnyCodable($0) })
        case is NSNull: try c.encodeNil()
        default: try c.encodeNil()
        }
    }
}

// MARK: - 选区结构
struct SelectionRect {
    let x: Double, y: Double, width: Double, height: Double
    let displayId: Int

    init?(from params: [String: AnyCodable]?) {
        guard let rectAny = params?["rect"]?.value as? [String: Any] else { return nil }
        func d(_ k: String) -> Double {
            if let v = rectAny[k] as? Double { return v }
            if let v = rectAny[k] as? Int { return Double(v) }
            return 0
        }
        x = d("x"); y = d("y"); width = d("width"); height = d("height")
        displayId = (rectAny["displayId"] as? Int) ?? 0
    }
}
