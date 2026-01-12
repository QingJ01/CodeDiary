<div align="center">
  <img src="https://esaimg.cdn1.vip/i/69511102b626b_1766920450.png" width="128" alt="CodeDiary Logo">
  <h1>CodeDiary - 你的编码日记 📔</h1>
  <p><b>捕获每一颗跳动的字符，见证你的代码人生。</b></p>

  <p>
    <a href="https://github.com/QingJ01/CodeDiary"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github" alt="GitHub Repository"></a> <a href="https://marketplace.visualstudio.com/items?itemName=QingJ.codediary"><img src="https://img.shields.io/visual-studio-marketplace/v/QingJ.codediary?style=flat-square&color=007ACC&label=Marketplace&logo=visual-studio-code" alt="Version"></a> <a href="https://marketplace.visualstudio.com/items?itemName=QingJ.codediary"><img src="https://img.shields.io/visual-studio-marketplace/i/QingJ.codediary?style=flat-square&color=44CC11&label=Installs" alt="Installs"></a> <a href="https://github.com/QingJ01/CodeDiary/stargazers"><img src="https://img.shields.io/github/stars/QingJ01/CodeDiary?style=flat-square&color=FFD700&label=Stars&logo=github" alt="GitHub Stars"></a> <a href="https://github.com/QingJ01/CodeDiary/blob/main/LICENSE"><img src="https://img.shields.io/github/license/QingJ01/CodeDiary?style=flat-square&color=white&label=License" alt="License"></a>
  </p>
</div>

CodeDiary 是一个专注于“编码量统计”的 VS Code 插件。它不仅仅是一个计数器，更是你的编码习惯追踪器。通过高精度的输入识别和精美的数据可视化，帮助你回顾每一天的产出与坚持。

<p align="center">
  <img src="https://esaimg.cdn1.vip/i/69510e04206af_1766919684.webp" width="60%" alt="Dashboard Preview">
</p>

## ✨ 核心特性

- **📊 绿墙看板**: 完美复刻 GitHub 风格的**年度热力图**，让每一天的坚持可见。
- **☁️ 云同步**: 支持 **GitHub Gist** 和 **WebDAV**，让你的编码足迹跨设备同步。
- **📥 备份与迁移**: 支持本地 JSON 数据导出与合并导入。
- **📈 多维洞察**:
  - **活跃韵律**: 24小时活跃度分布，寻找你的“高流”时刻。
  - **语言分布**: 自动统计各编程语言的产出占比。
  - **连胜挑战**: 自动记录连续编码天数 (Streak)，激励你保持状态。
- **🤖 AI/粘贴检测**: 智能识别敲击速度，统计 AI 生成与粘贴贡献。
- **😄 鼓励师**: 状态栏实时显示今日产出，并附带暖心的鼓励语。
- **🎨 极致美学**: 采用 Glassmorphism (毛玻璃) 设计风格，深色模式完美适配。

## 🚀 快速开始

1. 安装插件后，您的编码活动将自动开始记录。
2. 点击底部状态栏的 **CodeDiary** 图标（例如：`$(code) 今日 128 行`）。
3. 或者使用命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`) 输入：
   `> CodeDiary: 打开统计看板`

## ⚙️ 配置说明

您可以在设置中自定义统计行为：

- `codediary.excludeGlob`: 设置不参与统计的文件或文件夹。
- `codediary.pasteThreshold`: 单次输入超过多少字符视为粘贴（默认 50）。
- `codediary.dashboardCards`: 选择 Dashboard 显示的 4 张卡片。
- `codediary.sync.type`: 配置云同步方式 (None/Gist/WebDAV)。

## 🔒 隐私声明

**CodeDiary 非常重视您的隐私。**
- 默认情况下，所有统计数据**仅存储在您本地** (VS Code Global Storage)。
- 如果您启用了**云同步**，数据将通过加密链接传输到您指定的 Gist 或 WebDAV 服务器。
- 插件**不会**上传您的任何实际代码内容，仅包含字符数、行数、语言名等统计数值。
- 只有在您主动分享截图时，数据才会被展示。

## 📝 License

[MIT](LICENSE) © 2026 CodeDiary · [GitHub Repository](https://github.com/QingJ01/CodeDiary)
