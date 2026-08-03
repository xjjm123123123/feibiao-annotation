import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
@preconcurrency import ScreenCaptureKit

/// 截图引擎（M2）—— v1.0-late 真实实现：ScreenCaptureKit（macOS 12.3+）。
///
/// 设计要点：
/// - 需要「屏幕录制」TCC 权限；未授权时不抛错，降级返回 1x1 占位 PNG 且 `stub=true`，
///   保证 Electron/渲染层链路在无权限环境（如 CI、未授权首启）依旧可跑通、契约不破。
/// - 采集范围为传入的全局坐标 rect（左上原点，points）。SCScreenshotManager 以像素输出，
///   Retina 屏会带 scale，这里按 rect 目标点尺寸做等比裁切/缩放到 point 尺寸，
///   使返回的 width/height 与请求 rect 语义一致。
/// - 同步接口内部用信号量桥接 SCScreenshotManager 的异步 API，超时兜底降级。
enum CaptureEngine {
    // 1x1 透明 PNG（占位/降级用）
    private static let placeholderPNGBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

    private static func placeholder(_ rect: SelectionRect, reason: String) -> [String: Any] {
        return [
            "format": "png",
            "base64": placeholderPNGBase64,
            "width": Int(rect.width),
            "height": Int(rect.height),
            "stub": true,
            "reason": reason
        ]
    }

    static func capture(rect: SelectionRect) -> [String: Any] {
        // 无权限直接降级，避免触发系统弹窗阻塞（授权引导由 UI 侧另行处理）。
        if #available(macOS 10.15, *) {
            if !CGPreflightScreenCaptureAccess() {
                return placeholder(rect, reason: "SCREEN_RECORDING_NOT_GRANTED")
            }
        }

        // macOS 14+：优先用 ScreenCaptureKit 现代接口。
        if #available(macOS 14.0, *) {
            if let result = captureWithSCK(rect) {
                return result
            }
            // SCK 失败则继续尝试 CG 兜底。
        }

        // macOS 12.3–13.x 或 SCK 失败：CGWindowListCreateImage 兜底裁切。
        if let result = captureWithCG(rect) {
            return result
        }
        return placeholder(rect, reason: "CAPTURE_FAILED")
    }

    // MARK: - ScreenCaptureKit（macOS 14+）
    @available(macOS 14.0, *)
    private static func captureWithSCK(_ rect: SelectionRect) -> [String: Any]? {
        let targetW = max(1, Int(rect.width.rounded()))
        let targetH = max(1, Int(rect.height.rounded()))

        var resultImage: CGImage?
        let sem = DispatchSemaphore(value: 0)

        Task {
            defer { sem.signal() }
            do {
                let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
                guard let display = pickDisplay(content.displays, displayId: rect.displayId, rect: rect) else { return }

                let filter = SCContentFilter(display: display, excludingWindows: [])
                let cfg = SCStreamConfiguration()
                let localX = rect.x - Double(display.frame.origin.x)
                let localY = rect.y - Double(display.frame.origin.y)
                cfg.sourceRect = CGRect(x: localX, y: localY, width: rect.width, height: rect.height)
                cfg.width = targetW
                cfg.height = targetH
                cfg.showsCursor = false

                resultImage = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: cfg)
            } catch {
                logErr("[CaptureEngine] SCScreenshotManager 失败: \(error)")
            }
        }

        if sem.wait(timeout: .now() + 5) == .timedOut {
            return placeholder(rect, reason: "CAPTURE_TIMEOUT")
        }
        guard let cg = resultImage, let base64 = pngBase64(from: cg) else { return nil }
        return ["format": "png", "base64": base64, "width": cg.width, "height": cg.height, "stub": false]
    }

    // MARK: - CoreGraphics 兜底（macOS 12.3–13.x）
    private static func captureWithCG(_ rect: SelectionRect) -> [String: Any]? {
        let cgRect = CGRect(x: rect.x, y: rect.y, width: rect.width, height: rect.height)
        // kCGWindowListOptionOnScreenOnly + kCGNullWindowID：抓取该屏幕区域合成图。
        guard let cg = CGWindowListCreateImage(cgRect, .optionOnScreenOnly, kCGNullWindowID, [.bestResolution]),
              let base64 = pngBase64(from: cg) else {
            return nil
        }
        return ["format": "png", "base64": base64, "width": cg.width, "height": cg.height, "stub": false]
    }

    @available(macOS 12.3, *)
    private static func pickDisplay(_ displays: [SCDisplay], displayId: Int, rect: SelectionRect) -> SCDisplay? {
        if displayId != 0, let matched = displays.first(where: { Int($0.displayID) == displayId }) {
            return matched
        }
        // 按 rect 中心点落在哪个显示器
        let cx = rect.x + rect.width / 2
        let cy = rect.y + rect.height / 2
        if let hit = displays.first(where: { $0.frame.contains(CGPoint(x: cx, y: cy)) }) {
            return hit
        }
        return displays.first
    }

    /// CGImage → PNG → base64（无 data: 前缀）
    private static func pngBase64(from image: CGImage) -> String? {
        let data = NSMutableData()
        let type: CFString
        if #available(macOS 11.0, *) {
            type = UTType.png.identifier as CFString
        } else {
            type = "public.png" as CFString
        }
        guard let dest = CGImageDestinationCreateWithData(data, type, 1, nil) else { return nil }
        CGImageDestinationAddImage(dest, image, nil)
        guard CGImageDestinationFinalize(dest) else { return nil }
        return (data as Data).base64EncodedString()
    }
}
