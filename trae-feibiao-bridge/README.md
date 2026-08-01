# 飞标 → Trae 直连桥接(A+B 方案)

让飞标浏览器插件把整理好的批注**一键发送到 Trae IDE**,免去手动复制粘贴。

## 为什么是这个方案

Trae 没有对外暴露可推送任务的固定端口,也无法唤起 `trae://` 自定义链接,浏览器插件更没有能力去"发现"它的随机端口。所以这里**反过来做**:在 Trae 里装一个配套扩展,由这个扩展开一个**我们自己约定死的固定端口**(默认 `51799`),飞标插件通过后台脚本把交付包 POST 过去。

送达后扩展做两件事:
- **A(兜底,稳定):** 把 `feedback.md` + `feedback.json` + 截图写入当前工作区 `.feibiao/deliveries/<时间戳>/`,并自动打开 `feedback.md`。
- **B(尝试,体验最佳):** 把内容写入剪贴板,并自动探测、执行 Trae 的 AI 会话命令以聚焦对话框,方便直接粘贴。

## 一、在 Trae 安装配套扩展

1. 目录 `trae-feibiao-bridge/` 就是一个标准 VS Code 扩展(Trae 兼容)。
2. 在 Trae 中安装它,任选其一:
   - 把 `trae-feibiao-bridge/` 复制到 Trae 扩展目录(通常 `~/.trae/extensions/` 或 `~/.trae-cn/extensions/`),重启 Trae;
   - 或用 `vsce package` 打成 `.vsix` 后,在扩展面板选择"从 VSIX 安装"。
3. 安装后,Trae 右下角状态栏出现 `飞标:51799` 即表示本地服务已启动。
4. **必须在 Trae 里打开一个工作区文件夹**(A 方案落盘依赖工作区)。

## 二、浏览器插件已内置对接

`background.js` 已新增本地回环请求逻辑,`content.js` 的"整理给 Agent"弹窗已新增 **发送到 Trae** 按钮。重新加载扩展即可:`chrome://extensions/` → 飞标 → 刷新。

端口/令牌若需自定义,在扩展后台可改 `chrome.storage.local` 的 `vf-trae-bridge:port` / `vf-trae-bridge:token`,并与 Trae 扩展设置里的 `feibiao.bridge.port` / `feibiao.bridge.token` 保持一致(默认值已对齐,通常无需改)。

## 三、使用

1. 在网页上完成批注,点击工具栏 **整理给 Agent**。
2. 勾选要交付的条目,点击底部 **发送到 Trae**。
3. Trae 侧会弹出接收提示,自动打开 `feedback.md`;内容同时进入剪贴板,可直接在 AI 对话框粘贴。

## 四、关于 B(自动注入对话框)的说明与调优

Trae 未公开标准的"向 AI 会话发送消息"命令,扩展内置了一组常见命令候选自动探测(见 `extension.js` 的 `CHAT_COMMAND_CANDIDATES`)。若你的 Trae 版本命令名不同:

1. 在 Trae 命令面板执行 **飞标 Bridge: 探测可用的 AI 会话命令**;
2. 在输出面板里找到真正能聚焦/打开 AI 会话的命令 ID;
3. 填入设置项 `feibiao.bridge.injectChatCommands`(数组),即可优先执行。

即使 B 全部失败,A 也保证内容已落盘并在剪贴板,交付不会丢。

## 五、故障排查

- **提示"未连接到 Trae Bridge":** Trae 未运行、扩展未启用,或端口被占用。命令面板执行 **飞标 Bridge: 重启本地服务**,或改端口。
- **提示"请先在 Trae 打开工作区文件夹":** A 方案需要工作区,打开任意项目文件夹即可。
- **端口冲突:** 改 Trae 设置 `feibiao.bridge.port`,并同步改插件的 `vf-trae-bridge:port`。
- **安全性:** 服务仅绑定 `127.0.0.1`,不对局域网/公网开放;并用 `X-Feibiao-Token` 做简单校验。

## 涉及改动文件

- 新增 `trae-feibiao-bridge/package.json`、`trae-feibiao-bridge/extension.js`(Trae 配套扩展)
- `background.js`:新增 `VFS_DELIVER_TO_TRAE` 消息处理与 `deliverToTrae()` 本地请求
- `content.js`:交付弹窗新增"发送到 Trae"按钮与 `deliverAgentToTrae()`
