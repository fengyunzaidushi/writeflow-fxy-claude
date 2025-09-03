# 🚀 WriteFlow 快速入门指南

欢迎使用 WriteFlow AI 写作助手！本指南将帮助你快速上手。

## 💡 基本概念

WriteFlow 完全复刻了 Claude Code 的交互模式，提供简洁而强大的命令行写作体验。

### 三种输入模式

WriteFlow 支持三种特殊的输入前缀：

#### 1. `/` 斜杠命令模式
```bash
/outline AI技术发展趋势
/rewrite 通俗 ./article.md
/research 量子计算应用
/help                    # 查看所有可用命令
/status                  # 查看系统状态
/exit                    # 退出程序
```

#### 2. `!` Bash执行模式
```bash
!ls -la                  # 列出文件
!git status             # 查看git状态
!npm install            # 安装依赖
!pwd                    # 显示当前目录
```

#### 3. `#` 笔记记录模式
```bash
#今天的写作计划：完成AI技术文章
#记住：需要增加更多实例说明
#待办：检查引用格式
```

#### 4. 自由对话模式
直接输入问题或内容，无需前缀：
```
帮我分析一下人工智能的发展趋势
这段代码有什么问题吗？
请给我一些写作建议
```

## 🔄 模式切换系统

WriteFlow 提供四种工作模式，使用 **Shift+Tab** 循环切换：

### 1. 默认模式 (Default)
- 正常执行所有命令
- 支持文件读写和网络访问
- 适合日常写作任务

### 2. 计划模式 (Plan) 📋
- 只能执行只读命令
- 用于安全地分析和规划
- 不会修改任何文件

### 3. 自动接受模式 (Accept Edits) ✅
- 自动接受所有编辑建议
- 加速写作流程
- 适合快速迭代

### 4. 绕过权限模式 (Bypass Permissions) 🔓
- 绕过安全限制
- 高级用户模式
- 请谨慎使用

当前模式会在输入框下方显示，如：`📋 plan mode on (shift+tab to cycle)`

## ⚡ 常用斜杠命令

### 写作核心命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/outline` | 生成文章大纲 | `/outline AI技术发展` |
| `/rewrite` | 改写内容 | `/rewrite 通俗 ./tech.md` |
| `/research` | 网络研究 | `/research 量子计算应用` |
| `/style` | 风格调整 | `/style 学术 ./article.md` |
| `/grammar` | 语法检查 | `/grammar ./draft.md` |

### 文件操作命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/read` | 读取文件 | `/read ./article.md` |
| `/edit` | 编辑文件 | `/edit ./draft.md` |
| `/search` | 搜索内容 | `/search "关键词" ./docs/` |
| `/save` | 保存内容 | `/save ./output.md` |

### 发布工具命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/publish` | 发布转换 | `/publish wechat ./article.md` |
| `/format` | 格式化 | `/format markdown ./text.txt` |

### 系统管理命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/help` | 显示帮助 | `/help` 或 `/help outline` |
| `/status` | 系统状态 | `/status` |
| `/clear` | 清屏 | `/clear` |
| `/model` | 切换模型 | `/model deepseek` |
| `/settings` | 查看设置 | `/settings` |
| `/exit` | 退出程序 | `/exit` |

## 🎨 用户界面说明

WriteFlow 采用极简设计，界面元素说明：

```
┌─────────────────────────────────────┐
│ 🎯 WriteFlow - Default Mode         │  ← 标题栏和模式显示
├─────────────────────────────────────┤
│                                     │
│ 🚀 WriteFlow v2.2.4                 │  ← 启动消息
│                                     │
│ > 你的问题或命令...▋                 │  ← 输入框
│                                     │
│ 📋 plan mode on (shift+tab to cycle)│  ← 模式提示（仅非默认模式）
│                                     │
│ ✓ Ready | 7 条消息 | 22:50:46       │  ← 状态栏
└─────────────────────────────────────┘
```

## ⌨️ 快捷键

- **Enter**: 提交输入
- **Shift+Tab**: 切换工作模式
- **Ctrl+C**: 清空当前输入
- **Ctrl+L**: 清屏
- **Backspace**: 删除字符

## 🔧 高级技巧

### 1. 链式命令
```bash
/research AI发展 && /outline && /rewrite 通俗
```

### 2. 文件管道操作
```bash
/read ./draft.md | /grammar | /save ./final.md
```

### 3. 批量处理
```bash
/edit ./docs/*.md --operation=grammar-check
```

### 4. 模板使用
```bash
/outline --template=tech-article --topic=区块链
```

## 🆘 获取帮助

- **命令帮助**: `/help [命令名]` - 查看特定命令的详细说明
- **系统状态**: `/status` - 查看当前配置和系统信息
- **官方文档**: 查看 `docs/` 目录下的详细文档
- **问题反馈**: [GitHub Issues](https://github.com/wordflowlab/writeflow/issues)

## 🎉 开始写作

现在你已经掌握了 WriteFlow 的基本用法，可以开始你的 AI 辅助写作之旅了！

```bash
# 启动 WriteFlow
writeflow

# 开始你的第一篇文章
> /outline 我的第一篇技术文章
```

快乐写作！✨