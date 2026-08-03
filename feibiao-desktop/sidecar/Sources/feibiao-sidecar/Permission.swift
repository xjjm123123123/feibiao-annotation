import Foundation
import ApplicationServices
import CoreGraphics

/// 权限探测（M-Perm）
/// v1.0-late：
///  - 辅助功能：AXIsProcessTrusted()（只读，无副作用）。
///  - 屏幕录制：CGPreflightScreenCaptureAccess()（只读预检，不弹窗）。
///  - 输入监控：骨架阶段仍返回 notDetermined，待 v1.3 接 IOHIDCheckAccess。
enum Permission {
    static func status() -> [String: Any] {
        let axTrusted = AXIsProcessTrusted()
        let screenGranted: Bool
        if #available(macOS 10.15, *) {
            screenGranted = CGPreflightScreenCaptureAccess()
        } else {
            screenGranted = true
        }
        return [
            "accessibility": axTrusted ? "granted" : "notDetermined",
            "screenCapture": screenGranted ? "granted" : "notDetermined",
            "inputMonitoring": "notDetermined"  // TODO v1.3: IOHIDCheckAccess(kIOHIDRequestTypeListenEvent)
        ]
    }
}
