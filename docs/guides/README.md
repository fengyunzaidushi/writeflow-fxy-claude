# 📖 WriteFlow 使用指南

欢迎使用 WriteFlow！这里汇集了所有使用指南和教程，帮助您快速掌握 WriteFlow 的强大功能。

## 🚀 快速开始

### [快速开始指南](./quick-start.md)
5分钟快速上手 WriteFlow，了解基本功能和使用方法。

### [AI 提供商设置](./ai-providers-setup.md)
配置不同的 AI 模型提供商，包括 Claude、DeepSeek、Qwen、GLM 等。

### [部署指南](./deployment-guide.md)
详细的安装部署指南，包括环境要求、配置步骤和故障排除。

## 📝 核心功能

### [斜杠命令指南](./slash-commands.md)
详细介绍 WriteFlow 的所有斜杠命令，包括写作、研究、发布等功能。

### [Slidev PPT 使用手册](./slidev-ppt-guide.md) 🆕
**全新功能！** 使用 AI 创建专业的技术演示文稿，支持 Markdown 到 PPT 的智能转换。

## 🎯 功能分类

### 写作功能
- **大纲生成** (`/outline`) - AI 生成文章大纲
- **内容改写** (`/rewrite`) - 智能改写文章风格
- **语法检查** (`/grammar`) - 检查语法错误
- **风格调整** (`/style`) - 调整写作风格

### PPT 创作功能
- **创建演示文稿** (`/slide create`) - 根据主题生成完整 PPT
- **文章转换** (`/slide convert`) - 将 Markdown 转换为演示文稿
- **生成大纲** (`/slide outline`) - 生成演讲大纲
- **优化演示** (`/slide optimize`) - 优化现有演示文稿

### 研究功能
- **网络搜索** (`/research`) - 深度主题研究
- **事实核查** (`/fact-check`) - 验证信息准确性
- **引用管理** (`/cite`) - 管理参考文献

### 发布功能
- **格式转换** (`/publish`) - 多平台格式转换
- **微信排版** (`/wechat`) - 微信公众号排版
- **HTML 生成** (`/html`) - 生成 HTML 格式

## 📚 深入学习

### 系统架构
了解 WriteFlow 的技术架构和设计理念：
- [系统架构设计](../architecture/system-architecture.md)
- [技术实现详解](../architecture/technical-implementation.md)
- [写作工具集](../architecture/writing-tools.md)

### 功能文档
深入了解各项功能的详细设计：
- [Slidev PPT 功能需求文档](../features/slidev-ppt-feature.md)
- 更多功能文档即将推出...

## 🔧 配置与定制

### Agent 配置
了解如何配置和定制 Agent：
- Agent 配置文件位置：`.writeflow/agents/`
- 查看 [Agent 配置说明](../../.writeflow/agents/README.md)

### 模板系统
自定义模板以满足个性化需求：
- 模板目录：`src/templates/`
- 支持 Handlebars 语法

## 💡 使用技巧

### 提高效率的小技巧

1. **使用别名**：多数命令都有简短别名，如 `/ol` 代替 `/outline`
2. **批量处理**：支持批量转换多个文件
3. **命令组合**：可以组合使用多个命令完成复杂任务
4. **模板复用**：创建自定义模板提高效率

### 常见使用场景

| 场景 | 推荐命令组合 | 说明 |
|-----|------------|-----|
| 技术博客写作 | `/outline` → `/research` → `/rewrite` | 先定大纲，再研究，最后润色 |
| 演讲准备 | `/slide outline` → `/slide create` → `/slide optimize` | 从大纲到完整演示文稿 |
| 文章转演讲 | `/slide convert` → `/slide optimize` | 快速将文章转为 PPT |
| 多平台发布 | `/publish` → `/wechat` | 一文多发，适配不同平台 |

## 🆘 获取帮助

### 常见问题
- 查看各指南中的「常见问题」章节
- 访问 [GitHub Issues](https://github.com/writeflow/writeflow/issues)

### 社区支持
- [GitHub Discussions](https://github.com/writeflow/writeflow/discussions)
- [官方文档站](https://writeflow.app/docs)

### 反馈建议
我们欢迎您的反馈和建议：
- 提交 Issue：[GitHub Issues](https://github.com/writeflow/writeflow/issues/new)
- 贡献代码：[Contributing Guide](../../CONTRIBUTING.md)

## 📈 更新日志

### v2.9.3 (2025-01-03)
- 🎉 新增 Slidev PPT 创作功能
- 📚 完善使用文档和指南
- 🔧 优化 Agent 加载机制
- 🐛 修复已知问题

### v2.9.2 
- 增强引导流程
- 修复配置系统问题

### v2.9.1
- 初始版本发布

---

## 快速导航

### 📖 使用指南
- [快速开始](./quick-start.md)
- [AI 提供商设置](./ai-providers-setup.md)
- [部署指南](./deployment-guide.md)
- [斜杠命令](./slash-commands.md)
- [Slidev PPT 指南](./slidev-ppt-guide.md) 🔥

### 🏗️ 架构文档
- [系统架构](../architecture/system-architecture.md)
- [技术实现](../architecture/technical-implementation.md)
- [写作工具](../architecture/writing-tools.md)

### 🎯 功能文档
- [Slidev 功能](../features/slidev-ppt-feature.md)

### 🔍 其他资源
- [项目 README](../../README.md)
- [贡献指南](../../CONTRIBUTING.md)
- [更新日志](../../CHANGELOG.md)

---

*最后更新：2025-01-03*  
*WriteFlow Team*