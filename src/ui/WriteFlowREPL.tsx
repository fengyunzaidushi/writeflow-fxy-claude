/**
 * WriteFlow REPL - 重构版本
 * 完全采用 Kode 架构，使用新的消息类型系统和渲染组件
 */

import { Box, Text } from 'ink'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { WriteFlowApp } from '../cli/writeflow-app.js'
import { getTheme } from '../utils/theme.js'
import { PromptInput } from './components/PromptInput.js'
import { TodoPanel } from './components/TodoPanel.js'
import { PlanModeConfirmation, ConfirmationOption } from './components/PlanModeConfirmation.js'
import { ShortcutHints } from './components/ShortcutHints.js'
import { useTodoShortcuts, useModeShortcuts } from '../hooks/useKeyboardShortcuts.js'
import { Todo, TodoStats, TodoStatus } from '../types/Todo.js'
import { PlanMode } from '../types/agent.js'

// 导入新的消息系统
import type { 
  UIMessage, 
  UserMessage, 
  AssistantMessage,
  NormalizedMessage,
  ContentBlock
} from '../types/UIMessage.js'
import { 
  createUserMessage, 
  createAssistantMessage,
  createTextBlock,
  isUserMessage,
  isAssistantMessage
} from '../types/UIMessage.js'
import { Message } from './components/messages/Message.js'

// 导入工具系统
import { getAvailableTools } from '../tools/index.js'
import { systemReminderService } from '../services/SystemReminderService.js'
import type { Tool } from '../Tool.js'

const PRODUCT_NAME = 'WriteFlow'

interface WriteFlowREPLProps {
  writeFlowApp: WriteFlowApp
  onExit?: () => void
}

export function WriteFlowREPL({ writeFlowApp, onExit }: WriteFlowREPLProps) {
  const theme = getTheme()
  
  // 消息状态 - 使用新的 UIMessage 类型
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showModelConfig, setShowModelConfig] = useState(false)
  
  // TODO 状态
  const [todos, setTodos] = useState<Todo[]>([])
  const [todoStats, setTodoStats] = useState<TodoStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0
  })

  // Plan 模式状态
  const [currentMode, setCurrentMode] = useState<PlanMode>(PlanMode.Default)
  const [planModeStartTime, setPlanModeStartTime] = useState<number>(0)
  const [showPlanConfirmation, setShowPlanConfirmation] = useState<boolean>(false)
  const [pendingPlan, setPendingPlan] = useState<string>('')

  // 工具调用状态管理
  const [erroredToolUseIDs, setErroredToolUseIDs] = useState<Set<string>>(new Set())
  const [inProgressToolUseIDs, setInProgressToolUseIDs] = useState<Set<string>>(new Set())
  const [unresolvedToolUseIDs, setUnresolvedToolUseIDs] = useState<Set<string>>(new Set())
  
  // 获取可用工具
  const tools = useMemo(() => getAvailableTools(), [])
  
  // 获取可用命令
  const commands = useMemo(() => {
    try {
      return writeFlowApp.getAllCommands()
    } catch (error) {
      console.warn('Failed to get commands:', error)
      return []
    }
  }, [writeFlowApp])

  // TODO 面板是否展开
  const [showTodos, setShowTodos] = useState<boolean>(false)

  // 键盘快捷键：Ctrl+T 切换 TODO 面板
  useTodoShortcuts({
    onToggleTodos: () => setShowTodos(v => !v)
  })

  // Plan 模式确认处理
  const handlePlanConfirmation = useCallback(async (option: ConfirmationOption) => {
    try {
      const planManager = writeFlowApp.getPlanModeManager()
      if (planManager) {
        await planManager.handleUserConfirmation(option)
      }
      
      // 根据选项执行相应操作
      if (option === 'auto_approve' || option === 'manual_approve') {
        await writeFlowApp.exitPlanMode(pendingPlan)
      }
      
      setShowPlanConfirmation(false)
      setPendingPlan('')
    } catch (error) {
      console.error('处理 Plan 模式确认失败:', error)
      setShowPlanConfirmation(false)
    }
  }, [writeFlowApp, pendingPlan])

  const handlePlanConfirmationCancel = useCallback(() => {
    setShowPlanConfirmation(false)
    setPendingPlan('')
  }, [])

  // 模式循环切换处理
  const handleModeCycle = useCallback(async () => {
    if (isThinking) return // 在处理中时不允许切换模式

    try {
      let nextMode: PlanMode
      
      switch (currentMode) {
        case PlanMode.Default:
          nextMode = PlanMode.Plan
          await writeFlowApp.enterPlanMode()
          break
        case PlanMode.Plan:
          nextMode = PlanMode.AcceptEdits
          // 需要调用应用层退出Plan模式，而不是直接设置UI状态
          const currentPlan = writeFlowApp.getCurrentPlan?.() || '计划内容为空'
          const exitResult = await writeFlowApp.exitPlanMode(currentPlan)
          if (!exitResult) {
            // 如果退出失败，保持当前模式
            return
          }
          break
        case PlanMode.AcceptEdits:
        default:
          nextMode = PlanMode.Default
          // 回到默认模式
          break
      }
      
      setCurrentMode(nextMode)
      console.log(`🔄 模式切换: ${currentMode} → ${nextMode}`)
      
    } catch (error) {
      console.error('模式切换失败:', error)
    }
  }, [currentMode, isThinking, writeFlowApp, pendingPlan])

  // 键盘快捷键：Shift+Tab 切换模式，ESC 退出 Plan 模式
  useModeShortcuts({
    onModeCycle: handleModeCycle,
    onExitPlanMode: currentMode === PlanMode.Plan ? async () => {
      try {
        // 调用应用层退出Plan模式
        await writeFlowApp.exitPlanMode('用户通过ESC键退出')
        // UI状态会通过事件处理器自动更新
      } catch (error) {
        console.error('ESC退出Plan模式失败:', error)
        // 强制重置UI状态作为降级处理
        setCurrentMode(PlanMode.Default)
        setPlanModeStartTime(0)
      }
    } : undefined
  })

  // 获取 TODOs
  const fetchTodos = useCallback(async () => {
    try {
      const todoManager = (writeFlowApp as any).getTodoManager?.()
      console.log('🔍 TODO Manager:', todoManager ? 'found' : 'not found')
      if (todoManager) {
        const todosData = await (todoManager.getAllTodos?.() || todoManager.getTodos?.() || [])
        const list = Array.isArray(todosData) ? todosData : []
        console.log('📝 TODOs loaded:', list.length, 'items')
        setTodos(list)
        updateTodoStats(list)
        setShowTodos(prev => prev || list.length > 0)
      } else {
        // 兜底：直接用共享会话ID创建一个 TodoManager 读取
        try {
          const { TodoManager } = await import('../tools/TodoManager.js')
          const manager = new TodoManager(process.env.WRITEFLOW_SESSION_ID)
          const list = await manager.getAllTodos()
          console.log('📝 Fallback TODOs loaded:', list.length, 'items')
          setTodos(list)
          updateTodoStats(list)
          setShowTodos(prev => prev || list.length > 0)
        } catch (e) {
          console.log('📝 TODO Manager 未找到，使用空数组')
          setTodos([])
        }
      }
    } catch (error) {
      console.warn('获取 TODOs 失败:', error)
      setTodos([])
    }
  }, [writeFlowApp])

  // 更新 TODO 统计
  const updateTodoStats = useCallback((todosData: Todo[]) => {
    const stats = {
      total: todosData.length,
      pending: todosData.filter(t => t.status === TodoStatus.PENDING).length,
      inProgress: todosData.filter(t => t.status === TodoStatus.IN_PROGRESS).length,
      completed: todosData.filter(t => t.status === TodoStatus.COMPLETED).length,
      completionRate: todosData.length === 0 ? 0 : Math.round(
        (todosData.filter(t => t.status === TodoStatus.COMPLETED).length / todosData.length) * 100
      )
    }
    setTodoStats(stats)
  }, [])

  useEffect(() => {
    console.log('🚀 WriteFlowREPL 组件初始化')
    fetchTodos()
    
    // 检查初始的Plan模式状态
    const initialPlanMode = writeFlowApp.isInPlanMode()
    if (initialPlanMode) {
      setCurrentMode(PlanMode.Plan)
      setPlanModeStartTime(Date.now())
    }
    
    // 初始：若已有任务则展开显示
    setShowTodos((prev) => prev || todos.length > 0)
    // 订阅 todo:changed，全局任何地方更新都会刷新此面板
    const onTodoChanged = () => fetchTodos()
    systemReminderService.addEventListener('todo:changed', onTodoChanged)
    return () => {
      // 没有 remove 接口，允许会话结束后由服务重置
    }
  }, [fetchTodos, writeFlowApp])

  // 事件监听器
  useEffect(() => {
    const handleLaunchModelConfig = () => {
      setShowModelConfig(true)
    }

    const handleThinking = (thinkingText: string) => {
      if (thinkingText && thinkingText.trim()) {
        // 创建思考消息，但不显示在主对话中
        console.log('💭 AI 思考:', thinkingText)
      }
    }

    const handlePlanModeChanged = (data: { isActive: boolean; approved?: boolean; reminders?: any[] }) => {
      console.log('🔄 Plan mode changed:', data)
      if (data.isActive) {
        setCurrentMode(PlanMode.Plan)
        setPlanModeStartTime(Date.now())
      } else if (data.approved) {
        setCurrentMode(PlanMode.AcceptEdits)
        setPlanModeStartTime(0)
        setShowPlanConfirmation(false)
        setPendingPlan('')
      } else {
        setCurrentMode(PlanMode.Default)
        setPlanModeStartTime(0)
        setShowPlanConfirmation(false)
        setPendingPlan('')
      }
    }

    const handleExitPlanMode = (plan: string) => {
      console.log('📋 Exit plan mode requested with plan length:', plan.length)
      setPendingPlan(plan)
      setShowPlanConfirmation(true)
    }

    writeFlowApp.on('launch-model-config', handleLaunchModelConfig)
    writeFlowApp.on('ai-thinking', handleThinking)
    writeFlowApp.on('plan-mode-changed', handlePlanModeChanged)
    writeFlowApp.on('exit-plan-mode', handleExitPlanMode)

    return () => {
      writeFlowApp.off('launch-model-config', handleLaunchModelConfig)
      writeFlowApp.off('ai-thinking', handleThinking)
      writeFlowApp.off('plan-mode-changed', handlePlanModeChanged)
      writeFlowApp.off('exit-plan-mode', handleExitPlanMode)
    }
  }, [writeFlowApp])

  // 状态一致性监控 - 仅在组件挂载时检查一次
  useEffect(() => {
    const checkConsistency = () => {
      const appInPlanMode = writeFlowApp.isInPlanMode()
      const uiInPlanMode = currentMode === PlanMode.Plan

      if (appInPlanMode !== uiInPlanMode) {
        console.warn(`⚠️ Plan模式状态不一致: App=${appInPlanMode}, UI=${uiInPlanMode}`)
        // 以应用层状态为准进行修复
        if (appInPlanMode && !uiInPlanMode) {
          console.log('🔄 修复UI状态：进入Plan模式')
          setCurrentMode(PlanMode.Plan)
          setPlanModeStartTime(Date.now())
        } else if (!appInPlanMode && uiInPlanMode) {
          console.log('🔄 修复UI状态：退出Plan模式')
          setCurrentMode(PlanMode.Default)
          setPlanModeStartTime(0)
        }
      }
    }

    // 仅在初始加载时检查一次，避免定期检查干扰
    checkConsistency()
  }, []) // 空依赖数组，只在组件挂载时运行一次

  // 处理消息提交
  const handleSubmit = useCallback(async (message: string) => {
    if (!message.trim()) return

    // 添加用户消息
    const userMessage = createUserMessage(message.trim())
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      const trimmedMessage = message.trim()
      
      // 预创建流式助手消息
      let streamingMessage = createAssistantMessage([])
      setMessages(prev => [...prev, streamingMessage])
      
      // 智能文本缓冲器，用于处理 JSON 和纯文本混合
      let accumulatedText = ''
      let pendingTodoUpdate: any = null

      // 流式处理回调
      const onToken = (chunk: string) => {
        accumulatedText += chunk
        
        // 检查是否包含完整的 JSON TODO 更新
        const todoJsonMatch = accumulatedText.match(/\{[\s\S]*?"todos"\s*:\s*\[[\s\S]*?\][\s\S]*?\}/)
        if (todoJsonMatch) {
          try {
            const todoData = JSON.parse(todoJsonMatch[0])
            if (todoData.todos && Array.isArray(todoData.todos)) {
              pendingTodoUpdate = todoData.todos
              // 从显示文本中移除 JSON
              accumulatedText = accumulatedText.replace(todoJsonMatch[0], '').trim()
            }
          } catch (e) {
            // JSON 解析失败，继续处理为文本
          }
        }
        
        // 过滤工具调用相关信息
        accumulatedText = accumulatedText
          .replace(/AI: \[调用 todo_write 工具\] 正在执行\.\.\.\n/g, '')
          .replace(/todo_write工具: [^\n]*\n/g, '')
          .replace(/🎯 \*\*任务列表已更新\*\*[\s\S]*?(?=\n\n[^⎿]|$)/g, '')
          .replace(/⎿.*?\n/g, '')
          .trim()
        
        // 更新消息显示（仅显示非 JSON 内容）
        if (accumulatedText) {
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (isAssistantMessage(lastMessage)) {
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                message: {
                  ...lastMessage.message,
                  content: [createTextBlock(accumulatedText)]
                }
              }
            }
            
            return newMessages
          })
        }
      }

      // 调用 WriteFlowApp 的 handleFreeTextInput 方法
      const finalText = await writeFlowApp.handleFreeTextInput(trimmedMessage, {
        onToken
      })
      
      // 用最终文本替换流式占位消息（如"思考中..."）
      if (finalText && finalText.trim()) {
        // 过滤最终文本中的工具调用信息
        const cleanedFinalText = finalText
          .replace(/AI: \[调用 todo_write 工具\] 正在执行\.\.\.\n/g, '')
          .replace(/todo_write工具: [^\n]*\n/g, '')
          .replace(/🎯 \*\*任务列表已更新\*\*[\s\S]*?(?=\n\n[^⎿]|$)/g, '')
          .replace(/⎿.*?\n/g, '')
          .trim()
        
        if (cleanedFinalText) {
          setMessages(prev => {
            const newMessages = [...prev]
            const last = newMessages[newMessages.length - 1]
            if (isAssistantMessage(last)) {
              newMessages[newMessages.length - 1] = {
                ...last,
                message: {
                  ...last.message,
                  content: [createTextBlock(cleanedFinalText)]
                }
              }
            }
            return newMessages
          })
        }

        // 若文本包含 TODO 更新的信号，则刷新面板
        if (/Todos have been modified|任务列表已更新|"todos"\s*:\s*\[/.test(finalText)) {
          await fetchTodos()
        }
      }
      
      // 处理待处理的 TODO 更新
      if (pendingTodoUpdate) {
        try {
          const todoManager = (writeFlowApp as any).getTodoManager?.()
          if (todoManager) {
            await todoManager.saveTodos(pendingTodoUpdate)
            await fetchTodos()
          } else {
            setTodos(pendingTodoUpdate)
            updateTodoStats(pendingTodoUpdate)
          }
        } catch (error) {
          console.error('处理 TODO 更新失败:', error)
        }
      }

    } catch (error) {
      console.error('处理消息失败:', error)
      
      // 添加错误消息
      const errorMessage = createAssistantMessage([
        createTextBlock(`处理请求时发生错误: ${error instanceof Error ? error.message : '未知错误'}`)
      ])
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsThinking(false)
    }
  }, [writeFlowApp, fetchTodos, updateTodoStats])


  // 规范化消息用于渲染
  const normalizedMessages = useMemo((): NormalizedMessage[] => {
    return messages.filter(msg => {
      if (isUserMessage(msg)) {
        return typeof msg.message.content === 'string' && msg.message.content.trim().length > 0
      }
      if (isAssistantMessage(msg)) {
        return msg.message.content.length > 0 && msg.message.content.some(block => {
          return block.type === 'text' ? block.text.trim().length > 0 : true
        })
      }
      return true
    })
  }, [messages])

  // console.log('🎨 WriteFlowREPL 渲染中，todos.length:', todos.length, 'messages.length:', messages.length)
  
  // 计算动态状态文案
  const activityStatus: 'idle' | 'working' | 'thinking' | 'executing' =
    inProgressToolUseIDs.size > 0 ? 'executing' : (isThinking ? 'working' : 'idle')

  // 运行计时（用于 working/executing 状态显示秒数）
  const [statusStart, setStatusStart] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  useEffect(() => {
    if (activityStatus === 'idle') {
      setStatusStart(null)
      setElapsedSeconds(0)
      return
    }

    // 开始计时（仅首次进入活动状态时）
    const start = statusStart ?? Date.now()
    if (!statusStart) setStatusStart(start)

    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    }, 1000)

    return () => clearInterval(timer)
  }, [activityStatus])
  
  return (
    <Box flexDirection="column" width="100%" minHeight={3}>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" marginBottom={1}>
        <Text color="cyan" bold>
          ✨ {PRODUCT_NAME}
        </Text>
        <Box marginLeft={2}>
          <Text color={theme.dimText}>
            AI 写作助手
          </Text>
        </Box>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1}>
        {normalizedMessages.map((message, index) => {
          // 只渲染用户和助手消息
          if (message.type === 'user' || message.type === 'assistant') {
            return (
              <Message
                key={`${message.type}-${message.uuid}`}
                message={message}
                messages={normalizedMessages}
                addMargin={index > 0}
                tools={tools as any}
                verbose={false}
                debug={false}
                erroredToolUseIDs={erroredToolUseIDs}
                inProgressToolUseIDs={inProgressToolUseIDs}
                unresolvedToolUseIDs={unresolvedToolUseIDs}
                shouldAnimate={isThinking && index === normalizedMessages.length - 1}
                shouldShowDot={message.type === 'assistant' && index === normalizedMessages.length - 1}
              />
            )
          }
          return null
        })}
      </Box>

      {/* Plan Mode Confirmation - 只在需要确认时显示 */}
      {showPlanConfirmation && pendingPlan && (
        <Box marginTop={1} marginBottom={1}>
          <PlanModeConfirmation
            plan={pendingPlan}
            onConfirm={handlePlanConfirmation}
            onCancel={handlePlanConfirmationCancel}
          />
        </Box>
      )}

      {/* Todo Panel — 紧贴输入框上方，减少间距 */}
      <Box marginTop={0} marginBottom={0} paddingTop={0}>
        <TodoPanel
          todos={todos}
          stats={todoStats}
          isVisible={showTodos}
          compact={true}
          minimal={true}
          onToggle={() => setShowTodos(v => !v)}
          status={activityStatus}
          elapsedSeconds={elapsedSeconds}
        />
      </Box>

      {/* Input */}
      <Box marginTop={0}>
        <PromptInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isThinking}
          isDisabled={isThinking}
          mode="writing"
          onModeChange={() => {}}
          messages={[]}
          commands={commands}
          placeholder={isThinking ? '思考中...' : '输入消息...'}
        />
      </Box>

      {/* Shortcut Hints with Mode Status */}
      <Box marginTop={-1}>
        <ShortcutHints
          currentMode={currentMode}
          showTodos={showTodos}
          isLoading={isThinking}
          elapsedTime={planModeStartTime > 0 ? Date.now() - planModeStartTime : 0}
        />
      </Box>

      {/* Model Config Modal */}
      {showModelConfig && (
        <Box
          justifyContent="center"
          alignItems="center"
          marginTop={2}
        >
          <Box
            borderStyle="round"
            borderColor={theme.claude}
            padding={1}
            width={60}
          >
            {/* ModelConfig component would go here */}
            <Text>模型配置界面</Text>
            <Text color={theme.dimText}>按 Ctrl+C 关闭</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
