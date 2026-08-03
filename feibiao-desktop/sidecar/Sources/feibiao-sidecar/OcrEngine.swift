import Foundation

/// OCR 兜底（M4）—— 目标实现：Vision VNRecognizeTextRequest（设备端离线，含中文）。
/// v1.0 骨架：返回空文本占位；真实识别在 v1.2 里程碑接入。
enum OcrEngine {
    static func recognize(pngBase64: String) -> String {
        // TODO v1.2: 将 base64 解码为 CGImage → VNImageRequestHandler
        //            → VNRecognizeTextRequest(recognitionLanguages:["zh-Hans","en-US"])
        return ""
    }
}
