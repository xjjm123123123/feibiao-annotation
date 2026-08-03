import Foundation

/// 文本仲裁器（M5）—— 实现方案文档定稿的仲裁规则：
///   1. 优先辅助功能读取；若结果非空且长度 ≥ 2，直接采用（source=accessibility）。
///   2. 否则对选区截图跑 OCR；OCR 非空则采用（source=ocr）。
///   3. 两者皆空 → source=empty，text=""。
/// 不做一致性比对；结果始终标记 editable=true，交由 UI 手动校正。
enum TextArbiter {
    static func arbitrate(rect: SelectionRect) -> [String: Any] {
        let ax = AccessibilityReader.readText(rect: rect)
        let axText = ax.text.trimmingCharacters(in: .whitespacesAndNewlines)
        if !axText.isEmpty && axText.count >= 2 {
            return ["text": axText, "source": "accessibility", "editable": true]
        }

        // 辅助功能不可用或结果不达标 → OCR 兜底
        let shot = CaptureEngine.capture(rect: rect)
        let base64 = (shot["base64"] as? String) ?? ""
        let ocrText = OcrEngine.recognize(pngBase64: base64)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        if !ocrText.isEmpty {
            return ["text": ocrText, "source": "ocr", "editable": true]
        }

        return ["text": "", "source": "empty", "editable": true]
    }
}
