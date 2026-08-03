// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "feibiao-sidecar",
    platforms: [
        .macOS(.v13)  // ScreenCaptureKit 全量 API 需 12.3+，取 13 稳妥
    ],
    targets: [
        .executableTarget(
            name: "feibiao-sidecar",
            path: "Sources/feibiao-sidecar"
        )
    ]
)
