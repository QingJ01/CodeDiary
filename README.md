# CodeDiary - 你的编码日记 📔

> **捕获每一颗跳动的字符，见证你的代码人生。**

<p align="center">
  <a href="https://github.com/QingJ01/CodeDiary">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github" alt="GitHub Repository">
  </a>
</p>

CodeDiary 是一个专注于“编码量统计”的 VS Code 插件。它不仅仅是一个计数器，更是你的编码习惯追踪器。通过高精度的输入识别和精美的数据可视化，帮助你回顾每一天的产出与坚持。

![Dashboard Preview](https://youke2.picui.cn/s1/2025/12/28/695108434c818.png)

## ✨ 核心特性

- **🎯 精准统计**: 智能区分**手动敲击**与**粘贴输入**，拒绝虚假繁荣。
- **📊 绿墙看板**: 完美复刻 GitHub 风格的**年度热力图**，让每一天的坚持可见。
- **📈 多维洞察**:
  - **活跃韵律**: 24小时活跃度分布，寻找你的“高流”时刻。
  - **语言分布**: 自动统计各编程语言的产出占比。
  - **连胜挑战**: 自动记录连续编码天数 (Streak)，激励你保持状态。
- **😄 鼓励师**: 状态栏实时显示今日产出，并附带暖心的鼓励语。
- **🎨 极致美学**: 采用 Glassmorphism (毛玻璃) 设计风格，深色模式完美适配。

## 🚀 快速开始

1. 安装插件后，您的编码活动将自动开始记录。
2. 点击底部状态栏的 **CodeDiary** 图标（例如：`$(code) 今日 128 行`）。
3. 或者使用命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`) 输入：
   `> CodeDiary: 打开统计看板`

## ⚙️ 配置说明

您可以在设置中自定义统计行为：

- `codediary.excludeGlob`: 设置不参与统计的文件或文件夹（默认已排除 `node_modules`, `.min.js` 等）。
- `codediary.pasteThreshold`: 单次输入超过多少字符视为粘贴（默认 50）。

## 🔒 隐私声明

**CodeDiary 非常重视您的隐私。**
- 所有统计数据**仅存储在您本地** (VS Code Global Storage)。
- 插件**不会**上传您的任何代码内容或统计数据到云端。
- 只有在您主动分享截图时，数据才会被展示。

## 📝 License

[MIT](LICENSE) © 2025 CodeDiary · [GitHub Repository](https://github.com/QingJ01/CodeDiary)
