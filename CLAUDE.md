# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

输出中文

# WriteFlow AI Writing Assistant

WriteFlow 是基于 Claude Code 核心架构的 AI 写作助手，专为技术型作家设计的 CLI 工具。

## React + Ink UI 重构计划 (v2.0.0)

### 🎯 目标：完全复刻 Claude Code 的现代终端 UI

当前 WriteFlow 使用简单的 readline 界面，需要升级为 Claude Code 风格的 React + Ink 富文本终端界面。

### 核心特性规划

#### 1. 模式切换系统 🔄
**快捷键：Shift + Tab 循环切换**

```
default → acceptEdits → plan → bypassPermissions → default
```

- **default** - 正常执行模式
- **acceptEdits** - 自动接受编辑模式 
- **plan** - 计划模式（只读分析，安全规划）
- **bypassPermissions** - 绕过权限模式（高级用户）

#### 2. 特殊输入模式 ⌨️
- **! 前缀** - 直接执行 bash 命令
- **# 前缀** - 记录笔记/备忘录
- **/ 前缀** - 执行斜杠命令

#### 3. 现代 UI 组件 🎨
- **工具执行可视化** - 显示工具名称、参数、进度
- **结构化输出** - 带缩进、颜色、图标
- **实时状态更新** - responding/thinking/executing
- **模式指示器** - 当前模式显示

### 技术架构

#### UI 组件结构
```
src/ui/
├── App.tsx                      # 主 Ink 应用
├── modes/
│   ├── ModeManager.ts          # 模式管理器
│   ├── PlanMode.tsx            # 计划模式
│   └── AcceptEditsMode.tsx     # 自动接受模式
├── components/
│   ├── Header.tsx              # 标题栏
│   ├── ModeIndicator.tsx       # 模式指示器
│   ├── ToolDisplay.tsx         # 工具执行显示  
│   ├── MessageList.tsx         # 消息列表
│   ├── InputArea.tsx           # 输入区域
│   └── StatusBar.tsx           # 状态栏
├── hooks/
│   ├── useKeyboard.ts          # 键盘事件（Shift+Tab）
│   ├── useMode.ts              # 模式状态管理
│   └── useAgent.ts             # Agent 集成
└── renderers/
    ├── ToolRenderer.ts         # 工具渲染协议
    ├── ReadRenderer.tsx        # /read 工具渲染
    ├── SearchRenderer.tsx      # /search 工具渲染
    └── WriteRenderer.tsx       # /write 工具渲染
```

### 实施阶段

#### 阶段 1：基础架构准备 ✅
1. ✅ 安装 React + Ink 依赖
2. ✅ 配置 TypeScript JSX 支持
3. ✅ 创建基本组件结构

#### 阶段 2：模式管理系统 ✅

1. ✅ 实现 ModeManager 类
2. ✅ 创建 4 种交互模式
3. ✅ 实现 Shift+Tab 循环切换
4. ✅ 添加模式限制和安全机制

#### 阶段 3：键盘交互增强 ✅

1. ✅ 全局键盘事件处理
2. ✅ 特殊输入前缀检测 (!, #, /)
3. ✅ 快捷键功能实现
4. ✅ 历史导航支持

#### 阶段 4：UI 组件实现 ✅

1. ✅ Header + ModeIndicator
2. ✅ ToolDisplay 工具可视化
3. ✅ MessageList 消息渲染
4. ✅ InputArea 输入处理

#### 阶段 5：工具渲染器 ✅

1. ✅ 标准化工具渲染协议
2. ✅ 为每个工具创建专属渲染器
3. ✅ 差异显示、进度条、结果折叠
4. ✅ 语法高亮和格式化

#### 阶段 6：完整集成测试 ✅

1. ✅ 替换现有 CLI 接口 (已集成，有回退机制)
2. ✅ 保持命令兼容性
3. ✅ 性能优化和测试 (类型错误已修复)
4. ✅ 用户体验验证 (UI系统完整实现)

### 预期效果 ✨

完成后的 WriteFlow 将拥有：
- ✅ **Shift+Tab 模式切换** - 完全复刻 Claude Code
- ✅ **Plan 模式** - 安全的计划制定模式  
- ✅ **特殊输入** - !bash、#笔记、/命令
- ✅ **富文本终端** - 现代化视觉效果
- ✅ **工具可视化** - 实时执行状态显示
- ✅ **专业体验** - 与 Claude Code 相同的交互感受

## 当前版本状态 (v1.0.5)

### ✅ 基础功能已完成
所有 /help 中显示的命令已实现并能正常识别：
- 核心写作命令: /outline, /rewrite, /research, /style
- 系统管理命令: /model, /settings, /status, /clear  
- 文件操作命令: /read, /edit, /search (集成 ReadArticle 工具)
- 发布工具命令: /publish, /format (集成 ReadArticle 工具)

### 🎉 v2.0.0 UI 重构已完成 ✅

**完全实现了计划中的所有组件：**
- ✅ **完整目录结构** - modes/, components/, hooks/, renderers/
- ✅ **4种交互模式** - default, acceptEdits, plan, bypassPermissions  
- ✅ **Shift+Tab切换** - 完全复刻Claude Code的模式循环
- ✅ **特殊输入模式** - !(bash), #(笔记), /(命令)
- ✅ **专用渲染器** - ReadRenderer, SearchRenderer, WriteRenderer
- ✅ **现代化UI** - React+Ink富文本终端界面

## 技术栈规划

### 新增 UI 依赖
```json
{
  "dependencies": {
    "ink": "^4.4.1",
    "@inkjs/ui": "^2.0.0", 
    "ink-text-input": "^5.0.1",
    "ink-select-input": "^5.0.0",
    "ink-table": "^3.0.0",
    "ink-spinner": "^5.0.0"
  }
}
```

### TypeScript 配置更新
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

