import Foundation
import ApplicationServices

/// 辅助功能文本读取（M3）—— 目标实现：AXUIElement 命中选区元素并读取
/// kAXValueAttribute / kAXSelectedTextAttribute。
/// v1.0 骨架：返回空文本占位；若未授予辅助功能，标注 denied 供仲裁器降级。
enum AccessibilityReader {
    struct Result {
        let text: String
        let available: Bool // 辅助功能是否可用（受信任）
    }

    static func readText(rect: SelectionRect) -> Result {
        guard AXIsProcessTrusted() else {
            return Result(text: "", available: false)
        }
        // TODO v1.1: AXUIElementCopyElementAtPosition + AXUIElementCopyAttributeValue
        return Result(text: "", available: true)
    }
}
