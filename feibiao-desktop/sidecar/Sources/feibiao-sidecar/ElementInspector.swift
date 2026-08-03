import Foundation
import ApplicationServices
import CoreGraphics

/// 元素命中检查器（v1.1）—— 基于 macOS 辅助功能（Accessibility）API。
///
/// 能力：给定一个全局屏幕坐标点（左上原点 points，与截图契约同口径），
/// 用 `AXUIElementCopyElementAtPosition` 命中该点下最具体的 UI 元素，
/// 读取其角色 / 标题 / 值 / 边界，供上层「悬停高亮 + 点击锁定」使用。
///
/// 坐标口径：AX 的 position 属性即全局左上原点 points，天然与 SelectionRect 一致，
/// 因此命中框可直接作为截图 rect / 取文本 rect 使用，无需二次换算。
///
/// Chromium/Electron 兼容（关键）：
///   Chrome/VS Code/TRAE/飞书 等基于 Chromium 的应用，出于性能默认**不**为 Web 内容
///   构建辅助功能树，只暴露一个顶层容器（AXScrollArea/AXWebArea），导致命中总是全屏大框。
///   外部进程需向该应用设置 `AXManualAccessibility=true`（历史别名 `AXEnhancedUserInterface`），
///   Chromium 才会展开完整元素树。本类首次命中某应用时按需启用并缓存其 pid。
///
/// 兜底：未授予辅助功能时返回 available=false，由上层降级提示（绝不 crash）。
enum ElementInspector {

    /// 已启用「手动辅助功能」的应用 pid 缓存，避免重复设置。
    private static var enhancedPids = Set<pid_t>()

    /// 视为「容器/需要继续下钻」的角色白名单。命中这些且尺寸偏大时，尝试子元素深钻。
    private static let containerRoles: Set<String> = [
        "AXScrollArea", "AXWebArea", "AXGroup", "AXWindow",
        "AXSplitGroup", "AXLayoutArea", "AXUnknown", "AXBox", "AXTabGroup"
    ]

    /// 命中指定全局点下的元素。point 为全局左上原点 points。
    /// - ignorePids: 需要「穿透跳过」的进程 pid（如飞标自己的全屏框选浮层）。
    ///   若 system-wide 命中落到这些进程（浮层盖在最上层会拦截命中），
    ///   则枚举该点下方窗口，锁定第一个非忽略的普通应用窗口，改用应用级命中绕开浮层。
    static func at(x: Double, y: Double, ignorePids: Set<pid_t> = []) -> [String: Any] {
        guard AXIsProcessTrusted() else {
            return ["available": false, "hit": false, "reason": "ACCESSIBILITY_NOT_GRANTED"]
        }

        let sys = AXUIElementCreateSystemWide()
        let fx = Float(x), fy = Float(y)
        let point = CGPoint(x: x, y: y)

        // 首次命中：system-wide 按 Z 序返回最顶层窗口的元素。
        var element = copyAt(sys, fx, fy)
        guard var hit = element else {
            return ["available": true, "hit": false, "reason": "NO_ELEMENT"]
        }

        var pid: pid_t = 0
        AXUIElementGetPid(hit, &pid)

        // 穿透浮层：若命中落到需忽略的进程（飞标浮层），改为对该点下方的目标应用做应用级命中。
        if pid > 0, ignorePids.contains(pid) {
            if let targetPid = topmostWindowOwner(at: point, ignoring: ignorePids) {
                ensureEnhanced(targetPid)
                let appRef = AXUIElementCreateApplication(targetPid)
                if let re = copyAt(appRef, fx, fy) {
                    hit = re
                    element = re
                    pid = targetPid
                }
            }
        }

        // Chromium 增强树：首次命中某应用时启用「手动辅助功能」，展开完整元素树后重命中。
        if pid > 0, !enhancedPids.contains(pid) {
            enableEnhancedAccessibility(pid)
            enhancedPids.insert(pid)
            usleep(350_000)
            // 若走了穿透分支，重命中也要针对目标应用；否则用 system-wide。
            let base: AXUIElement = ignorePids.contains(pid) ? sys : AXUIElementCreateApplication(pid)
            if let re = copyAt(base, fx, fy) {
                hit = re
                element = re
            } else if let re = copyAt(sys, fx, fy) {
                hit = re
                element = re
            }
        }

        // 兜底深钻：若命中的仍是大容器，则在其子树里找“包含该点的最小元素”。
        hit = refineToLeaf(hit, at: point)

        return describe(hit)
    }

    /// 确保目标应用已启用增强辅助功能（穿透分支专用，避免重复设置）。
    private static func ensureEnhanced(_ pid: pid_t) {
        guard !enhancedPids.contains(pid) else { return }
        enableEnhancedAccessibility(pid)
        enhancedPids.insert(pid)
        usleep(350_000)
    }

    /// 枚举屏上窗口（前→后 Z 序），返回包含该点、且属主 pid 不在忽略名单、
    /// 处于普通窗口层（layer==0）的最顶层窗口的属主 pid。用于穿透飞标浮层。
    private static func topmostWindowOwner(at point: CGPoint, ignoring ignorePids: Set<pid_t>) -> pid_t? {
        let selfPid = getpid()
        guard let infoList = CGWindowListCopyWindowInfo(
            [.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID
        ) as? [[String: Any]] else { return nil }

        for win in infoList {
            // 只看普通应用窗口层（菜单栏/状态栏/浮层等非 0 层跳过）。
            let layer = (win[kCGWindowLayer as String] as? Int) ?? 0
            guard layer == 0 else { continue }

            let owner = pid_t((win[kCGWindowOwnerPID as String] as? Int) ?? 0)
            guard owner > 0, owner != selfPid, !ignorePids.contains(owner) else { continue }

            guard let bounds = win[kCGWindowBounds as String] as? [String: Any] else { continue }
            let wx = (bounds["X"] as? Double) ?? 0
            let wy = (bounds["Y"] as? Double) ?? 0
            let ww = (bounds["Width"] as? Double) ?? 0
            let wh = (bounds["Height"] as? Double) ?? 0
            let frame = CGRect(x: wx, y: wy, width: ww, height: wh)
            if frame.contains(point) {
                return owner   // 前→后顺序，第一个命中即最顶层目标窗口。
            }
        }
        return nil
    }

    // MARK: - 命中与下钻

    private static func copyAt(_ sys: AXUIElement, _ x: Float, _ y: Float) -> AXUIElement? {
        var ref: AXUIElement?
        let err = AXUIElementCopyElementAtPosition(sys, x, y, &ref)
        guard err == .success else { return nil }
        return ref
    }

    /// 向目标应用启用「手动/增强辅助功能」，触发 Chromium 展开完整树。
    private static func enableEnhancedAccessibility(_ pid: pid_t) {
        let appRef = AXUIElementCreateApplication(pid)
        // 新键名（Chromium 现行）+ 旧键名（兼容部分应用），任一成功即可。
        AXUIElementSetAttributeValue(appRef, "AXManualAccessibility" as CFString, kCFBooleanTrue)
        AXUIElementSetAttributeValue(appRef, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)
    }

    /// 若元素是大容器，则递归向子元素下钻，返回“包含该点的最深/最小元素”。
    /// 无子元素或子元素均不含该点时，返回当前元素本身。
    private static func refineToLeaf(_ element: AXUIElement, at point: CGPoint) -> AXUIElement {
        var current = element
        var guardDepth = 0
        while guardDepth < 40 {
            guardDepth += 1
            let role = copyStringAttr(current, kAXRoleAttribute as CFString) ?? ""
            // 只对容器类继续下钻；已是叶子（按钮/文本/图片等）则停止。
            let isContainer = containerRoles.contains(role)
            guard let kids = copyChildren(current), !kids.isEmpty else { break }
            // 在子元素中挑选“包含该点且面积最小”的一个，保证命中最精确的叶子。
            var best: AXUIElement?
            var bestArea = Double.greatestFiniteMagnitude
            for kid in kids {
                guard let f = copyFrame(kid), f.contains(point) else { continue }
                let area = Double(f.width * f.height)
                if area < bestArea { bestArea = area; best = kid }
            }
            guard let next = best else { break }
            // 若父本身不是容器却仍有更小子命中，也继续下钻以求最精确（不因角色而早停）。
            _ = isContainer
            current = next
        }
        return current
    }

    // MARK: - 结果描述

    private static func describe(_ element: AXUIElement) -> [String: Any] {
        let role = copyStringAttr(element, kAXRoleAttribute as CFString) ?? ""
        let roleDesc = copyStringAttr(element, kAXRoleDescriptionAttribute as CFString) ?? ""
        let title = copyStringAttr(element, kAXTitleAttribute as CFString) ?? ""
        let desc = copyStringAttr(element, kAXDescriptionAttribute as CFString) ?? ""
        let value = copyValueString(element)

        guard let frame = copyFrame(element) else {
            return [
                "available": true, "hit": true, "hasFrame": false,
                "role": role, "roleDescription": roleDesc,
                "title": title, "description": desc, "value": value
            ]
        }
        let text = firstNonEmpty(value, title, desc)
        return [
            "available": true, "hit": true, "hasFrame": true,
            "role": role, "roleDescription": roleDesc,
            "title": title, "description": desc, "value": value, "text": text,
            "rect": [
                "x": Double(frame.origin.x),
                "y": Double(frame.origin.y),
                "width": Double(frame.size.width),
                "height": Double(frame.size.height)
            ]
        ]
    }

    // MARK: - AX 属性读取辅助

    private static func copyChildren(_ element: AXUIElement) -> [AXUIElement]? {
        var ref: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &ref) == .success else { return nil }
        return ref as? [AXUIElement]
    }

    private static func copyStringAttr(_ element: AXUIElement, _ attr: CFString) -> String? {
        var ref: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, attr, &ref) == .success else { return nil }
        if let s = ref as? String { return s }
        return nil
    }

    /// kAXValueAttribute 可能是字符串、数字、布尔等，统一转成可读字符串。
    private static func copyValueString(_ element: AXUIElement) -> String {
        var ref: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &ref) == .success,
              let v = ref else { return "" }
        if let s = v as? String { return s }
        if let n = v as? NSNumber { return n.stringValue }
        return ""
    }

    /// 读取元素全局边界（左上原点 points）。position + size 两个 AXValue 组合。
    private static func copyFrame(_ element: AXUIElement) -> CGRect? {
        var posRef: CFTypeRef?
        var sizeRef: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, kAXPositionAttribute as CFString, &posRef) == .success,
              AXUIElementCopyAttributeValue(element, kAXSizeAttribute as CFString, &sizeRef) == .success,
              let posVal = posRef, let sizeVal = sizeRef,
              CFGetTypeID(posVal) == AXValueGetTypeID(),
              CFGetTypeID(sizeVal) == AXValueGetTypeID() else {
            return nil
        }
        var point = CGPoint.zero
        var size = CGSize.zero
        // swiftlint:disable:next force_cast
        AXValueGetValue(posVal as! AXValue, .cgPoint, &point)
        // swiftlint:disable:next force_cast
        AXValueGetValue(sizeVal as! AXValue, .cgSize, &size)
        guard size.width >= 1, size.height >= 1 else { return nil }
        return CGRect(origin: point, size: size)
    }

    private static func firstNonEmpty(_ items: String...) -> String {
        for s in items {
            let t = s.trimmingCharacters(in: .whitespacesAndNewlines)
            if !t.isEmpty { return t }
        }
        return ""
    }
}
