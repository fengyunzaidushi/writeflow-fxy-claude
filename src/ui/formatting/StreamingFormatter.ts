/**
 * 流式消息格式化引擎 - 借鉴 Kode 的实时渲染能力
 * 提供 Markdown 实时渲染、语法高亮和视觉层次
 */

import { format } from '../../utils/colorScheme.js'
import type { StreamMessage } from '../../services/ai/streaming/AsyncStreamingManager.js'

/**
 * 格式化配置选项
 */
export interface FormattingOptions {
  enableColors?: boolean
  enableMarkdown?: boolean
  enableSyntaxHighlight?: boolean
  maxWidth?: number
  compactMode?: boolean
  showTimestamps?: boolean
  showProgress?: boolean
}

/**
 * 流式消息格式化器
 */
export class StreamingFormatter {
  private options: Required<FormattingOptions>

  constructor(options: FormattingOptions = {}) {
    this.options = {
      enableColors: options.enableColors ?? true,
      enableMarkdown: options.enableMarkdown ?? true,
      enableSyntaxHighlight: options.enableSyntaxHighlight ?? true,
      maxWidth: options.maxWidth ?? 80,
      compactMode: options.compactMode ?? false,
      showTimestamps: options.showTimestamps ?? false,
      showProgress: options.showProgress ?? true
    }
  }

  /**
   * 格式化流式消息 - 核心格式化函数
   */
  formatMessage(message: StreamMessage): string {
    switch (message.type) {
      case 'ai_response':
        return this.formatAIResponse(message)
      case 'tool_execution':
        return this.formatToolExecution(message)
      case 'progress':
        return this.formatProgress(message)
      case 'error':
        return this.formatError(message)
      case 'system':
        return this.formatSystem(message)
      default:
        return this.formatGeneric(message)
    }
  }

  /**
   * 格式化AI响应 - 支持实时Markdown渲染
   */
  private formatAIResponse(message: any): string {
    const parts: string[] = []

    // AI响应前缀
    if (!this.options.compactMode) {
      const prefix = this.options.enableColors 
        ? format.info('🤖 AI响应:')
        : '🤖 AI响应:'
      parts.push(prefix)
    }

    // 处理内容 - 实时Markdown渲染
    let content = message.content
    if (this.options.enableMarkdown && content) {
      content = this.renderMarkdown(content)
    }

    // 如果是增量更新，只显示新内容
    if (message.delta && this.options.compactMode) {
      content = this.renderMarkdown(message.delta)
    }

    parts.push(content)

    // 元数据信息
    if (message.metadata && !this.options.compactMode) {
      const metadata = this.formatMetadata(message.metadata)
      if (metadata) {
        parts.push(metadata)
      }
    }

    return parts.join(this.options.compactMode ? '' : '\n')
  }

  /**
   * 格式化工具执行消息 - 借鉴 Kode 的工具执行展示
   */
  private formatToolExecution(message: any): string {
    const icon = this.getToolIcon(message.toolName)
    const statusIcon = this.getStatusIcon(message.status)
    
    let line = `${icon} ${message.toolName}`
    
    if (message.currentStep) {
      line += ` - ${message.currentStep}`
    }

    // 进度条
    if (message.progress !== undefined && this.options.showProgress) {
      const progressBar = this.createProgressBar(message.progress)
      line += ` ${progressBar} ${Math.round(message.progress)}%`
    }

    // 状态指示
    line = `${statusIcon} ${line}`

    // 着色
    if (this.options.enableColors) {
      switch (message.status) {
        case 'starting':
          return format.dim(line)
        case 'running':
          return format.info(line)
        case 'completed':
          return format.success(line)
        case 'failed':
          return format.error(line)
        default:
          return line
      }
    }

    return line
  }

  /**
   * 格式化进度消息
   */
  private formatProgress(message: any): string {
    const progressIcon = '⚡'
    let line = `${progressIcon} ${message.message}`

    if (message.progress !== undefined && this.options.showProgress) {
      const progressBar = this.createProgressBar(message.progress)
      line += ` ${progressBar} ${Math.round(message.progress)}%`
    }

    return this.options.enableColors ? format.dim(line) : line
  }

  /**
   * 格式化错误消息
   */
  private formatError(message: any): string {
    const errorLine = `❌ 错误: ${message.message}`
    return this.options.enableColors ? format.error(errorLine) : errorLine
  }

  /**
   * 格式化系统消息
   */
  private formatSystem(message: any): string {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    }

    const icon = (icons as Record<string, string>)[message.level] || 'ℹ️'
    let line = `${icon} ${message.message}`

    if (this.options.showTimestamps) {
      const timestamp = new Date(message.timestamp).toLocaleTimeString()
      line += ` (${timestamp})`
    }

    if (this.options.enableColors) {
      switch (message.level) {
        case 'warning':
          return format.warning(line)
        case 'error':
          return format.error(line)
        default:
          return format.dim(line)
      }
    }

    return line
  }

  /**
   * 通用格式化
   */
  private formatGeneric(message: any): string {
    return JSON.stringify(message, null, 2)
  }

  /**
   * 实时Markdown渲染 - 简化版实现
   * TODO: 集成 marked 库实现完整 Markdown 支持
   */
  private renderMarkdown(content: string): string {
    if (!this.options.enableMarkdown || !this.options.enableColors) {
      return content
    }

    // 简单的Markdown渲染 - 标题
    content = content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length
      switch (level) {
        case 1:
          return format.title(title, 1)
        case 2:
          return format.title(title, 2)
        case 3:
          return format.title(title, 3)
        default:
          return format.bold(title)
      }
    })

    // 代码块
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      if (this.options.enableSyntaxHighlight) {
        return this.highlightCode(code, lang)
      }
      return format.code(code)
    })

    // 行内代码
    content = content.replace(/`([^`]+)`/g, (match, code) => {
      return format.code(code)
    })

    // 粗体
    content = content.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
      return format.bold(text)
    })

    // 斜体
    content = content.replace(/\*([^*]+)\*/g, (match, text) => {
      return format.italic(text)
    })

    return content
  }

  /**
   * 语法高亮 - 简化版实现
   * TODO: 集成 cli-highlight 实现完整语法高亮
   */
  private highlightCode(code: string, language?: string): string {
    if (!this.options.enableSyntaxHighlight || !this.options.enableColors) {
      return format.code(code)
    }

    // 简单的语法高亮实现
    let highlighted = code

    if (language === 'bash' || language === 'sh') {
      // 高亮bash命令
      highlighted = highlighted.replace(/^(\w+)/gm, (match) => format.success(match))
      highlighted = highlighted.replace(/(--?\w+)/g, (match) => format.info(match))
    } else if (language === 'javascript' || language === 'js') {
      // 高亮JavaScript关键字
      highlighted = highlighted.replace(/\b(function|const|let|var|if|else|return)\b/g, 
        (match) => format.keyword(match))
    }

    return format.code(highlighted)
  }

  /**
   * 格式化元数据
   */
  private formatMetadata(metadata: any): string {
    const parts: string[] = []

    if (metadata.model) {
      parts.push(`模型: ${metadata.model}`)
    }

    if (metadata.tokensUsed) {
      parts.push(`tokens: ${metadata.tokensUsed}`)
    }

    if (metadata.duration) {
      parts.push(`耗时: ${metadata.duration}ms`)
    }

    if (parts.length === 0) return ''

    const metadataText = parts.join(' | ')
    return this.options.enableColors 
      ? format.dim(`(${metadataText})`)
      : `(${metadataText})`
  }

  /**
   * 创建进度条
   */
  private createProgressBar(progress: number, width: number = 10): string {
    const filled = Math.round((progress / 100) * width)
    const empty = width - filled
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    return this.options.enableColors ? format.info(`[${bar}]`) : `[${bar}]`
  }

  /**
   * 获取工具图标
   */
  private getToolIcon(toolName: string): string {
    const iconMap: Record<string, string> = {
      'Read': '📖',
      'Write': '✍️',
      'Edit': '✏️',
      'Bash': '⚡',
      'Grep': '🔍',
      'Glob': '📁',
      'MultiEdit': '✂️',
      'WebFetch': '🌐'
    }
    return iconMap[toolName] || '🔧'
  }

  /**
   * 获取状态图标
   */
  private getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'starting': '🚀',
      'running': '⚡',
      'completed': '✅',
      'failed': '❌'
    }
    return iconMap[status] || '📝'
  }

  /**
   * 更新格式化选项
   */
  updateOptions(options: Partial<FormattingOptions>): void {
    Object.assign(this.options, options)
  }
}

// 全局实例
let globalFormatter: StreamingFormatter | null = null

/**
 * 获取全局格式化器实例
 */
export function getStreamingFormatter(): StreamingFormatter {
  if (!globalFormatter) {
    globalFormatter = new StreamingFormatter()
  }
  return globalFormatter
}

/**
 * 便捷函数：格式化消息
 */
export function formatStreamMessage(message: StreamMessage): string {
  return getStreamingFormatter().formatMessage(message)
}